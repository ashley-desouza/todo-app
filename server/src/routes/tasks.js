/**
 * Task-related routes.
 * Routes stay focused on HTTP concerns (status codes, request parsing, socket emission)
 *
 * GET /api/tasks - Get all tasks (newest first)
 * POST /api/tasks - Add a new task. Broadcast to all clients via Socket.io.
 */

const { Router } = require('express');
const taskService = require('./../services/taskService');

const router = Router();

router.get('/', async (req, res, next) => {
	try {
		// Get all tasks, sorted by creation date (newest first)
		const tasks = await taskService.getAllTasks();
		res.json(tasks);
	} catch (err) {
		next(err);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { title } = req.body;

		const task = await taskService.createTask({ title });

		// Broadcast to every connected client so their task list updates in real time.
		req.app.get('io').emit('task:created', task);

		res.status(201).json(task);
	} catch (err) {
		if (err.name === 'ValidationError') {
			return res.status(400).json({ error: err.message });
		}

		next(err);
	}
});

module.exports = router;
