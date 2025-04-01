import customizeAxios from "./customizeAxios"

// Get user from storage
const getUser = () => {
  const user = localStorage.getItem("user") || sessionStorage.getItem("user")
  return user ? JSON.parse(user) : null
}

// Get token from storage
const getToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token")
}

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getToken()
}

// Login user
const login = async (username, password) => {
  const response = await customizeAxios.post("/auth/login", { username, password })
  return response
}

// Register user
const register = async (userData) => {
  return await customizeAxios.post("/auth/register", userData)
}

// Logout user
const logout = () => {
  localStorage.removeItem("access_token")
  localStorage.removeItem("user")
  sessionStorage.removeItem("access_token")
  sessionStorage.removeItem("user")

}

// Request password reset
const forgotPassword = async (email) => {
  return await customizeAxios.post("/auth/forgot-password", { email })
}

// Reset password with token
const resetPassword = async (token, password) => {
  return await customizeAxios.post("/auth/reset-password", { token, password })
}

// Update user profile
const updateProfile = async (userData) => {
  const response = await customizeAxios.put("/auth/profile", userData)

  if (response.data) {
    const user = getUser()
    const updatedUser = { ...user, ...response.data }

    // Update user in storage
    if (localStorage.getItem("user")) {
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
    if (sessionStorage.getItem("user")) {
      sessionStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  return response.data
}

// Change password
const changePassword = async (currentPassword, newPassword) => {
  return await customizeAxios.post("/auth/change-password", {
    currentPassword,
    newPassword,
  })
}

const authService = {
  getUser,
  getToken,
  isAuthenticated,
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
}

export default authService

