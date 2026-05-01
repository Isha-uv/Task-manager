// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { createProject, getProjects, addMember } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Saare routes par Token wali security lagadi
router.use(protect);

// APIs
router.post('/', createProject);               // POST /api/projects
router.get('/', getProjects);                  // GET /api/projects
router.put('/:id/members', addMember);         // PUT /api/projects/:id/members

module.exports = router;