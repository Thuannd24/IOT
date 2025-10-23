import os
import cv2
import face_recognition
import requests
import json

# Folder chứa ảnh mới
folder_path = "new_faces"

# URL Flask server
url = "http://127.0.0.1:5000/add_student"

# Lặp qua tất cả ảnh trong folder
for file_name in os.listdir(folder_path):
    if not (file_name.endswith(".jpg") or file_name.endswith(".png")):
        continue

    image_path = os.path.join(folder_path, file_name)
    print("Processing:", image_path)

    # Load ảnh
    img = face_recognition.load_image_file(image_path)
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Encode mặt
    encodings = face_recognition.face_encodings(rgb)
    if not encodings:
        print("Không nhận diện được mặt trong ảnh:", file_name)
        continue
    face_encoding = encodings[0].tolist()  # convert numpy array -> list

    # Lấy tên sinh viên từ file (bỏ phần đuôi .jpg/.png)
    name = os.path.splitext(file_name)[0]

    # Tạo payload JSON
    payload = {
        "name": name,
        "encoding": face_encoding
    }

    # Gửi POST lên server
    response = requests.post(url, json=payload)
    print(response.status_code)
    print(response.json())
