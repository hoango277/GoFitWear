import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { message, Spin } from 'antd';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../services/api';

const ProductCard = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [wishlistItemId, setWishlistItemId] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const userStorage = JSON.parse(localStorage.getItem("user"));
        if (userStorage?.userId) {
            setUserInfo(userStorage);
            loadWishlistStatus(userStorage.userId);
        }
    }, [product.productId]);

    const loadWishlistStatus = async (userId) => {
        try {
            const response = await fetchWishlist(userId);
            if (response?.data?.data) {
                const wishlistItems = response.data.data;
                const wishlistItem = wishlistItems.find(item => item.product.productId === product.productId);
                if (wishlistItem) {
                    setIsWishlisted(true);
                    setWishlistItemId(wishlistItem.id);
                } else {
                    setIsWishlisted(false);
                    setWishlistItemId(null);
                }
            }
        } catch (error) {
            console.error("Failed to load wishlist status:", error);
        }
    };

    const handleWishlistClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userInfo) {
            message.info("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
            return;
        }

        try {
            setIsLoading(true);
            setIsAnimating(true);
            
            if (isWishlisted) {
                await removeFromWishlist(userInfo.userId, wishlistItemId);
                // Đợi một chút để hiển thị loading
                await new Promise(resolve => setTimeout(resolve, 300));
                message.success("Đã xóa khỏi danh sách yêu thích");
            } else {
                await addToWishlist(userInfo.userId, product.productId);
                // Đợi một chút để hiển thị loading
                await new Promise(resolve => setTimeout(resolve, 300));
                message.success("Đã thêm vào danh sách yêu thích");
            }

            // Cập nhật lại trạng thái wishlist sau khi thêm/xóa
            await loadWishlistStatus(userInfo.userId);
            
            // Trigger wishlist update event
            window.dispatchEvent(new CustomEvent('wishlist-updated'));
        } catch (error) {
            console.error("Wishlist operation failed:", error);
            message.error("Có lỗi xảy ra, vui lòng thử lại");
            // Nếu có lỗi, load lại trạng thái để đảm bảo UI đồng bộ
            await loadWishlistStatus(userInfo.userId);
        } finally {
            setIsLoading(false);
            setTimeout(() => setIsAnimating(false), 500);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div 
            className="relative group font-montserrat"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link 
                to={`/product/${product.productId}`} 
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:scale-105 flex flex-col h-full block"
            >
                <div className="h-64 overflow-hidden relative">
                    <img
                        src={product.imageUrl || 'https://placehold.co/300x300?text=No+Image'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            e.target.src = "https://placehold.co/300x300?text=No+Image";
                        }}
                    />
                    {/* Brand tag */}
                    {product.brand && (
                        <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-xs font-medium uppercase">
                            {product.brand.name}
                        </div>
                    )}
                    {/* Wishlist button */}
                    <button
                        onClick={handleWishlistClick}
                        disabled={isLoading}
                        className={`absolute top-2 left-2 p-2.5 rounded-full transition-all duration-300 focus:outline-none transform ${
                            isWishlisted ? 'bg-red-100' : 'bg-white bg-opacity-80 hover:bg-opacity-100'
                        } ${isHovered || isWishlisted ? 'opacity-100' : 'opacity-0'}`}
                    >
                        {isLoading ? (
                            <Spin className="text-gray-600" size="small" />
                        ) : (
                            <FiHeart 
                                className={`h-5 w-5 ${isWishlisted ? 'text-red-500' : 'text-gray-600'} ${
                                    isAnimating ? 'animate-bounce' : ''
                                }`} 
                            />
                        )}
                    </button>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 product-title">
                            {product.name}
                        </h3>
                    </div>
                    <span className="text-xl font-bold text-black mt-auto product-price">
                        {formatPrice(product.price)}
                    </span>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard; 