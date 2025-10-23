import { X, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-2xl',
    // Confirm modal props
    variant = 'default', // 'default' | 'confirm'
    onConfirm,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    type = 'danger' // 'danger' | 'warning' | 'info'
}) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Type styles for confirm modal
    const typeStyles = {
        danger: {
            icon: 'bg-red-100',
            iconColor: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        },
        warning: {
            icon: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        },
        info: {
            icon: 'bg-blue-100',
            iconColor: 'text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
    };

    const style = typeStyles[type] || typeStyles.danger;

    // Render confirm modal
    if (variant === 'confirm') {
        const modalContent = (
            <>
                {/* Overlay */}
                <div
                    className="fixed inset-0 z-[9998] bg-black/50 transition-opacity duration-300"
                    onClick={onClose}
                    aria-hidden="true"
                />

                {/* Modal Container */}
                <div className="fixed inset-0 z-[9999] overflow-y-auto pointer-events-none">
                    <div className="flex items-center justify-center min-h-screen px-4 py-6">
                        {/* Modal */}
                        <div
                            className="inline-block bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all max-w-md w-full animate-fadeIn pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white px-6 pt-6 pb-4">
                                <div className="sm:flex sm:items-start">
                                    {/* Icon */}
                                    <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${style.icon} sm:mx-0 sm:h-10 sm:w-10`}>
                                        <AlertCircle className={`h-6 w-6 ${style.iconColor}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {title}
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-600">
                                                {message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    className={`w-full inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm ${style.button} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto transition-colors`}
                                >
                                    {confirmText}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mt-3 w-full inline-flex justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );

        return createPortal(modalContent, document.body);
    }

    // Render regular modal
    const modalContent = (
        <>
            {/* Overlay - Full screen backdrop */}
            <div
                className="fixed inset-0 z-[9998] bg-black/50 transition-opacity duration-300"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-[9999] overflow-y-auto pointer-events-none">
                <div className="flex items-center justify-center min-h-screen px-4 py-6">
                    {/* Modal */}
                    <div
                        className={`inline-block bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all w-full ${maxWidth} animate-fadeIn pointer-events-auto`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-white">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 rounded-lg p-1"
                                aria-label="Close modal"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="bg-white px-6 py-6">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    return createPortal(modalContent, document.body);
};

export default Modal;
