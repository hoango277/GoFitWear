import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Popconfirm, Select, message, Tree, Spin, Card, Row, Col, Tooltip } from 'antd';
import customizeAxios from '../../services/customizeAxios';
import { FolderOutlined, FolderOpenOutlined, TagOutlined, EditOutlined, DeleteOutlined, PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';

const PAGE_SIZE = 5;

const CategoryManager = () => {
  const [treeData, setTreeData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [parentOptions, setParentOptions] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Đệ quy fetch toàn bộ cây category
  const fetchCategoryTree = async (parentId = null) => {
    try {
      let url = parentId ? `/api/categories/${parentId}` : '/api/categories/top-level';
      const response = await customizeAxios.get(url);
      let categories = [];
      if (parentId) {
        // /api/categories/{id} trả về 1 category, lấy subcategories
        categories = response.data.subcategories || [];
      } else {
        // top-level trả về mảng
        categories = response.data || [];
      }
      // Đệ quy cho từng category con
      const result = await Promise.all(categories.map(async cat => {
        const children = await fetchCategoryTree(cat.categoryId);
        return {
          ...cat,
          key: cat.categoryId,
          title: cat.name,
          children: children.length > 0 ? children : undefined,
        };
      }));
      return result;
    } catch {
      return [];
    }
  };

  // Lấy tất cả categoryId trong cây để expand
  const getAllKeys = (nodes) => {
    let keys = [];
    nodes.forEach(node => {
      keys.push(node.key);
      if (node.children) {
        keys = keys.concat(getAllKeys(node.children));
      }
    });
    return keys;
  };

  // Fetch toàn bộ cây và expand
  const fetchAndExpandAll = async () => {
    setTreeLoading(true);
    const tree = await fetchCategoryTree();
    setTreeData(tree);
    setExpandedKeys(getAllKeys(tree));
    setTreeLoading(false);
  };

  // Fetch all categories cho select parent
  const fetchParentOptions = async () => {
    try {
      const response = await customizeAxios.get('/api/categories/dropdown');
      if (response && response.data) {
        setParentOptions(response.data.map(cat => ({
          label: cat.name,
          value: cat.categoryId,
        })));
      }
    } catch {
      setParentOptions([]);
    }
  };

  useEffect(() => {
    fetchAndExpandAll();
    fetchParentOptions();
  }, []);

  // Open modal for add/edit
  const openModal = async (category = null) => {
    if (category && category.categoryId && !category.description) {
      // Nếu là subcategory và chưa có description, fetch chi tiết
      try {
        const res = await customizeAxios.get(`/api/categories/${category.categoryId}`);
        if (res && res.data) {
          category = res.data;
        }
      } catch {
        message.error('Không lấy được thông tin chi tiết category');
      }
    }
    setEditingCategory(category);
    setModalVisible(true);
    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
        parentId: category.parent ? category.parent.categoryId : undefined,
      });
    } else {
      form.resetFields();
    }
  };

  // Handle add/edit submit
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!values.parentId) values.parentId = 9007199254740991;
      if (editingCategory) {
        await customizeAxios.put(`/api/categories/${editingCategory.categoryId}`, values);
        message.success('Cập nhật Category thành công');
      } else {
        await customizeAxios.post('/api/categories', values);
        message.success('Thêm Category thành công');
      }
      setModalVisible(false);
      fetchAndExpandAll();
      fetchParentOptions();
    } catch {
      message.error('Lỗi khi lưu Category');
    }
  };

  // Render icon cho node
  const renderIcon = (node) => {
    if (node.children && node.children.length > 0) {
      return <FolderOpenOutlined style={{ color: '#1890ff', marginRight: 8 }} />;
    }
    return <TagOutlined style={{ color: '#52c41a', marginRight: 8 }} />;
  };

  // Render title cho node (KHÔNG còn nút sửa/xoá)
  const renderTitle = (node) => (
    <div className="flex items-center">
      {renderIcon(node)}
      <span>{node.title}</span>
    </div>
  );

  // Đệ quy map lại treeData để dùng renderTitle
  const mapTreeWithTitle = (nodes) =>
    nodes.map(node => ({
      ...node,
      title: renderTitle(node),
      children: node.children ? mapTreeWithTitle(node.children) : undefined,
    }));

  // Khi chọn node, fetch chi tiết qua API
  const handleSelect = async (selectedKeys, info) => {
    if (info && info.node) {
      try {
        const res = await customizeAxios.get(`/api/categories/${info.node.key}`);
        if (res && res.data) {
          setSelectedCategory(res.data);
        }
      } catch {
        setSelectedCategory(null);
        message.error('Không lấy được thông tin chi tiết category');
      }
    }
  };

  // Xoá category
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    Modal.confirm({
      title: 'Xác nhận xoá',
      icon: <DeleteOutlined style={{ color: 'red' }} />,
      content: `Bạn có chắc muốn xoá category "${selectedCategory.name}"?` ,
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: async () => {
        try {
          await customizeAxios.delete(`/api/categories/${selectedCategory.categoryId}`);
          message.success('Xoá Category thành công');
          fetchAndExpandAll();
          fetchParentOptions();
          setSelectedCategory(null);
        } catch {
          message.error('Lỗi khi xoá Category');
        }
      },
    });
  };

  // Mở modal sửa (update)
  const handleEditCategory = () => {
    if (selectedCategory) {
      openModal(selectedCategory);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Row gutter={24}>
        <Col xs={24} md={14} lg={14} style={{ minWidth: 0 }}>
          <Card
            title={<span className="flex items-center gap-2"><FolderOutlined /> Danh mục sản phẩm</span>}
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm Category</Button>}
            className="shadow-lg rounded-lg"
            bodyStyle={{ padding: 16, minHeight: 500 }}
          >
            <Spin spinning={treeLoading}>
              <Tree
                treeData={mapTreeWithTitle(treeData)}
                onSelect={handleSelect}
                expandedKeys={expandedKeys}
                onExpand={setExpandedKeys}
                showLine
                height={500}
              />
            </Spin>
          </Card>
        </Col>
        <Col xs={24} md={10} lg={10} style={{ minWidth: 0 }}>
          <Card
            title={<span className="flex items-center gap-2"><InfoCircleOutlined /> Thông tin chi tiết</span>}
            className="shadow-lg rounded-lg min-h-[500px]"
            bodyStyle={{ padding: 32 }}
          >
            {selectedCategory ? (
              <div className="space-y-4">
                <div className="text-xl font-bold flex items-center gap-2">
                  {renderIcon(selectedCategory)}
                  {selectedCategory.name}
                </div>
                <div><b>Mô tả:</b> {selectedCategory.description || <span className="italic text-gray-400">(Chưa có mô tả)</span>}</div>
                <div><b>Category cha:</b> {selectedCategory.parent ? selectedCategory.parent.name : <span className="italic text-gray-400">(Không có)</span>}</div>
                <div><b>Số lượng con:</b> {selectedCategory.subcategories ? selectedCategory.subcategories.length : 0}</div>
                <div className="flex gap-3 mt-6">
                  <Button icon={<EditOutlined />} type="primary" onClick={handleEditCategory}>Sửa</Button>
                  <Button icon={<DeleteOutlined />} danger onClick={handleDeleteCategory}>Xoá</Button>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 flex flex-col items-center justify-center h-full">
                <InfoCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                Chọn một category để xem chi tiết
              </div>
            )}
          </Card>
        </Col>
      </Row>
      <Modal
        title={editingCategory ? <span><EditOutlined /> Sửa Category</span> : <span><PlusOutlined /> Thêm Category</span>}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
        centered
        bodyStyle={{ padding: 20 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên Category" rules={[{ required: true, message: 'Vui lòng nhập tên category' }]}> 
            <Input size="large" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}> 
            <Input.TextArea rows={3} size="large" />
          </Form.Item>
          <Form.Item name="parentId" label="Parent Category">
            <Select
              allowClear
              options={parentOptions}
              placeholder="Chọn category cha (nếu có)"
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManager; 