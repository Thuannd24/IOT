import cv2
import face_recognition
import json
import mysql.connector

# ==== 1. Load ảnh sinh viên ====
image_path = "new_faces/hanh.jpg"  # ảnh gốc
img = face_recognition.load_image_file(image_path)
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# ==== 2. Encode mặt ====
encoding_list = face_recognition.face_encodings(rgb, model='small')
if len(encoding_list) == 0:
    print("Không nhận diện được mặt trong ảnh!")
    exit()
face_encoding = encoding_list[0]

# ==== 3. Kết nối MySQL ====
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="123",          # đổi mật khẩu của bạn
    database="facerec",
    charset="utf8mb4"
)
cursor = conn.cursor()

# ==== 4. Thêm sinh viên ====
name = "Dương Thị Hồng Hạnh"
encoding_json = json.dumps(face_encoding.tolist())  # convert numpy array -> list -> JSON string

sql = "INSERT INTO face_db (name, encoding) VALUES (%s, %s)"
cursor.execute(sql, (name, encoding_json))
conn.commit()
print("Đã thêm sinh viên:", name)

# ==== 5. Đóng kết nối ====
cursor.close()
conn.close()
