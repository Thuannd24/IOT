// Format date to Vietnamese format
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

// Format time to Vietnamese format
export const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

// Format datetime to Vietnamese format
export const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

// Calculate attendance percentage
export const calculateAttendanceRate = (present, total) => {
    if (total === 0) return 0;
    return ((present / total) * 100).toFixed(2);
};

// Validate email
export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Validate phone number (Vietnamese format)
export const isValidPhone = (phone) => {
    const regex = /^(0|\+84)[0-9]{9,10}$/;
    return regex.test(phone);
};

// Get status color
export const getStatusColor = (status) => {
    const colors = {
        present: 'bg-green-100 text-green-800',
        late: 'bg-yellow-100 text-yellow-800',
        absent: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get status text
export const getStatusText = (status) => {
    const texts = {
        present: 'Có mặt',
        late: 'Muộn',
        absent: 'Vắng',
    };
    return texts[status] || 'Không xác định';
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Generate random ID
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Export data to CSV
export const exportToCSV = (data, filename) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    csvRows.push(headers.join(','));

    for (const row of data) {
        const values = headers.map(header => {
            const escaped = ('' + row[header]).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};
