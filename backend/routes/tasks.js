const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const { getDashboard, getTasks, createTask, getTask, updateTask, deleteTask } = require('../controllers/taskController');

router.get('/dashboard', protect, getDashboard);
router.get('/', protect, getTasks);
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('project').notEmpty().withMessage('Project ID is required')
], createTask);
router.get('/:id', protect, getTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
