const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Ek secret key ka backup, agar .env file mein JWT_SECRET na mile toh yeh use ho jayega
const JWT_SECRET = process.env.JWT_SECRET || 'ethara_super_secret_key_2026';

// 1. Register User (Signup)
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check karein agar user pehle se exist karta hai
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Ye email pehle se registered hai' });
    }

    // Password ko secure (hash) karna
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Naya user create karna
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Member'
    });

    await user.save();

    // 👇 FIX: Yahan Token banana miss ho gaya tha! Ab register hote hi token banega.
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '1d' } 
    );

    // FIX: Token aur user dono return kar rahe hain
    res.status(201).json({ 
      message: 'User successfully register ho gaya!',
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // User find karna
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Email ya Password' });
    }

    // Password match karna
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Email ya Password' });
    }

    // JWT Token generate karna (with fallback secret)
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '1d' } 
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};