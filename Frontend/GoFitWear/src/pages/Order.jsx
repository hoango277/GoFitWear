import React, { useEffect, useState } from 'react';
import customizeAxios from '../services/customizeAxios';
import { useNavigate } from 'react-router-dom';
import { Empty, Spin, Tag, Modal, message } from 'antd';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';
const formatDate = (dateStr) => new Date(dateStr).toLocaleString('vi-VN');

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [cancelModal, setCancelModal] = useState({ visible: false, orderId: null });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userStorage = JSON.parse(localStorage.getItem('user'));
    if (!userStorage?.userId) {
      navigate('/login');
      return;
    }
    setUserId(userStorage.userId);
    fetchOrders(userStorage.userId);
  }, [navigate]);

  const fetchOrders = async (userId) => {
    setLoading(true);
    try {
      const res = await customizeAxios.get(`/api/users/${userId}/orders`, {
        params: { page: 0, size: 8 , sort: 'orderDate,desc' },
      });
      if (res.statusCode === 200) {
        setOrders(res.data.data || []);
      }
    } catch (_) {
      // Bỏ qua error, chỉ cần reset state orders
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!userId) return;
    try {
      const res = await customizeAxios.post(`/api/users/${userId}/orders/${orderId}/cancel`);
      if (res.statusCode === 200) {
        message.success('Đã hủy đơn hàng thành công!');
        fetchOrders(userId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        message.error('Hủy đơn hàng thất bại!');
      }
    } catch (_) {
      // Bỏ qua error, chỉ hiển thị thông báo lỗi
      message.error('Hủy đơn hàng thất bại!');
    } finally {
      setCancelModal({ visible: false, orderId: null });
    }
  };

  const handleVnpayPayment = async (orderId) => {
    if (!userId) return;
    setPaymentLoading(true);
    
    try {
      // Gọi API để tạo thanh toán VNPAY
      const response = await customizeAxios.post(`/create-payment/${orderId}`, {
      });
      
      if (response.data && response.data.paymentUrl) {
        // Chuyển hướng người dùng đến trang thanh toán VNPAY
        window.location.href = response.data.paymentUrl;
      } else {
        message.error('Không thể khởi tạo thanh toán VNPAY');
      }
    } catch (error) {
      console.error('Lỗi tạo thanh toán:', error);
      message.error('Có lỗi xảy ra khi tạo thanh toán');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><Spin size="large" /></div>;
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-8">LỊCH SỬ ĐƠN HÀNG</h1>
        <Empty description="Bạn chưa có đơn hàng nào" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 py-12">
      <h1 className="text-3xl font-extrabold mb-10">LỊCH SỬ ĐƠN HÀNG</h1>
      <div className="space-y-12 gap-px">
        {orders.map(order => (
          <div key={order.orderId} className="border rounded-lg p-8 bg-white shadow-[0_8px_40px_0_rgba(0,0,0,0.25)] ">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <div>
                <span className="font-semibold text-lg">Mã đơn:</span> #{order.orderId}
                <span className="ml-6 font-semibold text-lg">Ngày đặt:</span> {formatDate(order.orderDate)}
              </div>
              <div className="mt-2 md:mt-0">
                <Tag color={order.status === 'PENDING' ? 'orange' : order.status === 'COMPLETED' ? 'green' : 'red'}>
                  {order.status}
                </Tag>
                <Tag color={order.paymentStatus === 'PENDING' ? 'orange' : 'green'}>
                  {order.paymentStatus === 'PENDING' ? 'Chưa thanh toán' : 'Đã thanh toán'}
                </Tag>
              </div>
            </div>
            <div className="mb-3">
              <span className="font-semibold text-lg">Tổng tiền:</span> <span className="text-2xl font-extrabold text-red-600">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="mb-2 text-base">
              <span className="font-semibold">Địa chỉ nhận:</span> {order.shippingAddress}
              <span className="ml-6 font-semibold">SĐT:</span> {order.shippingPhone}
            </div>
            <div className="mb-2 text-base">
              <span className="font-semibold">Phương thức thanh toán:</span> {order.paymentMethod}
            </div>
            
            <div className="mt-6">
              <div className="font-semibold mb-3 text-lg">Sản phẩm:</div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-1">
                {order.orderItems.map(item => (
                  <div key={item.orderItemId} className="flex items-center border p-4 rounded-lg bg-gray-50 h-32 items-stretch shadow-[0_6px_32px_0_rgba(0,0,0,0.28)]">
                    <div className="h-full w-24 flex-shrink-0 flex items-center justify-center">
                      <img src={item.variant.imageUrl} alt={item.variant.product.name} className="h-full w-full object-cover object-center rounded" />
                    </div>
                    <div className="flex-1 flex flex-col w-full ml-6">
                      <div className="font-bold text-base">{item.variant.product.name}</div>
                      <div className="text-xs text-gray-500 mb-1">{item.variant.size} - {item.variant.color}</div>
                      <div className="text-sm">SL: {item.quantity} x {formatPrice(item.unitPrice)}</div>
                      <div className="text-sm font-semibold text-red-600">Tạm tính: {formatPrice(item.subtotal)}</div>
                    </div>
                  </div>
                ))}
                  {/* Hiển thị nút thanh toán nếu là MOMO, BANKING, VNPAY và chưa thanh toán */}
                <div className='flex-col'>
                  {order.paymentStatus === 'PENDING' && ['MOMO', 'BANKING', 'VNPAY'].includes(order.paymentMethod) && (
                    <div className="flex flex-row align-center justify-center items-center mt-4 gap-3">
                      <button
                        className="px-4 py-2 text-medium bg-black text-white border-2 border-black rounded shadow-[0_4px_24px_0_rgba(0,0,0,0.28)] transition-colors hover:bg-white hover:text-black hover:border-black"
                        onClick={() => {
                          if (order.paymentMethod === 'VNPAY') {
                            handleVnpayPayment(order.orderId);
                          } else if (order.paymentMethod === 'MOMO') {
                            // Xử lý thanh toán MOMO
                          } else if (order.paymentMethod === 'BANKING') {
                            // Xử lý thanh toán BANKING
                          }
                        }}
                        disabled={paymentLoading}
                      >
                        {paymentLoading ? 'Đang xử lý...' : 'Thanh toán ngay'}
                      </button>
                      <button
                        className="px-4 py-2 text-medium bg-white text-black border-2 border-black rounded shadow-[0_4px_24px_0_rgba(0,0,0,0.28)] transition-colors hover:bg-black hover:text-white hover:border-black"
                        onClick={() => setCancelModal({ visible: true, orderId: order.orderId })}
                      >
                        Hủy đơn hàng
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        ))}
      </div>
      <Modal
        open={cancelModal.visible}
        onCancel={() => setCancelModal({ visible: false, orderId: null })}
        footer={null}
        centered
        className="rounded-lg"
      >
        <div className="text-center p-4">
          <div className="text-xl font-bold mb-2 text-black">Xác nhận hủy đơn hàng?</div>
          <div className="mb-6 text-gray-700">Bạn có chắc chắn muốn hủy đơn hàng này không? Thao tác này không thể hoàn tác.</div>
          <div className="flex justify-center gap-4">
            <button
              className="px-6 py-2 rounded border-2 border-black bg-white text-black font-medium hover:bg-black hover:text-white transition-colors"
              onClick={() => setCancelModal({ visible: false, orderId: null })}
            >
              Không, giữ lại
            </button>
            <button
              className="px-6 py-2 rounded border-2 border-black bg-black text-white font-medium hover:bg-white hover:text-black transition-colors"
              onClick={() => handleCancelOrder(cancelModal.orderId)}
            >
              Có, hủy đơn
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Order;
