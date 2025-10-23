import os
import cv2
import face_recognition
import numpy as np

def ensure_rgb_uint8(img):
    if img is None:
        raise ValueError("Ảnh bị lỗi hoặc không đọc được")
    if len(img.shape) == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
    elif img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2RGB)
    elif img.shape[2] == 3:
        pass
    if img.dtype != np.uint8:
        img = img.astype(np.uint8)
    return img

RAW_FACE_FOLDER = "D:\\PTIT_HN\\Sem1_2025_26\\IOT_va_ung_dung\\Project_BTL\\server\\raw_faces"
KNOWN_FACE_FOLDER = "D:\\PTIT_HN\\Sem1_2025_26\\IOT_va_ung_dung\\Project_BTL\\server\\known_faces"
TARGET_SIZE = (300, 300)

os.makedirs(KNOWN_FACE_FOLDER, exist_ok=True)

def crop_and_normalize_faces(source_folder, dest_folder, target_size):
    for filename in os.listdir(source_folder):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tif')):
            file_path = os.path.join(source_folder, filename)
            image = face_recognition.load_image_file(file_path)
            image = ensure_rgb_uint8(image)

            face_locations = face_recognition.face_locations(image, model='hog')

            if not face_locations:
                print(f"Không tìm thấy khuôn mặt trong ảnh: {filename}")
                continue

            top, right, bottom, left = face_locations[0]
            face_image = image[top:bottom, left:right]
            face_image = ensure_rgb_uint8(face_image)

            # Resize về kích thước chuẩn
            face_image_resized = cv2.resize(face_image, target_size, interpolation=cv2.INTER_AREA)

            base_name = os.path.splitext(filename)[0]
            save_path = os.path.join(dest_folder, base_name + ".jpg")
            cv2.imwrite(save_path, cv2.cvtColor(face_image_resized, cv2.COLOR_RGB2BGR))
            print(f"Đã crop, resize và lưu JPEG: {save_path}")

if __name__ == "__main__":
    crop_and_normalize_faces(RAW_FACE_FOLDER, KNOWN_FACE_FOLDER, TARGET_SIZE)