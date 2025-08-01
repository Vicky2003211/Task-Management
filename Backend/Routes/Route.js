const express = require('express');
const router = express.Router();

// Import controllers
const { 
  register, 
  login, 
  getUsersByRole, 
  getAllUsers, 
  updateUser, 
  deleteUser, 
  updatePassword 
} = require('../Controller/Login');

const { 
  upload, 
  uploadMultiple 
} = require('../Controller/Uploadcontroller');

const {
  getAllCsvData,
  getCsvDataByTaskId,
  completeTask,
  deleteTask
} = require('../Controller/Task');

const {
  assignTasksToAgents,
  assignTasksToSelectedAgents,
  getTaskDetailsByAgent
} = require('../Controller/TaskAssignment');

const verifyToken = require('../Middleware/Auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/users/role/:role', verifyToken, getUsersByRole);
router.get('/users', verifyToken, getAllUsers);
router.put('/users/:email', verifyToken, updateUser);
router.delete('/users/:email', verifyToken, deleteUser);
router.put('/update-password', verifyToken, updatePassword);

// File upload routes
router.post('/upload', verifyToken, upload);
router.post('/upload/multiple', verifyToken, uploadMultiple);

// Task management routes
router.get('/csv-data', verifyToken, getAllCsvData);
router.get('/csv-data/task/:taskId', verifyToken, getCsvDataByTaskId);
router.patch('/csv-data/complete/:taskId', verifyToken, completeTask);
router.delete('/csv-data/task/:taskId', verifyToken, deleteTask);

// Task assignment routes
router.post('/assign-tasks', verifyToken,assignTasksToAgents);
router.post('/assign-tasks/selected', verifyToken, assignTasksToSelectedAgents);
router.get('/task-details/agent/:agentId', verifyToken, getTaskDetailsByAgent);

module.exports = router; 