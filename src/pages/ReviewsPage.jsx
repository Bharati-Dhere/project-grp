import React, { useState } from 'react';
import { useReviews } from '../context/ReviewContext';
import ReviewCard from '../components/ReviewCard';
import { Link } from 'react-router-dom';

const ReviewPage = () => {
  const { reviews } = useReviews();
  const [filter, setFilter] = useState('newest');

  // Only include user-added reviews (with 'text' field, not product/accessory reviews)
  const userReviews = Array.isArray(reviews) ? reviews.filter(r => r.text && !r.productId && !r.accessoryId) : [];

  const sortedReviews = [...userReviews].sort((a, b) => {
    if (filter === 'newest') return b.id - a.id;
    if (filter === 'oldest') return a.id - b.id;
    if (filter === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Top bar: Heading + Filter + Add Review */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-2xl font-bold">All Reviews</h2>

        <div className="flex gap-2 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rating">Highest Rating</option>
          </select>

          <Link to="/add-review">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              + Add Review
            </button>
          </Link>
        </div>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedReviews.length > 0 ? (
          sortedReviews.map((review, idx) => (
            <ReviewCard key={review.id || review._id || idx} review={review} />
          ))
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to add one!</p>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;