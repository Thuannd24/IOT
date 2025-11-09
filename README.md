### 5. Chạy server Flask

1. Vào thư mục server và tạo virtualenv:
   git clone ...
   cd Server/server
   py -3.10 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   copy ..\.env.example .env ← sửa thông tin DB trong .env
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   pip install .\dlib-19.24.1-cp310-cp310-win_amd64.whl
   python app.py

Server sẽ chạy tại: http://localhost:5000

### 6. Cấu hình MySQL (nếu dùng database)

- Xóa db cũ attendance rồi dùng lệnh
  DROP DATABASE IF EXISTS attendance;
  CREATE DATABASE attendance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  USE attendance;

- Import file `Server/recog.sql` vào MySQL để tạo database và bảng.
- Sửa code Python nếu cần kết nối và thao tác với database.

## Chạy frontend (FE)

1. Vào thư mục `FE` và cài dependencies:

```powershell
cd FE
npm install
```

3. Chạy dev server:

```powershell
npm run dev
```

Ứng dụng FE mặc định chạy tại `http://localhost:5173`.
