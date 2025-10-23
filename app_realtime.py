from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import face_recognition, numpy as np, cv2, os, datetime as dt
from pathlib import Path

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# ========== LOAD KNOWN FACES ==========
KNOWN_DIR = Path(__file__).parent / "known_faces"
known_encodings = []
known_names = []

def load_known_faces():
    """Load encodings & names from KNOWN_DIR. Only take first face per image."""
    global known_encodings, known_names
    known_encodings = []
    known_names = []

    if not KNOWN_DIR.exists():
        KNOWN_DIR.mkdir(parents=True, exist_ok=True)

    valid_exts = {".jpg", ".jpeg", ".png"}
    loaded, skipped_no_face, skipped_err = 0, 0, 0

    for p in sorted(KNOWN_DIR.iterdir()):
        if p.is_file() and p.suffix.lower() in valid_exts:
            name = p.stem  # e.g. "Alice" from "Alice.jpg"
            try:
                img = face_recognition.load_image_file(str(p))
                # OPTIONAL: detect face locations first to avoid wrong encodings
                boxes = face_recognition.face_locations(img, model="hog")  # or "cnn" if you have GPU/dlib built
                if not boxes:
                    skipped_no_face += 1
                    continue
                encs = face_recognition.face_encodings(img, boxes)
                if not encs:
                    skipped_no_face += 1
                    continue
                # lấy encoding đầu tiên
                known_encodings.append(encs[0])
                known_names.append(name)
                loaded += 1
            except Exception as e:
                print(f"[load_known_faces] skip {p.name}: {e}")
                skipped_err += 1

    print(f"[load_known_faces] loaded={loaded}, no_face={skipped_no_face}, err={skipped_err}, total={len(known_names)}")

# Load ngay khi khởi động
load_known_faces()

@app.get("/api/reload-known-faces")
def api_reload_known_faces():
    load_known_faces()
    return jsonify({"ok": True, "count": len(known_names)}), 200

# ========== HEALTH ==========
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "time": dt.datetime.utcnow().isoformat(), "known_count": len(known_names)})

# ========== RECOGNIZE ==========
@app.route("/recognize", methods=["POST"])
def recognize():
    try:
        data = request.get_data()
        arr = np.frombuffer(data, np.uint8)
        img_bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            return jsonify({"result": "bad_image"}), 200

        rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        faces = face_recognition.face_locations(rgb, model="hog")  # or "cnn"
        if not faces:
            return jsonify({"result": "no_face"}), 200

        encs = face_recognition.face_encodings(rgb, faces)
        names = []
        for enc in encs:
            # so khớp: compare_faces -> True/False; có thể set tolerance (mặc định 0.6)
            matches = face_recognition.compare_faces(known_encodings, enc, tolerance=0.5)
            name = "Unknown"
            if True in matches:
                # lấy index match đầu tiên; có thể dùng face_distance để chọn distance nhỏ nhất
                idx = matches.index(True)
                name = known_names[idx]
            names.append(name)

        payload = {"names": names, "timestamp": dt.datetime.utcnow().isoformat()}
        socketio.emit("face_detected", payload)

        result = "recognized" if any(n != "Unknown" for n in names) else "unknown"
        return jsonify({"result": result, "names": names}), 200

    except Exception as e:
        print("Error in /recognize:", e)
        return jsonify({"result": "error", "error": str(e)}), 200

if __name__ == "__main__":
    # Nếu chạy production với eventlet/gevent thì thay bằng socketio.run(app, ...)
    socketio.run(app, host="0.0.0.0", port=5000)
