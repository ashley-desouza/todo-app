import { tasksApi } from "@/services/api";

/**
 * Tasks module.
 * Centralizes task state. Updates arrive from two sources:
 *   - User actions (createTask via the API)
 *   - Socket events (task:created broadcast from the server)
 * Vuex is the single reducer both sources feed into.
 */

const state = () => {
	return {
		tasks: [],
		isLoading: false,
		error: null,
	};
};

const getters = {
	allTasks: (state) => state.tasks,
};

const mutations = {
	SET_TASKS(state, tasks) {
		state.tasks = tasks;
	},

	ADD_TASK(state, task) {
		// If a task is created by this client, it's added from the POST response AND from the socket broadcast.
		// Skip if we already have it.
		if (!state.tasks.some((t) => t._id === task._id)) {
			// Add to the top of the list so newest shows first.
			state.tasks.unshift(task);
		}
	},

	SET_LOADING(state, isLoading) {
		state.isLoading = isLoading;
	},

	SET_ERROR(state, error) {
		state.error = error;
	},
};

const actions = {
	async fetchTasks({ commit }) {
		commit("SET_LOADING", true);
		commit("SET_ERROR", null);
		try {
			const tasks = await tasksApi.fetchAll();
			commit("SET_TASKS", tasks);
		} catch (err) {
			let message;

			if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
				/// Server is not reachable — could be down or offline
				message = "Unable to reach the server. Check that the backend is running.";
			} else {
				message = err.message || "Failed to load tasks";
			}

			commit("SET_ERROR", message);
		} finally {
			commit("SET_LOADING", false);
		}
	},

	async createTask({ commit }, title) {
		commit("SET_ERROR", null);
		try {
			const task = await tasksApi.create(title);
			commit("ADD_TASK", task);
			return task;
		} catch (err) {
			let message;

			if (err.response?.data?.error) {
				// Server-side validation error (For example: "Title is required").
				message = err.response.data.error;
			} else if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
				/// Server is not reachable — could be down or offline
				message = "Unable to reach the server. Check that the backend is running.";
			} else {
				message = err.message || "Failed to create task";
			}

			commit("SET_ERROR", message);
			throw err;
		}
	},

	// Called from App.vue when a socket event arrives.
	receiveTaskFromSocket({ commit }, task) {
		commit("ADD_TASK", task);
	},
};

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions,
};
