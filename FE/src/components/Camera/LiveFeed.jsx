import { useEffect, useRef, useState } from 'react';
import { Camera as CameraIcon } from 'lucide-react';

const LiveFeed = ({ isScanning, setIsScanning }) => {
    const videoRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize camera stream
        if (videoRef.current) {
            setIsConnected(true);
            // Connect to video stream
            // This is a placeholder - implement actual stream connection
        }

        return () => {
            // Cleanup stream connection
            setIsConnected(false);
        };
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Camera trực tiếp</h3>
                <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} ${isConnected ? 'animate-pulse' : ''}`}></div>
                    <span className="text-sm text-gray-600">
                        {isConnected ? 'Hoạt động' : 'Ngắt kết nối'}
                    </span>
                </div>
            </div>

            {/* Video Feed */}
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                <CameraIcon className="w-24 h-24 text-gray-600" />
                {isScanning && (
                    <div className="absolute inset-0 border-4 border-green-500 animate-pulse"></div>
                )}
                {!isConnected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <p className="text-white">Đang kết nối camera...</p>
                    </div>
                )}
            </div>

            {/* Control Buttons */}
            <div className="mt-4 flex justify-center gap-4">
                <button
                    onClick={() => setIsScanning(!isScanning)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${isScanning
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600'
                        } text-white`}
                >
                    {isScanning ? 'Dừng quét' : 'Bắt đầu quét'}
                </button>
            </div>
        </div>
    );
};

export default LiveFeed;
