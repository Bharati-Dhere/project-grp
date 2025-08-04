import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReviews } from '../context/ReviewContext';

const AddReview = () => {
  const { addReview } = useReviews();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newReview = {
      id: Date.now(),
      name,
      rating: parseInt(rating),
      description,
      avatar: '/images/default-user.jpg', // Optional avatar
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    addReview(newReview);
    navigate('/review'); // ✅ Redirect to reviews page after submit
  };

  const handleClose = () => {
    navigate('/review'); // ✅ Redirect if user cancels
  };

  return (
    <div className="max-w-md mx-auto mt-6 bg-white p-6 rounded shadow-md relative">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl"
        title="Close"
      >
        ✕
      </button>

      <h3 className="text-2xl font-semibold mb-4 text-center">Add Your Review</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />

        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {[5, 4, 3, 2, 1].map((star) => (
            <option key={star} value={star}>
              {star} Star{star > 1 ? 's' : ''}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Your Review"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full p-2 border rounded"
          rows={4}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default AddReview;