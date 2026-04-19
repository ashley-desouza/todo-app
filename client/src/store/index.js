import Vue from "vue";
import Vuex from "vuex";
import tasks from "./modules/task";

Vue.use(Vuex);

/**
 * Root store.
 * Task-related state and logic live in the `tasks` module.
 */
export default new Vuex.Store({
	state: {},
	mutations: {},
	actions: {},
	modules: {
		tasks,
	},
});
