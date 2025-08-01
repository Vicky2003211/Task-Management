# MERN Stack Admin-Agent Management System

## Objective

This is a basic MERN stack application built to:

* Authenticate Admin and Agent users.
* Allow Admin to add, edit, and manage agents
* Upload Single and Multiple CSV files and distribute the entries evenly among agents

---

##  Features

### 1. Admin and Agent Login

* Secure login form with:

  * **Email**
  * **Password**
* Backend authentication using **JWT (JSON Web Token)**
* On successful login:

  * Redirects to respective Dashboards (Admin or Agent)
* On failure:

  * Displays an appropriate error message
* Authenticated routes are protected using JWT middleware

---

### 2. Agent Management

* Admin can add, edit, and delete agent profiles with the following details:

  * **Name**
  * **Email**
  * **Mobile Number** (with country code)
  * **Password**
* Stored securely in MongoDB

---

### 3. CSV Upload & List Distribution

* Upload CSV/Excel as single or multiple files with the following fields:

  * `FirstName` (Text)
  * `Phone` (Number)
  * `Notes` (Text)
* Supports file types:

  * `.csv`
  * `.xlsx`
  * `.xls`
* Validates file type and format
* Splits items equally among **5 agents using the Split Task button**

  * If not divisible by 5, remaining items are distributed one-by-one sequentially
  * If agents are more than 5, the admin selects any 5 agents before distribution
* Saves distributed lists in MongoDB
* Displays assigned lists per agent on the frontend

---

### 4. Dashboards & UI Features

#### 🔷 Admin Sidebar

* Shows:

  * **Dashboard**
  * **Tasks**
  * **Edit Profile**
  * **Logout** button

#### 🔷 Agent Sidebar

* Shows:

  * **My Tasks**
  * **Edit Profile**
  * **Logout** button

#### 🔷 Agent Dashboard

* Displays assigned tasks with:

  * **Task ID**
  * **Title**
  * **Mobile Number**
  * **Notes**
  * **Status** (`In Progress`, `Completed`)
  * **Complete** button

#### 🔷 Admin Task Dashboard

* Displays all tasks with:

  * **Task ID**
  * **Title**
  * **Mobile Number**
  * **Notes**
  * **Status** (`Pending`, `In Progress`, `Completed`)
  * **Delete** button

#### 🔷 Edit Profile 

* Agents and Admins can update their profile details and change their password

---

## 🛠️ Tech Stack

* **Frontend**: React.js
* **Backend**: Node.js + Express.js
* **Database**: MongoDB + Mongoose
* **Authentication**: JWT (JSON Web Token)
* **File Parsing**: `multer`, `csv-parser`, `xlsx`

---




## Setup Instructions

### Prerequisites

* Node.js
* MongoDB 

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/mern-admin-agent-app.git
cd mern-admin-agent-app
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/agent-app
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

Run the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

---

## ✅ Final Notes

* Ensure exactly 5 agents are selected during task distribution
* Validate file structure before uploading
* Agents and Admins can manage their profile securely via Edit Profile
* There is no registration page so the developers register user-Admin using any testing environment like Postman,etc... and the admin need to create the Agents

 
##Important
* Here Sample Admin will be
 ```bash
{
 "email":"vel@example.com",
 "password":"111111"
 }

```
## Demo Video Link - https://drive.google.com/file/d/1RfUnA3M6kbWWfKKNwhMqSR-R3Qmvg0Dp/view?usp=sharing



