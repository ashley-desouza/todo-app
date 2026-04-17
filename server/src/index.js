require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:8080';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok' });
});

// Socket.io
const io = new Server(server, {
	cors: { origin: corsOrigin }
});

io.on('connection', (socket) => {
	console.log(`Socket connected: ${socket.id}`);

	socket.on('disconnect', () => {
		console.log(`Socket disconnected: ${socket.id}`);
	});
});

// Make io accessible to route handlers via req.app.get('io')
app.set('io', io);

// Routes


const PORT = process.env.PORT || 3000;

// Only auto-start when run directly. Don't auto-start when imported by tests.
// This allows tests to connect to the server without it already being started.
// require.main is a Node.js variable that is set to the module that was run directly. 
// If the current module is the one that was run directly, then require.main === module will be true.
// This check prevents the server from starting when this file is imported as a module in tests, allowing tests to control when the server starts and stops.
if (require.main === module) {
	connnectDB(process.env.DB_CONNECTION_STRING).then(() => {
		server.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	});
}

module.exports = { app, server, io };