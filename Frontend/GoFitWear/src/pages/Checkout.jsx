import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import customizeAxios from '../services/customizeAxios';
import './checkout/checkout.css'; // Import CSS cho radio buttons tùy chỉnh

const Checkout = () => {
    const navigate = useNavigate();
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        paymentMethod: 'COD',
        discountCode: '',
    });
    const [discount, setDiscount] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);

    useEffect(() => {
        // Lấy thông tin người dùng từ localStorage
        const userStorage = JSON.parse(localStorage.getItem("user"));
        if (!userStorage?.userId) {
            message.info("Vui lòng đăng nhập để tiếp tục thanh toán");
            navigate('/login');
            return;
        }
        setUserInfo(userStorage);

        // Điền thông tin từ localStorage vào form nếu có
        setFormData(prev => ({
            ...prev,
            fullName: userStorage.fullName || '',
            email: userStorage.email || '',
            phone: userStorage.phone || '',
            address: userStorage.address || ''
        }));

        // Lấy danh sách sản phẩm đã chọn từ localStorage
        const items = JSON.parse(localStorage.getItem('checkoutItems') || '[]');
        if (items.length === 0) {
            message.info("Không có sản phẩm nào được chọn để thanh toán");
            navigate('/cart');
            return;
        }
        setCheckoutItems(items);
        setLoading(false);

        // Chỉ gọi API nếu thông tin trong localStorage không đầy đủ
        if (!userStorage.fullName || !userStorage.phone || !userStorage.address) {
            fetchUserProfile(userStorage.userId);
        }
    }, [navigate]);

    const fetchUserProfile = async (userId) => {
        try {
            const response = await customizeAxios.get(`/api/users/${userId}/profile`);
            console.log(response);
            if (response.data.statusCode === 200) {
                const userProfile = response.data.data;
                
                // Cập nhật dữ liệu form từ API
                const updatedFormData = {
                    ...formData,
                    fullName: userProfile.fullName || formData.fullName,
                    email: userProfile.email || formData.email,
                    phone: userProfile.phone || formData.phone,
                    address: userProfile.address || formData.address
                };
                
                setFormData(updatedFormData);
                
                // Cập nhật thông tin user trong localStorage để lần sau không cần gọi API nữa
                const userStorage = JSON.parse(localStorage.getItem("user"));
                localStorage.setItem("user", JSON.stringify({
                    ...userStorage,
                    fullName: userProfile.fullName,
                    email: userProfile.email,
                    phone: userProfile.phone,
                    address: userProfile.address
                }));
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRadioChange = (e) => {
        setFormData(prev => ({ ...prev, paymentMethod: e.target.value }));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const calculateSubtotal = () => {
        return checkoutItems.reduce((total, item) => total + (item.variant.price * item.quantity), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - discount + shippingFee;
    };

    const applyDiscountCode = () => {
        // Thực hiện logic kiểm tra mã giảm giá ở đây
        if (formData.discountCode) {
            // Giả lập việc áp dụng mã giảm giá
            if (formData.discountCode === 'GIAMGIA10') {
                const discountValue = calculateSubtotal() * 0.1;
                setDiscount(discountValue);
                message.success("Áp dụng mã giảm giá thành công: Giảm 10%");
            } else {
                message.error("Mã giảm giá không hợp lệ");
                setDiscount(0);
            }
        }
    };

    const handlePlaceOrder = async () => {
        // Kiểm tra form
        if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
            message.error("Vui lòng điền đầy đủ thông tin giao hàng");
            return;
        }

        try {
            // Chuẩn bị dữ liệu đơn hàng cho API mới
            const cartItemIds = checkoutItems.map(item => item.cartItemId);
            const checkoutData = {
                shippingAddress: formData.address,
                shippingPhone: formData.phone,
                paymentMethod: formData.paymentMethod,
                cartItemIds: cartItemIds
            };

            // Gọi API mới
            const response = await customizeAxios.post(`/api/users/${userInfo.userId}/checkout`, checkoutData);
            console.log(response);
            if (response.statusCode === 201) {
                message.success("Đặt hàng thành công!");
                // Xóa dữ liệu thanh toán từ localStorage
                localStorage.removeItem('checkoutItems');
                // Cập nhật giỏ hàng
                window.dispatchEvent(new CustomEvent('cart-updated'));
                // Chuyển hướng đến trang Order mới tạo
                navigate(`/order`);
            }
        } catch (error) {
            console.error("Đặt hàng thất bại:", error);
            message.error("Đặt hàng thất bại, vui lòng thử lại sau");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[85%] mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">THÔNG TIN ĐƠN HÀNG</h1>
            
            {/* Danh sách sản phẩm đặt hàng */}
            <div className="border rounded-md p-4 mb-8">
                <h2 className="text-lg font-semibold mb-4">DANH SÁCH SẢN PHẨM ĐẶT HÀNG</h2>
                
                {checkoutItems.map((item) => (
                    <div key={item.cartItemId} className="flex items-center gap-4 py-4 border-b">
                        <img 
                            src={item.variant.imageUrl} 
                            alt={item.variant.product.name}
                            className="w-20 h-20 object-cover"
                        />
                        <div className="flex-1">
                            <h3 className="font-medium">{item.variant.product.name}</h3>
                             <div className="flex justify-between mt-2">
                                <span className="text-sm">
                                    {item.variant.size} - {item.variant.color}
                                </span>
                                <div>
                                    <p>Số lượng: {item.quantity}</p>
                                    <p className="font-semibold">{formatPrice(item.variant.price)}đ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Thông tin khách hàng */}
                <div className="flex-1">
                    <div className="border rounded-md p-4 mb-4">
                        <h2 className="text-lg font-semibold mb-4">THÔNG TIN KHÁCH HÀNG</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Nhập email"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm mb-1">Địa chỉ đầy đủ</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                        <h2 className="text-lg font-semibold mb-4">PHƯƠNG THỨC THANH TOÁN</h2>
                        
                        <div className="space-y-2">
                            <label className="flex items-center py-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="COD"
                                    checked={formData.paymentMethod === "COD"}
                                    onChange={handleRadioChange}
                                    className="custom-radio"
                                />
                                <span className="ml-2">Thanh toán khi nhận hàng</span>
                            </label>
                            {/* <label className="flex items-center py-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="BANKING"
                                    checked={formData.paymentMethod === "BANKING"}
                                    onChange={handleRadioChange}
                                    className="custom-radio"
                                />
                                <span className="ml-2">Chuyển khoản ngân hàng</span>
                            </label> */}
                            <label className="flex items-center py-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="VNPAY"
                                    checked={formData.paymentMethod === "VNPAY"}
                                    onChange={handleRadioChange}
                                    className="custom-radio"
                                />
                                <span className="ml-2">Thanh toán với VNPAY</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                {/* Thông tin thanh toán */}
                <div className="w-full md:w-96">
                    <div className="border rounded-md p-4">
                        <h2 className="text-lg font-semibold mb-4">THANH TOÁN</h2>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span>Tạm tính:</span>
                                <span>{formatPrice(calculateSubtotal())}đ</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span>Giảm giá:</span>
                                <span>-{formatPrice(discount)}đ</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span>Phí vận chuyển:</span>
                                <span>{formatPrice(shippingFee)}đ</span>
                            </div>
                            
                            <hr />
                            
                            <div className="flex justify-between font-semibold">
                                <span>Thành tiền:</span>
                                <span>{formatPrice(calculateTotal())}đ</span>
                            </div>
                            
                            <div className="pt-4">
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        name="discountCode"
                                        value={formData.discountCode}
                                        onChange={handleInputChange}
                                        className="flex-1 border px-3 py-2 rounded"
                                        placeholder="Mã giảm giá"
                                    />
                                    <button 
                                        onClick={applyDiscountCode}
                                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                                    >
                                        ÁP DỤNG
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={handlePlaceOrder}
                                    className="w-full bg-black text-white py-3 font-medium rounded hover:bg-gray-800"
                                >
                                    ĐẶT HÀNG →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;