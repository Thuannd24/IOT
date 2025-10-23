from flask import Flask, Response, request, jsonify
import cv2
import face_recognition
import numpy as np
import json
import mysql.connector
import os

app = Flask(__name__)

# ======================
# Hàm load tất cả face encodings từ MySQL
# ======================
def load_known_faces():
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='mysql123',
        database='facerec',
        charset='utf8mb4'  # hỗ trợ tên có dấu
    )
    cursor = conn.cursor()
    cursor.execute("SELECT name, encoding FROM face_db")
    data = cursor.fetchall()
    conn.close()

    known_names = []
    known_encodings = []
    for name, encoding_str in data:
        known_names.append(name)
        known_encodings.append(np.array(json.loads(encoding_str)))
    return known_names, known_encodings

# Load lần đầu
known_names, known_encodings = load_known_faces()

# ======================
# Route thêm sinh viên mới
# ======================
NEW_FACES_FOLDER = "new_faces"  # folder chứa ảnh gốc sinh viên

@app.route('/add_student', methods=['POST'])
def add_student():
    try:
        data = request.json
        name = data['name']

        # Đường dẫn ảnh sinh viên trong thư mục new_faces
        filename = f"{name}.jpg"  # có thể đổi sang .png tùy file thật
        filepath = os.path.join(NEW_FACES_FOLDER, filename)

        if not os.path.exists(filepath):
            return jsonify({
                "status": "error",
                "message": f"Ảnh {filename} không tồn tại trong thư mục new_faces"
            }), 400

        # Load ảnh và encode khuôn mặt
        image = face_recognition.load_image_file(filepath)
        encodings = face_recognition.face_encodings(
            image,
            num_jitters=20,  # có thể chỉnh 10–50 cho độ chính xác cao hơn
            model='large'
        )

        # Kiểm tra có tìm thấy mặt hay không
        if not encodings or len(encodings) == 0:
            return jsonify({
                "status": "error",
                "message": f"Không phát hiện khuôn mặt trong ảnh {filename}"
            }), 400

        # Lấy encoding đầu tiên
        encoding = encodings[0].tolist()

        # Lưu vào MySQL
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='mysql123',
            database='facerec',
            charset='utf8mb4'
        )
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO face_db (name, encoding) VALUES (%s, %s)",
            (name, json.dumps(encoding, ensure_ascii=False))
        )
        conn.commit()
        conn.close()

        return jsonify({
            "status": "ok",
            "message": f"Thêm sinh viên {name} thành công"
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500



# ======================
# Route reload database khi thêm người mới
# ======================
@app.route('/reload_db', methods=['POST'])
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
            name = "Unknown"
            if True in matches:
                idx = matches.index(True)
                name = known_names[idx]
                recognized = True  # mặt có trong database

            results_list.append({
                "name": name,
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
