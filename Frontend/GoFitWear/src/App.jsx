import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom"

// Pages
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import CategoryProducts from "./pages/CategoryProducts"
import ProductDetail from "./pages/ProductDetail"
import WishlistPage from "./pages/WishlistPage"
import StoreSystem from './pages/StoreSystem'

// Layout components
import Header from "./components/home/Header"
import Footer from "./components/home/Footer"
import MainMenu from "./components/Navigation/MainMenu"
import { Toaster } from "sonner"
import UserProfile from "./pages/UserProfile"



const App = () => {
  return (
    <Router>
      <Routes>
        {/* Auth routes (no header/footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Main routes with header and footer */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <MainMenu />
              <Outlet />
              <Footer />
            </>
          }
        >
          <Route index element={<Home />} />
          <Route path="category/:categoryId" element={<CategoryProducts />} />
          <Route path="product/:productId" element={<ProductDetail />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="he-thong-cua-hang" element={<StoreSystem />} />
        </Route>

       {/* User Profile Route */}
        <Route
          path="/user/profile"
          element={
            <>
              <Header />
              <MainMenu />
              <UserProfile/>
              <Footer />
            </>
          }
        />

        {/* All Products Route */}
        <Route
          path="/category"
          element={
            <>
              <Header />
              <MainMenu />
              <CategoryProducts />
              <Footer />
            </>
          }
        />

        {/* Category Products Route */}
        <Route
          path="/category/:categoryId"
          element={
            <>
              <Header />
              <MainMenu />
              <CategoryProducts />
              <Footer />
            </>
          }
        />

        {/* Subcategory Products Route */}
        <Route
          path="/category/:categoryId/:subcategoryId"
          element={
            <>
              <Header />
              <MainMenu />
              <CategoryProducts />
              <Footer />
            </>
          }
        />

        {/* Product Detail Route */}
        <Route
          path="/product/:productId"
          element={
            <>
              <Header />
              <MainMenu />
              <ProductDetail />
              <Footer />
            </>
          }
        />

        {/* Wishlist Route */}
        <Route
          path="/wishlist"
          element={
            <>
              <Header />
              <MainMenu />
              <WishlistPage />
              <Footer />
            </>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster/>
    </Router>
  )
}

export default App
