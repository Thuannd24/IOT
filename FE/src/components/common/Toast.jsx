import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ id, type = 'info', message, duration = 3000, onClose }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    const typeConfig = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-500',
            textColor: 'text-green-800',
            iconColor: 'text-green-500',
            progressColor: 'bg-green-500'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-500',
            textColor: 'text-red-800',
            iconColor: 'text-red-500',
            progressColor: 'bg-red-500'
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-500',
            textColor: 'text-yellow-800',
            iconColor: 'text-yellow-500',
            progressColor: 'bg-yellow-500'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-500',
            textColor: 'text-blue-800',
            iconColor: 'text-blue-500',
            progressColor: 'bg-blue-500'
        }
    };

    const config = typeConfig[type] || typeConfig.info;
    const Icon = config.icon;

    return (
        <div
            className={`
                ${config.bgColor} ${config.borderColor} ${config.textColor}
                border-l-4 rounded-lg shadow-lg p-4 mb-3 
                flex items-start gap-3 min-w-[320px] max-w-md
                animate-slideInRight hover:shadow-xl transition-shadow duration-200
            `}
            role="alert"
        >
            {/* Icon */}
            <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />

            {/* Message */}
            <div className="flex-1 text-sm font-medium">
                {message}
            </div>

            {/* Close Button */}
            <button
                onClick={() => onClose(id)}
                className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1 ${config.iconColor.replace('text-', 'focus:ring-')} rounded`}
                aria-label="Close notification"
            >
                <X className="h-4 w-4" />
            </button>

            {/* Progress Bar */}
            {duration && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
                    <div
                        className={`h-full ${config.progressColor} animate-shrink`}
                        style={{ animationDuration: `${duration}ms` }}
                    />
                </div>
            )}
        </div>
    );
};

const ToastContainer = ({ toasts, onClose }) => {
    const toastContent = (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
            <div className="pointer-events-auto">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={onClose}
                    />
                ))}
            </div>
        </div>
    );

    return createPortal(toastContent, document.body);
};

export default ToastContainer;
