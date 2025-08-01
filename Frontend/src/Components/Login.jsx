import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Login.css';
import config from '../config';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  const navigate = useNavigate();
  const popupRef = useRef(null);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };


  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowSuccessPopup(false);
      }
    };

    if (showSuccessPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuccessPopup]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Validate password
    if (!formData.password.trim()) {
      setError('Please enter your password.');
      setLoading(false);
      return;
    }

    const apiUrl = `${config.API_BASE_URL}${config.LOGIN_ENDPOINT}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Backend server may not be running.');
      }

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError(`Cannot connect to server. Please check if the backend server is running on ${config.API_BASE_URL}`);
      } else if (error.message.includes('non-JSON response')) {
        setError(`Backend server is not responding properly. Please check if the server is running on ${config.API_BASE_URL}`);
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Login-page">
      <div className="Login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      {showSuccessPopup && (
        <div className="login-success-overlay">
          <div className="login-success-modal" ref={popupRef}>
            <div className="login-success-icon">🎉</div>
            <h3 className="login-success-title">Login Successful!</h3>
            <p className="login-success-message">
              Welcome Back! Successfully Logged In.
            </p>
            <div className="login-success-progress">
              <div className="login-success-progress-bar"></div>
            </div>
            <p className="login-success-redirect">
              Redirecting
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
