# IOT

## Project structure

- `BE/`: Backend (không sử dụng, để trống)
- `FE/`: Frontend (React, Vite)
- `Server/`: Backend Python (Flask, face_recognition, MySQL)

---

## Hướng dẫn cài đặt & chạy backend (Server)

### 1. Cài đặt Python 3.10

- Tải tại: https://www.python.org/downloads/release/python-3109/
- Khi cài, tick "Add Python to PATH".

### 2. Cài đặt CMake bản 3.x (khuyên dùng 3.29.x)

- Tải tại: https://cmake.org/files/v3.29/cmake-3.29.3-windows-x86_64.msi
- Chọn "Add CMake to the system PATH for all users" khi cài.

### 3. Cài Visual Studio Build Tools (bắt buộc cho dlib)

- Tải tại: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- Khi cài, chọn "Desktop development with C++".

### 4. Cài đặt các thư viện Python

Mở PowerShell/cmd tại thư mục `Server/other`:

```powershell
py -3.10 -m venv myenv
.\myenv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Chạy server Flask

```powershell
python face_upload_server.py
```

- Server sẽ chạy tại: http://localhost:5000

### 6. Cấu hình MySQL (nếu dùng database)

- Import file `Server/known_faces_db.sql` vào MySQL để tạo database và bảng.
- Sửa code Python nếu cần kết nối và thao tác với database.
