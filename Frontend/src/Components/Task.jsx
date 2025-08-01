import React, { useState, useEffect, useRef } from 'react';
import '../Css/Task.css';
import Sidebar from './Sidebar';
import image from '../assets/image.png';
import { getAuthHeaders, handleApiError } from '../utils/auth';
import deleteIcon from '../assets/taskdelete.png';

const statuses = ['All', 'Pending', 'In-progress', 'Completed'];


const Task = () => {

  const [filterStatus, setFilterStatus] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  

  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  

  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  

  const [showAgentSelect, setShowAgentSelect] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [showAllAssignedPopup, setShowAllAssignedPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success'); 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  

  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);


  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        setUserName(user.username || "User");
        setUserRole(user.role || "Guest");


        if (user.role === 'Admin') {
          fetchTasks();
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
  }, []);


  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:3000/api/csv-data', {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (handleApiError(response, 'Failed to fetch tasks')) {
        return;
      }

      const data = await response.json();
      setTasks(data.data || []); 
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError('Failed to fetch tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
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
    }
  };


  const retryFetch = () => {
    if (userRole === 'Admin') {
      fetchTasks();
    }
  };


  const showMessage = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };


  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      showMessage('Please select valid CSV or Excel files (.csv, .xls, .xlsx) only', 'error');
      return;
    }

    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showMessage('Each file size should be less than 5MB', 'error');
      return;
    }

    try {
      setUploading(true);
      
      let response;
      
      if (files.length === 1) {
        const formData = new FormData();
        formData.append('file', files[0]);

        response = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData,
          credentials: 'include'
        });
      } else {
        const formData = new FormData();
        files.forEach((file, index) => {
          formData.append('files', file);
        });

        response = await fetch('http://localhost:3000/api/upload/multiple', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData,
          credentials: 'include'
        });
      }

      if (response.ok) {
        const result = await response.json();
        if (files.length === 1) {
          showMessage('File uploaded successfully!', 'success');
        } else {
          showMessage(`Successfully uploaded ${files.length} file(s)!`, 'success');
        }
        
        fetchTasks();
      } else {
        const errorData = await response.json();
        showMessage(`Upload failed: ${errorData.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };


  const handleSplitTask = async () => {
    const pendingTasks = tasks.filter(task => task.status === 'Pending');
    
    if (pendingTasks.length === 0) {
      setShowAllAssignedPopup(true);
      return;
    }

    if (agents.length <= 5) {
      await assignTasksToAllAgents();
    } else {
      setShowAgentSelect(true);
    }
  };


  const assignTasksToAllAgents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/assign-tasks', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          showMessage(errorData.message || `Failed to assign tasks: ${response.status}`, 'error');
        } catch (parseError) {
          showMessage(`Failed to assign tasks: ${response.status} - ${response.statusText}`, 'error');
        }
        return;
      }

      const result = await response.json();
      showMessage('Tasks assigned successfully!', 'success');
      fetchTasks();
    } catch (error) {
      console.error('Assignment error:', error);
      showMessage('Failed to assign tasks. Please try again.', 'error');
    }
  };

  const assignTasksToSelectedAgents = async (selectedAgentIds) => {
    try {
      const response = await fetch('http://localhost:3000/api/assign-tasks/selected', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ selectedAgentIds })
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          showMessage(errorData.message || `Failed to assign tasks to selected agents: ${response.status}`, 'error');
        } catch (parseError) {
          showMessage(`Failed to assign tasks to selected agents: ${response.status} - ${response.statusText}`, 'error');
        }
        return;
      }

      const result = await response.json();
      showMessage('Tasks assigned to selected agents successfully!', 'success');
      fetchTasks();
    } catch (error) {
      console.error('Assignment error:', error);
      showMessage('Failed to assign tasks. Please try again.', 'error');
    }
  };


  const handleAgentSelection = (agentId) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };


  const confirmAgentSelection = async () => {
    if (selectedAgents.length === 0) {
      showMessage('Please select at least one agent', 'error');
      return;
    }
    
    await assignTasksToSelectedAgents(selectedAgents);
    setShowAgentSelect(false);
    setSelectedAgents([]);
  };


  const cancelAgentSelection = () => {
    setShowAgentSelect(false);
    setSelectedAgents([]);
  };


  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };


  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/api/csv-data/task/${taskToDelete.Task_id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (handleApiError(response, 'Failed to delete task')) {
        return;
      }

      showMessage('Task deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
      

      fetchTasks();
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('Failed to delete task. Please try again.', 'error');
    }
  };


  const cancelDeleteTask = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAgentSelect && !event.target.closest('.agent-select-modal')) {
        setShowAgentSelect(false);
        setSelectedAgents([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAgentSelect]);


  const handleStatusClick = (status) => {
    setFilterStatus(status);
    setDropdownOpen(false);
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAllAssignedPopup && !event.target.closest('.all-assigned-modal')) {
        setShowAllAssignedPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAllAssignedPopup]);


  const filteredTasks = filterStatus === 'All' 
    ? tasks 
    : tasks.filter(task => task.status === filterStatus);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="task-container">
        <div className="task-header">
          <h2 className="task-heading">Task Management</h2>

          <div className="custom-dropdown" ref={dropdownRef}>
            <button
              className="dropdown-toggle"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {filterStatus === 'All'
                ? '📋 All Tasks'
                : filterStatus === 'Pending'
                ? '⏳ Pending'
                : filterStatus === 'In-progress'
                ? '⚙️ In-progress'
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
                      : status === 'Pending'
                      ? '⏳ Pending'
                      : status === 'In-progress'
                      ? '⚙️ In-progress'
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
            <p>Only Admins can view task details.</p>
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
                     <p>There are no tasks available at the moment.</p>
                   </div>
                 </td>
                </tr>
                             ) : (
                 filteredTasks.map((task, index) => (
                   <tr
                     key={task.id || task._id || index}
                     className={`status-${(task.status || 'pending').toLowerCase().replace(' ', '-')}`}
                   >
                     <td>{index + 1}</td>
                     <td>{task.Task_id || 'Undefined'}</td>
                     <td>{task.firstName || 'Unknown'}</td>
                     <td>{task.phone || 'N/A'}</td>
                     <td>{task.notes || 'No notes'}</td>
                     <td>{task.status || 'Pending'}</td>
                     <td>
                       <button 
                         className="delete-task-btn"
                         onClick={() => handleDeleteTask(task)}
                         title="Delete Task"
                       >
                         <img src={deleteIcon} alt="Delete" 
                         />
                       </button>
                     </td>
                   </tr>
                 ))
               )}
            </tbody>
          </table>
        )}


        {userRole === 'Admin' && !loading && !error && (
          <>
            <button className="split-task-button" onClick={handleSplitTask}>➕ Split Task</button>
            <button 
              className="upload-task-button" 
              onClick={handleUploadClick}
              disabled={uploading}
            >
              {uploading ? '📤 Importing...' : '📤 Import Task'}
            </button>
            

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.xls,.xlsx"
              multiple
              style={{ display: 'none' }}
            />
          </>
        )}


        {showAgentSelect && (
          <div className="agent-select-overlay">
            <div className="agent-select-modal">
              <div className="agent-select-header">
                <h3 className="agent-select-title">Select Agents for Split Task</h3>
                <p className="agent-select-subtitle">
                  Choose agents to assign tasks to (more than 5 agents available)
                </p>
              </div>
              
              <div className="agent-select-list">
                {agents.map((agent) => (
                  <div 
                    key={agent.user_id || agent.id} 
                    className={`agent-select-item ${selectedAgents.includes(agent.user_id || agent.id) ? 'selected' : ''}`}
                    onClick={() => handleAgentSelection(agent.user_id || agent.id)}
                  >
                    <div className="agent-select-checkbox">
                      {selectedAgents.includes(agent.user_id || agent.id) ? '☑️' : '☐'}
                    </div>
                    <div className="agent-select-info">
                      <div className="agent-select-name">{agent.username || agent.name}</div>
                      <div className="agent-select-email">{agent.email}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="agent-select-actions">
                <button 
                  className="agent-select-cancel" 
                  onClick={cancelAgentSelection}
                >
                  Cancel
                </button>
                <button 
                  className="agent-select-confirm" 
                  onClick={confirmAgentSelection}
                >
                  Confirm Selection ({selectedAgents.length} selected)
                </button>
              </div>
            </div>
          </div>
        )}


        {showAllAssignedPopup && (
          <div className="all-assigned-overlay">
            <div className="all-assigned-modal">
              <div className="all-assigned-icon">✅</div>
              <h3 className="all-assigned-title">All Tasks Assigned</h3>
              <p className="all-assigned-message">
                Great news! All tasks have been assigned to agents. There are no pending tasks at the moment.
              </p>
              <button 
                className="all-assigned-close" 
                onClick={() => setShowAllAssignedPopup(false)}
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


         {showDeleteConfirm && (
           <div className="delete-confirm-overlay">
             <div className="delete-confirm-modal">
               <div className="delete-confirm-icon">⚠️</div>
               <h3 className="delete-confirm-title">Delete Task</h3>
               <p className="delete-confirm-message">
                 Are you sure you want to delete this task? This action cannot be undone.
               </p>
               <div className="delete-confirm-actions">
                 <button 
                   className="delete-confirm-cancel" 
                   onClick={cancelDeleteTask}
                 >
                   Cancel
                 </button>
                 <button 
                   className="delete-confirm-delete" 
                   onClick={confirmDeleteTask}
                 >
                   Delete
                 </button>
               </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default Task;
