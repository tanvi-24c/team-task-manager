const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  getProjects, createProject, getProject,
  updateProject, deleteProject, addMember, removeMember
} = require('../controllers/projectController');

router.get('/', protect, getProjects);
router.post('/', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Project name is required')
], createProject);
router.get('/:id', protect, getProject);
router.put('/:id', protect, authorize('admin'), updateProject);
router.delete('/:id', protect, authorize('admin'), deleteProject);
router.post('/:id/members', protect, authorize('admin'), addMember);
router.delete('/:id/members/:userId', protect, authorize('admin'), removeMember);

module.exports = router;
