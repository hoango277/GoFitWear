import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import logo from "../assets/images/logo.jpg"
import customizeAxios from "../services/customizeAxios"
import { toast } from "sonner"

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [tokenValid, setTokenValid] = useState(true)

  useEffect(() => {
    // Verify token validity
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false)
        return
      }

      try {
        await customizeAxios.get(`/auth/verify-reset-token?token=${token}`)
        setTokenValid(true)
      } catch (error) {
        console.error("Invalid or expired token:", error)
        setTokenValid(false)
      }
    }

    verifyToken()
  }, [token])

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

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      // Replace with your actual API endpoint
      const response = await customizeAxios.post("/auth/reset-password", {
        token,
        password: formData.password,
      })

      if (response.data) {
        toast.success("Thành công!", {
          description: "Mật khẩu đã được đặt lại thành công!"
        })
        navigate("/login")
      }
    } catch (error) {
      console.error("Reset password error:", error)

      if (error.response && error.response.status === 400) {
        toast.error("Lỗi", {
          description: "Token không hợp lệ hoặc đã hết hạn."
        })
        setTokenValid(false)
      } else {
        toast.error("Lỗi", {
          description: "Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau."
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gray-50">
        <div className="w-full max-w-md border rounded-lg shadow-sm bg-white">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex justify-center mb-4">
              <img src={logo || "/placeholder.svg"} alt="GoFitWear Logo" className="h-12" />
            </div>
            <h3 className="text-2xl font-bold text-center">Liên kết không hợp lệ</h3>
            <p className="text-sm text-gray-500 text-center">
              Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            </p>
          </div>
          
          <div className="p-6 pt-0 space-y-4">
            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-600">
              <p>Vui lòng yêu cầu liên kết đặt lại mật khẩu mới để tiếp tục.</p>
            </div>
          </div>
          
          <div className="flex items-center p-6 pt-0">
            <div className="w-full text-center">
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center w-full text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 h-10 px-4 py-2 rounded-md"
              >
                Yêu cầu liên kết mới
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gray-50">
      <div className="w-full max-w-md border rounded-lg shadow-sm bg-white">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex justify-center mb-4">
            <img src={logo || "/placeholder.svg"} alt="GoFitWear Logo" className="h-12" />
          </div>
          <h3 className="text-2xl font-bold text-center">Đặt lại mật khẩu</h3>
          <p className="text-sm text-gray-500 text-center">Nhập mật khẩu mới của bạn</p>
        </div>
        
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Mật khẩu mới</label>
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

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            <button 
              type="submit" 
              className="w-full h-10 px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        </div>
        
        <div className="flex items-center p-6 pt-0">
          <div className="w-full text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-blue-600 hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại trang đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
