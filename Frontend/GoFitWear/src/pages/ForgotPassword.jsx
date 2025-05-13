import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import logo from "../assets/images/logo.jpg"
import customizeAxios from "../services/customizeAxios"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setEmail(e.target.value)
    setError("")
  }

  const validateForm = () => {
    if (!email) {
      setError("Email không được để trống")
      return false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email không hợp lệ")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await customizeAxios.post("/auth/forgot-password", {
        email: email
      }, {
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.data) {
        setSubmitted(true)
        toast.success("Gửi thành công!", {
          description: "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn."
        })
      }
    } catch (error) {
      console.error("Forgot password error:", error)

      if (error.response && error.response.status === 400) {
        setError(error.response.data || "Email không tồn tại trong hệ thống")
      } else {
        toast.error("Lỗi", {
          description: "Đã xảy ra lỗi. Vui lòng thử lại sau."
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gray-50">
      <div className="w-full max-w-md border rounded-lg shadow-sm bg-white">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex justify-center mb-4">
            <img src={logo || "/placeholder.svg"} alt="GoFitWear Logo" className="h-15 rounded-full" />
          </div>
          <h3 className="text-2xl font-bold text-center">Quên mật khẩu</h3>
          <p className="text-sm text-gray-500 text-center">
            {!submitted
              ? "Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu"
              : "Kiểm tra email của bạn để tiếp tục"}
          </p>
        </div>
        
        <div className="p-6 pt-0">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={handleChange}
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              <button 
                type="submit" 
                className="w-full h-10 px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Gửi hướng dẫn đặt lại mật khẩu"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600">
                <p>
                  Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp
                  thư đến của bạn và làm theo hướng dẫn.
                </p>
              </div>
              <p className="text-sm text-center text-gray-500">
                Không nhận được email? Kiểm tra thư mục spam hoặc{" "}
                <button 
                  onClick={() => setSubmitted(false)} 
                  className="text-blue-600 hover:underline"
                >
                  thử lại
                </button>
              </p>
            </div>
          )}
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

export default ForgotPassword
