# api/attendance.py
import os, cv2, numpy as np, datetime, traceback, face_recognition
from flask import Blueprint, request
from .common import (
    db_conn, ok, err, ensure_dirs, _mysql_time_to_time,
    STATIC_ATT, DETECT_MODEL, ENCODING_MODEL, KNOWN
)

bp_attendance = Blueprint("attendance", __name__)

# ---------- helpers ----------
def detect_and_encode_rgb(rgb_image):
    locs = face_recognition.face_locations(
        rgb_image, model=DETECT_MODEL, number_of_times_to_upsample=2
    )
    out = []
    for (t, r, b, l) in locs:
        encs = face_recognition.face_encodings(
            rgb_image, known_face_locations=[(t, r, b, l)], model=ENCODING_MODEL
        )
        if encs:
            out.append(((t, r, b, l), encs[0]))
    return out

def _pick_session_for_now(conn, session_name, now_dt):
    """
    Chỉ chọn phiên ĐANG MỞ:
    start_time <= now <= COALESCE(close_time, end_time).
    Không có -> None (để trả wait, tránh chèn 'absent').
    """
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """
        SELECT id, start_time, end_time, close_time
        FROM attendance_sessions
        WHERE date=%s
          AND session_name=%s
          AND start_time <= %s
          AND %s <= COALESCE(close_time, end_time)
        ORDER BY start_time ASC
        LIMIT 1
        """,
        (now_dt.date(), session_name, now_dt.time(), now_dt.time()),
    )
    return cur.fetchone()

def save_attendance(student_id, student_code, face_path, confidence=70.0):
    if not student_id:
        return {"status": "error", "message": "invalid_student"}

    now_dt = datetime.datetime.now()
    session_name = "Sáng" if now_dt.time() < datetime.time(12, 0, 0) else "Chiều"

    conn, _ = db_conn(dictionary=True)
    sess = _pick_session_for_now(conn, session_name, now_dt)
    if not sess:
        conn.close()
        return {"status": "wait", "message": "Ngoài khung giờ/đã đóng phiên."}

    st = _mysql_time_to_time(sess["start_time"])
    et = _mysql_time_to_time(sess["end_time"])
    ct = _mysql_time_to_time(sess["close_time"] or sess["end_time"])

    start_dt = datetime.datetime.combine(now_dt.date(), st)
    end_dt   = datetime.datetime.combine(now_dt.date(), et)
    close_dt = datetime.datetime.combine(now_dt.date(), ct)

    if now_dt < start_dt:
        conn.close()
        return {"status": "wait", "message": "Chưa đến thời gian điểm danh."}

    status = "present" if now_dt <= end_dt else ("late" if now_dt <= close_dt else "absent")

    # Không cho 1 SV điểm danh 2 lần trong cùng phiên
    cur = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT id FROM attendance_records WHERE student_id=%s AND session_id=%s",
        (student_id, sess["id"]),
    )
    if cur.fetchone():
        conn.close()
        return {"status": "already", "message": f"{student_code} đã điểm danh ca này!"}

    # Ghi nhận
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO attendance_records
          (`student_id`, `session_id`, `status`, `confidence`, `image_url`)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (student_id, sess["id"], status, confidence, face_path),
    )
    conn.commit()
    conn.close()

    print(f"[ATTEND] MSV: {student_code} -> {status}")  # log debug
    return {"status": "ok", "message": "Điểm danh thành công.", "detail": {"session": session_name, "state": status}}

# ---------- routes ----------
@bp_attendance.post("/recognitions")
def recognitions():
    try:
        ensure_dirs()
        img_bytes = request.get_data() or (request.files.get("file").read() if "file" in request.files else None)
        if not img_bytes:
            return err("no_image_bytes", 400)

        arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if frame is None:
            return err("cannot_decode_image", 400)

        small = cv2.resize(frame, (480, 360))
        rgb   = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

        results = detect_and_encode_rgb(rgb)
        if not results:
            return err("no_face_detected", 200)

        h, w = small.shape[:2]
        faces_out = []
        for (t, r, b, l), enc in results:
            recognized, full_name, studentCode, sid = False, "Unknown", "Unknown", None
            if KNOWN["encs"]:
                matches = face_recognition.compare_faces(KNOWN["encs"], enc, tolerance=0.62)
                if True in matches:
                    i = matches.index(True)
                    info = KNOWN["names"][i]
                    recognized, full_name, studentCode, sid = True, info["full_name"], info["studentCode"], info["id"]

            image_url = None
            crop = small[max(t, 0):min(b, h), max(l, 0):min(r, w)]
            if crop.size > 0:
                ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                code = studentCode if studentCode else "Unknown"
                fname = f"{code}_{ts}.jpg"
                cv2.imwrite(os.path.join(STATIC_ATT, fname), crop)
                image_url = f"/static/attendance_faces/{fname}"

            if recognized and sid:
                print(f"[RECOG] MSV {studentCode} (id={sid})")  # log msv
                attend_msg = save_attendance(sid, studentCode, image_url or "", 70.0)
            else:
                attend_msg = None

            faces_out.append({
                "name": full_name,
                "studentCode": studentCode,
                "recognized": recognized,
                "box": [int(t), int(r), int(b), int(l)],
                "image_url": image_url,
                "attendance": attend_msg,
            })

        return ok({"faces": faces_out}, "recognized")
    except Exception as e:
        print("recognitions error:", e, traceback.format_exc())
        return err(str(e), 500)

@bp_attendance.get("/attendance")
def attendance_list():
    """GET ?date=YYYY-MM-DD&session=...&status=present|late|absent&session_id=ID"""
    date = (request.args.get("date") or "").strip()
    session_name = (request.args.get("session") or request.args.get("session_name") or "").strip()
    status = (request.args.get("status") or "").strip()
    session_id = request.args.get("session_id")

    where, params = [], []
    if session_id:
        where.append("ar.session_id=%s"); params.append(session_id)
    if date:
        where.append("sess.date=%s"); params.append(date)
    if session_name:
        where.append("sess.session_name=%s"); params.append(session_name)
    if status in ("present", "late", "absent"):
        where.append("ar.status=%s"); params.append(status)

    where_sql = (" WHERE " + " AND ".join(where)) if where else ""
    sql = f"""
        SELECT
          s.msv AS studentId,
          s.full_name AS studentName,
          s.image_url,
          ar.timestamp,
          ar.status,
          ar.image_url AS face_image_url,
          sess.session_name AS session_name
        FROM attendance_records ar
        JOIN students s ON s.id = ar.student_id
        JOIN attendance_sessions sess ON sess.id = ar.session_id
        {where_sql}
        ORDER BY ar.timestamp DESC, ar.id DESC
        LIMIT 500
    """

    conn, cur = db_conn(dictionary=True)
    cur.execute(sql, tuple(params))
    rows = cur.fetchall()
    conn.close()

    for r in rows:
        ts = r.get("timestamp")
        if isinstance(ts, datetime.datetime):
            r["timestamp"] = ts.strftime("%Y-%m-%d %H:%M:%S")

    return ok(rows)
