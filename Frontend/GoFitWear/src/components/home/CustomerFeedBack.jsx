import React from "react";

const CustomerFeedback = () => {

  
  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header with decorative lines */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-1/4 h-px bg-gray-300"></div>
          <h2 className="text-2xl font-extralight text-center px-4 uppercase">
            FEEDBACK KHÁCH HÀNG
          </h2>
          <div className="w-1/4 h-px bg-gray-300"></div>
        </div>
        
        {/* Subtitle */}
        <p className="text-center text-gray-600 mb-10">
          Cảm nhận của khách hàng đã và đang sử dụng sản phẩm của GOFITWEAR
        </p>

        {/* Feedback cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-50">
          {/* Card 1 */}
          <div className="bg-gray-100 p-4 border border-gray-200 shadow-sm">
            <div className="p-3 bg-white border border-gray-200 flex flex-col items-center">
              {/* Customer image */}
              <div className="mb-4 w-full aspect-square overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60" 
                  alt="Feedback from Anh Công Nguyễn"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x400?text=Customer+Image";
                  }}
                />
              </div>
              
              {/* Feedback content */}
              <p className="text-gray-800 mb-4 text-center text-sm leading-relaxed">
                Đến đây shop đẹp lắm! Mình thích kiểu bán ở đây hy mua ở đâu là phải ghi thêm tên trên đơn mua về. Nhớ soạn đồ đẹp.
              </p>
              
              {/* Customer name */}
              <p className="font-semibold text-center">
                Anh Công Nguyễn
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-100 p-4 border border-gray-200 shadow-sm">
            <div className="p-3 bg-white border border-gray-200 flex flex-col items-center">
              {/* Customer image */}
              <div className="mb-4 w-full aspect-square overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60" 
                  alt="Feedback from Anh Giang Hoàng"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x400?text=Customer+Image";
                  }}
                />
              </div>
              
              {/* Feedback content */}
              <p className="text-gray-800 mb-4 text-center text-sm leading-relaxed">
                Thích nhất là áo ở GoFitWear, đa dạng kiểu mẫu, mặc lên đúng là sang. Chất vải tốt, trẻ trung, thoát, thì mua rồi tốn lắm.
              </p>
              
              {/* Customer name */}
              <p className="font-semibold text-center">
                Anh Giang Hoàng
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-gray-100 p-4 border border-gray-200 shadow-sm">
            <div className="p-3 bg-white border border-gray-200 flex flex-col items-center">
              {/* Customer image */}
              <div className="mb-4 w-full aspect-square overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjJ8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60" 
                  alt="Feedback from Anh Nhật Quý"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x400?text=Customer+Image";
                  }}
                />
              </div>
              
              {/* Feedback content */}
              <p className="text-gray-800 mb-4 text-center text-sm leading-relaxed">
                Lần đầu tiên mua hàng ở GoFitWear từ năm 2015, đến nay giờ vẫn chỉ thích mua ở đây. Hàng chuẩn giá tốt so sánh các hãng tên trên thị trường.
              </p>
              
              {/* Customer name */}
              <p className="font-semibold text-center">
                Anh Nhật Quý
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedback;
