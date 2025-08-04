
import { useState } from "react";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";

export default function AuthModal({ onClose, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginMobile, setLoginMobile] = useState({ countryCode: "+91", mobile: "", otp: "" });
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginGeneratedOtp, setLoginGeneratedOtp] = useState("");
  const [loginOtpMode, setLoginOtpMode] = useState(false);
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "+91",
    mobile: "",
    otp: ""
  });
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupOtpVerified, setSignupOtpVerified] = useState(false);
  const [signupGeneratedOtp, setSignupGeneratedOtp] = useState("");
  const [loginErrors, setLoginErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});

  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find(
      (user) => user.email === loginData.email.trim()
    );
    const errors = {};
    if (!foundUser) {
      errors.email = "User not found. Please sign up first.";
      setLoginErrors(errors);
      return;
    }
    if (foundUser.password !== loginData.password) {
      errors.password = "Invalid password.";
      setLoginErrors(errors);
      return;
    }
    // Single device login validation
    let sessions = JSON.parse(localStorage.getItem("userSessions")) || {};
    if (sessions[foundUser.email] && sessions[foundUser.email].active) {
      errors.general = "This account is already logged in on another device or tab.";
      setLoginErrors(errors);
      return;
    }
    // Mark session as active
    sessions[foundUser.email] = { active: true, timestamp: Date.now() };
    localStorage.setItem("userSessions", JSON.stringify(sessions));
    localStorage.setItem("loggedInUser", JSON.stringify(foundUser));
    let addedAccounts = JSON.parse(localStorage.getItem("addedAccounts")) || [];
    if (!addedAccounts.includes(foundUser.email)) {
      addedAccounts.push(foundUser.email);
      localStorage.setItem("addedAccounts", JSON.stringify(addedAccounts));
    }
    setUser(foundUser);
    toast.success(`Welcome back, ${foundUser.name}`);
    setLoginErrors({});
    onClose();
  };

  const handleLoginSendOtp = () => {
    if (!loginMobile.mobile || loginMobile.mobile.length < 8) {
      setLoginErrors({ mobile: 'Enter a valid mobile number.' });
      return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const matched = users.find(u => u.countryCode === loginMobile.countryCode && u.mobile === loginMobile.mobile);
    if (!matched) {
      setLoginErrors({ mobile: 'Mobile number not registered.' });
      return;
    }
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    setLoginGeneratedOtp(otp);
    setLoginOtpSent(true);
    setLoginErrors({ otp: `OTP sent to ${loginMobile.countryCode} ${loginMobile.mobile}. (Demo OTP: ${otp})` });
  };

  const handleLoginVerifyOtp = () => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const matched = users.find(u => u.countryCode === loginMobile.countryCode && u.mobile === loginMobile.mobile);
    if (loginMobile.otp === loginGeneratedOtp && matched) {
      // Mark session as active
      let sessions = JSON.parse(localStorage.getItem("userSessions")) || {};
      sessions[matched.email] = { active: true, timestamp: Date.now() };
      localStorage.setItem("userSessions", JSON.stringify(sessions));
      localStorage.setItem("loggedInUser", JSON.stringify(matched));
      let addedAccounts = JSON.parse(localStorage.getItem("addedAccounts")) || [];
      if (!addedAccounts.includes(matched.email)) {
        addedAccounts.push(matched.email);
        localStorage.setItem("addedAccounts", JSON.stringify(addedAccounts));
      }
      setUser(matched);
      toast.success(`Welcome back, ${matched.name}`);
      setLoginErrors({});
      onClose();
    } else {
      setLoginErrors({ otp: 'Invalid OTP.' });
    }
  };

  // On logout, clear session for this user
  // (This should be called from logout logic in Profile/Navbar as well)

  const handleSignupSendOtp = () => {
    if (!signupData.mobile || signupData.mobile.length < 8) {
      setSignupErrors({ mobile: 'Enter a valid mobile number.' });
      return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existsMobile = users.find(u => u.countryCode === signupData.countryCode && u.mobile === signupData.mobile);
    if (existsMobile) {
      setSignupErrors({ mobile: 'This mobile number is already registered with another account!' });
      return;
    }
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    setSignupGeneratedOtp(otp);
    setSignupOtpSent(true);
    setSignupErrors({ otp: `OTP sent to ${signupData.countryCode} ${signupData.mobile}. (Demo OTP: ${otp})` });
  };

  const handleSignupVerifyOtp = () => {
    if (signupData.otp === signupGeneratedOtp) {
      setSignupOtpVerified(true);
      setSignupErrors({ otp: 'Mobile number verified!' });
    } else {
      setSignupErrors({ otp: 'Invalid OTP.' });
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const errors = {};
    if (users.find((user) => user.email === signupData.email.trim())) {
      errors.email = "Email already registered.";
    }
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      errors.general = "Please fill all fields.";
    }
    if (!signupData.mobile) {
      errors.mobile = "Mobile number is required.";
    }
    if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    if (!signupData.mobile) {
      errors.mobile = "Mobile number is required.";
    } else if (!signupOtpVerified) {
      errors.otp = "Please verify your mobile number.";
    }
    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      return;
    }
    const newUser = {
      name: signupData.name.trim(),
      email: signupData.email.trim(),
      password: signupData.password,
      countryCode: signupData.countryCode,
      mobile: signupData.mobile
    };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("adminUserUpdates", JSON.stringify(users));
    toast.success("Signup successful! Please log in");
    setSignupErrors({});
    setSignupData({ name: "", email: "", password: "", confirmPassword: "", countryCode: "+91", mobile: "", otp: "" });
    let addedAccounts = JSON.parse(localStorage.getItem("addedAccounts")) || [];
    if (!addedAccounts.includes(newUser.email)) {
      addedAccounts.push(newUser.email);
      localStorage.setItem("addedAccounts", JSON.stringify(addedAccounts));
    }
    setLoginData({ email: newUser.email, password: newUser.password });
    setIsLogin(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center sm:items-center sm:justify-center overflow-y-auto">
      <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-xs sm:max-w-md relative mx-2 my-8 sm:my-0 shadow-xl flex flex-col">
        <button
          className="absolute top-2 right-2 text-xl text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {isLogin ? (
          <>
            {!loginOtpMode ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    className="w-full border p-2 rounded text-sm"
                  />
                  {loginErrors.email && (
                    <p className="text-red-600 text-sm mt-1">{loginErrors.email}</p>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="w-full border p-2 rounded text-sm"
                  />
                  {loginErrors.password && (
                    <p className="text-red-600 text-sm mt-1">{loginErrors.password}</p>
                  )}
                </div>
                {loginErrors.general && (
                  <p className="text-red-600 text-sm mb-2">{loginErrors.general}</p>
                )}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200 text-base sm:text-sm"
                >
                  Login
                </button>
                <div className="my-2 text-center text-gray-500 text-xs">or</div>
                <button
                  type="button"
                  className="w-full bg-green-100 text-green-700 p-2 rounded"
                  onClick={() => setLoginOtpMode(true)}
                >
                  Login with Mobile & OTP
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <select className="w-24 border p-2 rounded text-sm" value={loginMobile.countryCode} onChange={e => setLoginMobile({ ...loginMobile, countryCode: e.target.value })}>
                    <option value="+91">+91 (India)</option>
                    <option value="+1">+1 (USA)</option>
                    <option value="+44">+44 (UK)</option>
                  </select>
                  <input type="tel" placeholder="Mobile Number" className="flex-1 border p-2 rounded text-sm" value={loginMobile.mobile} onChange={e => setLoginMobile({ ...loginMobile, mobile: e.target.value.replace(/\D/g, '') })} maxLength={15} />
                </div>
                {!loginOtpSent ? (
                  <button className="w-full bg-blue-600 text-white p-2 rounded" onClick={handleLoginSendOtp}>Send OTP</button>
                ) : (
                  <>
                    <input type="text" placeholder="Enter OTP" className="w-full border p-2 rounded text-sm" value={loginMobile.otp} onChange={e => setLoginMobile({ ...loginMobile, otp: e.target.value.replace(/\D/g, '') })} maxLength={6} />
                    <div className="flex gap-2 mt-2">
                      <button className="flex-1 bg-green-600 text-white p-2 rounded" onClick={handleLoginVerifyOtp}>Verify & Login</button>
                      <button className="flex-1 bg-blue-500 text-white p-2 rounded" type="button" onClick={handleLoginSendOtp}>Resend OTP</button>
                    </div>
                  </>
                )}
                {loginErrors.mobile && <p className="text-red-600 text-sm mt-1">{loginErrors.mobile}</p>}
                {loginErrors.otp && <p className="text-green-600 text-sm mt-1">{loginErrors.otp}</p>}
                <button className="w-full bg-gray-300 text-black p-2 rounded mt-2" onClick={() => { setLoginOtpMode(false); setLoginOtpSent(false); setLoginMobile({ countryCode: "+91", mobile: "", otp: "" }); setLoginErrors({}); }}>Back to Email Login</button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={signupData.name}
              onChange={(e) =>
                setSignupData({ ...signupData, name: e.target.value })
              }
              className="w-full border p-2 rounded text-sm"
            />
            <div>
              <input
                type="email"
                placeholder="Email"
                value={signupData.email}
                onChange={(e) =>
                  setSignupData({ ...signupData, email: e.target.value })
                }
                className="w-full border p-2 rounded text-sm"
              />
              {signupErrors.email && (
                <p className="text-red-600 text-sm mt-1">{signupErrors.email}</p>
              )}
            </div>
            <div className="flex gap-2">
              <select className="w-24 border p-2 rounded text-sm" value={signupData.countryCode} onChange={e => setSignupData({ ...signupData, countryCode: e.target.value })}>
                <option value="+91">+91 (India)</option>
                <option value="+1">+1 (USA)</option>
                <option value="+44">+44 (UK)</option>
              </select>
              <input type="tel" placeholder="Mobile Number" className="flex-1 border p-2 rounded text-sm" value={signupData.mobile} onChange={e => setSignupData({ ...signupData, mobile: e.target.value.replace(/\D/g, '') })} maxLength={15} />
            </div>
            {!signupOtpVerified && (
              <>
                {!signupOtpSent ? (
                  <button className="w-full bg-blue-600 text-white p-2 rounded" type="button" onClick={handleSignupSendOtp}>Send OTP</button>
                ) : (
                  <div className="mt-2">
                    <input type="text" placeholder="Enter OTP" className="w-full border p-2 rounded text-sm" value={signupData.otp} onChange={e => setSignupData({ ...signupData, otp: e.target.value.replace(/\D/g, '') })} maxLength={6} />
                    <div className="flex gap-2 mt-2">
                      <button className="flex-1 bg-green-600 text-white p-2 rounded" type="button" onClick={handleSignupVerifyOtp}>Verify OTP</button>
                      <button className="flex-1 bg-blue-500 text-white p-2 rounded" type="button" onClick={handleSignupSendOtp}>Resend OTP</button>
                    </div>
                  </div>
                )}
                {signupErrors.mobile && <p className="text-red-600 text-sm mt-1">{signupErrors.mobile}</p>}
                {signupErrors.otp && <p className="text-green-600 text-sm mt-1">{signupErrors.otp}</p>}
              </>
            )}
            <input
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
              className="w-full border p-2 rounded text-sm"
            />
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={signupData.confirmPassword}
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full border p-2 rounded text-sm"
              />
              {signupErrors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {signupErrors.confirmPassword}
                </p>
              )}
            </div>
            {signupErrors.general && (
              <p className="text-red-600 text-sm">{signupErrors.general}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200 text-base sm:text-sm"
              disabled={!signupOtpVerified}
            >
              Sign Up
            </button>
          </form>
        )}

        <p className="text-center mt-4 text-sm">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setLoginErrors({});
                }}
                className="text-blue-600 underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsLogin(true);
                  setSignupErrors({});
                }}
                className="text-blue-600 underline"
              >
                Login
              </button>
            </>
          )}
        </p>
        <div className="text-center mt-2">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-sm underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}