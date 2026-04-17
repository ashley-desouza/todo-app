/**
 * Server entry point.
 * Connects Express, Socket.io, and the Mongo database.
 * Exports { app, server, io } so tests can import the app without
 * starting a server or hitting the real database.
 */
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();

// Socket.io requires a raw http.Server to attach to
const server = http.createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:8080';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok' });
});

// Socket.io has its own CORS layer, separate from Express middleware.
// Both must be configured or the production socket handshake will fail.
const io = new Server(server, {
	cors: { origin: corsOrigin }
});

io.on('connection', (socket) => {
	console.log(`Socket connected: ${socket.id}`);

	socket.on('disconnect', () => {
		console.log(`Socket disconnected: ${socket.id}`);
	});
});

// Expose io on the app so route handlers can emit without a circular import.
// Example usage in routes: req.app.get('io').emit(...)
app.set('io', io);

// Routes


const PORT = process.env.PORT || 3000;

// Only start the listener when this file is run directly (node src/index.js).
// When Jest imports this file for Supertest, `require.main !== module`, so
// the server doesn't bind a port or connect to the real DB — tests control
// their own lifecycle.
if (require.main === module) {
	connectDB(process.env.DB_CONNECTION_STRING).then(() => {
		server.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	});
}

module.exports = { app, server, io };