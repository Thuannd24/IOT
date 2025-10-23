import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class WebSocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });
    }

    onFaceDetected(callback) {
        this.socket.on('face_detected', callback);
    }

    onAttendanceMarked(callback) {
        this.socket.on('attendance_marked', callback);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default new WebSocketService();