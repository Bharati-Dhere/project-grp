// src/components/LoginModal.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const matched = users.find(u => u.email === email && u.password === password);
    if (!matched) {
      setError("Invalid email or password!");
    } else {
      login(matched);
      onClose();
      navigate('/');
    }
  };

  const handleSendOtp = () => {
    if (!mobile || mobile.length < 8) {
      setError('Enter a valid mobile number.');
      return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const exists = users.find(u => u.countryCode === countryCode && u.mobile === mobile);
    if (!exists) {
      setError('Mobile number not registered.');
      return;
    }
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    setError(`OTP sent to ${countryCode} ${mobile}. (Demo OTP: ${otp})`);
  };

  const handleVerifyOtp = () => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    // If multiple users with same mobile, pick the first one (or you can show a list to pick)
    const matched = users.find(u => u.countryCode === countryCode && u.mobile === mobile);
    if (otp === generatedOtp && matched) {
      // Always login as the matched user (with their email)
      login(matched);
      onClose();
      navigate('/');
    } else {
      setError('Invalid OTP.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-80">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-600">{error}</p>}
        {!otpMode ? (
          <>
            <input type="email" placeholder="Email" className="input" onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="input mt-2" onChange={e => setPassword(e.target.value)} />
            <button className="btn mt-4 bg-blue-600 text-white w-full" onClick={handleLogin}>Login</button>
            <div className="my-2 text-center text-gray-500 text-xs">or</div>
            <button className="btn bg-green-100 text-green-700 w-full" onClick={() => setOtpMode(true)}>Login with Mobile & OTP</button>
          </>
        ) : (
          <>
            <div className="flex gap-2 mb-2">
              <select className="input w-24" value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                <option value="+91">+91 (India)</option>
                <option value="+1">+1 (USA)</option>
                <option value="+44">+44 (UK)</option>
              </select>
              <input type="tel" placeholder="Mobile Number" className="input flex-1" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} maxLength={15} />
            </div>
            {!otpSent ? (
              <button className="btn bg-blue-600 text-white w-full" onClick={handleSendOtp}>Send OTP</button>
            ) : (
              <>
                <input type="text" placeholder="Enter OTP" className="input w-full mt-2" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={6} />
                <button className="btn bg-green-600 text-white w-full mt-2" onClick={handleVerifyOtp}>Verify & Login</button>
              </>
            )}
            <button className="btn mt-2 bg-gray-300 w-full" onClick={() => setOtpMode(false)}>Back to Email Login</button>
          </>
        )}
        <button className="btn mt-2 bg-gray-300 w-full" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default LoginModal;
