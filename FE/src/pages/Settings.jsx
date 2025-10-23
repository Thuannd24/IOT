import { useState } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useToast } from '../contexts/ToastContext';

const Settings = () => {
    const toast = useToast();
    const [settings, setSettings] = useState({
        systemName: 'Hệ thống điểm danh IoT',
        cameraUrl: 'rtsp://192.168.1.100:554/stream',
        confidenceThreshold: 0.8,
        attendanceStartTime: '08:00',
        attendanceEndTime: '17:00',
        lateThreshold: 15,
    });

    const handleChange = (e) => {
        setSettings({
            ...settings,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Saving settings:', settings);

        try {
            // Implement save logic here
            // await api.saveSettings(settings);

            toast.success('Cài đặt đã được lưu thành công!');
        } catch (error) {
            toast.error('Không thể lưu cài đặt. Vui lòng thử lại!');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold"
                style={{ color: 'var(--primary-color)' }}>
                Cài đặt Hệ thống
            </h1>
            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Cài đặt chung</h2>

                        <Input
                            label="Tên hệ thống"
                            name="systemName"
                            value={settings.systemName}
                            onChange={handleChange}
                        />

                        <Input
                            label="URL Camera"
                            name="cameraUrl"
                            value={settings.cameraUrl}
                            onChange={handleChange}
                            placeholder="rtsp://..."
                        />

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Ngưỡng độ tin cậy (0-1)
                            </label>
                            <input
                                type="range"
                                name="confidenceThreshold"
                                min="0"
                                max="1"
                                step="0.05"
                                value={settings.confidenceThreshold}
                                onChange={handleChange}
                                className="w-full"
                                style={{ accentColor: 'var(--primary-color)' }}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Giá trị hiện tại: {settings.confidenceThreshold}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Cài đặt điểm danh</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Giờ bắt đầu"
                                name="attendanceStartTime"
                                type="time"
                                value={settings.attendanceStartTime}
                                onChange={handleChange}
                            />

                            <Input
                                label="Giờ kết thúc"
                                name="attendanceEndTime"
                                type="time"
                                value={settings.attendanceEndTime}
                                onChange={handleChange}
                            />
                        </div>

                        <Input
                            label="Ngưỡng muộn (phút)"
                            name="lateThreshold"
                            type="number"
                            value={settings.lateThreshold}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-200">
                        <Button type="submit" variant="primary">
                            Lưu cài đặt
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
