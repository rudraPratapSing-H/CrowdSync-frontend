// Login.js - Firebase Auth login form
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl mb-4 font-bold text-center">Organizer Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-4">Login</button>
        <div className="flex flex-col gap-2 mt-2">
          <button type="button" className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded hover:bg-gray-100 shadow">
            <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.22l6.86-6.86C36.36 2.34 30.55 0 24 0 14.61 0 6.27 5.74 2.44 14.09l8.06 6.27C12.36 13.36 17.73 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.54-.14-3.02-.39-4.45H24v8.41h12.45c-.54 2.91-2.18 5.38-4.64 7.04l7.18 5.59C43.73 36.36 46.1 30.89 46.1 24.5z"/><path fill="#FBBC05" d="M10.5 28.36c-.54-1.62-.85-3.34-.85-5.36s.31-3.74.85-5.36l-8.06-6.27C.86 14.61 0 19.13 0 24s.86 9.39 2.44 13.63l8.06-6.27z"/><path fill="#EA4335" d="M24 48c6.55 0 12.36-2.17 16.91-5.91l-7.18-5.59c-2.01 1.35-4.59 2.15-7.73 2.15-6.27 0-11.64-3.86-13.5-9.36l-8.06 6.27C6.27 42.26 14.61 48 24 48z"/></g></svg>
            <span className="font-semibold text-gray-700">Sign in with Google</span>
          </button>
          <button type="button" className="w-full flex items-center justify-center gap-2 bg-gray-900 py-2 rounded hover:bg-gray-800 shadow">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
            <span className="font-semibold text-white">Sign in with GitHub</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
