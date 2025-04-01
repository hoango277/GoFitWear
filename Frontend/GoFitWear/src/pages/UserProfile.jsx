import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Avatar, message, Tabs, Spin, Divider, Modal } from 'antd';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiEdit, FiCalendar, FiUserCheck } from 'react-icons/fi';
import axios from 'axios';

const { TabPane } = Tabs;
const { TextArea } = Input;

const UserProfile = () => {
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            // Try to get user from localStorage first
            const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            
            if (storedUser) {
                setUser(storedUser);
                form.setFieldsValue({
                    username: storedUser.username,
                    email: storedUser.email,
                    fullName: storedUser.fullName,
                    phone: storedUser.phone || '',
                    address: storedUser.address || '',
                });
            } else {
                // Fallback to API call if needed
                const token = localStorage.getItem('access_token');
                if (!token) {
                    throw new Error('Không tìm thấy token đăng nhập');
                }
                
                const response = await axios.get('/api/user/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setUser(response.data);
                form.setFieldsValue({
                    username: response.data.username,
                    email: response.data.email,
                    fullName: response.data.fullName,
                    phone: response.data.phone || '',
                    address: response.data.address || '',
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            message.error('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
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
            
            // API call to update user data
            await axios.put('/api/user/profile', values, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update local storage with new values
            const updatedUser = { ...user, ...values };
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
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Không tìm thấy token đăng nhập');
            }
            
            // API call to change password
            await axios.post('/api/user/change-password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
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
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Thông Tin Tài Khoản</h1>
            
            <Tabs defaultActiveKey="profile" className="bg-white rounded-lg shadow-sm">
                <TabPane 
                    tab={<span className="ml-2 flex items-center"><FiUser className="mr-2" /> Thông tin cá nhân</span>}
                    key="profile"
                >
                    <div className="p-4">
                        <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
                            {/* User Avatar and Stats */}
                            <div className="flex flex-col items-center w-full md:w-1/3">
                                <Avatar 
                                    size={100} 
                                    icon={<FiUser />} 
                                    className="bg-blue-500 mb-4" 
                                />
                                <h2 className="text-xl font-semibold mb-1">{user?.fullName}</h2>
                                <p className="text-gray-500 mb-3">{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}</p>
                                
                                <Card className="w-full bg-gray-50">
                                    <div className="flex items-center mb-3">
                                        <FiCalendar className="text-gray-600 mr-2" />
                                        <div>
                                            <div className="text-sm text-gray-500">Ngày tham gia</div>
                                            <div>{formatDate(user?.createdAt)}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <FiUserCheck className="text-gray-600 mr-2" />
                                        <div>
                                            <div className="text-sm text-gray-500">Tài khoản</div>
                                            <div>{user?.username}</div>
                                        </div>
                                    </div>
                                </Card>

                                <Button 
                                    type="primary"
                                    className="mt-4 bg-blue-500 hover:bg-blue-600"
                                    onClick={() => setChangePasswordVisible(true)}
                                    icon={<FiLock />}
                                >
                                    Đổi mật khẩu
                                </Button>
                            </div>
                            
                            {/* User Information Form */}
                            <div className="w-full md:w-2/3">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Chi tiết cá nhân</h3>
                                    <Button 
                                        type={editMode ? "default" : "primary"} 
                                        icon={<FiEdit />}
                                        onClick={() => setEditMode(!editMode)}
                                    >
                                        {editMode ? "Hủy" : "Chỉnh sửa"}
                                    </Button>
                                </div>
                                
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleUpdateProfile}
                                >
                                    <Form.Item
                                        name="username"
                                        label="Tên đăng nhập"
                                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                                    >
                                        <Input 
                                            prefix={<FiUser className="text-gray-400" />} 
                                            disabled={true} // Username shouldn't be changeable
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email' },
                                            { type: 'email', message: 'Email không hợp lệ' }
                                        ]}
                                    >
                                        <Input 
                                            prefix={<FiMail className="text-gray-400" />} 
                                            disabled={!editMode}
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        name="fullName"
                                        label="Họ và tên"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ tên đầy đủ' }]}
                                    >
                                        <Input disabled={!editMode} />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        name="phone"
                                        label="Số điện thoại"
                                        rules={[
                                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                                        ]}
                                    >
                                        <Input 
                                            prefix={<FiPhone className="text-gray-400" />} 
                                            disabled={!editMode}
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        name="address"
                                        label="Địa chỉ"
                                    >
                                        <TextArea 
                                            rows={3} 
                                            placeholder="Nhập địa chỉ của bạn"
                                            disabled={!editMode}
                                            prefix={<FiMapPin className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                    
                                    {editMode && (
                                        <Form.Item>
                                            <Button 
                                                type="primary" 
                                                htmlType="submit" 
                                                loading={saving}
                                                className="bg-blue-500 hover:bg-blue-600"
                                            >
                                                Lưu thay đổi
                                            </Button>
                                        </Form.Item>
                                    )}
                                </Form>
                            </div>
                        </div>
                    </div>
                </TabPane>
                
                <TabPane 
                    tab={<span className="flex items-center"><FiMapPin className="mr-2" /> Địa chỉ giao hàng</span>} 
                    key="addresses"
                >
                    <div className="p-4">
                        <p className="text-gray-600 mb-4">Quản lý địa chỉ giao hàng của bạn.</p>
                        <Divider />
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium mb-2">Địa chỉ hiện tại</h3>
                            <p className="text-gray-700">{user?.address || 'Chưa có thông tin địa chỉ'}</p>
                        </div>
                        
                        <div className="mt-4">
                            <Button 
                                type="primary" 
                                icon={<FiEdit />}
                                onClick={() => {
                                    setEditMode(true);
                                    document.querySelector('[data-tab="profile"]')?.click();
                                }}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                Cập nhật địa chỉ
                            </Button>
                        </div>
                    </div>
                </TabPane>
            </Tabs>
            
            {/* Change Password Modal */}
            <Modal
                title={<div className="flex items-center"><FiLock className="mr-2" /> Đổi mật khẩu</div>}
                open={changePasswordVisible}
                onCancel={() => setChangePasswordVisible(false)}
                footer={null}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                >
                    <Form.Item
                        name="currentPassword"
                        label="Mật khẩu hiện tại"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    
                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    
                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
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
                        <Input.Password />
                    </Form.Item>
                    
                    <div className="flex justify-end">
                        <Button className="mr-2" onClick={() => setChangePasswordVisible(false)}>
                            Hủy
                        </Button>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={saving}
                            className="bg-blue-500 hover:bg-blue-600"
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
