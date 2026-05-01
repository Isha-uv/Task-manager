// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Ye API banegi: POST /api/auth/register
router.post('/register', registerUser);

// Ye API banegi: POST /api/auth/login
router.post('/login', loginUser);

module.exports = router;