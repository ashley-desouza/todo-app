# To-Do List with Real-Time Updates

A full-stack to-do list application with real-time updates via WebSockets.

**Stack:** Node.js, Express, MongoDB (Atlas), Socket.io, Vue 2

## Architecture
REST API for creating and fetching tasks, with WebSockets broadcasting new tasks to connected clients in real time. MongoDB Atlas is used for persistence.

Route handlers delegate persistence to a thin service layer (services/taskService.js), keeping HTTP concerns (status codes, request parsing, socket emission) separate from data access.
   
A repository layer on top of Mongoose would be redundant, since the Mongoose model already provides that abstraction, and so I stopped there. If domain logic grew, the service is the natural place to extend.

## Testing

- Backend tests use Jest + Supertest, with `mongodb-memory-server` for isolation from Atlas.
- Tests are colocated by resource (`tests/<resource>.test.js`).
- Shared setup would move into `jest.config.js` once a second resource appears.
- The Socket.io broadcast is smoke-tested manually — 
  - Open the app in two browser tabs
  - Create a task in one, and the second tab updates without a refresh. 
  - I chose not to add a dedicated socket integration test given the scope. 
  - In a production codebase I would add a socket integration test using `socket.io-client` in the test process to check the event payload shape.
- The REST layer is fully covered, and the socket emit is a one-line side effect in the route handler.