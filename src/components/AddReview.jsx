import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useReviews } from '../context/ReviewContext';
import AuthModal from './AuthModal';

const AddReview = () => {
  const { addReview } = useReviews();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.email) {
      setAuthModalReason('review');
      setShowAuthModal(true);
      return;
    }
    if (!name || !description || !rating) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Attach user avatar if available (prefer user.profile.avatar, fallback to user.avatar)
      let avatar = undefined;
      if (user?.profile && user.profile.avatar && user.profile.avatar.trim() !== '') {
        avatar = user.profile.avatar;
      } else if (user?.avatar && user.avatar.trim() !== '') {
        avatar = user.avatar;
      }
      await addReview({ name, text: description, rating, avatar });
      setName('');
      setDescription('');
      setRating(0);
      navigate('/review');
    } catch (err) {
      setError('Failed to submit review.');
    } finally {
      setLoading(false);
    }
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

      {error && (
        <div className="text-red-600 text-center mb-2">{error}</div>
      )}

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
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      {/* Auth Modal for guest users */}
      {showAuthModal && (
        <AuthModal reason={authModalReason} onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default AddReview;