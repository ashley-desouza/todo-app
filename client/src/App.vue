<template>
	<div id="app">
		<header class="header">
			<h1>To-Do List</h1>
			<p class="subheading">Real-time task updates</p>
		</header>

		<main>
			<TaskForm />

			<div v-if="error" class="page-error">
				{{ error }}
			</div>

			<TaskList :tasks="tasks" :is-loading="isLoading" />
		</main>
	</div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import TaskForm from "@/components/TaskForm.vue";
import TaskList from "@/components/TaskList.vue";
import { getSocket, disconnectSocket } from "@/services/api";

export default {
	name: "App",

	components: {
		TaskForm,
		TaskList,
	},

	computed: {
		...mapState("tasks", ["tasks", "isLoading", "error"]),
	},

	methods: {
		...mapActions("tasks", ["fetchTasks", "receiveTaskFromSocket"]),
	},

	async mounted() {
		// Load the initial task list from the server.
		await this.fetchTasks();

		// Subscribe to real-time task creation events.
		const socket = getSocket();

		// Server broadcasts task:created to all connected clients on every POST.
		// The dedupe happens in the store.
		socket.on("task:created", (task) => {
			this.receiveTaskFromSocket(task);
		});
	},

	beforeDestroy() {
		// Clean up the socket connection when the app unmounts.
		disconnectSocket();
	},
};
</script>

<style scoped>
.header {
	text-align: center;
	margin-bottom: 2rem;
}

.header h1 {
	margin: 0;
	font-size: 2rem;
	font-weight: 600;
}

.subheading {
	margin: 0.25rem 0 0;
	color: #6b7280;
	font-size: 0.95rem;
}

.page-error {
	padding: 0.75rem 1rem;
	background-color: #fef2f2;
	color: #991b1b;
	border: 1px solid #fecaca;
	border-radius: 6px;
	margin-bottom: 1rem;
	font-size: 0.9rem;
}
</style>
