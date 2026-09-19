const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/tasks
// Supports query params: ?search=&status=&priority=&sortBy=dueDate|priority|createdAt&order=asc|desc
router.get('/', protect, async (req, res) => {
  try {
    const { search, status, priority, sortBy, order } = req.query;

    const query = { user: req.user.id };

    // Status filter
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (status && validStatuses.includes(status)) {
      query.status = status;
    }

    // Priority filter
    const validPriorities = ['low', 'medium', 'high'];
    if (priority && validPriorities.includes(priority)) {
      query.priority = priority;
    }

    // Search by title or description (case-insensitive)
    if (search && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim().slice(0, 100), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Sort
    const validSortFields = ['createdAt', 'dueDate', 'priority'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    // Priority needs custom sort order (high > medium > low)
    let sortObj = {};
    if (sortField === 'priority') {
      // Use aggregation for custom priority sort
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const tasks = await Task.find(query).lean();
      tasks.sort((a, b) => {
        const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
        return sortOrder === 1 ? diff : -diff;
      });
      return res.json(tasks);
    }

    sortObj[sortField] = sortOrder;
    const tasks = await Task.find(query).sort(sortObj);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tasks
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({ message: 'Title must be 200 characters or fewer' });
    }

    if (description && description.length > 1000) {
      return res.status(400).json({ message: 'Description must be 1000 characters or fewer' });
    }

    const validStatuses = ['pending', 'in-progress', 'completed'];
    const validPriorities = ['low', 'medium', 'high'];

    const task = await Task.create({
      user: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: validStatuses.includes(status) ? status : 'pending',
      priority: validPriorities.includes(priority) ? priority : 'medium',
      dueDate: dueDate || undefined,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/tasks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, status, priority, dueDate } = req.body;

    // Validate fields if provided
    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ message: 'Title cannot be empty' });
      if (title.trim().length > 200) return res.status(400).json({ message: 'Title must be 200 characters or fewer' });
    }

    if (description !== undefined && description.length > 1000) {
      return res.status(400).json({ message: 'Description must be 1000 characters or fewer' });
    }

    const validStatuses = ['pending', 'in-progress', 'completed'];
    const validPriorities = ['low', 'medium', 'high'];

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined && validStatuses.includes(status)) updateData.status = status;
    if (priority !== undefined && validPriorities.includes(priority)) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate || null;

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
