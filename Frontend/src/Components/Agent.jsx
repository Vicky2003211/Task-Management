import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Agent.css';
import Sidebar from './Sidebar';
import Edit from '../assets/edit.png'
import Delete from '../assets/delete.png'
import Add from '../assets/add.png'
import Create from './Create'
import { getAuthHeaders, handleApiError } from '../utils/auth';


const Agent = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const usertoken = localStorage.getItem('token');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        setUserName(user.username || "User");
        setUserRole(user.role || "Guest");
        if (user.role === 'Agent') {
          navigate('/agent-tasks');
          return;
        }
        if (user.role === 'Admin') {
          fetchAgents();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setError('Error loading user data');
        setLoading(false);
      }
    } else {
      setError('No user data found. Please login again.');
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPopup && !event.target.closest('.message-popup-modal')) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopup]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:3000/api/users/role/Agent', {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (handleApiError(response, 'Failed to fetch agents')) {
        return;
      }

      const data = await response.json();
      setAgents(data.users || []);
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError('Failed to fetch agents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };


  const retryFetch = () => {
    if (userRole === 'Admin') {
      fetchAgents();
    }
  };

  const showMessage = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };


  const handleEditAgent = (agentId) => {
    const agent = agents.find(a => a.user_id === agentId);
    if (agent) {
      setSelectedAgent(agent);
      setEditMode(true);
      setShowCreatePopup(true);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    const agent = agents.find(a => a.user_id === agentId);
    if (agent) {
      setAgentToDelete(agent);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    if (!agentToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/api/users/${encodeURIComponent(agentToDelete.email)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (handleApiError(response, 'Failed to delete agent')) {
        return;
      }

      showMessage('Agent deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setAgentToDelete(null);
      
      fetchAgents();
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('Failed to delete agent. Please try again.', 'error');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAgentToDelete(null);
  };


  const handleAddAgent = () => {
    setEditMode(false);
    setSelectedAgent(null);
    setShowCreatePopup(true);
  };

 
  const handleCloseCreatePopup = () => {
    setShowCreatePopup(false);
    setEditMode(false);
    setSelectedAgent(null);
    fetchAgents();
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="agent-list-container">
        <div className="agent-header">
          <h2 className="agent-heading">Agent Details</h2>
          {userName && (
            <div className="welcome-message">
              Welcome back, <span className="user-name">{userName}</span>! 👋
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading agents...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            {userRole === 'Admin' && (
              <button onClick={retryFetch} className="retry-button">
                Retry
              </button>
            )}
          </div>
        ) : userRole !== 'Admin' ? (
          <div className="access-denied-container">
            <div className="access-denied-icon">🚫</div>
            <h3>Access Denied</h3>
            <p>Only Admins can view agent details.</p>
            <p>Your current role: <strong>{userRole}</strong></p>
          </div>
        ) : (
          <div className="agent-card-wrapper">
            {agents.length === 0 ? (
              <div className="no-agents-container">
                <div className="no-agents-icon">📋</div>
                <h3>No Agents Found</h3>
                <p>There are no agents available at the moment.</p>
              </div>
            ) : (
              agents.map((agent, index) => (
                <div className="agent-card" key={agent.user_id || index}>
                  <div className="agent-avatar">👤</div>
                  <div className="agent-details">
                    <h3>{agent.name || agent.username || 'Unknown'}</h3>
                    <p><strong>ID:</strong> {agent.user_id || agent.id || 'N/A'}</p>
                    <p><strong>Email:</strong> {agent.email || 'N/A'}</p>
                    <p><strong>Mobile:</strong> {agent.mobile || agent.phone || 'N/A'}</p>
                    <p><strong>Role:</strong> {agent.role || 'Agent'}</p>
                  </div>
                  <div className="agent-actions">
                    <button 
                      className="action-icon edit-icon" 
                      onClick={() => handleEditAgent(agent.user_id || agent.id)}
                      title="Edit Agent"
                    >
                      <img src={Edit} alt="Edit" />
                    </button>
                    <button 
                      className="action-icon delete-icon" 
                      onClick={() => handleDeleteAgent(agent.user_id || agent.id)}
                      title="Delete Agent"
                    >
                      <img src={Delete} alt="Delete" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

          {userRole === 'Admin' && !loading && !error && (
          <button 
            className="floating-add-button" 
            onClick={handleAddAgent}
            title="Add New Agent"
          >
            <img src={Add} alt="Add" />
          </button>
        )}

  
        {showCreatePopup && (
          <Create 
            onClose={handleCloseCreatePopup} 
            editMode={editMode}
            agentData={selectedAgent}
          />
        )}

        {showDeleteConfirm && agentToDelete && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <div className="delete-confirm-icon">🗑️</div>
              <h3 className="delete-confirm-title">Delete User</h3>
              <p className="delete-confirm-message">
                Are you sure you want to delete <strong>{agentToDelete.username || agentToDelete.name}</strong>?
              </p>
              <p className="delete-confirm-warning">This action cannot be undone.</p>
              <div className="delete-confirm-actions">
                <button 
                  className="delete-confirm-cancel" 
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button 
                  className="delete-confirm-delete" 
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
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

export default Agent;
