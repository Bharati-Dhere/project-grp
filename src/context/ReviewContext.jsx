import React, { createContext, useContext, useEffect, useState } from 'react';

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('reviews');
    if (stored) setReviews(JSON.parse(stored));
  }, []);

  const addReview = (review) => {
    const updated = [review, ...reviews];
    setReviews(updated);
    localStorage.setItem('reviews', JSON.stringify(updated));
  };

  return (
    <ReviewContext.Provider value={{ reviews, addReview }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => useContext(ReviewContext);