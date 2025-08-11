import React, { createContext, useContext, useEffect, useState } from 'react';

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Fetch reviews from backend
    fetch('/api/reviews', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.data)) {
          setReviews(data.data);
        } else {
          setReviews([]);
        }
      })
      .catch(() => setReviews([]));
  }, []);

  const addReview = async (review) => {
    try {
      // Ensure user reviews have a 'text' field for filtering
      const userReview = { ...review, text: review.description || review.text };
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userReview)
      });
      const result = await res.json();
      const newReview = { ...userReview, ...(result.data || result) };
      setReviews([newReview, ...reviews]);
    } catch {
      // handle error
    }
  };

  return (
    <ReviewContext.Provider value={{ reviews, addReview }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => useContext(ReviewContext);