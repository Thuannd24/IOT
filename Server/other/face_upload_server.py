from flask import Flask, request, jsonify
import os
import time
import uuid

app = Flask(__name__)

UPLOAD_ROOT = "uploads"

if not os.path.exists(UPLOAD_ROOT):
    os.makedirs(UPLOAD_ROOT)

@app.route('/api/upload_faces', methods=['POST'])
def upload_faces():
    # Tạo folder cho lần upload này (dùng timestamp + UUID để đảm bảo không bị trùng lẫn)
    batch_id = f"{int(time.time())}_{uuid.uuid4().hex[:8]}"
    batch_folder = os.path.join(UPLOAD_ROOT, batch_id)
    os.makedirs(batch_folder, exist_ok=True)

    saved_files = []
    for i in range(3):
        file = request.files.get(f"file{i}")
        if not file:
            continue
        filename = f"face_{i+1}.jpg"
        file_path = os.path.join(batch_folder, filename)
        file.save(file_path)
        saved_files.append(file_path)

    if not saved_files:
        return jsonify({"status": "fail", "message": "No images received"}), 400

    return jsonify({
        "status": "success",
        "batch_folder": batch_folder,
        "saved_files": saved_files
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)