import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedInUser } from "../utils/authUtils";
import AuthModal from "../components/AuthModal";

export default function Help() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you today?", sender: "bot" },
    { text: "You can ask me about product details, order status and offers...", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const quickActions = [
    { label: "Track Order", response: "To track your order, go to profile." },
    { label: "Browse Products", response: "Use the Products page to browse the latest items." },
    { label: "Reviews", response: "You can view user reviews under the 'Reviews' tab." },
    { label: "Home", response: "Redirecting you to the Home page." },
    { label: "Help", response: "You can email us at help@mobileshopy.com" }
  ];

  const faqs = [
    "How do I track my order?",
    "How can I avail discounts and offers?",
    "Can I pre-order new devices?",
    "How can I contact customer support?"
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "Thanks for your message! We'll get back to you shortly.", sender: "bot" }
      ]);
    }, 1000);

    setInput("");
  };

  const handleQuickAction = (response, label) => {
    switch (label) {
      case "Home":
        navigate("/");
        break;
      case "Track Order": {
        const user = getLoggedInUser();
        if (!user || !user.email) {
          setShowAuthModal(true);
          setMessages((prev) => [
            ...prev,
            { text: "Please log in to track your order.", sender: "bot" }
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { text: response, sender: "bot" }
          ]);
          navigate("/profile");
        }
        break;
      }
      case "Browse Products":
        setMessages((prev) => [
          ...prev,
          { text: response, sender: "bot" }
        ]);
        navigate("/products");
        break;
      case "Reviews":
        setMessages((prev) => [
          ...prev,
          { text: response, sender: "bot" }
        ]);
        navigate("/review");
        break;
      case "Help":
        setMessages((prev) => [
          ...prev,
          { text: response, sender: "bot" }
        ]);
        navigate("/help");
        break;
      default:
        setMessages((prev) => [
          ...prev,
          { text: response, sender: "bot" }
        ]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 font-sans">
      {/* Chat Section */}
      <div className="flex flex-col flex-1 h-[80vh] border border-gray-300 rounded-xl p-4 bg-white">
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[70%] px-4 py-3 rounded-xl text-sm ${
                msg.sender === "user"
                  ? "self-end bg-blue-100"
                  : "self-start bg-blue-50"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="flex mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your Feedback!!!"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>

      {/* Sidebar Section */}
      <div className="flex-2 w-full md:w-[40%] h-[80vh] overflow-y-auto border border-gray-300 rounded-xl p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

        <div className="flex flex-col items-center gap-4 mb-6">
          {/* Row 1 */}
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => handleQuickAction(quickActions[0].response, quickActions[0].label)}
              className="bg-blue-700 text-white px-4 py-2 rounded-full text-sm min-w-[130px]"
            >
              {quickActions[0].label}
            </button>
            <button
              onClick={() => handleQuickAction(quickActions[1].response, quickActions[1].label)}
              className="bg-blue-700 text-white px-4 py-2 rounded-full text-sm min-w-[130px]"
            >
              {quickActions[1].label}
            </button>
          </div>

          {/* Center */}
          <div className="flex justify-center">
            <button
              onClick={() => handleQuickAction(quickActions[4].response, quickActions[4].label)}
              className="bg-blue-700 text-white px-4 py-2 rounded-full text-sm min-w-[130px]"
            >
              {quickActions[4].label}
            </button>
          </div>

          {/* Row 2 */}
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => handleQuickAction(quickActions[2].response, quickActions[2].label)}
              className="bg-blue-700 text-white px-4 py-2 rounded-full text-sm min-w-[130px]"
            >
              {quickActions[2].label}
            </button>
            <button
              onClick={() => handleQuickAction(quickActions[3].response, quickActions[3].label)}
              className="bg-blue-700 text-white px-4 py-2 rounded-full text-sm min-w-[130px]"
            >
              {quickActions[3].label}
            </button>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-3">Frequently Asked Questions</h3>
        <div className="pl-2 space-y-2 text-sm text-gray-700">
          {faqs.map((faq, i) => (
            <h4 key={i}>{faq}</h4>
          ))}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          setUser={() => setShowAuthModal(false)}
          reason="order"
        />
      )}
    </div>
  );
}