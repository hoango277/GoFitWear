import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Pagination, Select, message, Upload, Drawer, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import customizeAxios from '../../services/customizeAxios';

const PAGE_SIZE = 5;

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [variantDrawer, setVariantDrawer] = useState({ visible: false, product: null });
  const [variants, setVariants] = useState([]);
  const [variantModal, setVariantModal] = useState({ visible: false, editing: null });
  const [variantForm] = Form.useForm();
  const [variantFileList, setVariantFileList] = useState([]);

  // Fetch products
  const fetchProducts = async (page = 1, size = PAGE_SIZE) => {
    setLoading(true);
    try {
      const res = await customizeAxios.get(`/api/products?page=${page - 1}&size=${size}`);
      if (res && res.data) {
        // Lọc bỏ các product có is_deleted = true
        console.log(res.data.data);
        const filteredProducts = res.data.data;
        setProducts(filteredProducts);
        setPagination(res.data.meta);
      }
    } catch {
      message.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Fetch brands & categories for select
  const fetchBrandsAndCategories = async () => {
    try {
      const [brandRes, catRes] = await Promise.all([
        customizeAxios.get('/api/brands/dropdown'),
        customizeAxios.get('/api/categories/dropdown'),
      ]);
      setBrands(brandRes.data);
      setCategories(catRes.data);
    } catch {
      setBrands([]);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts(1, PAGE_SIZE);
    fetchBrandsAndCategories();
  }, []);

  // Open modal for add/edit
  const openModal = (product = null) => {
    setEditingProduct(product);
    setModalVisible(true);
    setFileList([]);
    if (product) {
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        brandId: product.brand.brandId,
        categoryId: product.category.categoryId,
        price: product.price,
      });
    } else {
      form.resetFields();
    }
  };

  // Handle add/edit submit
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('product', JSON.stringify(values));
      if (fileList[0]) formData.append('image', fileList[0].originFileObj);
      if (editingProduct) {
        await customizeAxios.put(`/api/products/${editingProduct.productId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await customizeAxios.post('/api/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        message.success('Thêm sản phẩm thành công');
      }
      setModalVisible(false);
      fetchProducts(pagination.page, pagination.pageSize);
    } catch {
      message.error('Lỗi khi lưu sản phẩm');
    }
  };

  // Handle delete
  const handleDelete = async (productId) => {
    try {
      await customizeAxios.delete(`/api/products/${productId}`);
      message.success('Xóa sản phẩm thành công');
      fetchProducts(pagination.page, pagination.pageSize);
    } catch {
      message.error('Lỗi khi xóa sản phẩm');
    }
  };

  // Handle page change
  const handlePageChange = (page, pageSize) => {
    fetchProducts(page, pageSize);
  };

  // Variant logic
  const openVariantDrawer = async (product) => {
    setVariantDrawer({ visible: true, product });
    fetchVariants(product.productId);
  };
  const closeVariantDrawer = () => {
    setVariantDrawer({ visible: false, product: null });
    setVariants([]);
  };
  const fetchVariants = async (productId) => {
    try {
      const res = await customizeAxios.get(`/api/product-variants/product/${productId}`);
      setVariants(res.data.data || []);
    } catch {
      setVariants([]);
    }
  };
  const openVariantModal = (variant = null) => {
    setVariantModal({ visible: true, editing: variant });
    if (variant) {
      variantForm.setFieldsValue({ ...variant });
      setVariantFileList([]);
    } else {
      variantForm.resetFields();
      setVariantFileList([]);
    }
  };
  const handleVariantOk = async () => {
    try {
      const values = await variantForm.validateFields();
      const formData = new FormData();
      // Always include productId for create
      const variantPayload = variantModal.editing
        ? { ...values, productId: variantDrawer.product.productId }
        : { ...values, productId: variantDrawer.product.productId };
      formData.append('variant', JSON.stringify(variantPayload));
      if (variantFileList[0]) formData.append('image', variantFileList[0].originFileObj);
      if (variantModal.editing) {
        await customizeAxios.put(
          `/api/product-variants/${variantModal.editing.variantId}/upload`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        message.success('Cập nhật variant thành công');
      } else {
        await customizeAxios.post(
          '/api/product-variants/upload',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        message.success('Thêm variant thành công');
      }
      setVariantModal({ visible: false, editing: null });
      setVariantFileList([]);
      fetchVariants(variantDrawer.product.productId);
    } catch {
      message.error('Lỗi khi lưu variant');
    }
  };
  const handleVariantDelete = async (variantId) => {
    try {
      // Tìm variant hiện tại
      const variant = variants.find(v => v.variantId === variantId);
      if (!variant) throw new Error('Không tìm thấy variant');
      const formData = new FormData();
      // Giữ nguyên các trường, chỉ set stockQuantity = 0
      const variantPayload = { ...variant, stockQuantity: 0 };
      formData.append('variant', JSON.stringify(variantPayload));
      // Nếu có ảnh, gửi kèm ảnh (nếu không có thì không gửi)
      // Không gửi lại ảnh cũ vì không có file, chỉ gửi variant
      await customizeAxios.put(
        `/api/product-variants/${variantId}/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      message.success('Đã cập nhật tồn kho variant về 0 (ẩn variant)');
      fetchVariants(variantDrawer.product.productId);
    } catch {
      message.error('Lỗi khi cập nhật tồn kho variant');
    }
  };

  const handleRestoreProduct = async (productId) => {
    try {
      await customizeAxios.put(`/api/products/turn-on/${productId}`);
      message.success('Đã hiển thị lại sản phẩm');
      fetchProducts(pagination.page, pagination.pageSize);
    } catch {
      message.error('Lỗi khi hiển thị lại sản phẩm');
    }
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: url => <img src={url} alt="sp" className="w-16 h-16 object-cover rounded" />,
    },
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Brand', dataIndex: ['brand', 'name'], key: 'brand' },
    { title: 'Category', dataIndex: ['category', 'name'], key: 'category' },
    { title: 'Giá', dataIndex: 'price', key: 'price', render: v => v.toLocaleString('vi-VN') + ' ₫' },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: v => v ? v.substring(0, 10) : '' },
    {
      title: 'Hành động',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <div className="flex gap-2">
          {record.isDeleted ? (
            <Button
              className="!px-4 !py-2 !text-medium !bg-black !text-white !border-2 !border-black !rounded !transition-colors hover:!bg-white hover:!text-black hover:!border-black !font-semibold"
              onClick={() => handleRestoreProduct(record.productId)}
            >
              Hiển thị lại sản phẩm
            </Button>
          ) : (
            <>
              <Button
                className="!px-4 !py-2 !text-medium !bg-black !text-white !border-2 !border-black !rounded !transition-colors hover:!bg-white hover:!text-black hover:!border-black !font-semibold"
                icon={<EditOutlined />}
                onClick={() => openModal(record)}
              >
                Sửa
              </Button>
              <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.productId)} okText="Xóa" cancelText="Hủy">
                <Button
                  className="!px-4 !py-2 !text-medium !bg-white !text-red-600 !border-2 !border-red-600 !rounded !transition-colors hover:!bg-red-600 hover:!text-white hover:!border-red-600 !font-semibold"
                  icon={<DeleteOutlined />}
                >
                  Xóa
                </Button>
              </Popconfirm>
              <Button
                className="!px-4 !py-2 !text-medium !bg-black !text-white !border-2 !border-black !rounded !transition-colors hover:!bg-white hover:!text-black hover:!border-black !font-semibold"
                onClick={() => openVariantDrawer(record)}
              >
                Quản lý variant
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Variant columns
  const variantColumns = [
    { title: 'Ảnh', dataIndex: 'imageUrl', key: 'imageUrl', render: url => url ? <img src={url} alt="variant" className="w-12 h-12 object-cover rounded" /> : null },
    { title: 'Size', dataIndex: 'size', key: 'size' },
    { title: 'Color', dataIndex: 'color', key: 'color' },
    { title: 'Giá', dataIndex: 'price', key: 'price', render: v => v.toLocaleString('vi-VN') + ' ₫' },
    { title: 'Tồn kho', dataIndex: 'stockQuantity', key: 'stockQuantity' },
    {
      title: 'Hành động',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            className="!px-4 !py-2 !text-medium !bg-black !text-white !border-2 !border-black !rounded !transition-colors hover:!bg-white hover:!text-black hover:!border-black !font-semibold"
            icon={<EditOutlined />}
            onClick={() => openVariantModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleVariantDelete(record.variantId)} okText="Xóa" cancelText="Hủy">
            <Button
              className="!px-4 !py-2 !text-medium !bg-white !text-red-600 !border-2 !border-red-600 !rounded !transition-colors hover:!bg-red-600 hover:!text-white hover:!border-red-600 !font-semibold"
              icon={<DeleteOutlined />}
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
        <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
        <Button
          className="!px-4 !py-2 !text-medium !bg-black !text-white !border-2 !border-black !rounded !transition-colors hover:!bg-white hover:!text-black hover:!border-black !font-semibold"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Thêm sản phẩm
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="productId"
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
      {/* Modal thêm/sửa sản phẩm */}
      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}> 
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="brandId" label="Brand" rules={[{ required: true, message: 'Vui lòng chọn brand' }]}> 
            <Select options={brands.map(b => ({ label: b.name, value: b.brandId }))} />
          </Form.Item>
          <Form.Item name="categoryId" label="Category" rules={[{ required: true, message: 'Vui lòng chọn category' }]}> 
            <Select options={categories.map(c => ({ label: c.name, value: c.categoryId }))} />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}> 
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item label="Ảnh sản phẩm">
            <Upload
              listType="picture"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList)}
              maxCount={1}
            >
              <Button icon={<PlusOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      {/* Drawer quản lý variant */}
      <Drawer
        title={<div className="flex justify-between items-center"><span>Quản lý variant cho: <b>{variantDrawer.product?.name}</b></span><Button icon={<CloseOutlined />} onClick={closeVariantDrawer} /> </div>}
        open={variantDrawer.visible}
        onClose={closeVariantDrawer}
        width={500}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Danh sách variant</h2>
          <Button
            className="!px-4 !py-2 !text-medium !bg-black !text-white !border-2 !border-black !rounded !transition-colors hover:!bg-white hover:!text-black hover:!border-black !font-semibold"
            icon={<PlusOutlined />}
            onClick={() => openVariantModal()}
          >
            Thêm variant
          </Button>
        </div>
        <Table
          columns={variantColumns}
          dataSource={variants}
          rowKey="variantId"
          pagination={false}
          bordered
          size="small"
        />
        {/* Modal thêm/sửa variant */}
        <Modal
          title={variantModal.editing ? 'Sửa variant' : 'Thêm variant'}
          open={variantModal.visible}
          onOk={handleVariantOk}
          onCancel={() => setVariantModal({ visible: false, editing: null })}
          okText="Lưu"
          cancelText="Hủy"
          destroyOnClose
        >
          <Form form={variantForm} layout="vertical">
            <Form.Item name="size" label="Size" rules={[{ required: true, message: 'Vui lòng nhập size' }]}> 
              <Input />
            </Form.Item>
            <Form.Item name="color" label="Color" rules={[{ required: true, message: 'Vui lòng nhập màu' }]}> 
              <Input />
            </Form.Item>
            <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}> 
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item name="stockQuantity" label="Tồn kho" rules={[{ required: true, message: 'Vui lòng nhập tồn kho' }]}> 
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item label="Ảnh variant">
              <Upload
                listType="picture"
                fileList={variantFileList}
                beforeUpload={() => false}
                onChange={({ fileList }) => setVariantFileList(fileList)}
                maxCount={1}
              >
                <Button icon={<PlusOutlined />}>Chọn ảnh</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </Drawer>
    </div>
  );
};

export default ProductManager; 