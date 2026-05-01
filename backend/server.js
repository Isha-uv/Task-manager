require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Exact file names import kar rahe hain ('s' ke sath)
const authRoute = require('./routes/authRoutes');
const projectRoute = require('./routes/projectRoutes');
const taskRoute = require('./routes/taskRoutes');

const app = express();

// 2. Middlewares
app.use(cors()); 
app.use(express.json()); 

// 3. API Routes setup
app.use('/api/auth', authRoute);
app.use('/api/projects', projectRoute);
app.use('/api/tasks', taskRoute);
app.use('/api/projects', require('./routes/projectRoutes'));

// 4. MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ethara';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Connect ho gaya!'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

// 5. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});