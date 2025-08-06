// filepath: [SignupModal.jsx](http://_vscodecontentref_/1)
import React, { useState } from 'react';
import { signup as apiSignup } from '../utils/api';
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Country codes for dropdown
const countryCodes = [
  { code: '+91', label: 'India' },
  { code: '+1', label: 'USA' },
  { code: '+44', label: 'UK' },
  // Add more as needed
];

// Your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyCbzEH-BA95GcmLnkTNhAOITcLHEc-UT68",
  authDomain: "mobile-website-b8b87.firebaseapp.com",
  projectId: "mobile-website-b8b87",
  storageBucket: "mobile-website-b8b87.firebasestorage.app",
  messagingSenderId: "74911372681",
  appId: "1:74911372681:web:377a4a064f7a318ff23d58",
  measurementId: "G-R30F1DT9HZ"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const SignupModal = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', countryCode: '+91', mobile: '', otp: '' });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info'); // 'error' or 'info'
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Validation functions
  const validateMobile = (mobile) => mobile && /^\d{8,15}$/.test(mobile);
  const validateEmail = (email) => email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const validatePassword = (pw) => pw && pw.length >= 6;
  const validateName = (name) => name && name.trim().length >= 2;

  // Send OTP using Firebase
  const handleSendOtp = async () => {
    setMsg('');
    setMsgType('error');
    if (!validateMobile(form.mobile)) {
      setMsg('Enter a valid mobile number (8-15 digits).');
      return;
    }
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        form.countryCode + form.mobile,
        window.recaptchaVerifier
      );
      setConfirmation(confirmationResult);
      setOtpSent(true);
      setMsgType('info');
      setMsg(`OTP sent to ${form.countryCode} ${form.mobile}.`);
    } catch (err) {
      setMsgType('error');
      setMsg('Failed to send OTP. Try again.');
    }
  };

  // Verify OTP using Firebase
  const handleVerifyOtp = async () => {
    setMsg('');
    setMsgType('error');
    if (!form.otp || form.otp.length !== 6) {
      setMsg('Enter the 6-digit OTP.');
      return;
    }
    try {
      await confirmation.confirm(form.otp);
      setOtpVerified(true);
      setMsgType('info');
      setMsg('Mobile number verified!');
    } catch (err) {
      setMsg('Invalid OTP.');
    }
  };

  // Signup logic
  const handleSignup = async () => {
    setMsg('');
    setMsgType('error');
    const errors = {};
    if (!validateName(form.name)) {
      errors.name = 'Enter a valid name (at least 2 characters).';
    }
    if (!validateEmail(form.email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!validatePassword(form.password)) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (!validateMobile(form.mobile)) {
      errors.mobile = 'Enter a valid mobile number (8-15 digits).';
    }
    if (Object.keys(errors).length === 0 && !otpVerified) {
      errors.otp = 'Please verify your mobile number by entering the OTP sent to your phone.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    try {
      const signupData = {
        name: form.name,
        email: form.email,
        password: form.password,
        mobile: form.mobile,
        countryCode: form.countryCode
      };
      await apiSignup(signupData);
      setMsgType('info');
      setMsg('Signup successful! You can now log in.');
      setFieldErrors({});
    } catch (err) {
      setMsgType('error');
      setMsg(err.response?.data?.message || 'Signup failed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-80">
        <h2 className="text-xl font-bold mb-4">Signup</h2>
        {msg && (
          <p className={msgType === 'error' ? 'text-red-600' : 'text-green-600'}>{msg}</p>
        )}
        <input
          type="text"
          placeholder="Name"
          className="input"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        {fieldErrors.name && <div className="text-red-500 text-xs">{fieldErrors.name}</div>}
        <input
          type="email"
          placeholder="Email"
          className="input mt-2"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        {fieldErrors.email && <div className="text-red-500 text-xs">{fieldErrors.email}</div>}
        <input
          type="password"
          placeholder="Password"
          className="input mt-2"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        {fieldErrors.password && <div className="text-red-500 text-xs">{fieldErrors.password}</div>}
        <div className="flex mt-2 gap-2">
          <select
            className="input w-24"
            value={form.countryCode}
            onChange={e => setForm({ ...form, countryCode: e.target.value })}
          >
            {countryCodes.map(c => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.label})
              </option>
            ))}
          </select>
          <input
            type="tel"
            placeholder="Mobile Number"
            className="input flex-1"
            value={form.mobile}
            onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
            maxLength={15}
          />
        </div>
        {fieldErrors.mobile && <div className="text-red-500 text-xs">{fieldErrors.mobile}</div>}
        <div id="recaptcha-container"></div>
        {!otpVerified && (
          <>
            {!otpSent ? (
              <button
                className="btn mt-2 bg-blue-600 text-white w-full"
                onClick={handleSendOtp}
              >
                Send OTP
              </button>
            ) : (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="input w-full"
                  value={form.otp}
                  onChange={e => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
                  maxLength={6}
                />
                <button
                  className="btn mt-2 bg-green-600 text-white w-full"
                  onClick={handleVerifyOtp}
                >
                  Verify OTP
                </button>
                <button
                  className="btn mt-2 bg-blue-500 text-white w-full"
                  onClick={handleSendOtp}
                >
                  Resend OTP
                </button>
                {fieldErrors.otp && <div className="text-red-500 text-xs">{fieldErrors.otp}</div>}
              </div>
            )}
          </>
        )}
        <button
          className="btn mt-4 bg-green-600 text-white w-full"
          onClick={handleSignup}
        >
          Signup
        </button>
        <button className="btn mt-2 bg-gray-300 w-full" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SignupModal;