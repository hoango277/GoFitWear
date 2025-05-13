import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spin, Button } from 'antd';
import customizeAxios from '../services/customizeAxios';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const VnpayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy các query params từ URL (VNPAY sẽ trả về nhiều thông tin)
    const params = new URLSearchParams(location.search);
    const vnp_TxnRef = params.get('vnp_TxnRef'); // Mã đơn hàng
    const vnp_Amount = params.get('vnp_Amount'); // Số tiền (đã nhân 100)
    const vnp_PayDate = params.get('vnp_PayDate'); // Ngày thanh toán

    // Lưu thông tin để hiển thị
    setOrderInfo({
      orderId: vnp_TxnRef,
      amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : 0,
      payDate: vnp_PayDate
    });

    const verifyPayment = async () => {
      try {
        const callbackUrl = `/vnpay-payment-callback?${params.toString()}`;
        const response = await customizeAxios.get(callbackUrl);
        
        console.log(response);
        if (response.data && response.data.status === 'success') {
          setStatus('success');
        } else {
          setStatus('fail');
        }
      } catch (error) {
        console.error('Lỗi xác nhận thanh toán:', error);
        setStatus('fail');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location.search]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Đang xác nhận thanh toán...</p>
      </div>
    );
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    
    try {
      // Format: YYYYMMDDHHMMSS to YYYY-MM-DD HH:MM:SS
      return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)} ${dateStr.substring(8, 10)}:${dateStr.substring(10, 12)}:${dateStr.substring(12, 14)}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen py-12" style={{
    }}>
      <div className="max-w-3xl mx-auto bg-white rounded-lg border border-black shadow-[0_8px_40px_0_rgba(0,0,0,0.3)] p-8 mt-15">
        <div className="flex flex-col items-center text-center mb-8">
          {status === 'success' ? (
             <CheckCircleOutlined className="text-5xl text-green-500" />
          ) : (
           <CloseCircleOutlined className="text-5xl text-red-500" />
          )}
          
          <h1 className="text-3xl font-bold mb-2">
            {status === 'success' ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
          </h1>
          
          <p className="text-gray-600">
            {status === 'success' 
              ? 'Cảm ơn bạn đã mua hàng. Đơn hàng của bạn sẽ được xử lý trong thời gian sớm nhất.'
              : 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ với chúng tôi để được hỗ trợ.'}
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Thông tin thanh toán</h2>
          
          {orderInfo && (
            <div className="space-y-4 bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-inner">
              <div className="flex justify-between">
                <span className="font-medium">Mã đơn hàng:</span>
                <span className="font-semibold">{orderInfo.orderId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Số tiền:</span>
                <span className="font-bold text-red-600">{new Intl.NumberFormat('vi-VN').format(orderInfo.amount)}đ</span>
              </div>
              
              {orderInfo.payDate && (
                <div className="flex justify-between">
                  <span className="font-medium">Thời gian thanh toán:</span>
                  <span>{formatDateTime(orderInfo.payDate)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <Button 
            type="primary" 
            size="large" 
            onClick={() => navigate('/')}
            className="bg-black hover:bg-gray-800 text-white border-2 border-black shadow-[0_4px_10px_0_rgba(0,0,0,0.25)] font-medium px-6"
          >
            Về trang chủ
          </Button>
          <Button 
            size="large" 
            onClick={() => navigate('/order')}
            className="border-2 border-black text-black hover:bg-black hover:text-white shadow-[0_4px_10px_0_rgba(0,0,0,0.25)] font-medium px-6"
          >
            Xem đơn hàng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VnpayReturn; 