import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Spin } from 'antd';
import { mostSaleProduct } from '../../services/api';
import ProductCard from '../ProductCard';
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { message } from 'antd';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../../services/api';

const PAGE_SIZE = 8;

const MostSaleProduct = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [loadingStates, setLoadingStates] = useState({});

    // Format price with commas in VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    };

    useEffect(() => {
        const userStorage = JSON.parse(localStorage.getItem("user"));
        if (userStorage?.userId) {
            setUserInfo(userStorage);
            loadWishlistItems(userStorage.userId);
        }
    }, []);

    const loadWishlistItems = async (userId) => {
        try {
            const response = await fetchWishlist(userId);
            if (response?.data?.data) {
                setWishlistItems(response.data.data);
            }
        } catch (error) {
            console.error("Failed to load wishlist:", error);
        }
    };

    // Fetch products when component mounts or page changes
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let page = 0;
            let result = [];
            let stop = false;
            while (result.length < PAGE_SIZE && !stop) {
                const response = await mostSaleProduct(page, PAGE_SIZE);
                const fetched = response.data.data || [];
                // Lọc sản phẩm chưa bị xóa
                const filtered = fetched.filter(p => !p.isDeleted);
                // Thêm vào result, nhưng không trùng lặp
                filtered.forEach(p => {
                    if (!result.some(item => item.productId === p.productId)) {
                        result.push(p);
                    }
                });
                if (fetched.length < PAGE_SIZE) stop = true; // Không còn sản phẩm để lấy nữa
                page++;
            }
            setProducts(result.slice(0, PAGE_SIZE));
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToWishlist = async (e, product) => {
        e.preventDefault(); // Prevent the Link from navigating
        e.stopPropagation(); // Stop event propagation

        if (!userInfo) {
            message.info("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
            return;
        }

        const wishlistItem = wishlistItems.find(item => item.product.productId === product.productId);
        
        setLoadingStates(prev => ({ ...prev, [product.productId]: true }));
        
        try {
            if (wishlistItem) {
                await removeFromWishlist(userInfo.userId, wishlistItem.id);
                await new Promise(resolve => setTimeout(resolve, 300));
                message.success("Đã xóa khỏi danh sách yêu thích");
            } else {
                await addToWishlist(userInfo.userId, product.productId);
                await new Promise(resolve => setTimeout(resolve, 300));
                message.success("Đã thêm vào danh sách yêu thích");
            }
            
            // Refresh wishlist
            await loadWishlistItems(userInfo.userId);
            // Trigger wishlist update event
            window.dispatchEvent(new CustomEvent('wishlist-updated'));
        } catch (error) {
            console.error("Wishlist operation failed:", error);
            message.error("Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setLoadingStates(prev => ({ ...prev, [product.productId]: false }));
        }
    };

    const isProductWishlisted = (productId) => {
        return wishlistItems.some(item => item.product.productId === productId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 font-montserrat">
                <Spin size="large" tip="Đang tải sản phẩm..." />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 font-montserrat">
            <div className="flex flex-col items-center mt-4.5 mb-8">
                <h1 className="text-3xl font-extralight section-title">SẢN PHẨM BÁN CHẠY</h1>
                <span className="text-gray-700 mb-2">Những sản phẩm bán chạy trong thời gian gần đây</span>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    Không có sản phẩm nào để hiển thị
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ml-30 mr-30">
                    {products.map((product) => (
                        <div 
                            key={product.productId} 
                            className="relative group shadow-[0_6px_32px_0_rgba(0,0,0,0.28)] rounded-lg bg-white transition-transform duration-300 hover:shadow-xl hover:scale-105 flex flex-col h-full block"
                            onMouseEnter={() => setHoveredProduct(product.productId)}
                            onMouseLeave={() => setHoveredProduct(null)}
                        >
                            <Link 
                                to={`/product/${product.productId}`} 
                                className="flex flex-col h-full"
                            >
                                <div className="h-64 overflow-hidden relative">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/300x300?text=Image+Not+Available";
                                        }}
                                    />
                                    <button 
                                        onClick={(e) => handleAddToWishlist(e, product)}
                                        className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 focus:outline-none transform 
                                            ${hoveredProduct === product.productId || isProductWishlisted(product.productId)
                                                ? 'opacity-100 scale-100' 
                                                : 'opacity-0 scale-90'} 
                                            ${isProductWishlisted(product.productId)
                                                ? 'bg-red-100' 
                                                : 'bg-white bg-opacity-80 hover:bg-opacity-100'}`}
                                        aria-label="Add to wishlist"
                                        disabled={loadingStates[product.productId]}
                                    >
                                        {loadingStates[product.productId] ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"/>
                                        ) : isProductWishlisted(product.productId) ? (
                                            <HeartSolid className="h-5 w-5 text-red-500" />
                                        ) : (
                                            <HeartOutline className="h-5 w-5 text-red-500" />
                                        )}
                                    </button>
                                </div>

                                <div className="p-4 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 product-title">
                                            {product.name}
                                        </h3>
                                        <span className="bg-black text-white text-xs font-medium px-2 py-1 rounded">
                                            {product.brand.name}
                                        </span>
                                    </div>
                                    
                                    <span className="text-xl font-bold text-black mt-auto product-price">
                                        {formatPrice(product.price)}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MostSaleProduct;
