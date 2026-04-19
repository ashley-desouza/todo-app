const mongoose = require('mongoose');

/**
 * MongoDB connection helper.
 * Exit the process on failure.
 * A running server without a DB would accept requests and fail on every query.
 * Exiting immediately makes the problem obvious and prevents a broken server from running.
 */
async function connectDB(uri) {
	try {
		await mongoose.connect(uri);
		console.log('MongoDB connected successfully');
	} catch (err) {
		console.error('Error connecting to MongoDB:', err.message);
		process.exit(1); // Exit process with failure
	}
}

module.exports = connectDB;
