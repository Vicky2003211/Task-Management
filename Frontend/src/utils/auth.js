/**
 * Authentication Utility Functions
 * Provides centralized authentication and authorization functionality
 */

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};


export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};


export const redirectToLogin = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};


export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};


export const handleApiError = (response, errorMessage = 'Request failed') => {
  if (response.status === 401) {
    redirectToLogin();
    return true; 
  }
  
  if (!response.ok) {
    throw new Error(`${errorMessage}: ${response.status}`);
  }
  
  return false; 
}; 