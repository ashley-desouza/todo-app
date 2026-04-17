const mongoose = require('mongoose');

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