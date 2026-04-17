/**
 * Task service.
 * Task related logic and persistence live here.
 */

const Task = require('./../models/Task');

async function getAllTasks() {
	return Task.find().sort({ createdAt: -1 });
}

async function createTask({ title }) {
	return Task.create({ title });
}

module.exports = { getAllTasks, createTask };