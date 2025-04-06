import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg"
import { Input, Dropdown, Avatar, message, Empty, Badge, Popover } from 'antd';
import { FiPhone, FiHome, FiUser, FiHeart, FiShoppingCart, FiLogOut, FiSettings, FiX } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import authService from "../../services/auth.services";
import { fetchWishlist, removeFromWishlist } from "../../services/api";

const Header = () => {
    const { Search } = Input;
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loadingWishlist, setLoadingWishlist] = useState(false);
    
    // Function to fetch user's wishlist - defined as useCallback to avoid recreating it
    const fetchUserWishlist = useCallback(async (userId) => {
        if (!userId) return;
        
        try {
            setLoadingWishlist(true);
            const response = await fetchWishlist(userId);
            
            if (response && response.statusCode === 200) {
                const total = response.data.meta.total || 0;
                const items = response.data.data || [];
                setWishlistCount(total);
                setWishlistItems(items);
            }
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
            setWishlistCount(0);
            setWishlistItems([]);
        } finally {
            setLoadingWishlist(false);
        }
    }, []);
    
    // Effect to handle user authentication and load initial data
    useEffect(() => {
        const userToken = localStorage.getItem('access_token');
        setIsLoggedIn(!!userToken);

        if (userToken) {
            try {
                // Get user info from localStorage
                const userStorage = JSON.parse(localStorage.getItem("user"));
                
                if (userStorage && userStorage.id) {
                    // Set user info
                    setUserInfo({
                        id: userStorage.id,
                        name: userStorage.fullName,
                        username: userStorage.username,
                        avatar: null
                    });
                    
                    // Load wishlist immediately after user info is set
                    fetchUserWishlist(userStorage.id);
                }
            } catch (error) {
                console.error("Failed to fetch user info:", error);
            }
        }
        
        // Scroll handler
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [fetchUserWishlist]);
    
    // Listen for wishlist updates from other components
    useEffect(() => {
        const handleWishlistUpdate = () => {
            const userStorage = JSON.parse(localStorage.getItem("user"));
            if (userStorage?.id) {
                fetchUserWishlist(userStorage.id);
            }
        };
        
        window.addEventListener('wishlist-updated', handleWishlistUpdate);
        
        return () => {
            window.removeEventListener('wishlist-updated', handleWishlistUpdate);
        };
    }, [fetchUserWishlist]);
    
    // Logout function
    const handleLogout = () => {
        authService.logout();
        setIsLoggedIn(false);
        setUserInfo(null);
        setWishlistCount(0);
        setWishlistItems([]);
        message.success("Đăng xuất thành công");
        navigate('/');
    };
    
    // Profile dropdown items
    const userMenuItems = [
        {
            key: '1',
            label: (
                <div className="py-2 px-1">
                    <div className="font-bold">{userInfo?.name || "User"}</div>
                    <div className="text-sm text-gray-500">{userInfo?.email || ""}</div>
                </div>
            ),
        },
        {
            key: '2',
            label: (
                <NavLink to="/user/profile" className="flex items-center gap-2">
                    <FiUser /> Thông tin tài khoản
                </NavLink>
            ),
        },
        {
            key: '3',
            label: (
                <NavLink to="/user/wishlist" className="flex items-center gap-2">
                    <FiHeart /> Danh sách yêu thích
                </NavLink>
            ),
        },
        {
            key: '5',
            type: 'divider',
        },
        {
            key: '6',
            label: (
                <div 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 text-red-500"
                >
                    <FiLogOut /> Đăng xuất
                </div>
            ),
        },
    ];

    const handleWishlistClick = () => {
        if (isLoggedIn) {
            navigate('/user/wishlist');
        } else {
            message.info("Vui lòng đăng nhập để xem danh sách yêu thích");
            navigate('/login');
        }
    };

    const handleRemoveFromWishlist = async (e, wishlistItemId) => {
        e.stopPropagation();
        
        if (!userInfo?.id) return;
        
        try {
            await removeFromWishlist(userInfo.id, wishlistItemId);
            // Update local state to reflect the removed item
            setWishlistItems(wishlistItems.filter(item => item.id !== wishlistItemId));
            setWishlistCount(prev => Math.max(0, prev - 1));
            
            // Trigger update event
            window.dispatchEvent(new CustomEvent('wishlist-updated'));
            
            message.success("Đã xóa sản phẩm khỏi danh sách yêu thích");
        } catch (error) {
            console.error("Failed to remove from wishlist:", error);
            message.error("Không thể xóa sản phẩm khỏi danh sách yêu thích");
        }
    };
    
    // Format price with commas
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    };

    const renderWishlistContent = () => {
        if (!isLoggedIn) {
            return (
                <div className="p-4 w-64">
                    <p className="text-center text-sm mb-2">Vui lòng đăng nhập để xem danh sách yêu thích</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full py-2 bg-black text-white text-sm font-medium rounded"
                    >
                        Đăng nhập
                    </button>
                </div>
            );
        }
        
        if (loadingWishlist) {
            return (
                <div className="p-4 w-64">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black"></div>
                    </div>
                </div>
            );
        }
        
        if (wishlistItems.length === 0) {
            return (
                <div className="p-4 w-64">
                    <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                        description="Chưa có sản phẩm yêu thích"
                    />
                </div>
            );
        }
        
        return (
            <div className="p-2 w-72 max-h-80 overflow-y-auto">
                <div className="mb-2 px-2 flex justify-between items-center">
                    <h3 className="text-sm font-semibold">Danh sách yêu thích</h3>
                    <span className="text-xs text-gray-500">{wishlistCount} sản phẩm</span>
                </div>
                <div className="space-y-2">
                    {wishlistItems.slice(0, 4).map(item => (
                        <div 
                            key={item.id} 
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer wishlist-item"
                            onClick={() => navigate(`/product/${item.product.productId}`)}
                        >
                            <div className="w-12 h-12 relative flex-shrink-0">
                                <img 
                                    src={item.product.imageUrl || 'https://placehold.co/100x100?text=No+Image'} 
                                    alt={item.product.name}
                                    className="w-full h-full object-cover rounded"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium line-clamp-2">{item.product.name}</p>
                                <p className="text-xs font-semibold mt-1">{formatPrice(item.product.price)}</p>
                            </div>
                            <button 
                                onClick={(e) => handleRemoveFromWishlist(e, item.id)}
                                className="p-1 hover:bg-gray-200 rounded-full wishlist-remove-btn"
                                aria-label="Remove from wishlist"
                            >
                                <FiX size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                {wishlistItems.length > 4 && (
                    <div className="mt-2 text-center">
                        <button
                            onClick={handleWishlistClick}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            Xem tất cả ({wishlistCount} sản phẩm)
                        </button>
                    </div>
                )}
                <div className="mt-3 pt-2 border-t border-gray-200">
                    <button
                        onClick={handleWishlistClick}
                        className="w-full py-1.5 bg-black text-white text-xs font-medium rounded"
                    >
                        Xem chi tiết
                    </button>
                </div>
            </div>
        );
    };

    return (
        <header className={`w-full sticky top-0 z-30 transition-all duration-300 ${
            isScrolled 
                ? 'py-1.5 px-3 bg-black text-white shadow-md' 
                : 'py-2.5 px-4 bg-white text-black'
        }`}>
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    <NavLink to="/">
                        <img 
                            src={logo} 
                            alt="Logo" 
                            className={`transition-all duration-300 rounded-full ${
                                isScrolled ? 'h-10 w-10' : 'h-12 w-12'
                            }`}
                        />
                    </NavLink>
                    <div className="flex-col ml-3 mb-1">
                        <div className={`font-bold uppercase transition-all duration-300 ${
                            isScrolled ? 'text-sm' : 'text-base'
                        }`}>Go Fit Wear</div>
                        <div className={`text-xs transition-all duration-300 ${
                            isScrolled ? 'text-gray-300 text-[10px]' : 'text-gray-500 text-xs'
                        }`}>VIET NAM</div>
                    </div>
                </div>

                {/* Search Bar - Chỉ hiển thị khi không cuộn */}
                {!isScrolled && (
                    <div className="relative flex-grow max-w-md mx-4 transition-all duration-300">
                        <Search 
                            className="w-full" 
                            placeholder="Bạn muốn tìm gì?" 
                            size="small"
                        />
                    </div>
                )}

                {/* Navigation Icons */}
                <div className="flex items-center">
                    <div className={`hidden md:flex items-center transition-all duration-300 ${
                        isScrolled ? 'mr-2' : 'mr-3'
                    }`}>
                        <FiPhone className="mr-1" />
                        <span className={isScrolled ? 'text-xs' : 'text-sm'}>0366469999</span>
                    </div>

                    <div className={`hidden md:flex items-center transition-all duration-300 ${
                        isScrolled ? 'mr-2' : 'mr-3'
                    }`}>
                        <FiHome className="mr-1" />
                        <span className={isScrolled ? 'text-xs' : 'text-sm'}>180 Hồng Bàng</span>
                    </div>

                    {/* Wishlist with Dropdown */}
                    <Popover
                        content={renderWishlistContent}
                        trigger="hover"
                        placement="bottomRight"
                        overlayClassName="wishlist-dropdown"
                        arrow={false}
                    >
                        <div 
                            className={`relative transition-all duration-300 cursor-pointer ${
                                isScrolled ? 'mr-2 mb-0.5' : 'mr-3'
                            }`}
                            onClick={handleWishlistClick}
                        >
                            <Badge count={wishlistCount} size="small" offset={[-2, 2]}>
                                <FiHeart className={`${isScrolled ? 'text-base text-white' : 'text-lg'}`} />
                            </Badge>
                        </div>
                    </Popover>

                    {/* Cart */}
                    <div className={`relative transition-all duration-300 cursor-pointer ${
                        isScrolled ? 'mr-2 mb-0.5' : 'mr-3'
                    }`}>
                        <Badge count={0} size="small" offset={[-2, 2]} showZero={false}>
                            <FiShoppingCart className={`${isScrolled ? 'text-base text-white' : 'text-lg'}`} />
                        </Badge>
                    </div>
                    
                    {/* Login or User Profile */}
                    {isLoggedIn ? (
                        <Dropdown 
                            menu={{ items: userMenuItems }} 
                            placement="bottomRight"
                            trigger={['click']}
                            onOpenChange={(visible) => setDropdownVisible(visible)}
                        >
                            <div className="cursor-pointer relative">
                                {userInfo?.avatar ? (
                                    <Avatar 
                                        src={userInfo.avatar} 
                                        size={isScrolled ? 24 : 30}
                                        className="transition-all duration-300"
                                    />
                                ) : (
                                    <div className={`flex items-center justify-center rounded-full bg-blue-500 text-white transition-all duration-300 ${
                                        isScrolled ? 'w-6 h-6' : 'w-8 h-8'
                                    }`}>
                                        {userInfo?.name?.[0]?.toUpperCase() || <FiUser />}
                                    </div>
                                )}
                                
                                {/* Notification dot for open dropdown */}
                                {dropdownVisible && (
                                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                                )}
                            </div>
                        </Dropdown>
                    ) : (
                        <NavLink to="/login" className={`transition-all duration-300 ${
                            isScrolled 
                                ? 'text-xs hover:text-gray-300' 
                                : 'text-sm hover:text-neutral-400'
                        }`}>
                            Đăng Nhập
                        </NavLink>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;