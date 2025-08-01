/**
 * Application Configuration
 * Centralized configuration for API endpoints, development settings, and environment variables
 * Update these values to match your backend server configuration
 */

// Configuration for API endpoints
const config = {
  /**
   * Backend API Base URL
   * Determines the base URL for all API requests
   * Uses production URL in production environment, localhost in development
   * 
   * IMPORTANT: Make sure your backend server is running on this port!
   * If your backend uses a different port, update this URL accordingly.
   */
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-api.com' 
    : 'http://localhost:3000', // Change this if your backend uses a different port
  
  /**
   * API Endpoints
   * Define all backend API routes used by the application
   * Update these to match your backend server routes
   */
  LOGIN_ENDPOINT: '/api/login', // User authentication endpoint
  REGISTER_ENDPOINT: '/api/register', // User registration endpoint
  TASKS_ENDPOINT: '/api/tasks', // Task management endpoint
  AGENTS_ENDPOINT: '/api/agents', // Agent management endpoint
  
  /**
   * Development Fallback Credentials
   * Used for testing and development purposes
   * Should be replaced with actual credentials in production
   */
  DEV_CREDENTIALS: {
    email: 'test@example.com',
    password: '123456'
  },
  
  /**
   * Debug Mode
   * Enables additional logging and debugging features
   * Set to false in production for better performance
   */
  DEBUG: true,

  USE_MOCK_DATA: false
};

export default config; 