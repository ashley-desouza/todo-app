import { tasksApi } from "@/services/api";

/**
 * Tasks module.
 *
 * Holds the task state for the app. Updates arrive from two places:
 *   - User actions (the current user adds a task via POST)
 *   - Socket events (another user adds a task, which are broadcast from the server)
 *
 * Both paths go through this store, and so there is only one place to update
 * the task list and one place to debug if something goes wrong with tasks.
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

	// When the current user creates a task, it arrives twice —
	//   1. Once from the POST response,
	//   2. And once from the socket broadcast.
	// Dedupe by _id so we don't show it twice.
	ADD_TASK(state, task) {
		if (!state.tasks.some((t) => t._id === task._id)) {
			// Add to the front of the list so that the newest task shows first.
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
			commit("SET_ERROR", mapErrorToMessage(err, "Failed to load tasks"));
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
			commit("SET_ERROR", mapErrorToMessage(err, "Failed to create task"));
			// Re-throw so the TaskForm component can decide whether to keep the user input.
			throw err;
		}
	},

	// Called from App.vue when a socket event arrives for a task created by another client.
	receiveTaskFromSocket({ commit }, task) {
		commit("ADD_TASK", task);
	},
};

/**
 * Translate an axios error into a user-facing message.
 * Handles three cases:
 *   - Server-side validation error (like"Title is required") - Return the server's message.
 *   - Network error - Return a message that the server is unreachable.
 *   - Other error - Return a default message.
 */
function mapErrorToMessage(err, defaultMessage) {
	if (err.response?.data?.error) {
		return err.response.data.error;
	}
	if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
		return "Unable to reach the server. Check that the server is running.";
	}
	return err.message || defaultMessage;
}

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions,
};
