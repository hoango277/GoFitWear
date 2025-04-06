import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg"
import { Input, Dropdown, Avatar, message } from 'antd';
import { FiPhone, FiHome, FiUser, FiHeart, FiShoppingCart, FiLogOut, FiSettings } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import authService from "../../services/auth.services";

const Header = () => {
    const { Search } = Input;
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    
    useEffect(() => {
        
        const userToken  = localStorage.getItem('access_token');
        setIsLoggedIn(!!userToken);


        if (userToken) {
            fetchUserInfo(userToken);
        }
        
        // Thêm event listener để theo dõi scroll
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        
        // Cleanup event listener khi component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    
    // Function to fetch user information
    const fetchUserInfo = async () => {
        try {

            let userStorage = JSON.parse(localStorage.getItem("user"))
            setUserInfo({
                name: userStorage.fullName,
                username: userStorage.username,
                avatar: null // URL to avatar image or null
            });
        } catch (error) {
            console.error("Failed to fetch user info:", error);
        }
    };
    
    // Logout function
    const handleLogout = () => {
        authService.logout();
        setIsLoggedIn(false);
        setUserInfo(null);
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

                    {/* Wishlist */}
                    <div className={`relative transition-all duration-300 ${
                        isScrolled ? 'mr-2' : 'mr-3'
                    }`}>
                        <FiHeart className={isScrolled ? 'text-base' : 'text-lg'} />
                        <span className={`absolute -top-1.5 -right-1.5 text-white text-[10px] rounded-full flex items-center justify-center transition-all duration-300 ${
                            isScrolled ? 'w-3 h-3 bg-red-500' : 'w-3.5 h-3.5 bg-gray-500'
                        }`}>
                            0
                        </span>
                    </div>

                    {/* Cart */}
                    <div className={`relative transition-all duration-300 ${
                        isScrolled ? 'mr-2' : 'mr-3'
                    }`}>
                        <FiShoppingCart className={isScrolled ? 'text-base' : 'text-lg'} />
                        <span className={`absolute -top-1.5 -right-1.5 text-white text-[10px] rounded-full flex items-center justify-center transition-all duration-300 ${
                            isScrolled ? 'w-3 h-3 bg-red-500' : 'w-3.5 h-3.5 bg-gray-500'
                        }`}>
                            0
                        </span>
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
