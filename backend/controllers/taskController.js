const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    let projectQuery = req.user.role === 'admin' ? { owner: req.user._id } : { members: req.user._id };
    const userProjects = await Project.find(projectQuery).select('_id');
    const projectIds = userProjects.map(p => p._id);
    const baseFilter = req.user.role === 'admin'
      ? { project: { $in: projectIds } }
      : { $or: [{ assignedTo: req.user._id }, { project: { $in: projectIds } }] };
    const [total, todo, inProgress, completed, overdue] = await Promise.all([
      Task.countDocuments(baseFilter),
      Task.countDocuments({ ...baseFilter, status: 'todo' }),
      Task.countDocuments({ ...baseFilter, status: 'in-progress' }),
      Task.countDocuments({ ...baseFilter, status: 'completed' }),
      Task.countDocuments({ ...baseFilter, dueDate: { $lt: now }, status: { $ne: 'completed' } })
    ]);
    const recentTasks = await Task.find(baseFilter)
      .populate('assignedTo', 'name').populate('project', 'name').populate('createdBy', 'name')
      .sort('-createdAt').limit(5);
    const overdueTasks = await Task.find({ ...baseFilter, dueDate: { $lt: now }, status: { $ne: 'completed' } })
      .populate('assignedTo', 'name').populate('project', 'name')
      .sort('dueDate').limit(5);
    res.json({ stats: { total, todo, inProgress, completed, overdue }, recentTasks, overdueTasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId, status, priority, assignedTo } = req.query;
    const filter = {};
    if (projectId) filter.project = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email').populate('project', 'name').populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { title, description, project, assignedTo, priority, dueDate, status } = req.body;
    const task = await Task.create({ title, description, project, assignedTo: assignedTo || null, priority, dueDate, status, createdBy: req.user._id });
    await task.populate([{ path: 'assignedTo', select: 'name email' }, { path: 'project', select: 'name' }, { path: 'createdBy', select: 'name' }]);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email').populate('project', 'name').populate('createdBy', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name email').populate('project', 'name').populate('createdBy', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
