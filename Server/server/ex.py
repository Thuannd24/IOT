from flask import Flask, Response, render_template, request, jsonify
import cv2
import face_recognition
import numpy as np
import json
import mysql.connector
import os
from werkzeug.utils import secure_filename
import traceback
from PIL import Image

NEW_FACES_FOLDER = os.path.join("static", "students")  # folder chứa ảnh gốc sinh viên
ATTENDANCE_FACES_FOLDER = os.path.join("static", "attendance_faces")  # folder lưu ảnh điểm danh


app = Flask(__name__)

# URL Flask server
url = "http://127.0.0.1:5000/admin/add_student"
@app.route('/admin/add_student', methods=['GET'])
def add_student_form():
    return render_template('add_student.html')

# ======================
# Hàm load tất cả face encodings từ MySQL
# ======================
def load_known_faces():
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='mysql123',
        database='attendance',
        charset='utf8mb4'
    )
    cursor = conn.cursor()
    cursor.execute("SELECT msv, full_name, encoding FROM students")
    data = cursor.fetchall()
    conn.close()

    known_names, known_encodings = [], []
    for studentCode, full_name, encoding_str in data:
        student_obj = {
            "studentCode": studentCode,
            "full_name": full_name
        }
        known_names.append(student_obj)
        known_encodings.append(np.array(json.loads(encoding_str)))

    return known_names, known_encodings

# Load lần đầu
known_names, known_encodings = load_known_faces()

# ======================
# Route thêm sinh viên mới
# ======================
@app.route('/add_student', methods=['POST'])
def add_student():
    try:
        # Nhận dữ liệu từ form
        msv = (request.form.get("msv") or "").strip()
        full_name = (request.form.get("full_name") or "").strip()
        file = request.files.get("image")

        if not msv or not full_name or not file:
            return jsonify({
                "status": "error",
                "message": "Thiếu mã sinh viên, họ tên hoặc ảnh!"
            }), 400

        # Lưu ảnh vào static/students
        filename = secure_filename(f"{msv}.jpg")

        os.makedirs(NEW_FACES_FOLDER, exist_ok=True)
        image_path = os.path.join(NEW_FACES_FOLDER, filename)
        file.save(image_path)

        # Load ảnh
        img = face_recognition.load_image_file(image_path)
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Encode mặt
        encodings = face_recognition.face_encodings(rgb, model='small')

        if not encodings:
            return jsonify({
                "status": "error",
                "message": "Không phát hiện khuôn mặt trong ảnh!"
            }), 400

        encoding_json = json.dumps(encodings[0].tolist(), ensure_ascii=False)

        conn = mysql.connector.connect(
                host='localhost',
                user='root',
                password='mysql123',
                database='attendance',
                charset='utf8mb4'
            )
        cursor = conn.cursor()

        image_url = f"/static/students/{filename}"

        sql = """
            INSERT INTO students (msv, full_name, image_url, encoding)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (msv, full_name, image_url, encoding_json))
        conn.commit()
        conn.close()

        return jsonify({
            "status": "ok",
            "message": f"Thêm sinh viên {full_name} ({msv}) thành công",
            "msv": msv,
            "full_name": full_name,
            "image_url": image_url
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500



# ======================
# Route reload database khi thêm người mới
# ======================
# @app.route('/reload_db', methods=['POST'])
def reload_db():
    global known_names, known_encodings
    known_names, known_encodings = load_known_faces()
    return jsonify({"status":"ok", "message":"Database reloaded"}), 200

# ======================
# Route nhận ảnh từ ESP32-CAM
# ======================
@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        # Nhận dữ liệu ảnh JPEG từ ESP32-CAM
        img_bytes = request.data
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"status":"error", "message":"Cannot decode image"}), 400

        # Resize ảnh SVGA 800x600 → 320x240 để nhanh hơn
        small_frame = cv2.resize(frame, (320,240))

        cv2.imwrite("RECEIVED_face.jpg", small_frame)
        print("✅ Ảnh đã được lưu ra RECEIVED_face.jpg")

        # Detect mặt bằng HOG model
        face_locations = face_recognition.face_locations(small_frame, model='hog')
        results_list = []

        for (top, right, bottom, left) in face_locations:
            # Kiểm tra tọa độ tránh vượt quá kích thước ảnh
            top = max(top, 0)
            left = max(left, 0)
            bottom = min(bottom, small_frame.shape[0])
            right = min(right, small_frame.shape[1])

            # Debug: lưu ảnh mặt được detect
            cv2.imwrite("DEBUG_face.jpg", small_frame[top:bottom, left:right])

            # Encode trực tiếp trên small_frame với location đã detect
            encodings = face_recognition.face_encodings(
                small_frame, known_face_locations=[(top, right, bottom, left)], model='large'
            )
            if not encodings:
                continue
            live_encoding = encodings[0]

            # So sánh với database
            matches = face_recognition.compare_faces(known_encodings, live_encoding, tolerance=0.6)
            recognized = False
            full_name = "Unknown"
            studentCode = "Unknown"
            if True in matches:
                idx = matches.index(True)
                full_name = known_names[idx]["full_name"]
                studentCode = known_names[idx]["studentCode"]
                recognized = True  # mặt có trong database

            results_list.append({
                "name": full_name,
                "studentCode": studentCode,
                "location": [int(top), int(right), int(bottom), int(left)],
                "recognized": recognized
            })
            
            response_json = {"status": "ok", "faces": results_list}
            print("Response JSON: ", response_json)

        return Response(
        json.dumps(response_json, ensure_ascii=False),
        content_type="application/json; charset=utf-8")

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"status":"error", "message": str(e)}), 500

# ======================
# Main
# ======================
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
