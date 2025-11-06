import requests

url = "http://127.0.0.1:5000/upload"
image_path = "hanh.jpg"  # thay bằng ảnh thật

with open(image_path, "rb") as f:
    img_bytes = f.read()

response = requests.post(url, data=img_bytes)
print(response.status_code)
print(response.json())
