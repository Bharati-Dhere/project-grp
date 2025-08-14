import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import { useNavigate } from 'react-router-dom';

const slidesData = {
  en: [
    {
      title: 'Exclusive Deals Just For You',
      subtitle: 'Save big on top brands and enjoy fast delivery.',
      imgUrl:
        'https://png.pngtree.com/background/20230617/original/pngtree-website-for-mobile-store-rendered-in-3d-picture-image_3706125.jpg',
    },
    {
      title: 'Latest Smartphones Collection',
      subtitle: 'Find your perfect phone with amazing offers.',
      imgUrl:
        'https://tse4.mm.bing.net/th/id/OIP.w_xCZ2P4qrCd_M7w_mjLZwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
    },
    {
      title: 'Smart Gadgets & Accessories',
      subtitle: 'Upgrade your life with the latest tech essentials.',
      imgUrl:
        'https://th.bing.com/th/id/OIP.ygn4alDgL0S57ikHKT3a0QHaDt?w=349&h=174&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    },
  ],
  hi: [
    {
      title: 'आपके लिए विशेष ऑफर्स',
      subtitle: 'शीर्ष ब्रांड्स पर बड़ी बचत और तेज़ डिलीवरी का आनंद लें।',
      imgUrl:
        'https://png.pngtree.com/background/20230617/original/pngtree-website-for-mobile-store-rendered-in-3d-picture-image_3706125.jpg',
    },
    {
      title: 'नवीनतम स्मार्टफोन संग्रह',
      subtitle: 'शानदार ऑफर्स के साथ अपना पसंदीदा फोन पाएं।',
      imgUrl:
        'https://tse4.mm.bing.net/th/id/OIP.w_xCZ2P4qrCd_M7w_mjLZwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
    },
    {
      title: 'स्मार्ट गैजेट्स और एक्सेसरीज़',
      subtitle: 'नवीनतम तकनीक से अपना जीवन अपग्रेड करें।',
      imgUrl:
        'https://th.bing.com/th/id/OIP.ygn4alDgL0S57ikHKT3a0QHaDt?w=349&h=174&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    },
  ],
  mr: [
    {
      title: 'फक्त तुमच्यासाठी खास ऑफर्स',
      subtitle: 'टॉप ब्रँड्सवर मोठी बचत आणि जलद डिलिव्हरीचा आनंद घ्या.',
      imgUrl:
        'https://png.pngtree.com/background/20230617/original/pngtree-website-for-mobile-store-rendered-in-3d-picture-image_3706125.jpg',
    },
    {
      title: 'नवीनतम स्मार्टफोन संग्रह',
      subtitle: 'आश्चर्यकारक ऑफर्ससह तुमचा आवडता फोन शोधा.',
      imgUrl:
        'https://tse4.mm.bing.net/th/id/OIP.w_xCZ2P4qrCd_M7w_mjLZwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
    },
    {
      title: 'स्मार्ट गॅजेट्स आणि अ‍ॅक्सेसरीज',
      subtitle: 'नवीनतम तंत्रज्ञानासह तुमचे जीवन अपग्रेड करा.',
      imgUrl:
        'https://th.bing.com/th/id/OIP.ygn4alDgL0S57ikHKT3a0QHaDt?w=349&h=174&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    },
  ],
};

const Hero = () => {
  const navigate = useNavigate();

  const { language } = useLanguage();
  const slides = slidesData[language] || slidesData.en;
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  // Button translations
  const t = translations[language] || translations.en;

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <img
        src={slides[currentSlide].imgUrl}
        alt="banner"
        className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 md:px-10 text-white">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-md">
            {slides[currentSlide].title}
          </h1>
          <p className="text-base md:text-xl lg:text-2xl font-medium text-gray-100">
            {slides[currentSlide].subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <button 
            onClick={() => navigate('/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:scale-105">
              {t.shopNow || 'Shop Now'}
            </button>
            <button 
             onClick={() => navigate('/about')}
            className="border border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-md hover:scale-105">
              {t.exploreMore || 'Explore More'}
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-4 h-4 rounded-full border-2 ${
              index === currentSlide
                ? 'bg-white border-white scale-110 shadow-lg'
                : 'bg-transparent border-gray-300'
            } transition-all duration-300`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
