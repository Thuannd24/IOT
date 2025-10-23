import cv2
import numpy as np

# Mở webcam (0 là webcam mặc định)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Không mở được webcam")
    exit()

print("Nhấn phím 'c' để chụp ảnh, 'q' để thoát")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Không đọc được khung hình")
        break

    # Hiển thị live feed
    cv2.imshow("Webcam", frame)

    key = cv2.waitKey(1) & 0xFF
    if key == ord('c'):
        # Nhấn 'c' để chụp ảnh
        # Nếu frame có alpha (hiếm khi), bỏ kênh alpha
        if frame.shape[2] == 4:
            frame = frame[:, :, :3]

        # Convert BGR -> RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Ép dtype uint8
        rgb_frame = rgb_frame.astype(np.uint8)

        # Lưu ảnh ra file
        cv2.imwrite("hanh_glass.jpg", frame)
        print("Đã lưu ảnh: hanh.jpg")
    elif key == ord('q'):
        break