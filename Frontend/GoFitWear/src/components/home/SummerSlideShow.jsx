import React, { useState, useEffect } from 'react';

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
  );
};

export default SummerSlideshow;
