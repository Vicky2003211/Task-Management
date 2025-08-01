import React, { useState, useEffect, useRef } from 'react';
import '../Css/Task.css';
import Sidebar from './Sidebar';
import image from '../assets/image.png';
import tick from '../assets/tick.png';
import { getAuthHeaders, handleApiError } from '../utils/auth';

const statuses = ['All', 'In-progress', 'Completed'];

const AgentTask = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        
        setUserName(user.username || "User");
        setUserRole(user.role || "Guest");


        if (user.role === 'Agent') {
          fetchAgentTasks();
        } else {
          setLoading(false);
        }
      } catch (error) {
        setError('Error loading user data');
        setLoading(false);
      }
    } else {
      setError('No user data found. Please login again.');
      setLoading(false);
    }
  }, []);

  const fetchAgentTasks = async () => {
    try {
      setLoading(true);
      setError('');

      const userData = localStorage.getItem('user');
      const user = JSON.parse(userData);
      const agentId = user.user_id || user.id;

      const response = await fetch(`http://localhost:3000/api/task-details/agent/${agentId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (handleApiError(response, 'Failed to fetch agent tasks')) {
        return;
      }

      const data = await response.json();
      setTasks(data.taskDetails || []); 
    } catch (err) {
      console.error("Error fetching agent tasks:", err);
      setError('Failed to fetch tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const retryFetch = () => {
    if (userRole === 'Agent') {
      fetchAgentTasks();
    }
  };

  const showMessage = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };



  const handleTickTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/csv-data/complete/${taskId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (handleApiError(response, 'Failed to complete task')) {
        return;
      }
      
      fetchAgentTasks(); 
    } catch (error) {
      console.error('Error completing task:', error);
      showMessage('Network error. Please try again.', 'error');
    }
  };

  const filteredTasks =
    filterStatus === 'All'
      ? tasks
      : tasks.filter((task) => task.status === filterStatus);

  const handleStatusClick = (status) => {
    setFilterStatus(status);
    setDropdownOpen(false);
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (showPopup && !event.target.closest('.message-popup-modal')) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="task-container">
        <div className="task-header">
          <h2 className="task-heading">My Tasks</h2>

          <div className="custom-dropdown" ref={dropdownRef}>
            <button
              className="dropdown-toggle"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {filterStatus === 'All'
                ? '📋 All Tasks'
                : filterStatus === 'In-progress'
                ? '⚙️ In Progress'
                : '✅ Completed'}
              <span className="arrow-icon"><img src={image} alt="arrow" /></span>
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                {statuses.map((status) => (
                  <div
                    key={status}
                    className={`dropdown-item ${
                      filterStatus === status ? 'active' : ''
                    }`}
                    onClick={() => handleStatusClick(status)}
                  >
                    {status === 'All'
                      ? '📋 All Tasks'
                      : status === 'In-progress'
                      ? '⚙️ In Progress'
                      : '✅ Completed'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            {userRole === 'Agent' && (
              <button onClick={retryFetch} className="retry-button">
                Retry
              </button>
            )}
          </div>
        ) : userRole !== 'Agent' ? (
          <div className="access-denied-container">
            <div className="access-denied-icon">🚫</div>
            <h3>Access Denied</h3>
            <p>Only Agents can view their assigned tasks.</p>
            <p>Your current role: <strong>{userRole}</strong></p>
          </div>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Task ID</th>
                <th>Title</th>
                <th>Mobile</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-tasks-message">
                    <div className="no-tasks-container">
                      <div className="no-tasks-icon">📋</div>
                      <h3>No Tasks Found</h3>
                      <p>You have no tasks assigned at the moment.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task, index) => (
                  <tr
                    key={task._id || task.id || index}
                    className={`status-${(task.status || 'pending').toLowerCase().replace(' ', '-')}`}
                  >
                    <td>{index + 1}</td>
                    <td>{task.Task_id || 'Undefined'}</td>
                    <td>{task.firstName || 'Unknown'}</td>
                    <td>{task.phone || 'N/A'}</td>
                    <td>{task.notes || 'No notes'}</td>
                    <td>{task.status || 'Pending'}</td>
                    <td>
                      <div className="task-actions">
                        <button 
                          className="tick-task-btn"
                          onClick={() => handleTickTask(task.Task_id)}
                          title="Mark as Complete"
                        >
                          <img src={tick} alt="tick" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

export default AgentTask;