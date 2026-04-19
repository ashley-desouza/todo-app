import { mount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import TaskForm from "@/components/TaskForm.vue";

// Create a local Vue constructor for testing. This allows us to add Vuex without affecting the global Vue.
const localVue = createLocalVue();
localVue.use(Vuex);

describe("TaskForm Component", () => {
	let createTaskAction;
	let store;

	beforeEach(() => {
		// Mock the createTask action.
		createTaskAction = jest.fn().mockResolvedValue({ _id: "1", title: "Test task" });

		// Create a new Vuex store instance with the mocked action for each test.
		store = new Vuex.Store({
			modules: {
				tasks: {
					namespaced: true,
					actions: {
						createTask: createTaskAction,
					},
				},
			},
		});
	});

	test("disables submit button when input is empty", () => {
		const wrapper = mount(TaskForm, { localVue, store });
		const button = wrapper.find("button");

		expect(button.attributes("disabled")).toBeDefined();
	});

	test("enables submit button when input has text", async () => {
		const wrapper = mount(TaskForm, { localVue, store });
		const input = wrapper.find("input");
		await input.setValue("Buy groceries");

		const button = wrapper.find("button");
		expect(button.attributes("disabled")).toBeUndefined();
	});

	test("disables submit button when input is whitespace only", async () => {
		const wrapper = mount(TaskForm, { localVue, store });
		const input = wrapper.find("input");
		await input.setValue("   ");

		const button = wrapper.find("button");
		expect(button.attributes("disabled")).toBeDefined();
	});

	test("dispatches createTask action on submit with trimmed title", async () => {
		const wrapper = mount(TaskForm, { localVue, store });
		const input = wrapper.find("input");
		await input.setValue("  Buy groceries  ");

		await wrapper.find("form").trigger("submit.prevent");

		expect(createTaskAction).toHaveBeenCalledTimes(1);
		// Vuex action handlers receive (context, payload). Test that payload is the 2nd argument.
		expect(createTaskAction.mock.calls[0][1]).toBe("Buy groceries");
	});

	test("clears input after successful submit", async () => {
		const wrapper = mount(TaskForm, { localVue, store });
		const input = wrapper.find("input");
		await input.setValue("Buy groceries");

		await wrapper.find("form").trigger("submit.prevent");
		// Wait for the async submit handler to finish
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();

		expect(input.element.value).toBe("");
	});

	test("keeps input when submit fails", async () => {
		createTaskAction.mockRejectedValue(new Error("Server error"));

		const wrapper = mount(TaskForm, { localVue, store });
		const input = wrapper.find("input");
		await input.setValue("Buy groceries");

		await wrapper.find("form").trigger("submit.prevent");
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();

		expect(input.element.value).toBe("Buy groceries");
	});
});
