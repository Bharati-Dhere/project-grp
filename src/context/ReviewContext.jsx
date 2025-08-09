import React, { createContext, useContext, useEffect, useState } from 'react';

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Fetch reviews from backend
    fetch('/api/reviews', { credentials: 'include' })
      .then(res => res.json())
      .then(setReviews)
      .catch(() => setReviews([]));
  }, []);

  const addReview = async (review) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(review)
      });
      const newReview = await res.json();
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