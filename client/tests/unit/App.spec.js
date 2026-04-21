import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import App from "@/App.vue";

// Mock the api module so tests do not open a real socket.
jest.mock("@/services/api", () => {
	return {
		getSocket: jest.fn().mockReturnValue({
			on: jest.fn(),
			disconnect: jest.fn(),
		}),
		disconnectSocket: jest.fn(),
	};
});

// Create a local Vue constructor for testing.
// This allows us to add Vuex without affecting the global Vue instance used in the app.
const localVue = createLocalVue();
localVue.use(Vuex);

describe("App Component", () => {
	let store;
	let fetchTasksAction;

	beforeEach(() => {
		fetchTasksAction = jest.fn().mockResolvedValue([]);

		// Create a new Vuex store instance with the mocked action.
		store = new Vuex.Store({
			modules: {
				tasks: {
					namespaced: true,
					state: () => ({ tasks: [], isLoading: false, error: null }),
					actions: {
						fetchTasks: fetchTasksAction,
						receiveTaskFromSocket: jest.fn(),
					},
				},
			},
		});
	});

	test("renders the header", () => {
		const wrapper = shallowMount(App, { localVue, store });
		expect(wrapper.find("h1").text()).toBe("To-Do List");
	});

	test("renders TaskForm and TaskList components", () => {
		const wrapper = shallowMount(App, { localVue, store });
		expect(wrapper.findComponent({ name: "TaskForm" }).exists()).toBe(true);
		expect(wrapper.findComponent({ name: "TaskList" }).exists()).toBe(true);
	});

	test("dispatches fetchTasks when mounted", async () => {
		shallowMount(App, { localVue, store });

		// Flush any pending promises so mounted()'s await this.fetchTasks() completes before we assert.
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(fetchTasksAction).toHaveBeenCalled();
	});

	test("shows error message when the store has an error", () => {
		// Create a new store instance with an error message in the state.
		store = new Vuex.Store({
			modules: {
				tasks: {
					namespaced: true,
					state: () => ({ tasks: [], isLoading: false, error: "Something went wrong" }),
					actions: {
						fetchTasks: jest.fn().mockResolvedValue([]),
						receiveTaskFromSocket: jest.fn(),
					},
				},
			},
		});

		const wrapper = shallowMount(App, { localVue, store });
		expect(wrapper.text()).toContain("Something went wrong");
	});
});
