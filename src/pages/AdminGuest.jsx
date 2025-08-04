import React, { useState, useEffect } from "react";

export default function AdminGuest() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    // Load feedbacks from localStorage
    const storedFeedbacks = JSON.parse(localStorage.getItem("guestFeedbacks")) || [];
    setFeedbacks(storedFeedbacks);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Guest Feedbacks</h1>
      {feedbacks.length === 0 ? (
        <p className="text-gray-500">No feedback submitted by guests.</p>
      ) : (
        <ul className="space-y-4">
          {feedbacks.map((fb, idx) => (
            <li key={idx} className="bg-gray-50 p-4 rounded shadow">
              <p><strong>Feedback:</strong> {fb.message}</p>
              <p><strong>Date:</strong> {fb.date}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
