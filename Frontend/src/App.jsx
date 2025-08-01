import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Login from './Components/Login'
import Agent from './Components/Agent'
import Task from './Components/Task'
import AgentTask from './Components/AgentTask'
import EditProfile from './Components/EditProfile'
import ProtectedRoute from './Components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Agent />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Task />
          </ProtectedRoute>
        } />
        <Route path="/agent-tasks" element={
          <ProtectedRoute>
            <AgentTask />
          </ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
