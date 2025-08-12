import React from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import Offers from "../components/Offers";
import BestSellers from "../components/BestSellers";
import WhyChoose from "../components/WhyChoose";
import Steps from "../components/Steps";
// import Reviews from "../components/Reviews";
import ReviewSwiper from "../components/ReviewSwiper";
import Contact from "../components/Contact"; // ✅ Import Contact



const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Hero />
      <Offers />
      <BestSellers />
      <WhyChoose />
      <Steps />

      {/* Discount Banner Section */}
      
      <section
        className="relative bg-fixed bg-center bg-cover text-white text-center py-24 px-4"
        style={{
          backgroundImage:
            'url(https://static.vecteezy.com/system/resources/previews/000/664/483/original/abstract-blue-banner-design-vector.jpg)',
        }}
      >
        <div className="bg-black/60 backdrop-blur-sm py-16 px-4 rounded-xl max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Mega Sale is Live!</h2>
          <p className="text-lg md:text-xl mb-6">
            Flat 40% off on all smartphones and gadgets
          </p>
          <button 
          onClick={() => navigate('/products')}
          className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300 font-semibold text-sm shadow-md">
            Shop Now
          </button>
        </div>
      </section>

      {/* <Reviews /> */}
      <ReviewSwiper />
      <Contact /> {/* ✅ Add Contact Section here */}
    </div>
  );
};

export default Home;
