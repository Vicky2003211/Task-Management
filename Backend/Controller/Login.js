require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../Models/User');
const jwt = require('jsonwebtoken');





// Register
const register = async (req, res) => {
  const { user_id, username, email, password, role, mobile } = req.body;

  try {
    const existingUser = await User.findOne({ 
      $or: [{ user_id }, { email }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User Already Exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      user_id, 
      username, 
      email, 
      password: hashedPassword,
      role,
      mobile
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
};

// User login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
    
    if (!JWT_SECRET) {
      return res.status(500).json({ 
        message: 'Server configuration error', 
        error: 'JWT_SECRET not configured in .env file' 
      });
    }
    
    // Include role in JWT token payload
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email,
        role: user.role,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { 
        user_id: user.user_id, 
        email: user.email, 
        username: user.username, 
        role: user.role 
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

// Get users by role
const getUsersByRole = async (req, res) => {
  const { role } = req.params;

  try {
    const users = await User.find({ role }).select('-password');
    
    if (users.length === 0) {
      return res.status(404).json({ 
        message: `No users found with role: ${role}` 
      });
    }

    res.status(200).json({
      message: `Users with role: ${role}`,
      count: users.length,
      users: users
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching users by role', 
      error: err.message 
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    res.status(200).json({
      message: 'All users retrieved successfully',
      count: users.length,
      users: users
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching all users', 
      error: err.message 
    });
  }
};

// Update user by email
const updateUser = async (req, res) => {
  const { email } = req.params;
  const updateData = req.body;

  try {
    delete updateData.password;
    
    const updatedUser = await User.findOneAndUpdate(
      { email },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error updating user', 
      error: err.message 
    });
  }
};

// Delete user by email
const deleteUser = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findOneAndDelete({ email });

    res.status(200).json({
      message: 'User deleted successfully',
      deletedUser: {
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error deleting user', 
      error: err.message 
    });
  }
};

// Update password with validation
const updatePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, username, mobile } = req.body;
    
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'Email, old password, and new password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({
        message: 'Old password is incorrect'
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updateData = {
      password: hashedNewPassword
    };

    if (username) {
      updateData.username = username;
    }
    if (mobile) {
      updateData.mobile = mobile;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      message: 'Password updated successfully',
      user: updatedUser
    });

  } catch (err) {
    res.status(500).json({
      message: 'Error updating password',
      error: err.message
    });
  }
};

module.exports = { 
  register, 
  login, 
  getUsersByRole, 
  getAllUsers, 
  updateUser, 
  deleteUser,
  updatePassword
};
