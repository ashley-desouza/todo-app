/**
 * Server entry point.
 * Connects Express, Socket.io, and the Mongo database.
 * Export { app, server, io }. This lets tests import the app without
 * starting a server or hitting the real database.
 */
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/tasks');

const app = express();

const server = http.createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:8080';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok' });
});

// Socket.io has its own CORS layer, separate from Express middleware.
const io = new Server(server, {
	cors: { origin: corsOrigin },
});

io.on('connection', (socket) => {
	console.log(`Socket connected: ${socket.id}`);

	socket.on('disconnect', () => {
		console.log(`Socket disconnected: ${socket.id}`);
	});
});

// Expose io on the app so route handlers can emit without a circular import.
// For Example: req.app.get('io').emit(...)
app.set('io', io);

// Routes
app.use('/api/tasks', taskRoutes);

// Global error handler.
// Express recognizes it as an error handler because it has 4 parameters,
// and it is declared after all routes to catch their errors.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

// Only start the listener when this file is run directly (node src/index.js).
// Jest imports this file for Supertest and so `require.main !== module`.
// As a result, the server does not bind a port or connect to the real DB.
if (require.main === module) {
	connectDB(process.env.DB_CONNECTION_STRING).then(() => {
		server.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	});
}

module.exports = { app, server, io };
