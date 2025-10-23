import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { chartData, pieData } from '../../data';

const AttendanceChart = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart - Weekly Attendance */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Thống kê điểm danh <span className="text-sm text-gray-400 font-normal">/Tuần này</span></h2>
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ paddingBottom: '30px' }}
                        />
                        <defs>
                            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fb2c36" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#fb2c36" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <Line
                            type="monotone"
                            dataKey="present"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Có mặt"
                            dot={{ fill: '#10b981', r: 2 }}
                            activeDot={{ r: 4 }}
                            fill="url(#colorPresent)"
                        />
                        <Line
                            type="monotone"
                            dataKey="late"
                            stroke="#f97316"
                            strokeWidth={2}
                            name="Muộn"
                            dot={{ fill: '#f97316', r: 2 }}
                            activeDot={{ r: 4 }}
                            fill="url(#colorLate)"
                        />
                        <Line
                            type="monotone"
                            dataKey="absent"
                            stroke="#fb2c36"
                            strokeWidth={2}
                            name="Vắng"
                            dot={{ fill: '#fb2c36', r: 2 }}
                            activeDot={{ r: 4 }}
                            fill="url(#colorAbsent)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Radar Chart - Attendance Report */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-2">Báo cáo <span className="text-sm text-gray-400 font-normal">| Tháng này</span></h2>
                <div className="flex-1 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                        <RadarChart data={pieData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis
                                dataKey="name"
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                            />
                            <Radar
                                name="Kế hoạch"
                                dataKey="allocated"
                                stroke="#6366f1"
                                fill="#6366f1"
                                fillOpacity={0.2}
                                strokeWidth={2}
                            />
                            <Radar
                                name="Thực tế"
                                dataKey="actual"
                                stroke="#10b981"
                                fill="#10b981"
                                fillOpacity={0.2}
                                strokeWidth={2}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={24}
                                wrapperStyle={{ fontSize: '13px', paddingTop: '30px' }}
                                iconType="circle"
                                iconSize={8}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AttendanceChart;
