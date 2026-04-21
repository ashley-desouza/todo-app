import { shallowMount } from "@vue/test-utils";
import TaskList from "@/components/TaskList.vue";

describe("TaskList Component", () => {
	test("shows a loading message when isLoading is true", () => {
		// Use shallowMount since we do not need to render child components for this test.
		const wrapper = shallowMount(TaskList, {
			propsData: { tasks: [], isLoading: true },
		});

		expect(wrapper.text()).toContain("Loading tasks");
	});

	test("shows an empty state message when tasks array is empty and not loading", () => {
		// Use shallowMount since we do not need to render child components for this test.
		const wrapper = shallowMount(TaskList, {
			propsData: { tasks: [], isLoading: false },
		});

		expect(wrapper.text()).toContain("No tasks yet");
	});

	test("renders the list of tasks when tasks exist", () => {
		const tasks = [
			{ _id: "1", title: "First task", createdAt: "2026-04-19T12:00:00.000Z" },
			{ _id: "2", title: "Second task", createdAt: "2026-04-19T13:00:00.000Z" },
		];

		// Use shallowMount since we do not need to render child components for this test.
		const wrapper = shallowMount(TaskList, {
			propsData: { tasks, isLoading: false },
		});

		const items = wrapper.findAll("li");
		expect(items).toHaveLength(2);
		expect(items.at(0).text()).toContain("First task");
		expect(items.at(1).text()).toContain("Second task");
	});

	test("does not show loading or empty state when tasks exist", () => {
		const tasks = [{ _id: "1", title: "A task", createdAt: "2026-04-19T12:00:00.000Z" }];

		// Use shallowMount since we do not need to render child components for this test.
		const wrapper = shallowMount(TaskList, {
			propsData: { tasks, isLoading: false },
		});

		expect(wrapper.text()).not.toContain("Loading tasks");
		expect(wrapper.text()).not.toContain("No tasks yet");
	});
});
