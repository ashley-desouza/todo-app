/**
 * Integration tests for /api/tasks.
 * Uses an in-memory MongoDB so tests are isolated from Atlas —
 * fast, deterministic, no shared state.
 *
 * Supertest drives the Express app in-process, so no port binding
 * or real network I/O is involved.
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../src/index');

let mongoServer;

// First run downloads the MongoDB binary (~100MB), which can exceed
// Jest's default 5s hook timeout. Hence the 60 second timeout.
// Cached locally after first run.
beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	await mongoose.connect(mongoServer.getUri());
}, 60000); // Increase timeout for MongoDB binaries download on CI

// Wipe collections between tests.
afterEach(async () => {
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		await collections[key].deleteMany({});
	}
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
});

describe('GET /api/tasks', () => {
	test('returns an empty array when no tasks exist', async () => {
		const res = await request(app).get('/api/tasks');

		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);
	});

	test('returns all tasks, newest first', async () => {
		await request(app).post('/api/tasks').send({ title: 'First task' });
		// Add a small delay so that the 2 tasks have different createdAt timestamps.
		await new Promise((resolve) => setTimeout(resolve, 10));
		await request(app).post('/api/tasks').send({ title: 'Second task' });

		const res = await request(app).get('/api/tasks');

		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(2);
		expect(res.body[0].title).toBe('Second task');
		expect(res.body[1].title).toBe('First task');
	});
});

describe('POST /api/tasks', () => {
	test('creates a task and returns 201 with the saved document', async () => {
		const res = await request(app).post('/api/tasks').send({ title: 'Buy groceries' });

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({ title: 'Buy groceries' });
		expect(res.body._id).toBeDefined();
		expect(res.body.createdAt).toBeDefined();
	});

	test('trims whitespace from the title', async () => {
		const res = await request(app).post('/api/tasks').send({ title: '   Walk the dog   ' });

		expect(res.status).toBe(201);
		expect(res.body.title).toBe('Walk the dog');
	});

	test('returns 400 when title is missing', async () => {
		const res = await request(app).post('/api/tasks').send({});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/title/i);
	});

	test('returns 400 when title is an empty string', async () => {
		const res = await request(app).post('/api/tasks').send({ title: '' });

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/title/i);
	});
});
