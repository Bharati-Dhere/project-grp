// src/context/AuthContext.js
import { createContext, useContext, useState } from 'react';
import { login as apiLogin, logout as apiLogout, signup as apiSignup } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);


  // Login with backend
  const login = async (credentials) => {
    try {
      const data = await apiLogin(credentials);
      let userObj = data.user;
      // Fallback: if _id is missing but id exists, use id
      if (userObj && !userObj._id && userObj.id) {
        userObj._id = userObj.id;
      }
      if (!userObj || !userObj._id) {
        console.error('Login: user object missing _id:', userObj);
        return { success: false, message: 'User data invalid from server' };
      }
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      console.log('AuthContext: user set after login:', userObj);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };


  // Logout with backend
  const logout = async () => {
    try {
      await apiLogout();
    } catch {}
    localStorage.removeItem('user');
    setUser(null);
  };


  // Example admin check (customize as needed)
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@example.com';


  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
