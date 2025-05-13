import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import loginImage from "../assets/images/login.jpg"
import logo from "../assets/images/logo.jpg"
import { toast } from "sonner"
import authService from "../services/auth.services"

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "Username không được để trống"
    } 

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
    
      const response = await authService.login(
        formData.email,
        formData.password,
      )

      if (response.data) {
        localStorage.setItem("access_token", response.data.access_token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        toast.success("Đăng nhập thành công!", {
          description: "Chào mừng bạn quay trở lại."
        })
        if (response.data.user.role === 'ADMIN') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      }
    } catch (error) {
      console.error("Login error:", error)

      if (error.response && error.response.status === 401) {
        toast.error("Đăng nhập thất bại", {
          description: "Email hoặc mật khẩu không chính xác."
        })
      } else {
        toast.error("Lỗi", {
          description: "Tài khoản hoặc mật khẩu không chính xác"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Image */}
      <div className="hidden md:block md:w-1/2 bg-gray-100">
        <div className="h-full w-full relative">
          <img src={loginImage || "/placeholder.svg"} alt="Login" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <img src={logo || "/placeholder.svg"} alt="GoFitWear Logo" className="h-25 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Chào mừng trở lại!</h2>
              <p className="text-lg">Đăng nhập để tiếp tục mua sắm và khám phá các sản phẩm mới nhất của chúng tôi.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md border rounded-lg shadow-sm bg-white">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex justify-center mb-4 md:hidden">
              <img src={logo || "/placeholder.svg"} alt="GoFitWear Logo" className="h-20" />
            </div>
            <h3 className="text-2xl font-bold text-center">Đăng nhập</h3>
            <p className="text-sm text-gray-500 text-center">Nhập thông tin đăng nhập của bạn để tiếp tục</p>
          </div>
          
          <div className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Username</label>
                <input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium">Mật khẩu</label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              <button 
                type="submit" 
                className="w-full h-10 px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>
          </div>
          
          <div className="flex flex-col space-y-4 p-6 pt-0">
            <div className="text-center text-sm">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
