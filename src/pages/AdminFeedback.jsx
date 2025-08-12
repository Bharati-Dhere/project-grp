import React, { useState, useEffect } from "react";
import { fetchFeedback, deleteFeedback } from "../utils/feedbackApi";
import { sendAdminReply } from "../utils/sendAdminReply";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [replyModal, setReplyModal] = useState({ open: false, fb: null });
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

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
                onClick={() => {
                  setReplyModal({ open: true, fb });
                  setReplySubject(`Re: ${fb.subject || 'Feedback Response'}`);
                  setReplyBody(`Hi ${fb.name || ''},\n\n`);
                }}
                title="Reply to this feedback"
              >Reply</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Reply Modal for backend email sending */}
      {replyModal.open && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-gray-800 bg-opacity-90 p-8 rounded-2xl shadow-2xl max-w-lg w-full relative text-white">
      <button
        className="absolute top-3 right-4 text-gray-300 hover:text-red-500 text-2xl"
        onClick={() => setReplyModal({ open: false, fb: null })}
        title="Close"
      >
        ✕
      </button>
      <h2 className="text-2xl font-semibold mb-6">
        Reply to {replyModal.fb?.name || 'User'}
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">To:</label>
        <input
          type="email"
          className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={replyModal.fb?.email || replyModal.fb?.userEmail || ''}
          disabled
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Subject:</label>
        <input
          type="text"
          className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={replySubject}
          onChange={e => setReplySubject(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Message:</label>
        <textarea
          className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={6}
          value={replyBody}
          onChange={e => setReplyBody(e.target.value)}
        />
      </div>

      {sendError && <div className="text-red-400 mb-2">{sendError}</div>}
      {sendSuccess && <div className="text-green-400 mb-2">{sendSuccess}</div>}

      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow-lg transition disabled:opacity-50"
        disabled={sending}
        onClick={async () => {
          setSending(true);
          setSendError("");
          setSendSuccess("");
          try {
            await sendAdminReply({
              to: replyModal.fb?.email || replyModal.fb?.userEmail || '',
              subject: replySubject,
              text: replyBody
            });
            setSendSuccess('Reply sent successfully!');
          } catch (err) {
            setSendError('Failed to send reply.');
          } finally {
            setSending(false);
          }
        }}
      >
        {sending ? 'Sending...' : 'Send Reply'}
      </button>
    </div>
  </div>
)}

    </div>
  );
}
