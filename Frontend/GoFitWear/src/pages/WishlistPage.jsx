import React, { useState, useEffect } from 'react';
import { Empty, message } from 'antd';
import { fetchWishlist, removeFromWishlist } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';

const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserWishlist = async () => {
            try {
                const userStorage = JSON.parse(localStorage.getItem("user"));
                if (!userStorage?.userId) {
                    message.info("Vui lòng đăng nhập để xem danh sách yêu thích");
                    navigate('/login');
                    return;
                }

                setLoading(true);
                const response = await fetchWishlist(userStorage.userId);
                if (response && response.statusCode === 200) {
                    setWishlistItems(response.data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch wishlist:", error);
                message.error("Không thể tải danh sách yêu thích");
            } finally {
                setLoading(false);
            }
        };

        fetchUserWishlist();
    }, [navigate]);

    const handleRemoveFromWishlist = async (wishlistItemId) => {
        try {
            const userStorage = JSON.parse(localStorage.getItem("user"));
            if (!userStorage?.userId) return;

            await removeFromWishlist(userStorage.userId, wishlistItemId);
            setWishlistItems(wishlistItems.filter(item => item.id !== wishlistItemId));
            message.success("Đã xóa sản phẩm khỏi danh sách yêu thích");
            
            // Trigger update event for header
            window.dispatchEvent(new CustomEvent('wishlist-updated'));
        } catch (error) {
            console.error("Failed to remove from wishlist:", error);
            message.error("Không thể xóa sản phẩm khỏi danh sách yêu thích");
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price) + 'đ';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-8">SẢN PHẨM YÊU THÍCH</h1>
                <div className="text-center max-w-md">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span className="text-lg text-gray-500">
                                Danh sách yêu thích của bạn hiện đang trống
                            </span>
                        }
                    />
                    <p className="mt-4 text-gray-500">
                        Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng theo dõi và mua sau
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        className="mt-8 px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center mx-auto"
                    >
                        <FiShoppingBag className="mr-2" /> Khám phá sản phẩm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-[80%] font-montserrat">
            <div className="border-2 border-gray-300 shadow-[0_8px_40px_0_rgba(0,0,0,0.25)]">
                <h1 className="text-2xl font-bold text-center bg-black text-white py-4 font-montserrat">
                    SẢN PHẨM YÊU THÍCH
                </h1>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="group relative bg-white p-4 border-2 border-gray-300 rounded-xl shadow-[0_6px_32px_0_rgba(0,0,0,0.28)]">
                                <div 
                                    className="aspect-w-1 aspect-h-1 cursor-pointer"
                                    onClick={() => navigate(`/product/${item.product.productId}`)}
                                >
                                    <img
                                        src={item.product.imageUrl || 'https://placehold.co/300x300?text=No+Image'}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm font-medium product-title">{item.product.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">Mã sản phẩm: {item.product.productId}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveFromWishlist(item.id)}
                                            className="text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-sm font-semibold mt-2 product-price">{formatPrice(item.product.price)}</p>
                                    <button 
                                        onClick={() => navigate(`/product/${item.product.productId}`)}
                                        className="w-full mt-2 py-2 bg-black text-white text-sm font-medium border-2 border-black rounded shadow-[0_4px_24px_0_rgba(0,0,0,0.28)] hover:bg-white hover:text-black hover:border-black transition-colors button-text"
                                    >
                                        MUA NGAY
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WishlistPage;