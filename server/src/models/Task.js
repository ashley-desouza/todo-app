const mongoose = require('mongoose');

/**
 * Task model: { _id, title, createdAt }
 * 
 * Note: The schema trims whitespace from the title, so the route handler does not need to do it.
 */
const taskSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Title is required'],
		trim: true,
		maxLength: [200, 'Title must be 200 characters or fewer'],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Task', taskSchema);
