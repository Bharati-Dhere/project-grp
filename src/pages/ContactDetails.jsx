import React, { useState } from 'react';

const ContactDetails = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const storedData = JSON.parse(localStorage.getItem('contactForms')) || [];

  const handleLogin = () => {
    if (password === 'admin123') {
      setAuthenticated(true);
    } else {
      alert('Wrong password!');
    }
  };

  return (
    <section className="py-16 px-6 min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-8">
        {!authenticated ? (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Admin Password"
              className="w-full p-3 border rounded-lg"
            />
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              View Submissions
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-center mb-8">Submitted Contact Forms</h2>
            {storedData.length === 0 ? (
              <p className="text-center text-gray-500">No contact forms submitted yet.</p>
            ) : (
              <div className="space-y-6">
                {storedData.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-6 shadow-md bg-gray-50"
                  >
                    <p><strong>Name:</strong> {item.name}</p>
                    <p><strong>Email:</strong> {item.email}</p>
                    <p><strong>Subject:</strong> {item.subject}</p>
                    <p><strong>Message:</strong> {item.message}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ContactDetails;
