import React, { useState, useRef, useEffect } from 'react';
import '../Css/Create.css';
import { getAuthHeaders, handleApiError } from '../utils/auth';

const Create = ({ onClose, editMode = false, agentData = null }) => {
  // Form data state
  const [formData, setFormData] = useState({
    user_id: '',
    username: '',
    email: '',
    mobile: '',
    role: 'Agent',
    password: ''
  });
  
  // Popup message states
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');

  const modalRef = useRef();

  useEffect(() => {
    if (editMode && agentData) {
      setFormData({
        user_id: agentData.user_id || agentData.id || '',
        username: agentData.username || '',
        email: agentData.email || '',
        mobile: agentData.mobile || agentData.phone || '',
        role: agentData.role || 'Agent',
        password: ''
      });
    }
  }, [editMode, agentData]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
      if (showPopup && !event.target.closest('.message-popup-modal')) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, showPopup]);


  const showMessage = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate mobile number format (+91XXXXXXXXXX)
    const mobileRegex = /^\+91[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      showMessage('Please enter a valid mobile number in format: +91XXXXXXXXXX', 'error');
      return;
    }
    
    try {
      if (editMode) {
        // Update existing user using email - include all predefined data
        const updateData = {
          username: formData.username,
          mobile: formData.mobile,
          role: formData.role,
          email: formData.email, // Include email from predefined data
          user_id: formData.user_id // Include user_id from predefined data
        };
        
        const response = await fetch(`http://localhost:3000/api/users/${encodeURIComponent(formData.email)}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(updateData)
        });

        if (handleApiError(response, 'Failed to update user')) {
          return;
        }

        const result = await response.json();
        showMessage('User updated successfully!', 'success');
        
        // Delay the close and reload to show the success message
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000); // Show popup for 2 seconds before closing
      } else {
        // Create new user
        const createData = {
          user_id: formData.user_id,
          username: formData.username,
          email: formData.email,
          mobile: formData.mobile,
          role: formData.role,
          password: formData.password
        };
        
        const response = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(createData)
        });

        if (!response.ok) {
          try {
            const errorData = await response.json();
            showMessage(errorData.message || `Failed to create user: ${response.status}`, 'error');
          } catch (parseError) {
            showMessage(`Failed to create user: ${response.status} - ${response.statusText}`, 'error');
          }
          return;
        }

        const result = await response.json();
        showMessage('User created successfully!', 'success');
        
        // Delay the close and reload to show the success message
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000); // Show popup for 2 seconds before closing
      }
    } catch (error) {
      console.error('Network error:', error);
      showMessage('Network error. Please try again.', 'error');
    }
  };

  return (
    <div className="create-container">
      <div className="create-form-wrapper" ref={modalRef}>
        <h2 className="create-form-title">
          {editMode ? 'Edit User' : 'Create New User'}
        </h2>
        <form onSubmit={handleSubmit} className="create-form">
          {editMode ? (
            // Edit mode - show only username, mobile, and role with pre-filled email
            <>
              {/* Pre-filled email (read-only) */}
              <div className="create-form-group">
                <label htmlFor="email" className="create-form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="create-form-input"
                  style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                />
              </div>

              {/* Editable username */}
              <div className="create-form-group">
                <label htmlFor="username" className="create-form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="create-form-input"
                  autoComplete="new-password"
                  autoFill="off"
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder="Enter Username"
                />
              </div>

              {/* Editable mobile */}
              <div className="create-form-group">
                <label htmlFor="mobile" className="create-form-label">Mobile</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  className="create-form-input"
                  autoComplete="new-password"
                  autoFill="off"
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder="Enter Mobile Number (+91XXXXXXXXXX)"
                />
              </div>

              {/* Editable role */}
              <div className="create-form-group">
                <label htmlFor="role" className="create-form-label">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="create-form-select"
                >
                  <option value="Agent">Agent</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </>
          ) : (
            // Create mode - show all fields
            <>
              {/* Form Fields */}
              {['user_id', 'username', 'email', 'mobile', 'password'].map((field, idx) => (
                <div className="create-form-group" key={idx}>
                  <label htmlFor={field} className="create-form-label">
                    {field.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'}
                    id={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    required
                    className="create-form-input"
                    autoComplete="new-password"
                    autoFill="off"
                    data-lpignore="true"
                    data-form-type="other"
                    placeholder={
                      field === 'user_id' ? 'Enter User ID' :
                      field === 'username' ? 'Enter Username' :
                      field === 'email' ? 'Enter Email Address' :
                      field === 'mobile' ? 'Enter Mobile Number (+91XXXXXXXXXX)' :
                      field === 'password' ? 'Enter Password' :
                      `Enter ${field}`
                    }
                  />
                </div>
              ))}

              <div className="create-form-group">
                <label htmlFor="role" className="create-form-label">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="create-form-select"
                >
                  <option value="Agent">Agent</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <div className="create-form-actions">
            <button type="submit" className="create-submit-btn">
              {editMode ? 'Update User' : 'Create User'}
            </button>
            <button type="button" className="create-cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>

      {/* Message Popup */}
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
  );
};

export default Create;
