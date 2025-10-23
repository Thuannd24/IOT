const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm mb-1">{title}</p>
                    <h3 className="text-3xl font-bold">{value}</h3>
                    {trend && (
                        <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% so với tuần trước
                        </p>
                    )}
                </div>
                <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
