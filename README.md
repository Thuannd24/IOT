### 5. Chạy server Flask

1. Vào thư mục server và tạo virtualenv:

```powershell
cd Server\server
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Tạo file env từ mẫu (có sẵn ở root `.env.example`) và copy vào từng service:

````powershell
# Copy mẫu vào backend
copy ..\.env.example .\Server\server\.env

3. Cài dependencies và chạy server:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
````

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
