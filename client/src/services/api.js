import axios from "axios";
import { io } from "socket.io-client";

/**
 * API layer — centralizes all network I/O.
 */

const API_BASE_URL = process.env.VUE_APP_API_URL || "http://localhost:3000";

const httpClient = axios.create({
	baseURL: API_BASE_URL,
	headers: { "Content-Type": "application/json" },
});

// REST calls
export const tasksApi = {
	fetchAll() {
		return httpClient.get("/api/tasks").then((res) => res.data);
	},

	create(title) {
		return httpClient.post("/api/tasks", { title }).then((res) => res.data);
	},
};

// Socket connection - lazy so tests can import the module without opening a socket.
let socket = null;

export function getSocket() {
	if (!socket) {
		socket = io(API_BASE_URL);
	}
	return socket;
}

export function disconnectSocket() {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}
