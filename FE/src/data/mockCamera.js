// Mock Camera Detection Data
export const mockDetections = [
    {
        id: 1,
        recognized: true,
        name: 'Nguyễn Văn A',
        studentId: 'SV001',
        timestamp: '08:15:23',
        confidence: 0.985,
        image: 'https://via.placeholder.com/100'
    },
    {
        id: 2,
        recognized: true,
        name: 'Trần Thị B',
        studentId: 'SV002',
        timestamp: '08:16:45',
        confidence: 0.972,
        image: 'https://via.placeholder.com/100'
    },
    {
        id: 3,
        recognized: false,
        name: null,
        studentId: null,
        timestamp: '08:17:30',
        confidence: 0.456,
        image: 'https://via.placeholder.com/100'
    },
    {
        id: 4,
        recognized: true,
        name: 'Lê Văn C',
        studentId: 'SV003',
        timestamp: '08:18:12',
        confidence: 0.968,
        image: 'https://via.placeholder.com/100'
    },
];

// Camera Status
export const mockCameraStatus = {
    isOnline: true,
    streamUrl: 'rtsp://192.168.1.100:554/stream',
    fps: 30,
    resolution: '1920x1080',
    lastUpdate: new Date().toISOString(),
};
