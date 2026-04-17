const mongoose = require('mongoose');

/**
 * Task model.
 *   { _id, title, createdAt }
 * This is the minimal shape needed to support "add a task" and "display all tasks."
 * Validation lives here rather than in the route handler so the rules are enforced
 * regardless of how a Task gets created.
 */
const taskSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Title is required'],
		// Normalize whitespace by trimming leading/trailing spaces.
		trim: true,
		// Defensive cap on input size.
		maxLength: [200, 'Title must be 200 characters or fewer']
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Task', taskSchema);