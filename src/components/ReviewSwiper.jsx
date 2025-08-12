// 3. ReviewSwiper.jsx (Homepage section)
import React from 'react';
import defaultAvatar from '../assets/default-avtar.jpg';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import { useNavigate } from 'react-router-dom';
import { useReviews } from '../context/ReviewContext';
import StarRating from './StarRating';

const ReviewSwiper = () => {
  const navigate = useNavigate();
  const { reviews } = useReviews();
  // Only show user-added reviews (with 'text' field, not product/accessory reviews)
  const userReviews = Array.isArray(reviews) ? reviews.filter(r => r.text && !r.productId && !r.accessoryId) : [];
  // Show latest 4 user reviews
  const latestReviews = [...userReviews].slice(-4).reverse();


  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Customer Reviews</h2>

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {latestReviews.map((review) => (
            <SwiperSlide key={review.id}>
              <div className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition">
                <img
                  src={review.avatar && review.avatar.trim() !== '' ? review.avatar : (review.userAvatar || defaultAvatar)}
                  className="w-16 h-16 mx-auto rounded-full mb-4"
                  alt={review.name}
                  onError={e => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                />
                <h3 className="text-lg font-semibold">{review.name}</h3>
                <p className="text-gray-600">{review.text || review.description}</p>
                <StarRating rating={review.rating} />
                <p className="text-xs text-gray-400 mt-2">{review.date ? new Date(review.date).toLocaleDateString() : ''}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/review')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          >
            See More Reviews
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReviewSwiper;