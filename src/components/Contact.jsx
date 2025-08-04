import React, { useState } from "react";


const Contact = () => {
  const [fields, setFields] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!fields.name.trim()) errs.name = "Name is required.";
    if (!fields.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(fields.email)) {
      errs.email = "Enter a valid email address.";
    }
    if (!fields.message.trim()) errs.message = "Message is required.";
    return errs;
  };

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setShowSuccess(true);
    setFields({ name: "", email: "", message: "" });
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <section className="py-10 px-4 md:px-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Contact Us
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Contact Form */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-lg">
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="block text-gray-700 font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={fields.name}
                  onChange={handleChange}
                  className={`w-full border ${errors.name ? "border-red-400" : "border-gray-300"} rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300`}
                  placeholder="Your Name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={fields.email}
                  onChange={handleChange}
                  className={`w-full border ${errors.email ? "border-red-400" : "border-gray-300"} rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium">Message</label>
                <textarea
                  name="message"
                  value={fields.message}
                  onChange={handleChange}
                  className={`w-full border ${errors.message ? "border-red-400" : "border-gray-300"} rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300`}
                  rows="5"
                  placeholder="Type your message here..."
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Send Message
              </button>
            </form>
           {showSuccess && (
  <div
    style={{
      position: "fixed",
      top: "40px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#16a34a",
      color: "white",
      padding: "14px 36px",
      borderRadius: "10px",
      boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
      zIndex: 9999,
      fontWeight: "bold",
      fontSize: "1.1rem",
      opacity: 1,
      transition: "opacity 0.5s"
    }}
  >
    Message sent successfully!
  </div>
)}
          </div>

          {/* Right: Google Map */}
          <div className="flex-1 relative rounded-lg overflow-hidden shadow-lg h-72 md:h-auto min-h-[400px]">
            {/* View on Google Maps Button */}
            <a
              href="https://www.google.com/maps/place/Lincode+Technology+Pvt+Ltd/@18.5259362,73.8466472,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 z-10 bg-white text-blue-700 hover:text-blue-900 px-3 py-1.5 rounded-md shadow-md text-xs font-medium border border-blue-300"
            >
              View in Large Map
            </a>

            {/* Red Location Pin */}
            <div className="absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="36"
                viewBox="0 0 24 24"
                width="36"
                fill="#d93025"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
              </svg>
            </div>

            {/* Embedded Google Map */}
            <iframe
              title="Lincode Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.8663082135313!2d73.84406607520652!3d18.525936220723355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c148e492e145%3A0xfa28415f4a85e89!2sLinkcode%20Technologies%20%7C%20Gen%20AI%20%7C%20Java%20%7C%20Python%20%7C%20Data%20Analytics%20%7C%20Data%20Science%20%7C%20Mean%2FMern%20Stack!5e0!3m2!1sen!2sin!4v1753416844196!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;