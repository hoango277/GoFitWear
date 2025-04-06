import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

// Pages
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import CategoryProducts from "./pages/CategoryProducts"

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
              <Home />
              <Footer />
            </>
          }
        />

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

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster/>
    </Router>
  )
}

export default App
