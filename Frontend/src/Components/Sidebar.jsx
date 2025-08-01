// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Css/Sidebar.css';
import { logout } from '../utils/auth';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [userName, setUserName] = useState('User Name');
  const [userRole, setUserRole] = useState('');


  useEffect(() => {

    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.username || "User");
        setUserRole(user.role || "");
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserName('User Name');
        setUserRole('');
      }
    }
  }, []);


  const handleNavigation = (path) => {
    navigate(path);
  };


  const handleTaskNavigation = () => {

    if (userRole === 'Agent') {
      navigate('/agent-tasks');
    } else {
      navigate('/tasks');
    }
  };


  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  return (
    <div className="sidebar-container">

      <div className="sidebar-profile">
        <span role="img" aria-label="User" className="sidebar-profile-icon">👤</span>
        <h3 className="sidebar-profile-name">{userName}</h3>
      </div>


      <nav className="sidebar-nav">

        {userRole !== 'Agent' && (
          <button 
            className={`sidebar-nav-button ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigation('/dashboard')}
          >
            📄 Dashboard
          </button>
        )}
        

        <button 
          className={`sidebar-nav-button ${(location.pathname === '/tasks' || location.pathname === '/agent-tasks') ? 'active' : ''}`}
          onClick={handleTaskNavigation}
        >
          📁 {userRole === 'Agent' ? 'My Tasks' : 'Tasks'}
        </button>
        
        <button 
          className={`sidebar-nav-button ${location.pathname === '/edit-profile' ? 'active' : ''}`}
          onClick={() => handleNavigation('/edit-profile')}
        >
          👤 Edit Profile
        </button>
      </nav>

        
      <button className="sidebar-logout-button" onClick={handleLogout}>
        🚪 Logout
      </button>
    </div>
  );
};

export default Sidebar;
