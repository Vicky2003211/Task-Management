import React, { useState, useEffect } from 'react';
import '../Css/EditProfile.css';
import Sidebar from './Sidebar';
import { getAuthHeaders, handleApiError } from '../utils/auth';

const EditProfile = () => {

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    oldPassword: '',
    password: '',
    confirmPassword: ''
  });
  
 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');


  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setUserRole(userObj.role || '');
        
        setFormData({
          username: userObj.username || '',
          email: userObj.email || '',
          mobile: userObj.mobile || userObj.phone || '',
          oldPassword: '',
          password: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        setError('Error loading user data');
      }
    } else {
      setError('No user data found. Please login again.');
    }
    setLoading(false);
  }, []);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPopup && !event.target.closest('.message-popup-modal')) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopup]);

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  const handleEditClick = () => {
    setIsEditing(true);
    setUpdateSuccess(false);
  };

  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      mobile: user.mobile || user.phone || '',
      oldPassword: '',
      password: '',
      confirmPassword: ''
    });
    setUpdateSuccess(false);
  };

  
  const showMessage = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (formData.password && !formData.oldPassword) {
      showMessage('Please enter your old password', 'error');
      return;
    }

    
    if (formData.password && formData.password.length < 6) {
      showMessage('New password must be at least 6 characters long', 'error');
      return;
    }

    
    if (formData.password && formData.password !== formData.confirmPassword) {
      showMessage('New password and confirm password do not match', 'error');
      return;
    }


    if (formData.password && formData.password === formData.oldPassword) {
      showMessage('New password must be different from old password', 'error');
      return;
    }

    
    const mobileRegex = /^\+91[0-9]{10}$/;
    if (formData.mobile && !mobileRegex.test(formData.mobile)) {
      showMessage('Please enter a valid mobile number in format: +91XXXXXXXXXX', 'error');
      return;
    }

    try {
      const updateData = {
        email: user.email, 
        username: formData.username,
        mobile: formData.mobile,
        oldPassword: formData.oldPassword,
        newPassword: formData.password
      };

      const response = await fetch('http://localhost:3000/api/update-password', {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        // Try to get the error message from the response
        try {
          const errorData = await response.json();
          console.log('EditProfile - Error response data:', errorData);
          showMessage(errorData.message || `Update failed: ${response.status}`, 'error');
        } catch (parseError) {
          console.log('EditProfile - Could not parse error response:', parseError);
          showMessage(`Update failed: ${response.status} - ${response.statusText}`, 'error');
        }
        return;
      }

      const result = await response.json();
      console.log('EditProfile - Response data:', result);
      
      
      const updatedUser = { ...user, username: formData.username, mobile: formData.mobile };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      showMessage('Profile updated successfully!', 'success');
      setIsEditing(false);
      setUpdateSuccess(true);
      
      
      setFormData(prev => ({
        ...prev,
        oldPassword: '',
        password: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Update profile error:', error);
      showMessage('Failed to update profile. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div className="edit-profile-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div className="edit-profile-container">
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="edit-profile-container">
        <div className="edit-profile-header">
          <h2 className="edit-profile-heading">Edit Profile</h2>
        </div>

        <div className="edit-profile-card">
          <div className="profile-info">
            <div className="profile-avatar">👤</div>
            <div className="profile-details">
              <h3>{user?.username || 'User'}</h3>
              <p><strong>Role:</strong> {user?.role || 'Agent'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            </div>
          </div>

          {!isEditing ? (
            <div className="profile-actions">
              <button 
                className="edit-profile-btn"
                onClick={handleEditClick}
              >
                ✏️ Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="edit-profile-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter Username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="+91XXXXXXXXXX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="oldPassword">Current Password</label>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter Current Password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter New Password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Confirm New Password"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  💾 Update Profile
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={handleCancelEdit}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        
        {showSuccessPopup && (
          <div className="success-popup-overlay">
            <div className="success-popup-modal">
              <div className="success-popup-icon">✅</div>
              <h3 className="success-popup-title">Profile Updated Successfully!</h3>
              <p className="success-popup-message">
                Your profile has been updated successfully. Your changes are now saved.
              </p>
              <button 
                className="success-popup-close" 
                onClick={() => setShowSuccessPopup(false)}
              >
                Got it
              </button>
            </div>
          </div>
        )}


        {showPopup && (
          <div className="message-popup-overlay">
            <div className="message-popup-modal">
              <div className={`message-popup-icon ${popupType === 'success' ? 'success' : 'error'}`}>
                {popupType === 'success' ? '✅' : '❌'}
              </div>
              <h3 className={`message-popup-title ${popupType === 'success' ? 'success' : 'error'}`}>
                {popupType === 'success' ? 'Success!' : 'Error!'}
              </h3>
              <p className="message-popup-message">
                {popupMessage}
              </p>
              <button 
                className={`message-popup-close ${popupType === 'success' ? 'success' : 'error'}`}
                onClick={() => setShowPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile; 