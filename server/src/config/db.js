const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose.
 * Exit the process on failure. The server should not run without a DB connection.
 */
async function connectDB(uri) {
	try {
		await mongoose.connect(uri);
		console.log('MongoDB connected successfully');
	} catch (err) {
		console.error('Error connecting to MongoDB:', err.message);
		process.exit(1);
	}
}

module.exports = connectDB;
