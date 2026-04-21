<template>
	<form class="task-form" @submit.prevent="handleSubmit">
		<input
			v-model="title"
			type="text"
			placeholder="Please enter a task title..."
			class="task-input"
			:disabled="isSubmitting"
			maxlength="200"
		/>
		<button type="submit" class="submit-button" :disabled="isSubmitting || !canSubmit">
			{{ isSubmitting ? "Adding..." : "Add Task" }}
		</button>
	</form>
</template>

<script>
import { mapActions } from "vuex";

export default {
	name: "TaskForm",

	data() {
		return {
			title: "",
			isSubmitting: false,
		};
	},

	computed: {
		canSubmit() {
			return this.title.trim().length > 0;
		},
	},

	methods: {
		...mapActions("tasks", ["createTask"]),

		async handleSubmit() {
			if (!this.canSubmit || this.isSubmitting) return;

			this.isSubmitting = true;
			try {
				await this.createTask(this.title.trim());

				// Clear on success.
				this.title = "";
			} catch (err) {
				// Intentionally empty — the Vuex action has already stored the error message in state,
				// which is displayed in App.vue
			} finally {
				this.isSubmitting = false;
			}
		},
	},
};
</script>

<style scoped>
.task-form {
	display: flex;
	gap: 0.5rem;
	margin-bottom: 1.5rem;
}

.task-input {
	flex: 1;
	padding: 0.6rem 0.8rem;
	font-size: 1rem;
	border: 1px solid #d1d5db;
	border-radius: 6px;
	outline: none;
	transition: border-color 0.15s;
}

.task-input:focus {
	border-color: #3b82f6;
}

.task-input:disabled {
	background-color: #f3f4f6;
	cursor: not-allowed;
}

.submit-button {
	padding: 0.6rem 1.2rem;
	font-size: 1rem;
	font-weight: 500;
	color: white;
	background-color: #3b82f6;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	transition: background-color 0.15s;
}

.submit-button:hover:not(:disabled) {
	background-color: #2563eb;
}

.submit-button:disabled {
	background-color: #93c5fd;
	cursor: not-allowed;
}
</style>
