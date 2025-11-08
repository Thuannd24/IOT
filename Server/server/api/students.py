# api/students.py
import os, json, traceback, face_recognition
from flask import Blueprint, request
from werkzeug.utils import secure_filename
from .common import (
    db_conn, ensure_dirs, ok, err,
    load_known_faces_into_ram, _student_by_id, STATIC_STUDENTS
)

bp_students = Blueprint("students", __name__)

@bp_students.get("/")
def students_list():
    conn, cur = db_conn(dictionary=True)
    cur.execute("SELECT id, msv AS studentCode, full_name, image_url, created_at FROM students ORDER BY id DESC")
    data = cur.fetchall(); conn.close()
    return ok(data)

@bp_students.post("/")
def students_add():
    try:
        ensure_dirs()
        msv = (request.form.get("msv") or "").strip()
        full_name = (request.form.get("full_name") or "").strip()
        file = request.files.get("image")
        if not (msv and full_name and file):
            return err("missing msv/full_name/image", 400)

        conn, cur = db_conn()
        cur.execute("SELECT id FROM students WHERE msv=%s", (msv,))
        if cur.fetchone():
            conn.close()
            return err("msv_already_exists", 409)

        fn = secure_filename(f"{msv}.jpg")
        path = os.path.join(STATIC_STUDENTS, fn)
        file.save(path)

        img = face_recognition.load_image_file(path)
        encs = face_recognition.face_encodings(img, model="large")
        if not encs:
            return err("no_face_found_in_image", 400)

        enc_json = json.dumps(encs[0].tolist(), ensure_ascii=False)
        cur.execute(
            "INSERT INTO students (msv, full_name, image_url, encoding) VALUES (%s,%s,%s,%s)",
            (msv, full_name, f"/static/students/{fn}", enc_json)
        )
        conn.commit(); conn.close()

        load_known_faces_into_ram()
        return ok({"msv": msv, "full_name": full_name}, "student_created", 201)

    except Exception as e:
        print("students_add error:", e, traceback.format_exc())
        return err(str(e), 500)

@bp_students.put("/<int:sid>")
def students_update(sid: int):
    try:
        ensure_dirs()
        cur_st = _student_by_id(sid, dict_cursor=True)
        if not cur_st:
            return err("student_not_found", 404)

        msv = (request.form.get("msv") or cur_st["msv"]).strip()
        full_name = (request.form.get("full_name") or cur_st["full_name"]).strip()
        file = request.files.get("image")

        # check trùng MSV (ngoại trừ chính mình)
        conn, cur = db_conn()
        cur.execute("SELECT id FROM students WHERE msv=%s AND id<>%s", (msv, sid))
        if cur.fetchone():
            conn.close()
            return err("msv_already_exists", 409)
        conn.close()

        image_url = cur_st["image_url"]
        enc_json = None

        if file:
            fn = secure_filename(f"{msv}.jpg")
            path = os.path.join(STATIC_STUDENTS, fn)
            file.save(path)

            img = face_recognition.load_image_file(path)
            encs = face_recognition.face_encodings(img, model="large")
            if not encs:
                return err("no_face_found_in_image", 400)

            enc_json = json.dumps(encs[0].tolist(), ensure_ascii=False)
            image_url = f"/static/students/{fn}"

        sets, params = [], []
        if msv != cur_st["msv"]:
            sets.append("msv=%s"); params.append(msv)
        if full_name != cur_st["full_name"]:
            sets.append("full_name=%s"); params.append(full_name)
        if image_url != cur_st["image_url"]:
            sets.append("image_url=%s"); params.append(image_url)
        if enc_json is not None:
            sets.append("encoding=%s"); params.append(enc_json)

        if not sets:
            return ok({"id": sid, "msv": msv, "full_name": full_name, "image_url": image_url}, "student_unchanged")

        sql = f"UPDATE students SET {', '.join(sets)} WHERE id=%s"
        params.append(sid)

        conn, cur = db_conn()
        cur.execute(sql, tuple(params))
        conn.commit(); conn.close()

        load_known_faces_into_ram()
        return ok({"id": sid, "msv": msv, "full_name": full_name, "image_url": image_url}, "student_updated")
    except Exception as e:
        print("students_update error:", e, traceback.format_exc())
        return err(str(e), 500)

@bp_students.delete("/<int:sid>")
def students_delete(sid: int):
    try:
        st = _student_by_id(sid, dict_cursor=True)
        if not st:
            return err("student_not_found", 404)

        conn, cur = db_conn()
        cur.execute("DELETE FROM attendance_records WHERE student_id=%s", (sid,))
        cur.execute("DELETE FROM students WHERE id=%s", (sid,))
        conn.commit(); conn.close()

        # (optional) dọn file ảnh cũ
        try:
            import os
            if st.get("image_url"):
                rel = st["image_url"].lstrip("/").replace("/", os.sep)
                if os.path.isfile(rel):
                    os.remove(rel)
        except:
            pass

        load_known_faces_into_ram()
        return ok({"id": sid}, "student_deleted")
    except Exception as e:
        print("students_delete error:", e, traceback.format_exc())
        return err(str(e), 500)
