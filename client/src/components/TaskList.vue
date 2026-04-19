<template>
	<div class="task-list">
		<div v-if="isLoading" class="state-message">Loading tasks...</div>

		<div v-else-if="tasks.length === 0" class="state-message empty">
			No tasks yet. Add a task above to get started.
		</div>

		<ul v-else class="tasks">
			<li v-for="task in tasks" :key="task._id" class="task">
				<div class="task-title">{{ task.title }}</div>
				<div class="task-date">{{ formatDate(task.createdAt) }}</div>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	name: "TaskList",

	props: {
		tasks: {
			type: Array,
			required: true,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	},

	methods: {
		formatDate(isoString) {
			const date = new Date(isoString);

			return date.toLocaleString(undefined, {
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
			});
		},
	},
};
</script>

<style scoped>
.task-list {
	margin-top: 1rem;
}

.state-message {
	text-align: center;
	padding: 2rem 1rem;
	color: #6b7280;
	font-style: italic;
}

.tasks {
	list-style: none;
	padding: 0;
	margin: 0;
}

.task {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.8rem 1rem;
	background-color: white;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	margin-bottom: 0.5rem;
}

.task-title {
	font-size: 1rem;
	color: #111827;
	word-break: break-word;
	flex: 1;
}

.task-date {
	font-size: 0.85rem;
	color: #6b7280;
	margin-left: 1rem;
	flex-shrink: 0;
	white-space: nowrap;
}
</style>
