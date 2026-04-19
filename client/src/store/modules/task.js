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
			commit("SET_ERROR", err.message || "Failed to load tasks");
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
			const message = err.response?.data?.error || err.message || "Failed to create task";
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
