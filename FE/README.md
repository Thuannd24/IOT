# Hệ thống IoT Nhận diện Khuôn mặt Điểm danh Sinh viên

Ứng dụng web quản lý hệ thống điểm danh sinh viên sử dụng công nghệ nhận diện khuôn mặt.

## Công nghệ sử dụng

- **React 19** - Frontend framework
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **WebSocket** - Real-time communication

## Cấu trúc thư mục

```
src/
├── components/
│   ├── Layout/          # Layout components (Sidebar, Header)
│   ├── Dashboard/       # Dashboard components
│   ├── Students/        # Student management components
│   ├── Attendance/      # Attendance tracking components
│   ├── Camera/          # Live camera feed components
│   └── common/          # Reusable common components
├── pages/               # Page components
├── services/            # API and WebSocket services
└── utils/               # Helper functions
```

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd face-recognition
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

4. Cấu hình các biến môi trường trong file `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000/ws
VITE_CAMERA_STREAM_URL=rtsp://192.168.1.100:554/stream
```

## Chạy ứng dụng

### Development mode:
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### Build production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

## 📱 Tính năng

### 1. Dashboard
- Hiển thị thống kê tổng quan
- Biểu đồ điểm danh theo thời gian
- Hoạt động gần đây

### 2. Quản lý sinh viên
- Thêm/Sửa/Xóa thông tin sinh viên
- Hiển thị danh sách sinh viên dạng card
- Tìm kiếm và lọc sinh viên

### 3. Quản lý điểm danh
- Xem lịch sử điểm danh
- Lọc theo ngày, lớp, trạng thái
- Xuất báo cáo

### 4. Camera giám sát
- Xem live feed từ camera
- Hiển thị trạng thái nhận diện real-time
- Độ tin cậy nhận diện

### 5. Cài đặt hệ thống
- Cấu hình camera
- Thiết lập thời gian điểm danh
- Ngưỡng độ tin cậy

## API Integration

### API Service (`src/services/api.js`)
Xử lý tất cả các HTTP requests đến backend:
- GET/POST/PUT/DELETE students
- GET attendance records
- Dashboard statistics

### WebSocket Service (`src/services/websocket.js`)
Xử lý real-time communication:
- Live camera feed
- Real-time face recognition
- Attendance notifications

## Styling

Ứng dụng sử dụng Tailwind CSS với các utility classes. Các component common đã được tạo sẵn:
- `Button` - Các kiểu button (primary, secondary, danger, success)
- `Input` - Form input với label
- `Modal` - Modal dialog

## TODO

- [ ] Tích hợp backend API
- [ ] Implement authentication
- [ ] Add chart library (Chart.js/Recharts)
- [ ] Image upload for students
- [ ] Export attendance to Excel/PDF
- [ ] Dark mode support
- [ ] Mobile responsive optimization
- [ ] Notification system
- [ ] Multi-language support

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo pull request hoặc issue.

## 📄 License

MIT License
