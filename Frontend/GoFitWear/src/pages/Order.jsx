import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Empty, Spin, Tag } from 'antd';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';
const formatDate = (dateStr) => new Date(dateStr).toLocaleString('vi-VN');

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
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
      const res = await axios.get(`http://localhost:8080/api/users/${userId}/orders`, {
        params: { page: 0, size: 8 , sort: 'orderDate,desc' },
      });
      if (res.data.statusCode === 200) {
        setOrders(res.data.data.data || []);
      }
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
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
      <div className="space-y-12">
        {orders.map(order => (
          <div key={order.orderId} className="border rounded-lg p-8 bg-white shadow-[0_8px_40px_0_rgba(0,0,0,0.25)]">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {order.paymentStatus === 'PENDING' && ['MOMO', 'BANKING', 'VNPAY'].includes(order.paymentMethod) && (
                  <div className="flex justify-end mt-4">
                    <button
                      className="px-4 py-2 text-medium bg-black text-white border-2 border-black rounded shadow-[0_4px_24px_0_rgba(0,0,0,0.28)] transition-colors self-center hover:bg-white hover:text-black hover:border-black"
                      onClick={() => {/* TODO: Thêm logic thanh toán */}}
                    >
                      Thanh toán ngay
                    </button>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Order;
