import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ClerkProvider } from '@clerk/clerk-react';
import { LanguageProvider } from './context/LanguageContext';
import { ReviewProvider } from './context/ReviewContext';
import { AuthProvider } from './context/AuthContext';

const clerkFrontendApi = "pk_test_dmFzdC1zdGluZ3JheS03Ny5jbGVyay5hY2NvdW50cy5kZXYk"; // TODO: Replace with your Clerk key

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <ClerkProvider publishableKey={clerkFrontendApi}>
      <AuthProvider>
        <LanguageProvider>
          <ReviewProvider>
            <App />
          </ReviewProvider>
        </LanguageProvider>
      </AuthProvider>
    </ClerkProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();