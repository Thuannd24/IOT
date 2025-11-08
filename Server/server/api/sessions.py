# api/sessions.py
import datetime, traceback
from flask import Blueprint, request
from mysql.connector.errors import IntegrityError          # 👈 thêm
from .common import db_conn, ok, err, _mysql_time_to_time

bp_sessions = Blueprint("sessions", __name__)

def finalize_session_mark_absent(session_id: int, date_val: datetime.date, close_t):
    try:
        close_dt = datetime.datetime.combine(date_val, _mysql_time_to_time(close_t))
        conn, cur = db_conn()
        cur.execute("""
            INSERT IGNORE INTO attendance_records (student_id, session_id, status, confidence, image_url, timestamp)
            SELECT s.id, %s, 'absent', 0, NULL, %s
            FROM students s
            LEFT JOIN attendance_records ar
              ON ar.student_id = s.id AND ar.session_id = %s
            WHERE ar.id IS NULL
        """, (session_id, close_dt, session_id))
        conn.commit(); conn.close()
        print(f"[FINALIZE] session={session_id} -> ABSENT for no-shows")
    except Exception as e:
        print("finalize_session_mark_absent error:", e, traceback.format_exc())

def finalize_due_sessions():
    now_dt = datetime.datetime.now()
    conn, cur = db_conn(dictionary=True)
    cur.execute("SELECT id, date, end_time, close_time FROM attendance_sessions")
    for r in cur.fetchall():
        ct = r["close_time"] or r["end_time"]
        close_dt = datetime.datetime.combine(r["date"], _mysql_time_to_time(ct))
        if close_dt <= now_dt:
            finalize_session_mark_absent(r["id"], r["date"], ct)
    conn.close()

@bp_sessions.post("/finalize")
def sessions_finalize():
    try:
        finalize_due_sessions()
        return ok(message="finalized")
    except Exception as e:
        return err(str(e), 500)
# api/sessions.py
from mysql.connector.errors import IntegrityError  # <— thêm import
@bp_sessions.post("")
@bp_sessions.post("/")
def create_session():
    from datetime import datetime as _dt
    data = request.get_json(silent=True) or {}
    try:
        date = _dt.strptime(data["date"], "%Y-%m-%d").date()
        session_name = (data.get("session_name") or "").strip()
        shift = int(data.get("shift") or 1)                  # 👈 NEW
        start_time = _dt.strptime(data["start_time"], "%H:%M:%S").time()
        end_time   = _dt.strptime(data["end_time"], "%H:%M:%S").time()
        close_time = _dt.strptime((data.get("close_time") or data["end_time"]), "%H:%M:%S").time()
        if session_name not in ("Sáng", "Chiều"):
            return err("session_name must be 'Sáng' or 'Chiều'", 400)

        conn, cur = db_conn()
        # check tồn tại theo (date, session_name, shift)
        cur.execute("""
          SELECT 1 FROM attendance_sessions
          WHERE date=%s AND session_name=%s AND shift=%s
        """, (date, session_name, shift))
        if cur.fetchone():
            conn.close()
            return err("session_already_exists", 409)

        try:
            cur.execute("""
              INSERT INTO attendance_sessions
              (date, session_name, shift, start_time, end_time, close_time)
              VALUES (%s, %s, %s, %s, %s, %s)
            """, (date, session_name, shift, start_time, end_time, close_time))
            conn.commit()
        except IntegrityError as e:
            conn.rollback()
            if getattr(e, "errno", None) == 1062:
                return err("session_already_exists", 409)
            raise
        finally:
            conn.close()

        return ok({"message": "session_created"}, 201)
    except Exception as e:
        print("create_session error:", e, traceback.format_exc())
        return err(str(e), 500)

@bp_sessions.get("")
@bp_sessions.get("/")
def sessions_list():
    try:
        date = (request.args.get("date") or "").strip()
        where, params = [], []
        if date:
            where.append("date=%s"); params.append(date)
        where_sql = (" WHERE " + " AND ".join(where)) if where else ""

        # Cách 1: sắp theo start_time (an toàn, không dính chuỗi có dấu)
        sql = f"""
          SELECT id, DATE_FORMAT(date,'%Y-%m-%d') AS date,
                 session_name, shift,
                 TIME_FORMAT(start_time,'%H:%i:%s') AS start_time,
                 TIME_FORMAT(end_time,'%H:%i:%s')   AS end_time,
                 TIME_FORMAT(close_time,'%H:%i:%s') AS close_time
          FROM attendance_sessions
          {where_sql}
          ORDER BY date DESC, start_time ASC, shift ASC
        """

        # --- Nếu bạn muốn đúng thứ tự Sáng -> Chiều, dùng CASE (vẫn ổn nếu charset chuẩn):
        # sql = f"""
        #   SELECT id, DATE_FORMAT(date,'%Y-%m-%d') AS date,
        #          session_name, shift,
        #          TIME_FORMAT(start_time,'%H:%i:%s') AS start_time,
        #          TIME_FORMAT(end_time,'%H:%i:%s')   AS end_time,
        #          TIME_FORMAT(close_time,'%H:%i:%s') AS close_time
        #   FROM attendance_sessions
        #   {where_sql}
        #   ORDER BY date DESC,
        #     CASE session_name WHEN 'Sáng' THEN 0 WHEN 'Chiều' THEN 1 ELSE 2 END,
        #     shift ASC, start_time ASC
        # """

        conn, cur = db_conn(dictionary=True)
        cur.execute(sql, tuple(params))
        rows = cur.fetchall()
        conn.close()
        return ok(rows)
    except Exception as e:
        import traceback
        print("sessions_list error:", e, traceback.format_exc())
        return err(str(e), 500)

@bp_sessions.get("/<int:sid>/stats")
def session_stats(sid: int):
    conn, cur = db_conn(dictionary=True)
    cur.execute("""
      SELECT status, COUNT(*) AS c
      FROM attendance_records
      WHERE session_id=%s
      GROUP BY status
    """, (sid,))
    by = {r["status"]: int(r["c"]) for r in cur.fetchall()}
    conn.close()
    data = {
        "present": by.get("present", 0),
        "late": by.get("late", 0),
        "absent": by.get("absent", 0),
    }
    return ok(data)
