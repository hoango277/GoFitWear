import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Avatar, message, Tabs, Spin, Modal } from 'antd';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiEdit, FiCalendar, FiUserCheck } from 'react-icons/fi';
import customizeAxios from '../services/customizeAxios'
import './UserProfile.css'; // Import custom CSS for overriding Ant Design styles

const { TabPane } = Tabs;
const { TextArea } = Input;

// Tạo instance axios với interceptor để xử lý refresh token


// Interceptor để xử lý token hết hạn

const UserProfile = () => {
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        fetchUserById();
    }, []);

    const fetchUserById = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Không tìm thấy token đăng nhập');
            }
            
            // Gọi API để lấy thông tin người dùng theo ID
            let user = JSON.parse(localStorage.getItem('user'));
            console.log(user);
            const response = await customizeAxios.get(`/users/${user.userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response);
            
            // Lưu thông tin người dùng vào state
            setUser(response.data);
            
            // Điền thông tin vào form
            form.setFieldsValue({
                userId: user.userId,
                username: response.data.username,
                email: response.data.email,
                fullName: response.data.fullName,
                phone: response.data.phone || '',
                address: response.data.address || '',
            });
            
            return response.data;
        } catch (error) {
            console.error('Error fetching user data by ID:', error);
            message.error('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
            return null;
        } finally {
            setLoading(false);
        }
    };
    

    const handleUpdateProfile = async (values) => {
        setSaving(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Không tìm thấy token đăng nhập');
            }
            
            const response = await customizeAxios.put('/users', values, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Cập nhật thông tin người dùng trong localStorage
            const updatedUser = { ...response.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            setUser(updatedUser);
            message.success('Cập nhật thông tin thành công!');
            setEditMode(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error('Cập nhật thông tin thất bại. Vui lòng thử lại sau.');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (values) => {
        setSaving(true);
        try {
            const userId = user?.userId || JSON.parse(localStorage.getItem('user'))?.userId;
            if (!userId) throw new Error('Không tìm thấy userId');
            await customizeAxios.post(`/api/users/${userId}/change-password`, {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            });
            
            message.success('Đổi mật khẩu thành công!');
            setChangePasswordVisible(false);
            passwordForm.resetFields();
        } catch (error) {
            console.error('Error changing password:', error);
            if (error.response && error.response.status === 400) {
                message.error('Mật khẩu hiện tại không chính xác');
            } else {
                message.error('Đổi mật khẩu thất bại. Vui lòng thử lại sau.');
            }
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spin size="large" tip="Đang tải thông tin..." />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="bg-white">
                {/* Profile Header */}
                <div className="border-b border-gray-200 pb-8 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <Avatar 
                                size={80} 
                                icon={<FiUser />} 
                                className="bg-black text-white" 
                            />
                            <div>
                                <h1 className="text-2xl font-medium text-black">{user?.fullName}</h1>
                                <p className="text-black">{user?.role === 'ADMIN' ? 'Quản Trị Viên' : 'Khách Hàng'}</p>
                            </div>
                        </div>
                        <Button 
                            type={editMode ? "default" : "default"} 
                            icon={<FiEdit />}
                            onClick={() => setEditMode(!editMode)}
                            className="border-black text-black hover:bg-gray-100"
                        >
                            {editMode ? "Hủy" : "Chỉnh sửa"}
                        </Button>
                    </div>
                </div>

                <Tabs 
                    defaultActiveKey="profile" 
                    className="mt-8"
                    tabBarStyle={{ 
                        color: 'black', 
                        borderBottomColor: 'black' 
                    }}
                    style={{ 
                        color: 'black'
                    }}
                >
                    <TabPane 
                        tab={<span className="flex items-center text-black"><FiUser className="mr-2" /> Thông tin cá nhân</span>}
                        key="profile"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left Column - User Info */}
                            <div className="space-y-6">
                                <Card className="border border-black">
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <FiCalendar className="text-black mr-3" />
                                            <div>
                                                <div className="text-sm text-black">Ngày tham gia</div>
                                                <div className="font-medium text-black">{formatDate(user?.createdAt)}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center">
                                            <FiUserCheck className="text-black mr-3" />
                                            <div>
                                                <div className="text-sm text-black">Tài khoản</div>
                                                <div className="font-medium text-black">{user?.username}</div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Button 
                                    type="default"
                                    className="w-full border-black text-black hover:bg-gray-100"
                                    onClick={() => setChangePasswordVisible(true)}
                                    icon={<FiLock />}
                                >
                                    Đổi mật khẩu
                                </Button>
                            </div>

                            {/* Right Column - Profile Form */}
                            <div className="md:col-span-2">
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleUpdateProfile}
                                    className="bg-white"
                                >
                                     <Form.Item
                                        name="userId" // Thêm trường userId vào form
                                        noStyle // Không hiển thị label hoặc input
                                    >
                                        <Input type="hidden" /> {/* Thực tế không có input hiển thị nào */}
                                    </Form.Item>
                                    <Form.Item
                                        name="username"
                                        label={<span className="text-black">Tên đăng nhập</span>}
                                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                                    >
                                        <Input 
                                            prefix={<FiUser className="text-black" />} 
                                            disabled={true}
                                            className="border-black"
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        name="email"
                                        label={<span className="text-black">Email</span>}
                                        rules={[
                                            { message: 'Vui lòng nhập email' },
                                            { type: 'email', message: 'Email không hợp lệ' }
                                        ]}
                                    >
                                        <Input 
                                            prefix={<FiMail className="text-black" />} 
                                            disabled={!editMode}
                                            className="border-black"
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        name="fullName"
                                        label={<span className="text-black">Họ và tên</span>}
                                        rules={[{ required: true, message: 'Vui lòng nhập họ tên đầy đủ' }]}
                                    >
                                        <Input 
                                            disabled={!editMode}
                                            className="border-black"
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        name="phone"
                                        label={<span className="text-black">Số điện thoại</span>}
                                        rules={[
                                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                                        ]}
                                    >
                                        <Input 
                                            prefix={<FiPhone className="text-black" />} 
                                            disabled={!editMode}
                                            className="border-black"
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        name="address"
                                        label={<span className="text-black">Địa chỉ</span>}
                                    >
                                        <TextArea 
                                            rows={3} 
                                            placeholder="Nhập địa chỉ của bạn"
                                            disabled={!editMode}
                                            prefix={<FiMapPin className="text-black" />}
                                            className="border-black"
                                        />
                                    </Form.Item>
                                    
                                    {editMode && (
                                        <Form.Item>
                                            <Button 
                                                type="primary" 
                                                htmlType="submit" 
                                                loading={saving}
                                                className="bg-black hover:bg-gray-800"
                                            >
                                                Lưu thay đổi
                                            </Button>
                                        </Form.Item>
                                    )}
                                </Form>
                            </div>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
            
            {/* Change Password Modal */}
            <Modal
                title={<div className="flex items-center text-black"><FiLock className="mr-2" /> Đổi mật khẩu</div>}
                open={changePasswordVisible}
                onCancel={() => setChangePasswordVisible(false)}
                footer={null}
                className="rounded-lg"
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                    className="mt-4"
                >
                    <Form.Item
                        name="currentPassword"
                        label={<span className="text-black">Mật khẩu hiện tại</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                    >
                        <Input.Password className="border-black" />
                    </Form.Item>
                    
                    <Form.Item
                        name="newPassword"
                        label={<span className="text-black">Mật khẩu mới</span>}
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                        ]}
                    >
                        <Input.Password className="border-black" />
                    </Form.Item>
                    
                    <Form.Item
                        name="confirmPassword"
                        label={<span className="text-black">Xác nhận mật khẩu mới</span>}
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Hai mật khẩu không khớp nhau!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password className="border-black" />
                    </Form.Item>
                    
                    <div className="flex justify-end gap-2">
                        <Button 
                            onClick={() => setChangePasswordVisible(false)}
                            className="border-black text-black hover:bg-gray-100"
                        >
                            Hủy
                        </Button>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={saving}
                            className="bg-black hover:bg-gray-800"
                        >
                            Cập nhật mật khẩu
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default UserProfile;
