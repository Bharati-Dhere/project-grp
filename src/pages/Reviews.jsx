import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";

export default function Reviews() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState({ date: "All", rating: "All" });
  const [userReview, setUserReview] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Load all reviews from backend
    fetch('/api/reviews', { credentials: 'include' })
      .then(res => res.json())
      .then(setReviews)
      .catch(() => setReviews([]));
  }, []);

  // Only show user-added reviews (not product/accessory reviews)
  const filteredReviews = reviews.filter((r) => {
    // User reviews have 'text' field and no productId/accessoryId
    if (r.productId || r.accessoryId) return false;
    let match = true;
    if (filter.rating !== "All" && r.rating !== Number(filter.rating)) match = false;
    if (filter.date === "Last 30 days") {
      const reviewDate = new Date(r.date);
      const now = new Date();
      if ((now - reviewDate) / (1000 * 60 * 60 * 24) > 30) match = false;
    }
    return match;
  });

  const handleAddReview = async () => {
    // Get user from context or backend session
    const res = await fetch('/api/auth/profile', { credentials: 'include' });
    const user = await res.json();
    if (!user || !user.email) {
      setShowAuthModal(true);
      return;
    }
    if (!userReview.trim()) return;
    const newReview = {
      text: userReview,
      rating: userRating,
      date: new Date().toLocaleDateString(),
      userEmail: user.email,
      userName: user.name || "User",
    };
    const reviewRes = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newReview)
    });
    const savedReview = await reviewRes.json();
  setReviews([...reviews, savedReview]);
  setUserReview("");
  setUserRating(5);
  setSuccessMsg("Review added successfully!");
  setTimeout(() => setSuccessMsg("");, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-6 text-center">User Reviews</h2>
      <div className="flex gap-4 mb-6 justify-center">
        <select value={filter.date} onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} className="px-4 py-2 border rounded">
          <option value="All">All Dates</option>
          <option value="Last 30 days">Last 30 days</option>
        </select>
        <select value={filter.rating} onChange={e => setFilter(f => ({ ...f, rating: e.target.value }))} className="px-4 py-2 border rounded">
          <option value="All">All Ratings</option>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}★</option>)}
        </select>
      </div>
      <div className="space-y-4 mb-8">
        {filteredReviews.length === 0 ? (
          <p className="text-gray-500">No reviews found.</p>
        ) : (
          filteredReviews.map((r, idx) => (
            <div key={idx} className="border rounded p-3 bg-gray-50">
              <div className="flex gap-2 items-center mb-1">
                <span className="text-yellow-500">{r.rating}★</span>
                <span className="text-xs text-gray-400">{r.date}</span>
                <span className="text-xs text-blue-700">{r.userName}</span>
              </div>
              <div className="text-gray-700">{r.text}</div>
            </div>
          ))
        )}
      </div>
      {successMsg && (
        <div className="mb-4 text-green-600 font-semibold text-center bg-green-100 border border-green-300 rounded p-2">
          {successMsg}
        </div>
      )}
      <div className="border-t pt-4 mt-4">
        <h4 className="font-semibold mb-2">Add Your Review</h4>
        <div>
          <div className="flex gap-2 items-center mb-2">
            <label>Rating:</label>
            <select value={userRating} onChange={e => setUserRating(Number(e.target.value))} className="border rounded px-2 py-1">
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}★</option>)}
            </select>
          </div>
          <textarea value={userReview} onChange={e => setUserReview(e.target.value)} rows={2} className="border rounded w-full px-2 py-1 mb-2" placeholder="Write your review..." />
          <button onClick={handleAddReview} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition">Submit Review</button>
        </div>
      </div>
      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            navigate(-1);
          }}
          setUser={() => {
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}
