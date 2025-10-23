// Mock Dashboard Statistics
export const mockDashboardStats = {
    totalStudents: 150,
    presentToday: 128,
    absentToday: 15,
    lateToday: 7,
    attendanceRate: 85,
    activeCameras: 4,
    totalCameras: 5,
    trends: {
        students: 5,
        attendance: 3,
        cameras: -2,
        rate: 1,
    },
};

// Mock System Settings
export const mockSettings = {
    systemName: 'Hệ thống điểm danh IoT',
    cameraUrl: 'rtsp://192.168.1.100:554/stream',
    confidenceThreshold: 0.8,
    attendanceStartTime: '08:00',
    attendanceEndTime: '17:00',
    lateThreshold: 15, // minutes
    autoRecognition: true,
    notificationEnabled: true,
    emailNotification: true,
    smsNotification: false,
};

// Mock Classes
export const mockClasses = [
    { id: 1, name: 'CNTT01', studentCount: 47, instructor: 'TS. Nguyễn Văn X' },
    { id: 2, name: 'CNTT02', studentCount: 46, instructor: 'TS. Trần Thị Y' },
    { id: 3, name: 'CNTT03', studentCount: 48, instructor: 'TS. Lê Văn Z' },
    { id: 4, name: 'CNTT04', studentCount: 48, instructor: 'ThS. Phạm Thị W' },
];
