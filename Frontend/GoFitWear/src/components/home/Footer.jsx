import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.jpg"
import accept from "../../assets/images/accept.png"
import { 
    FaGooglePlus, 
    FaFacebookF, 
    FaInstagram, 
    FaYoutube, 
    FaTwitter,
  } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Logo and Company Info */}
          <div className="flex justify-between items-center md:items-start">
            <div className="mb-6 bg-white">
              <img 
                src={logo} 
                alt="Domino Logo" 
                className="h-50"
              />
            </div>

            <div className="mb-6 mt-5">
              <img 
                src={accept} 
                alt="Domino Logo" 
                className="h-40"
              />
            </div>
          </div>

          {/* Right Column - Support Links and Social Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Support Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">HỖ TRỢ KHÁCH HÀNG</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/chinh-sach-bao-mat" className="hover:text-gray-300 flex items-center">
                    <span className="mr-2">▸</span>
                    Chính sách bảo mật thông tin
                  </Link>
                </li>
                <li>
                  <Link to="/chinh-sach-ban-hang" className="hover:text-gray-300 flex items-center">
                    <span className="mr-2">▸</span>
                    Chính sách bán hàng
                  </Link>
                </li>
                <li>
                  <Link to="/chinh-sach-van-chuyen" className="hover:text-gray-300 flex items-center">
                    <span className="mr-2">▸</span>
                    Chính sách vận chuyển và giao nhận
                  </Link>
                </li>
                <li>
                  <Link to="/chinh-sach-doi-tra" className="hover:text-gray-300 flex items-center">
                    <span className="mr-2">▸</span>
                    Chính sách đổi trả và hoàn tiền
                  </Link>
                </li>
                <li>
                  <Link to="/chinh-sach-thanh-toan" className="hover:text-gray-300 flex items-center">
                    <span className="mr-2">▸</span>
                    Chính sách thanh toán
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-4">KẾT NỐI VỚI GOFITWEAR</h3>
            <div className="flex flex-wrap gap-4">
              <a href="https://plus.google.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                <div className="bg-red-500 w-10 h-10 rounded-full flex items-center justify-center">
                  <FaGooglePlus className="text-white text-xl" />
                </div>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
                  <FaFacebookF className="text-white text-xl" />
                </div>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                <div className="bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 w-10 h-10 rounded-full flex items-center justify-center">
                  <FaInstagram className="text-white text-xl" />
                </div>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                <div className="bg-red-600 w-10 h-10 rounded-full flex items-center justify-center">
                  <FaYoutube className="text-white text-xl" />
                </div>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                <div className="bg-blue-400 w-10 h-10 rounded-full flex items-center justify-center">
                  <FaTwitter className="text-white text-xl" />
                </div>
              </a>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="container mx-auto px-4 py-6 text-center text-sm border-t border-gray-800">
        <p className="mb-2">Hộ Kinh Doanh Thời Trang GOFITWEAR - MST số 0309301196 do UBND quận Hoàn Kiếm cấp ngày 01/01/2011</p>
        <p className="mb-2">Địa chỉ: 150 Hồ Hàng Bông, Phường Hàng Bông, quận Hoàn Kiếm, Hà Nội.</p>
        <p className="mb-2">Hotline: 0976271476</p>
        <p className="mb-6">Mail: online@gofitwear.vn</p>
        
        <p className="text-xs text-gray-400">Thiết kế web bởi ❤️ hoango</p>
      </div>

      {/* Zalo Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a href="#" className="block rounded-full bg-white p-2 shadow-lg">
          <img src="/path-to-zalo-icon/zalo-icon.png" alt="Zalo Chat" className="w-10 h-10" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
