from flask import Flask, request
import face_recognition
import numpy as np
import cv2
import os

app = Flask(__name__)

# Load known faces
known_encodings = []
known_names = []
for file in os.listdir('known_faces'):
    if file.lower().endswith('.jpg') or file.lower().endswith('.png'):
        try:
            img = face_recognition.load_image_file(f'known_faces/{file}')
            if len(img.shape) == 3 and img.shape[2] == 3:
                enc = face_recognition.face_encodings(img)
                if enc:
                    known_encodings.append(enc[0])
                    known_names.append(file.split('.')[0])
                else:
                    print(f"[WARN] Không nhận diện được khuôn mặt trong ảnh: {file}")
            else:
                print(f"[WARN] Ảnh không đúng định dạng RGB: {file}")
        except Exception as e:
            print(f"[ERROR] Lỗi khi xử lý ảnh {file}: {e}")

@app.route('/recognize', methods=['POST'])
def recognize():
    try:
        nparr = np.frombuffer(request.data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        print("img:", type(img), img.shape if img is not None else None, img.dtype if img is not None else None)
        if img is None:
            return "Image decode failed", 200
        cv2.imwrite('received.jpg', img)
        try:
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        except Exception as e:
            return f"Convert to RGB failed: {e}", 200
        faces = face_recognition.face_locations(rgb_img)
        if not faces:
            return "No face detected", 200
        encodings = face_recognition.face_encodings(rgb_img, faces)
        for encoding in encodings:
            matches = face_recognition.compare_faces(known_encodings, encoding)
            if True in matches:
                name = known_names[matches.index(True)]
                return f'Face recognized: {name}', 200
        return 'Unknown', 200
    except Exception as e:
        print("Error in recognize:", e)
        return f"Server error: {e}", 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
