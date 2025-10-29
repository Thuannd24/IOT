import { io } from "socket.io-client";

let socket;
export function connectWS() {
  if (socket) return socket;
  const url = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
  socket = io(url, { transports: ['websocket'], path: '/socket.io/' });
  return socket;
}

export function onRecognition(cb) {
  const s = connectWS();
  s.on('connect', () => console.log('[WS] connected', s.id));
  s.on('recognition', (payload) => cb && cb(payload));
  s.on('disconnect', () => console.log('[WS] disconnected'));
}

export function disconnectWS() {
  if (socket) socket.disconnect();
  socket = null;
}
