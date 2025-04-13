import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import axios from 'axios';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const userStorage = JSON.parse(localStorage.getItem("user"));
        if (!userStorage?.userId) {
            message.info("Vui lòng đăng nhập để xem giỏ hàng");
            navigate('/login');
            return;
        }
        setUserInfo(userStorage);
        fetchCartItems(userStorage.userId);
    }, [navigate]);

    const fetchCartItems = async (userId) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/api/users/${userId}/cart`);
            if (response.data.statusCode === 200) {
                setCartItems(response.data.data.cartItems || []);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            message.error('Không thể tải giỏ hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (cartItemId, variantId, newQuantity) => {
        if (!userInfo?.userId) return;
        
        try {
            if (newQuantity <= 0) {
                await axios.delete(`http://localhost:8080/api/users/${userInfo.userId}/cart/items/${cartItemId}`);
                message.success("Đã xóa sản phẩm khỏi giỏ hàng");
            } else {
                await axios.put(`http://localhost:8080/api/users/${userInfo.userId}/cart/items/${cartItemId}`, {
                    variantId: variantId,
                    quantity: newQuantity
                });
                message.success("Đã cập nhật số lượng sản phẩm");
            }
            fetchCartItems(userInfo.userId);
            window.dispatchEvent(new CustomEvent('cart-updated'));
        } catch (error) {
            console.error("Failed to update cart:", error);
            message.error("Không thể cập nhật giỏ hàng");
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.variant.price * item.quantity), 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-[85%]">
            <h1 className="text-2xl font-bold mb-8">CHI TIẾT GIỎ HÀNG</h1>
            
            <div className="border-2 border-gray-200 rounded-lg">
                <table className="w-full">
                    <thead className="bg-black text-white">
                        <tr>
                            <th className="py-3 px-4 text-left font-extralight">STT</th>
                            <th className="py-3 px-4 text-left font-extralight">Mã sản phẩm</th>
                            <th className="py-3 px-4 text-left font-extralight">Sản phẩm</th>
                            <th className="py-3 px-4 text-center font-extralight">Số lượng</th>
                            <th className="py-3 px-4 text-right font-extralight">Thành tiền</th>
                            <th className="py-3 px-4 text-center font-extralight">Xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map((item, index) => (
                            <tr key={item.cartItemId} className="border-t border-gray-200">
                                <td className="py-4 px-4">{index + 1}</td>
                                <td className="py-4 px-4 text-gray-600">{item.variant.product.name}</td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center space-x-4">
                                        <img 
                                            src={item.variant.imageUrl} 
                                            alt={item.variant.product.name}
                                            className="w-20 h-20 object-cover"
                                        />
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                {item.variant.size} - {item.variant.color}
                                            </p>
                                            <p className="text-sm font-medium mt-1">
                                                {formatPrice(item.variant.price)}đ
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-center">
                                        <div className="flex items-center border border-gray-300 rounded">
                                            <button 
                                                className="w-8 h-8 flex items-center justify-center text-sm border-r border-gray-300"
                                                onClick={() => handleUpdateQuantity(item.cartItemId, item.variant.variantId, item.quantity - 1)}
                                            >
                                                -
                                            </button>
                                            <span className="w-12 text-center">{item.quantity}</span>
                                            <button 
                                                className="w-8 h-8 flex items-center justify-center text-sm border-l border-gray-300"
                                                onClick={() => {
                                                    if (item.quantity < item.variant.stockQuantity) {
                                                        handleUpdateQuantity(item.cartItemId, item.variant.variantId, item.quantity + 1);
                                                    }
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right font-medium">
                                    {formatPrice(item.variant.price * item.quantity)}đ
                                </td>
                                <td className="py-4 px-4">
                                    <button 
                                        className="mx-auto block hover:text-red-500"
                                        onClick={() => handleUpdateQuantity(item.cartItemId, item.variant.variantId, 0)}
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex justify-between items-center">
                <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-2 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-colors"
                >
                    MUA THÊM SẢN PHẨM KHÁC
                </button>
                <div className="text-right">
                    <div className="text-lg mb-2">
                        Tổng tiền = <span className="font-bold">{formatPrice(calculateTotal())}đ</span>
                    </div>
                    <button className="px-8 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors">
                        THANH TOÁN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart; 