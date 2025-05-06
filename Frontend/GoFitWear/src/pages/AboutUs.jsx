import React from "react";

const AboutUs = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white py-12 px-4">
      <div className="bg-white border border-black rounded-2xl shadow-[0_8px_40px_0_rgba(0,0,0,0.25)] flex flex-col md:flex-row items-center max-w-4xl w-full p-8 md:p-12 gap-8">
        {/* Left: Text */}
        <div className="flex-1 flex flex-col items-start justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4">ABOUT US</h1>
          <div className="w-16 h-1 bg-black rounded mb-6" />
          <p className="text-gray-800 text-lg mb-6 max-w-md">
            GoFitWear là thương hiệu thời trang thể thao hiện đại, mang đến cho bạn những sản phẩm chất lượng, thiết kế trẻ trung, phù hợp xu hướng. Chúng tôi luôn nỗ lực để tạo ra trải nghiệm mua sắm tốt nhất cho khách hàng.
          </p>
          <a href="https://gofitwear.vn" target="_blank" rel="noopener noreferrer"
            className="mt-2 px-6 py-3 bg-black text-white border border-black rounded-lg shadow hover:bg-white hover:text-black transition-all font-semibold text-base">
            Đến trang chủ GoFitWear.vn
          </a>
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={"https://cdn.wallpapersafari.com/50/46/7Lyzow.jpg"}
            alt="About Us Illustration"
            className="w-full max-w-xs md:max-w-sm rounded-xl shadow-[0_6px_32px_0_rgba(0,0,0,0.28)] object-cover border border-black"
          />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
