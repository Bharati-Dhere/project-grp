import React, { useState, useEffect } from "react";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState("");
  const [showContactForms, setShowContactForms] = useState(true);
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    // Read all feedbacks from new unified key
    const allFeedbacks = JSON.parse(localStorage.getItem("adminReviews")) || [];
    const contactForms = JSON.parse(localStorage.getItem("contactForms")) || [];
    const usersList = JSON.parse(localStorage.getItem("users")) || [];
    // Normalize contactForms to feedback-like objects
    const contactFeedbacks = contactForms.map(form => ({
      userEmail: form.email,
      date: form.date || "",
      message: form.message,
      isContactForm: true,
      name: form.name,
      subject: form.subject
    }));
    // Add isRegistered property to feedbacks
    const feedbacksWithType = allFeedbacks.map(fb => ({
      ...fb,
      isRegistered: usersList.some(u => u.email === fb.userEmail)
    }));
    // Combine and sort by date
    const combined = [...feedbacksWithType, ...contactFeedbacks].map(fb => ({
      ...fb,
      date: fb.date ? new Date(fb.date) : new Date(0)
    }));
    setFeedbacks(combined);
  }, []);

  let filteredFeedbacks = feedbacks;
  if (showContactForms) {
    filteredFeedbacks = feedbacks.filter(fb => fb.isContactForm);
  } else {
    filteredFeedbacks = feedbacks.filter(fb => {
      if (filter === "guest") return !fb.isContactForm && fb.isRegistered === false;
      if (filter === "user") return !fb.isContactForm && fb.isRegistered === true;
      return !fb.isContactForm;
    });
  }
  // Sort by date
  filteredFeedbacks = filteredFeedbacks.sort((a, b) => sortOrder === "desc" ? b.date - a.date : a.date - b.date);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Feedback Management</h1>
      <ul className="space-y-2">
        {feedbacks.filter(fb => fb.isContactForm).length === 0 && (
          <li className="text-gray-500">No feedback found.</li>
        )}
        {feedbacks.filter(fb => fb.isContactForm).map((fb, idx) => (
          <li key={idx} className="bg-gray-50 p-4 rounded shadow flex flex-col">
            <span className="font-semibold text-blue-800">Contact Form</span>
            <span className="text-sm text-gray-500">{fb.date instanceof Date ? fb.date.toLocaleString() : fb.date}</span>
            <span><strong>Name:</strong> {fb.name || "N/A"}</span>
            <span><strong>Email:</strong> {fb.userEmail || "N/A"}</span>
            <span><strong>Subject:</strong> {fb.subject || "N/A"}</span>
            <span className="mt-2"><strong>Message:</strong> {fb.message || "No message provided."}</span>
            <div className="flex gap-2 mt-2">
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                onClick={() => {
                  // Delete contact form logic (match all unique fields, normalize date)
                  const contactForms = JSON.parse(localStorage.getItem('contactForms')) || [];
                  const updatedForms = contactForms.filter((form) => {
                    let formDate = form.date ? String(form.date) : '';
                    let fbDate = fb.date ? String(fb.date) : '';
                    let dateMatch = false;
                    try {
                      dateMatch = new Date(form.date).toISOString() === new Date(fb.date).toISOString();
                    } catch {
                      dateMatch = formDate === fbDate;
                    }
                    // If either date is missing, ignore date in matching
                    return !(
                      form.email === fb.userEmail &&
                      (formDate === '' || fbDate === '' || dateMatch) &&
                      form.name === fb.name &&
                      form.subject === fb.subject &&
                      form.message === fb.message
                    );
                  });
                  localStorage.setItem('contactForms', JSON.stringify(updatedForms));
                  window.location.reload();
                }}
                title="Delete this contact form"
              >Delete</button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                onClick={() => window.alert('Reply feature coming soon!')}
                title="Reply to this contact form"
              >Reply</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
