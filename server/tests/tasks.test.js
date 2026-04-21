/**
 * Integration tests for GET and POST /api/tasks.
 * Uses an in-memory MongoDB so tests are isolated from Atlas.
 *
 * Supertest is used to make HTTP requests against the Express app without needing to run an actual server.
 *
 * The MongoDB connection is established before all tests and is closed after all tests.
 * Each test starts with a clean database state by deleting all documents from all collections after each test.
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../src/index');

let mongoServer;

// The first time the tests run, MongoMemoryServer may need to download a MongoDB binary,
// which can take time and could exceed the default Jest timeout of 5 seconds. Hence the 60 second timeout.
// The MongoDB binary is cached locally after that.
beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	await mongoose.connect(mongoServer.getUri());
}, 60000);

// Delete all documents from all collections.
afterEach(async () => {
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		await collections[key].deleteMany({});
	}
});

// Close the Mongoose connection and stop MongoMemoryServer after all tests are done.
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

	test('returns all tasks sorted by newest first', async () => {
		await request(app).post('/api/tasks').send({ title: 'First task' });
		// Add a small delay to guarantee that the 2 tasks have distinct createdAt timestamps.
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
	test('creates a task and returns 201', async () => {
		const res = await request(app)
			.post('/api/tasks')
			.send({ title: 'Buy groceries' });

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({ title: 'Buy groceries' });
		expect(res.body._id).toBeDefined();
		expect(res.body.createdAt).toBeDefined();
	});

	test('trims whitespace from the title', async () => {
		const res = await request(app)
			.post('/api/tasks')
			.send({ title: '   Walk the dog   ' });

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
