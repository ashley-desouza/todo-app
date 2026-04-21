import axios from "axios";
import { io } from "socket.io-client";

/**
 * API layer for the app.
 * Contains both REST calls and socket connection logic.
 */

const API_BASE_URL = process.env.VUE_APP_API_URL || "http://localhost:3000";

const httpClient = axios.create({
	baseURL: API_BASE_URL,
	headers: { "Content-Type": "application/json" },
});

// REST calls
export const tasksApi = {
	async fetchAll() {
		const res = await httpClient.get("/api/tasks");
		return res.data;
	},

	async create(title) {
		const res = await httpClient.post("/api/tasks", { title });
		return res.data;
	},
};

// Socket connection. A single socket instance is created for the app.
// The socket is initialized lazily in getSocket() when it is called from App.vue's mounted() hook.
// This way we avoid creating a socket connection during testing when App.vue is not mounted.
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
