import { useEffect } from 'react';
import { useNavigate, NavLink, Routes, Route } from 'react-router-dom';
import BrandManager from './BrandManager';
import UserManager from './UserManager';
import CategoryManager from './CategoryManager';
import OrderManager from './OrderManager';
import ProductManager from './ProductManager';
import logo from '../../assets/images/logo.jpg';
import { message } from 'antd';

const sidebarItems = [
  { label: 'Brand', path: 'brands' },
  { label: 'User', path: 'users' },
  { label: 'Category', path: 'categories' },
  { label: 'Order', path: 'orders' },
  { label: 'Product', path: 'products' },
];

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    message.success('Đã đăng xuất admin!');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col py-8 px-4">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="h-16 w-16 rounded-full mb-2 border-2 border-white shadow" />
          <h2 className="text-xl font-bold text-center">Quản lý Go Fit Wear</h2>
        </div>
        <nav className="flex flex-col gap-4 flex-1">
          {sidebarItems.map(item => (
            <NavLink
              key={item.path}
              to={`/admin/${item.path}`}
              className={({ isActive }) =>
                `py-2 px-4 rounded transition ${isActive ? 'bg-white text-black font-bold' : 'hover:bg-gray-800'}`
              }
              end
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-8 py-2 px-4 bg-white text-black rounded font-semibold border-2 border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-2 hover:border-black cursor-pointer"
        >
          Đăng xuất
        </button>
        <button
          onClick={() => navigate('/')}
          className="mt-3 py-2 px-4 bg-white text-black rounded font-semibold border-2 border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-2 hover:border-black cursor-pointer"
        >
          Về trang chủ
        </button>
      </aside>
      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-8">
        <Routes>
          <Route path="brands" element={<BrandManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="*" element={<div>Chọn chức năng quản lý ở sidebar.</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout; 