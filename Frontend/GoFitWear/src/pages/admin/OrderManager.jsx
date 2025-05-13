import { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Button, Tag, Select, Input, Pagination, Spin, message, Descriptions, Modal, DatePicker, Statistic, Tooltip } from 'antd';
import { InfoCircleOutlined, SearchOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, BarChartOutlined, PieChartOutlined, DollarOutlined } from '@ant-design/icons';
import customizeAxios from '../../services/customizeAxios';
import { Bar, Pie } from '@ant-design/charts';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
dayjs.extend(quarterOfYear);

const { Option } = Select;
const { RangePicker } = DatePicker;
const PAGE_SIZE = 5;

const statusColors = {
  PENDING: 'orange',
  PROCESSING: 'blue',
  SHIPPED: 'purple',
  DELIVERED: 'green',
  CANCELLED: 'red',
};

const statusOptions = [
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'SHIPPED', label: 'Đã gửi hàng' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã huỷ' },
];

const periodOptions = [
  { value: 'month', label: 'Tháng' },
  { value: 'quarter', label: 'Quý' },
  { value: 'year', label: 'Năm' },
];

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: PAGE_SIZE, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState();
  const [detailLoading, setDetailLoading] = useState(false);
  const [statPeriod, setStatPeriod] = useState('month');
  const [statDate, setStatDate] = useState(dayjs());
  const [statLoading, setStatLoading] = useState(false);
  const [revenue, setRevenue] = useState(0);
  const [statusPie, setStatusPie] = useState([]);
  const [paymentPie, setPaymentPie] = useState([]);
  const [totalOrder, setTotalOrder] = useState(0);
  const [cancelPercent, setCancelPercent] = useState(0);

  // Fetch orders list
  const fetchOrders = async (page = 1, status) => {
    setLoading(true);
    try {
      let url = `/api/admin/orders?page=${page - 1}&size=${PAGE_SIZE}`;
      let params = {};
      if (status) {
        params.filter = `status='${status}'`;
      }
      const res = await customizeAxios.get(url, { params });
      if (res && res.data) {
        setOrders(res.data.data);
        setMeta(res.data.meta);
      }
    } catch {
      message.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Fetch order detail
  const fetchOrderDetail = async (orderId) => {
    setDetailLoading(true);
    try {
      const res = await customizeAxios.get(`/api/orders/${orderId}`);
      if (res && res.data) {
        setSelectedOrder(res.data);
      }
    } catch {
      message.error('Không lấy được chi tiết đơn hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  // Fetch all orders for statistics (by period)
  const fetchStatOrders = async () => {
    setStatLoading(true);
    try {
      let allOrders = [];
      let page = 0;
      let totalPages = 1;
      let urlBase = '/api/admin/orders?size=50';
      let start, end;
      if (statPeriod === 'month') {
        start = statDate.startOf('month');
        end = statDate.endOf('month');
      } else if (statPeriod === 'quarter') {
        const q = statDate.quarter();
        const y = statDate.year();
        start = dayjs(`${y}-01-01`).quarter(q).startOf('quarter');
        end = dayjs(`${y}-01-01`).quarter(q).endOf('quarter');
      } else {
        start = statDate.startOf('year');
        end = statDate.endOf('year');
      }
      do {
        const url = `${urlBase}&page=${page}`;
        const res = await customizeAxios.get(url);
        if (res && res.data && res.data.data) {
          const orders = res.data.data.data || res.data.data;
          allOrders = allOrders.concat(orders);
          totalPages = res.data.data.meta ? res.data.data.meta.pages : 1;
        }
        page++;
      } while (page < totalPages);
      // Lọc theo thời gian
      const filtered = allOrders.filter(o => {
        const d = dayjs(o.orderDate);
        return d.isAfter(start.subtract(1, 'second')) && d.isBefore(end.add(1, 'second'));
      });
      // Tính doanh thu (bỏ CANCELLED)
      const rev = filtered.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.totalAmount, 0);
      setRevenue(rev);
      // Tính tỉ lệ trạng thái
      const statusCount = {};
      statusOptions.forEach(s => statusCount[s.value] = 0);
      filtered.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1; });
      const totalOrder = filtered.length;
      setStatusPie(statusOptions.map(s => ({
        type: s.label,
        value: statusCount[s.value],
        percent: totalOrder > 0 ? (statusCount[s.value] / totalOrder * 100).toFixed(1) : 0
      })));
      // Tính tỉ lệ phương thức thanh toán
      const paymentCount = {};
      filtered.forEach(o => {
        paymentCount[o.paymentMethod] = (paymentCount[o.paymentMethod] || 0) + 1;
      });
      const paymentPie = Object.keys(paymentCount).map(k => ({
        type: k,
        value: paymentCount[k],
        percent: totalOrder > 0 ? (paymentCount[k] / totalOrder * 100).toFixed(1) : 0
      }));
      setPaymentPie(paymentPie);
      setTotalOrder(totalOrder);
      setCancelPercent(totalOrder > 0 ? (statusCount['CANCELLED'] / totalOrder * 100).toFixed(1) : 0);
    } catch {
      setRevenue(0);
      setStatusPie([]);
      setPaymentPie([]);
      setTotalOrder(0);
      setCancelPercent(0);
    } finally {
      setStatLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, filterStatus);
  }, [filterStatus]);

  useEffect(() => {
    fetchStatOrders();
  }, [statPeriod, statDate]);

  // Table columns
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      width: 80,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'username',
      width: 120,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      width: 140,
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      width: 120,
      render: (amount) => amount.toLocaleString('vi-VN') + ' ₫',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      width: 100,
      render: (_, record) => (
        <Button size="small" onClick={() => fetchOrderDetail(record.orderId)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Filter + search bar
  const filterBar = (
    <div className="flex gap-2 mb-4 items-center">
      <Select
        allowClear
        placeholder="Lọc trạng thái"
        style={{ width: 150 }}
        value={filterStatus}
        onChange={setFilterStatus}
        options={statusOptions}
      />
      <Button icon={<ReloadOutlined />} onClick={() => fetchOrders(meta.page, filterStatus)} />
    </div>
  );

  // Update status
  const handleUpdateStatus = async (orderId, status) => {
    try {
      await customizeAxios.patch(`/api/admin/orders/${orderId}/status?status=${status}`);
      message.success('Cập nhật trạng thái thành công');
      fetchOrders(meta.page, filterStatus);
      fetchOrderDetail(orderId);
    } catch {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    Modal.confirm({
      title: 'Xác nhận huỷ đơn',
      icon: <CloseCircleOutlined style={{ color: 'red' }} />,
      content: 'Bạn có chắc muốn huỷ đơn hàng này?',
      okText: 'Huỷ',
      okType: 'danger',
      cancelText: 'Không',
      onOk: async () => {
        try {
          await customizeAxios.patch(`/api/admin/orders/${orderId}/status?status=CANCELLED`);
          message.success('Đã huỷ đơn hàng');
          fetchOrders(meta.page, filterStatus);
          setSelectedOrder(null);
        } catch {
          message.error('Lỗi khi huỷ đơn hàng');
        }
      },
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Thống kê doanh thu & trạng thái */}
      <Row gutter={24} className="mb-6" align="stretch">
        <Col xs={24} md={8} lg={8} style={{ height: 350 }}>
          <Card
            title={<span className="flex items-center gap-2"><BarChartOutlined /> Doanh thu ({
              statPeriod === 'quarter'
                ? `Quý ${statDate.quarter()} ${statDate.year()}`
                : periodOptions.find(p => p.value === statPeriod).label + ' ' + statDate.format(statPeriod === 'year' ? 'YYYY' : 'MM/YYYY')
            })</span>}
            className="shadow-[0_6px_32px_0_rgba(0,0,0,0.28)] border border-black rounded-lg"
            bodyStyle={{ padding: 24 }}
            style={{ height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}
          >
            <div className="flex gap-2 mb-4">
              <Select value={statPeriod} onChange={setStatPeriod} style={{ width: 100 }} options={periodOptions} />
              <DatePicker
                picker={statPeriod}
                value={statDate}
                onChange={setStatDate}
                allowClear={false}
                style={{ width: statPeriod==='year'?120:statPeriod==='quarter'?140:110 }}
              />
            </div>
            <Spin spinning={statLoading}>
              <Statistic
                title="Tổng doanh thu"
                value={revenue}
                precision={0}
                valueStyle={{ color: '#3f8600', fontWeight: 700, fontSize: 28 }}
                suffix="₫"
              />
              <div className="mt-4">
                <Bar
                  data={[{ type: 'Doanh thu', value: revenue }]}
                  xField="type"
                  yField="value"
                  height={120}
                  color="#3f8600"
                  label={{ position: 'middle', style: { fill: '#fff' } }}
                  xAxis={false}
                  yAxis={false}
                  legend={false}
                />
              </div>
            </Spin>
          </Card>
        </Col>
        <Col xs={24} md={8} lg={8} style={{ height: 350 }}>
          <Card
            title={<span className="flex items-center gap-2"><PieChartOutlined /> Tỉ lệ trạng thái đơn ({
              statPeriod === 'quarter'
                ? `Quý ${statDate.quarter()} ${statDate.year()}`
                : periodOptions.find(p => p.value === statPeriod).label + ' ' + statDate.format(statPeriod === 'year' ? 'YYYY' : 'MM/YYYY')
            })</span>}
            className="shadow-[0_6px_32px_0_rgba(0,0,0,0.28)] border border-black rounded-lg"
            bodyStyle={{ padding: 24 }}
            style={{ height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}
          >
            <Spin spinning={statLoading}>
              <Pie
                data={statusPie}
                angleField="value"
                colorField="type"
                height={180}
                legend={{ position: 'bottom' }}
                label={{ type: 'outer', content: d => `${d.type} (${d.value}, ${d.percent}%)` }}
                color={[ '#faad14', '#1890ff', '#722ed1', '#52c41a', '#ff4d4f' ]}
                tooltip={{
                  customContent: (title, items) => items && items.length ? `<div style='padding:4px 8px'>${items[0].data.type}: <b>${items[0].data.value}</b> đơn (${items[0].data.percent}%)</div>` : ''
                }}
              />
              <div className="mt-2 text-center">
                <Tooltip title="Tỉ lệ đơn huỷ trên tổng số đơn">
                  <Tag color="red">Tỉ lệ huỷ: {cancelPercent}%</Tag>
                </Tooltip>
                <span className="ml-2 text-gray-500">Tổng đơn: {totalOrder}</span>
              </div>
            </Spin>
          </Card>
        </Col>
        <Col xs={24} md={8} lg={8} style={{ height: 350 }}>
          <Card
            title={<span className="flex items-center gap-2"><DollarOutlined /> Tỉ lệ phương thức thanh toán ({
              statPeriod === 'quarter'
                ? `Quý ${statDate.quarter()} ${statDate.year()}`
                : periodOptions.find(p => p.value === statPeriod).label + ' ' + statDate.format(statPeriod === 'year' ? 'YYYY' : 'MM/YYYY')
            })</span>}
            className="shadow-[0_6px_32px_0_rgba(0,0,0,0.28)] border border-black rounded-lg"
            bodyStyle={{ padding: 24 }}
            style={{ height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}
          >
            <Spin spinning={statLoading}>
              <Pie
                data={paymentPie}
                angleField="value"
                colorField="type"
                height={180}
                legend={{ position: 'bottom' }}
                label={{ type: 'outer', content: d => `${d.type} (${d.value}, ${d.percent}%)` }}
                color={[ '#1890ff', '#faad14', '#52c41a', '#ff4d4f', '#722ed1' ]}
                tooltip={{
                  customContent: (title, items) => items && items.length ? `<div style='padding:4px 8px'>${items[0].data.type}: <b>${items[0].data.value}</b> đơn (${items[0].data.percent}%)</div>` : ''
                }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col xs={24} md={14} lg={14} style={{ minWidth: 0, height: 500 }}>
          <Card
            title={<span className="flex items-center gap-2"><SyncOutlined /> Danh sách đơn hàng</span>}
            className="shadow-[0_6px_32px_0_rgba(0,0,0,0.28)] border border-black rounded-lg"
            bodyStyle={{ padding: 16, minHeight: 500 }}
            style={{ height: 600, display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}
          >
            {filterBar}
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={orders}
                rowKey="orderId"
                pagination={false}
                size="middle"
                onRow={record => ({
                  onClick: () => fetchOrderDetail(record.orderId),
                  style: { cursor: 'pointer' },
                })}
                rowClassName={record => selectedOrder && selectedOrder.orderId === record.orderId ? 'bg-blue-50' : ''}
              />
              <div className="flex justify-end mt-4">
                <Pagination
                  current={meta.page}
                  pageSize={meta.pageSize}
                  total={meta.total}
                  onChange={page => fetchOrders(page, filterStatus)}
                  showSizeChanger={false}
                />
              </div>
            </Spin>
          </Card>
        </Col>
        <Col xs={24} md={10} lg={10} style={{ minWidth: 0, height: '100%' }}>
          <Card
            title={<span className="flex items-center gap-2"><InfoCircleOutlined /> Thông tin đơn hàng</span>}
            className="shadow-[0_6px_32px_0_rgba(0,0,0,0.28)] border border-black rounded-lg min-h-[500px]"
            bodyStyle={{ padding: 32 }}
            style={{ height: '100%', minHeight: 700, display: 'flex', flexDirection: 'column' }}
          >
            {detailLoading ? <Spin /> : selectedOrder ? (
              <div className="space-y-4">
                <Descriptions column={1} bordered size="middle">
                  <Descriptions.Item label="Mã đơn">{selectedOrder.orderId}</Descriptions.Item>
                  <Descriptions.Item label="Khách hàng">{selectedOrder.username}</Descriptions.Item>
                  <Descriptions.Item label="Ngày đặt">{new Date(selectedOrder.orderDate).toLocaleString('vi-VN')}</Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền">{selectedOrder.totalAmount.toLocaleString('vi-VN')} ₫</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={statusColors[selectedOrder.status]}>{selectedOrder.status}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Thanh toán">
                    <Tag color={selectedOrder.paymentStatus === 'PENDING' ? 'orange' : 'green'}>{selectedOrder.paymentStatus}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Phương thức thanh toán">{selectedOrder.paymentMethod}</Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ giao hàng">{selectedOrder.shippingAddress}</Descriptions.Item>
                  <Descriptions.Item label="SĐT giao hàng">{selectedOrder.shippingPhone}</Descriptions.Item>
                </Descriptions>
                <div>
                  <b>Sản phẩm trong đơn:</b>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.orderItems.map(item => (
                      <div
                        key={item.orderItemId}
                        className="flex items-center border border-black p-4 rounded-lg bg-gray-50 h-32 items-stretch shadow-[0_6px_32px_0_rgba(0,0,0,0.28)]"
                      >
                        <img src={item.variant.product.imageUrl} alt="sp" className="w-16 h-16 object-cover rounded" />
                        <div className="ml-4">
                          <div className="font-semibold">{item.variant.product.name}</div>
                          <div className="text-xs text-gray-500">{item.variant.size} - {item.variant.color}</div>
                          <div className="text-xs">SL: {item.quantity} x {item.unitPrice.toLocaleString('vi-VN')} ₫</div>
                          <div className="text-xs">Tạm tính: <b>{item.subtotal.toLocaleString('vi-VN')} ₫</b></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Select
                    value={selectedOrder.status}
                    onChange={status => handleUpdateStatus(selectedOrder.orderId, status)}
                    style={{ width: 180 }}
                    options={statusOptions}
                  />
                  {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                    <Button
                      icon={<CloseCircleOutlined />}
                      className="!px-4 !py-2 !text-medium !bg-white !text-red-600 !border-2 !border-red-600 !rounded !transition-colors hover:!bg-red-600 hover:!text-white hover:!border-red-600 !font-semibold"
                      onClick={() => handleCancelOrder(selectedOrder.orderId)}
                    >
                      Huỷ đơn
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 flex flex-col items-center justify-center h-full">
                <InfoCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                Chọn một đơn hàng để xem chi tiết
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderManager; 