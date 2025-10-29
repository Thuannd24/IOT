import { useEffect, useState } from 'react';
import { onRecognition } from '@/services/websocket';
import { RecognitionsAPI } from '@/services/api';

export default function RecentActivity() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    RecognitionsAPI.recent(20).then(setItems).catch(console.error);

    onRecognition((payload) => {
      setItems((prev) => [payload, ...prev].slice(0, 50));
    });
  }, []);

  return (
    <div className="space-y-2">
      {items.map((it, idx) => (
        <div key={idx} className="p-3 rounded-xl border bg-white">
          <div className="font-medium">{it.studentName} <span className="text-xs text-gray-500">({it.className})</span></div>
          <div className="text-sm text-gray-600">{it.status} · {new Date(it.time || it.timestamp).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
