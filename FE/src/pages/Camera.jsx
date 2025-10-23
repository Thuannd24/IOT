import { useState } from 'react';
import LiveFeed from '../components/Camera/LiveFeed';
import RecognitionStatus from '../components/Camera/RecognitionStatus';
import { mockAttendance } from '../data';

const Camera = () => {
    const [isScanning, setIsScanning] = useState(false);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>
                Camera nhận diện
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Camera Feed - 2 columns */}
                <div className="lg:col-span-2">
                    <LiveFeed isScanning={isScanning} setIsScanning={setIsScanning} />
                </div>

                {/* Status & Recent Recognition - 1 column */}
                <div>
                    <RecognitionStatus recentAttendance={mockAttendance.slice(0, 5)} />
                </div>
            </div>
        </div>
    );
};

export default Camera;
