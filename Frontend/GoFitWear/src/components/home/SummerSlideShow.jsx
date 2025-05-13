import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SummerSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const slides = [
    {
      id: 1,
      image: 'https://pos.nvncdn.com/8ca22b-20641/bn/20250312_7B4fVjp4.gif',
    },
    {
      id: 2,
      image: 'https://pos.nvncdn.com/8ca22b-20641/bn/20250312_m9kCZj2F.gif',
    },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      handleSlideChange((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 10000);
    
    return () => clearInterval(interval);
  }, [slides.length]);
  
  const handleSlideChange = (newSlideIndex) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Nếu newSlideIndex là hàm, gọi nó với currentSlide
    if (typeof newSlideIndex === 'function') {
      setCurrentSlide(newSlideIndex);
    } else {
      setCurrentSlide(newSlideIndex);
    }
    
    // Đặt thời gian cho animation hoàn thành
    setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Thời gian bằng với thời gian transition
  };
  
  const goToSlide = (index) => {
    handleSlideChange(index);
  };
  
  const nextSlide = () => {
    handleSlideChange((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    console.log(1);
  };
  
  const prevSlide = () => {
    handleSlideChange((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };
  
  return (
    <div className="w-full space-y-8">
      <div className="relative w-full h-[650px]">
        {/* Slideshow container */}
        <div className="w-full h-full relative">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                currentSlide === index 
                  ? 'opacity-100 z-10' 
                  : 'opacity-0 z-0'
              }`}
            >
              <img 
                src={slide.image} 
                alt={`Slide ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide} 
          disabled={isAnimating}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={nextSlide} 
          disabled={isAnimating}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Dots Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isAnimating}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === index ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Promotional Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chaco Sandals Banner */}
        <Link to="/all-products" className="relative group overflow-hidden">
          <img 
            src="https://pos.nvncdn.com/8ca22b-20641/bn/20250312_4cOYZMQm.gif"
            alt="Sandal Chaco Chính Hãng" 
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 pb-8 flex flex-col items-center text-center">
            <h3 className="text-2xl font-light text-white mb-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] text-shadow-lg">SANDAL CHACO CHÍNH HÃNG</h3>
            <Link to="/all-products" className="font-medium bg-black text-white px-6 py-2 text-sm hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer">
              XEM CHI TIẾT
            </Link>
          </div>
        </Link>

        {/* Lacoste Banner */}
        <Link to="/all-products" className="relative group overflow-hidden">
          <img 
            src="https://pos.nvncdn.com/8ca22b-20641/bn/20250312_c9plVVC8.gif"
            alt="Dép Lacoste Chính Hãng" 
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 pb-8 flex flex-col items-center text-center">
            <h3 className="text-2xl font-light text-white mb-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] text-shadow-lg">DÉP LACOSTE CHÍNH HÃNG</h3>
            <Link to="/all-products" className="font-medium bg-black text-white px-6 py-2 text-sm hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer">
              XEM CHI TIẾT
            </Link>
          </div>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Summer Clothes Banner */}
        <Link to="/all-products" className="relative group overflow-hidden">
          <img 
            src="https://pos.nvncdn.com/8ca22b-20641/bn/20250312_V1uUTgHQ.gif"
            alt="Áo Hè Chính Hãng" 
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 pb-8 flex flex-col items-center text-center">
            <h3 className="text-2xl font-light text-white mb-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] text-shadow-lg">ÁO HÈ CHÍNH HÃNG</h3>
            <Link to="/all-products" className="font-medium bg-black text-white px-6 py-2 text-sm hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer">
              XEM CHI TIẾT
            </Link>
          </div>
        </Link>

        {/* Sports Shoes Banner */}
        <Link to="/all-products" className="relative group overflow-hidden">
          <img 
            src="https://pos.nvncdn.com/8ca22b-20641/bn/20250312_gZQIzDv8.gif"
            alt="Giày Thể Thao" 
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 pb-8 flex flex-col items-center text-center">
            <h3 className="text-2xl font-light text-white mb-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] text-shadow-lg">GIÀY THỂ THAO</h3>
            <Link to="/all-products" className="font-medium bg-black text-white px-6 py-2 text-sm hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer">
              XEM CHI TIẾT
            </Link>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SummerSlideshow;
