const express = require('express');
const router = express.Router();

// 👇 FIX 1: Yahan 'deleteTask' ko import mein add kar liya
const { createTask, getTasks, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTaskStatus);

// 👇 FIX 2: Delete karne ka API route add kar diya
router.delete('/:id', deleteTask);

module.exports = router;