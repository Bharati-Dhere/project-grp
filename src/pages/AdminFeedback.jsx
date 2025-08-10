import React, { useState, useEffect } from "react";
import { fetchFeedback, deleteFeedback } from "../utils/feedbackApi";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    async function loadFeedback() {
      try {
        const res = await fetchFeedback();
        setFeedbacks(Array.isArray(res.data) ? res.data : []);
      } catch {
        setFeedbacks([]);
      }
    }
    loadFeedback();
  }, []);

  // Sort by date
  const sortedFeedbacks = [...feedbacks].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Feedback Management</h1>
      <ul className="space-y-2">
        {sortedFeedbacks.length === 0 && (
          <li className="text-gray-500">No feedback found.</li>
        )}
        {sortedFeedbacks.map((fb, idx) => (
          <li key={fb._id || idx} className="bg-gray-50 p-4 rounded shadow flex flex-col">
            <span className="font-semibold text-blue-800">{fb.isContactForm ? "Contact Form" : (fb.isRegistered ? "User Feedback" : "Guest Feedback")}</span>
            <span className="text-sm text-gray-500">{fb.date ? new Date(fb.date).toLocaleString() : "N/A"}</span>
            <span><strong>Name:</strong> {fb.name || "N/A"}</span>
            <span><strong>Email:</strong> {fb.email || fb.userEmail || "N/A"}</span>
            {fb.subject && <span><strong>Subject:</strong> {fb.subject}</span>}
            <span className="mt-2"><strong>Message:</strong> {fb.message || "No message provided."}</span>
            <div className="flex gap-2 mt-2">
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                onClick={async () => {
                  if(window.confirm("Delete this feedback?")) {
                    await deleteFeedback(fb._id);
                    setFeedbacks(feedbacks => feedbacks.filter(f => f._id !== fb._id));
                  }
                }}
                title="Delete this feedback"
              >Delete</button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                onClick={() => window.alert('Reply feature coming soon!')}
                title="Reply to this feedback"
              >Reply</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
