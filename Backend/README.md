# Agent Management System API

A comprehensive REST API for managing agent tasks, user authentication, and CSV data processing built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (admin, agent, manager)
  - Secure password hashing with bcrypt

- **Task Management**
  - CSV file upload and processing
  - Task assignment to agents
  - Task status tracking (Pending, In-progress, Completed)
  - Task completion and deletion

- **Agent Management**
  - Automatic task distribution using round-robin method
  - Manual task assignment to selected agents
  - Agent performance tracking

- **File Upload System**
  - Support for CSV, Excel, and Word documents
  - Automatic CSV parsing and data storage
  - File validation and error handling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   ```

4. **Start the server**
   ```bash
   npm start
   ```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "user_id": "AG001",
  "username": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "agent",
  "mobile": "+1234567890"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Protected Endpoints

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

#### User Management
- `GET /api/users` - Get all users
- `GET /api/users/role/:role` - Get users by role
- `PUT /api/users/:email` - Update user
- `DELETE /api/users/:email` - Delete user
- `PUT /api/update-password` - Update password

#### File Upload
- `POST /api/upload` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files

#### Task Management
- `GET /api/csv-data` - Get all tasks
- `GET /api/csv-data/task/:taskId` - Get task by ID
- `PATCH /api/csv-data/complete/:taskId` - Complete task
- `DELETE /api/csv-data/task/:taskId` - Delete task

#### Task Assignment
- `POST /api/assign-tasks` - Auto-assign tasks to all agents
- `POST /api/assign-tasks/selected` - Assign tasks to selected agents
- `GET /api/task-details/agent/:agentId` - Get agent's tasks

## 🗂️ Project Structure

```
Backend/
├── App.js                 # Main application entry point
├── Routes/
│   └── Route.js          # API route definitions
├── Controller/
│   ├── Login.js          # User authentication & management
│   ├── Task.js           # Task CRUD operations
│   ├── TaskAssignment.js # Task assignment logic
│   └── Uploadcontroller.js # File upload handling
├── Models/
│   ├── User.js           # User schema
│   └── CsvData.js        # Task data schema
├── Middleware/
│   └── Auth.js           # JWT authentication middleware
├── Uploads/              # File upload directory
└── package.json
```

## 🔧 Configuration

### Database Connection
The application connects to MongoDB using the connection string in `App.js`. Update the `MONGO_URI` variable with your MongoDB connection string.

### CORS Configuration
CORS is configured to allow requests from common development ports:
- `http://localhost:3000` (React)
- `http://localhost:3001` (Alternative React)
- `http://localhost:5173` (Vite)
- `http://localhost:4173` (Vite Preview)

### File Upload Limits
- Maximum file size: 5MB
- Supported formats: CSV, Excel (.xls, .xlsx), Word (.docx)
- Upload directory: `./uploads/`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds of 10
- **Input Validation**: Comprehensive request validation
- **File Type Validation**: Strict file type checking
- **Error Handling**: Proper error responses without sensitive data exposure

## 📊 Data Models

### User Schema
```javascript
{
  user_id: String (unique),
  username: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'agent', 'manager']),
  mobile: String,
  timestamps: true
}
```

### CSV Data Schema
```javascript
{
  Task_id: String (unique),
  firstName: String,
  phone: String,
  notes: String,
  status: String (enum: ['Pending', 'In-progress', 'Completed']),
  assignedAgent: String,
  timestamps: true
}
```

## 🚀 Usage Examples

### Frontend Integration

#### Login and Get Token
```javascript
const login = async (email, password) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};
```

#### Make Authenticated Request
```javascript
const getTasks = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/csv-data', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

#### Upload CSV File
```javascript
const uploadFile = async (file) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return response.json();
};
```

## 🐛 Error Handling

The API returns consistent error responses:

```javascript
{
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add proper comments and documentation
5. Test your changes
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository. 