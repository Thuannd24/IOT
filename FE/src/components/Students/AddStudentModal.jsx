import { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const AddStudentModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        studentId: '',
        class: '',
        email: '',
        phone: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            name: '',
            studentId: '',
            class: '',
            email: '',
            phone: '',
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Cập nhật sinh viên' : 'Thêm sinh viên mới'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Họ và tên"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Mã số sinh viên"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Lớp"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                />
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary">
                        {initialData ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddStudentModal;
