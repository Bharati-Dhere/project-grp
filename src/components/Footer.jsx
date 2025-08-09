import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
// import LoginModal from "./LoginModal";

export default function Footer() {
  // const [showLoginModal, setShowLoginModal] = useState(false);
  const { language, setLanguage } = useLanguage();
  const languageOptions = [
    { value: "en", label: "English" },
    { value: "hi", label: "हिंदी" },
    { value: "mr", label: "मराठी" },
  ];

  const t = translations[language] || translations.en;

  return (
    <>
      {/* {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )} */}
      <footer className="bg-gray-900 text-white py-10 mt-10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-sm text-gray-300">
          {/* Brand Info + Help Line */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">{t.brand}</h2>
            <p className="leading-relaxed">{t.brandDesc}</p>
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-blue-800/90 rounded-lg px-4 py-2 shadow-sm hover:bg-blue-700/90 transition-colors duration-200">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-600 rounded-full">
                  <img src="https://img.icons8.com/ios-filled/24/ffffff/phone.png" alt="Help Line" className="w-5 h-5" />
                </span>
                <span className="font-semibold text-white text-base">Help Line:</span>
                <a href="tel:1800123456" className="text-blue-100 hover:text-white font-bold text-lg transition-colors duration-200">1800-123-456</a>
              </div>
              <div className="flex items-center gap-3 bg-green-800/90 rounded-lg px-4 py-2 shadow-sm hover:bg-green-700/90 transition-colors duration-200">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-green-600 rounded-full">
                  <img src="https://img.icons8.com/ios-filled/24/ffffff/phone-disconnected.png" alt="Contact" className="w-5 h-5" />
                </span>
                <span className="font-semibold text-white text-base">Contact:</span>
                <a href="tel:9876543210" className="text-green-100 hover:text-white font-bold text-lg transition-colors duration-200">+91-98765-43210</a>
              </div>
            </div>
          </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-3">{t.quickLinks}</h2>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-white transition duration-300 font-semibold">{t.home}</a></li>
            <li><a href="/help" className="hover:text-white transition duration-300 font-semibold">{t.help || 'Help'}</a></li>
            <li><a href="/products" className="hover:text-white transition duration-300 font-semibold">{t.product || 'product'}</a></li>
          </ul>
        </div>

        {/* Social Icons and Language Selector */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-3">{t.connect}</h2>
          <div className="flex space-x-4 mb-4">
            {[
              { icon: "facebook-new", alt: "Facebook" },
              { icon: "instagram-new", alt: "Instagram" },
              { icon: "twitter", alt: "Twitter" },
            ].map(({ icon, alt }) => (
              <button
                key={alt}
                type="button"
                aria-label={alt}
                className="group focus:outline-none"
              >
                <div className="p-2 rounded-full bg-gray-800 hover:bg-white transition duration-300 transform group-hover:scale-110 cursor-pointer">
                  <img
                    src={`https://img.icons8.com/ios-filled/24/000000/${icon}.png`}
                    alt={alt}
                    className="w-5 h-5 group-hover:invert"
                  />
                </div>
              </button>
            ))}
          </div>
          {/* Language Selector */}
          <div className="mt-2">
            <label htmlFor="language-select" className="block mb-1 text-gray-400">{t.selectLanguage}</label>
            <select
              id="language-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-500"
            >
              {languageOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 mt-8 text-xs tracking-wide">
          &copy; 2025 {t.brand}. {t.copyright}
        </div>
      </footer>
    </>
  );
}
