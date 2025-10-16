from PIL import Image
import os

# Đường dẫn tới thư mục chứa ảnh
folder = 'known_faces'

for filename in os.listdir(folder):
    if filename.lower().endswith('.jpg') or filename.lower().endswith('.png'):
        path = os.path.join(folder, filename)
        try:
            img = Image.open(path).convert('RGB')
            new_path = os.path.join(folder, f"fixed_{filename.split('.')[0]}.jpg")
            img.save(new_path)
            print(f"Đã chuyển đổi: {filename} -> {new_path}")
        except Exception as e:
            print(f"Lỗi với {filename}: {e}")
