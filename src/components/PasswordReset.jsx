// PasswordResetModal.jsx
import React from 'react';
import { useClerk, useSignIn } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

export default function PasswordResetModal({ showModal, setShowModal }) {
  const { signIn } = useSignIn();
  const { signOut, session } = useClerk();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset all state when modal is opened or closed
  useEffect(() => {
    if (showModal) {
      setStep(1);
      setEmail("");
      setCode("");
      setPassword("");
      setMessage("");
      setLoading(false);
    }
  }, [showModal]);

  // Auto-close only after password reset success
  useEffect(() => {
    if (step === 4 && showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [step, setShowModal, showModal]);

  //  Step 1: Send email code
  const handleSendCode = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Always sign out before starting a new signIn to avoid 'session already exists' error
      if (typeof signOut === 'function') await signOut();
      if (signIn && signIn.reset) signIn.reset();
      await signIn.create({
        identifier: email,
        strategy: "email_code",
      });

      setStep(2);
      setMessage(" Verification code sent to your email.");
    } catch (err) {
      // If error is 'session_exists', force signOut and reset, then retry once
      if (err.errors && err.errors[0]?.code === 'session_exists') {
        try {
          if (typeof signOut === 'function') await signOut();
          if (signIn && signIn.reset) signIn.reset();
          await signIn.create({
            identifier: email,
            strategy: "email_code",
          });
          setStep(2);
          setMessage(" Verification code sent to your email.");
          setLoading(false);
          return;
        } catch (err2) {
          setMessage(err2.errors?.[0]?.message || err2.message || "Error sending code.");
          setStep(1); // Always show email entry if error
          setLoading(false);
          return;
        }
      }
      setMessage(err.errors?.[0]?.message || "Error sending code.");
      setStep(1); // Always show email entry if error
    }

    setLoading(false);
  };

  // ✅ Step 2: Verify Code
  const handleVerifyCode = async () => {
    setLoading(true);
    setMessage("");

    try {
      await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      setStep(3); // Go to set new password
      setMessage(" Code verified. Set your new password.");
    } catch (err) {
      setMessage(err.errors?.[0]?.message || "Invalid code.");
    }

    setLoading(false);
  };

  // ✅ Step 3: Set new password
  const handleSetPassword = async () => {
  setLoading(true);
  setMessage("");

  try {
    const response = await fetch("/api/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, verified: true }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Server error");
    }

    setStep(4);
    setMessage("Password updated successfully.");
  } catch (err) {
    setMessage(err.message || "Error setting password.");
  }

  setLoading(false);
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button
          onClick={() => setShowModal(false)}
          className={`absolute top-2 right-3 text-xl`}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">Forgot Password</h2>

        {message && <p className="mb-3 text-sm text-blue-600">{message}</p>}

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 mb-3"
            />
            <button onClick={handleSendCode} disabled={loading} className="btn w-full">
              {loading ? "Sending..." : "Send Code"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border p-2 mb-3"
            />
            <button onClick={handleVerifyCode} disabled={loading} className="btn w-full">
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 mb-3"
            />
            <button onClick={handleSetPassword} disabled={loading} className="btn w-full">
              {loading ? "Setting..." : "Set Password"}
            </button>
          </>
        )}

        {step === 4 && (
          <p className="text-green-600 text-center"> Password updated! Redirecting...</p>
        )}
      </div>
    </div>
  );
}
