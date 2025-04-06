import axios from "axios"

const instance = axios.create({
    baseURL:'http://localhost:8080'
})



instance.interceptors.response.use(
    (response) => {
        if(response.data && response.data.data)
            return response.data
    },
    async (error) => {

        
        const originalRequest = error.config;
        
        // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Gọi API refresh token (refresh_token đã được lưu trong cookies)
                const response = await axios.post('/api/auth/refresh');
                console.log(response);
                
                // Lưu access token mới vào localStorage
                localStorage.setItem('access_token', response.data.access_token);
                
                // Cập nhật header và thử lại request ban đầu
                originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Nếu refresh token cũng hết hạn, đăng xuất người dùng
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);


export default instance
