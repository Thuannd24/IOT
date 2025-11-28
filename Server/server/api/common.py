# api/common.py
import os, json, datetime, mysql.connector, numpy as np
from flask import jsonify

# Try to load .env if present (optional)
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# ====== Config ======
# DB config can be set via environment variables for easier deployment.
DB = dict(
    host=os.environ.get('DB_HOST', 'localhost'),
    user=os.environ.get('DB_USER', 'root'),
    password=os.environ.get('DB_PASSWORD'),
    database=os.environ.get('DB_NAME', 'attendance'),
    charset='utf8mb4'
)
STATIC_STUDENTS = os.path.join(os.environ.get('STATIC_DIR', 'static'), "students")
STATIC_ATT     = os.path.join(os.environ.get('STATIC_DIR', 'static'), "attendance_faces")
ENCODING_MODEL = os.environ.get('ENCODING_MODEL', 'large')
DETECT_MODEL   = os.environ.get('DETECT_MODEL', 'hog')

# ====== In-memory ======
KNOWN = {"names": [], "encs": []}


# ====== Utils ======
def ensure_dirs():
    os.makedirs(STATIC_STUDENTS, exist_ok=True)
    os.makedirs(STATIC_ATT, exist_ok=True)

def db_conn(dictionary=False):
    conn = mysql.connector.connect(**DB)
    cur = conn.cursor(dictionary=dictionary)
    try:
        cur.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci")
    except Exception:
        pass
    return conn, cur

def ok(data=None, message=None, status=200):
    # Luôn gắn status="ok" để client (ESP32) hiểu là thành công
    res = {"status": "ok"}
    if message is not None:
        res["message"] = message
    if data is not None:
        res["data"] = data
    return jsonify(res), status



def err(msg="error", status=400):
    from flask import jsonify as _jsonify
    return _jsonify({"status":"error","message":msg}), status

def _mysql_time_to_time(t):
    if isinstance(t, datetime.timedelta):
        return (datetime.datetime.min + t).time()
    if isinstance(t, datetime.time):
        return t
    if isinstance(t, str):
        return datetime.datetime.strptime(t, "%H:%M:%S").time()
    raise TypeError(f"Unsupported TIME: {type(t)}")

def load_known_faces_into_ram():
    conn, cur = db_conn()
    cur.execute("SELECT id, msv, full_name, encoding FROM students")
    rows = cur.fetchall(); conn.close()
    names, encs = [], []
    for sid, msv, full_name, enc_json in rows:
        try:
            arr = np.array(json.loads(enc_json))
            if arr.size == 0:
                continue
            names.append({"id": sid, "studentCode": msv, "full_name": full_name})
            encs.append(arr)
        except Exception:
            pass
    KNOWN["names"], KNOWN["encs"] = names, encs
    print(f"[RELOAD] known encodings = {len(encs)}")


def _student_by_id(sid, dict_cursor=True):
    conn, cur = db_conn(dictionary=dict_cursor)
    cur.execute("SELECT id, msv, full_name, image_url FROM students WHERE id=%s", (sid,))
    row = cur.fetchone()
    conn.close()
    return row
