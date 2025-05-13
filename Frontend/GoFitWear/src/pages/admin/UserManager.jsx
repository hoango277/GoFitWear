import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Pagination, Popconfirm, Select, message } from 'antd';
import customizeAxios from '../../services/customizeAxios';

const PAGE_SIZE = 3;
const ROLE_OPTIONS = [
  { label: 'CUSTOMER', value: 'CUSTOMER' },
  { label: 'ADMIN', value: 'ADMIN' },
];

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordModal, setPasswordModal] = useState({ visible: false, user: null });
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Fetch users
  const fetchUsers = async (page = 1, size = PAGE_SIZE) => {
    setLoading(true);
    try {
      const response = await customizeAxios.get('/admin/users', { params: { page: page - 1, size } });
      if (response && response.data) {
        setUsers(response.data.data);
        setPagination({
          page: response.data.meta.page,
          pageSize: response.data.meta.pageSize,
          total: response.data.meta.total,
        });
      }
    } catch (e) {
      message.error('Lỗi khi tải danh sách User');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, PAGE_SIZE);
  }, []);

  // Open modal for add
  const openModal = () => {
    setEditingUser(null);
    setModalVisible(true);
    form.resetFields();
  };

  // Open modal for edit
  const openEditModal = (user) => {
    setEditingUser(user);
    setModalVisible(false);
    editForm.setFieldsValue({ ...user });
    setTimeout(() => setEditModalVisible(true), 0);
  };

  // Handle add submit
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await customizeAxios.post('/admin/users', values);
      message.success('Thêm User thành công');
      setModalVisible(false);
      fetchUsers(pagination.page, pagination.pageSize);
    } catch (e) {
      message.error('Lỗi khi lưu User');
    }
  };

  // Handle edit submit
  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields();
      await customizeAxios.put('/users', { ...values, userId: editingUser.userId });
      message.success('Cập nhật User thành công');
      setEditModalVisible(false);
      fetchUsers(pagination.page, pagination.pageSize);
    } catch (e) {
      message.error('Lỗi khi cập nhật User');
    }
  };

  // Handle delete
  const handleDelete = async (userId) => {
    try {
      await customizeAxios.delete(`/admin/users/${userId}`);
      message.success('Xóa User thành công');
      fetchUsers(pagination.page, pagination.pageSize);
    } catch {
      message.error(JSON.parse(e.request.response).error);
    }
  };

  // Handle page change
  const handlePageChange = (page, pageSize) => {
    fetchUsers(page, pageSize);
  };

  // Handle open password modal
  const openPasswordModal = (user) => {
    setPasswordModal({ visible: true, user });
    passwordForm.resetFields();
  };

  // Handle update password
  const handlePasswordOk = async () => {
    try {
      const { newPassword } = await passwordForm.validateFields();
      await customizeAxios.put(`/admin/${passwordModal.user.userId}/change-password`, { newPassword });
      message.success('Đổi mật khẩu thành công');
      setPasswordModal({ visible: false, user: null });
    } catch {
      message.error(JSON.parse(e.request.response).error);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'userId', key: 'userId', width: 60 },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (role, record) => (
      <Button type="link" onClick={() => openRoleModal(record)}>{role}</Button>
    ) },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: v => v ? v.substring(0, 10) : '' },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            className="!px-4 !py-2 !text-medium !bg-black !text-white !border-2 !border-black !rounded !transition-colors hover:!bg-white hover:!text-black hover:!border-black !font-semibold"
            onClick={() => openEditModal(record)}
          >
            Sửa
          </Button>
          <Button
            className="!px-4 !py-2 !text-medium !bg-black !text-white !border-2 !border-black !rounded !transition-colors hover:!bg-white hover:!text-black hover:!border-black !font-semibold"
            onClick={() => openPasswordModal(record)}
          >
            Đổi mật khẩu
          </Button>
          <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.userId)} okText="Xóa" cancelText="Hủy">
            <Button
              className="!px-4 !py-2 !text-medium !bg-white !text-red-600 !border-2 !border-red-600 !rounded !transition-colors hover:!bg-red-600 hover:!text-white hover:!border-red-600 !font-semibold"
            >
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="shadow-[0_6px_32px_0_rgba(0,0,0,0.28)] border border-black rounded-lg bg-white p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý User</h1>
        <Button
          className="!px-4 !py-2 !text-medium !bg-black !text-white !border-2 !border-black !rounded !transition-colors hover:!bg-white hover:!text-black hover:!border-black !font-semibold"
          onClick={openModal}
        >
          Thêm User
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="userId"
        loading={loading}
        pagination={false}
        bordered
        scroll={{ x: true }}
      />
      <div className="flex justify-end mt-4">
        <Pagination
          current={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>
      {/* Modal thêm user */}
      <Modal
        title={'Thêm User'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Vui lòng nhập username' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}> 
            <Input.Password />
          </Form.Item>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="SĐT" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Vui lòng chọn role' }]}> 
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal sửa user */}
      <Modal
        title={'Sửa User'}
        open={editModalVisible}
        onOk={handleEditOk}
        onCancel={() => setEditModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="SĐT"> 
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ"> 
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Vui lòng chọn role' }]}> 
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal đổi mật khẩu */}
      <Modal
        title={'Đổi mật khẩu'}
        open={passwordModal.visible}
        onOk={handlePasswordOk}
        onCancel={() => setPasswordModal({ visible: false, user: null })}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}> 
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManager; 