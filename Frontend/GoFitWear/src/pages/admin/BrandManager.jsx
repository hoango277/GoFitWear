import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Pagination, Popconfirm, message } from 'antd';
import customizeAxios from '../../services/customizeAxios';

const PAGE_SIZE = 5;

const BrandManager = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [form] = Form.useForm();

  // Fetch brands
  const fetchBrands = async (page = 1, size = PAGE_SIZE) => {
    setLoading(true);
    try {
      const response = await customizeAxios.get('/api/brands', { params: { page: page - 1, size } });
      if (response && response.data) {
        setBrands(response.data.data);
        setPagination({
          page: response.data.meta.page,
          pageSize: response.data.meta.pageSize,
          total: response.data.meta.total,
        });
      }
    } catch {
      message.error('Lỗi khi tải danh sách Brand');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands(1, PAGE_SIZE);
  }, []);

  // Open modal for add/edit
  const openModal = (brand = null) => {
    setEditingBrand(brand);
    setModalVisible(true);
    if (brand) {
      form.setFieldsValue({ name: brand.name, description: brand.description });
    } else {
      form.resetFields();
    }
  };

  // Handle add/edit submit
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingBrand) {
        // Update
        await customizeAxios.put(`/api/brands/${editingBrand.brandId}`, values);
        message.success('Cập nhật Brand thành công');
      } else {
        // Add
        await customizeAxios.post('/api/brands', values);
        message.success('Thêm Brand thành công');
      }
      setModalVisible(false);
      fetchBrands(pagination.page, pagination.pageSize);
    } catch {
      message.error('Lỗi khi lưu Brand');
    }
  };

  // Handle delete
  const handleDelete = async (brandId) => {
    try {
      await customizeAxios.delete(`/api/brands/${brandId}`);
      message.success('Xóa Brand thành công');
      fetchBrands(pagination.page, pagination.pageSize);
    } catch {
      message.error('Lỗi khi xóa Brand');
    }
  };

  // Handle page change
  const handlePageChange = (page, pageSize) => {
    fetchBrands(page, pageSize);
  };

  const columns = [
    { title: 'ID', dataIndex: 'brandId', key: 'brandId', width: 60 },
    { title: 'Tên Brand', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            className="!px-4 !py-2 !text-medium !bg-black !text-white !border-2 !border-black !rounded !transition-colors hover:!bg-white hover:!text-black hover:!border-black !font-semibold"
            onClick={() => openModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.brandId)} okText="Xóa" cancelText="Hủy">
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
        <h1 className="text-2xl font-bold">Quản lý Brand</h1>
        <Button
          className="!px-4 !py-2 !text-medium !bg-black !text-white !border-2 !border-black !rounded !transition-colors hover:!bg-white hover:!text-black hover:!border-black !font-semibold"
          onClick={() => openModal()}
        >
          Thêm Brand
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={brands}
        rowKey="brandId"
        loading={loading}
        pagination={false}
        bordered
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
      <Modal
        title={editingBrand ? 'Sửa Brand' : 'Thêm Brand'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
        className="shadow-[0_6px_32px_0_rgba(0,0,0,0.28)] border border-black rounded-lg"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên Brand" rules={[{ required: true, message: 'Vui lòng nhập tên brand' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}> 
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BrandManager; 