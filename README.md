# Realtime To-Do

A full-stack to-do list application with real-time updates.

> **Live demo:** _(link to be added)_

**Stack:** Node.js, Express, MongoDB (Atlas), Socket.io, Vue 2, Vuex

---

## Quick start

This project consists of a Node/Express backend in `server/` and a Vue 2 frontend in `client/`.

**Requirements**: Node 18+ and MongoDB (Atlas free tier works).

**1. Clone and install**

```bash
git clone https://github.com/ashley-desouza/todo-app.git
cd todo-app
```

**2. Backend setup**

```bash
cd server
npm install
cp .env.default .env
# Edit .env and set DB_CONNECTION_STRING to your Atlas connection string
npm run dev
```

The server listens on `http://localhost:3000`.

**3. Frontend setup** (in a separate terminal)

```bash
cd client
npm install
npm run serve
```

The client runs on `http://localhost:8080`.

The client is configured to call the backend at `http://localhost:3000`. 

Open the URL in two browser tabs to see real-time updates in action.

---

## Features

- **Add tasks** via a form with client- and server-side validation
- **View all tasks** sorted by creation time, newest first
- **Real-time updates** — New tasks appear in every connected browser tab without a refresh, via WebSockets
- **Error states** for loading, empty list, validation failures, and server unreachable
- Whitespace trimming, length caps, and other defensive input handling

Per the brief, task deletion and editing are intentionally out of scope.

---

## Architecture

### Backend

REST API for creating and fetching tasks (`GET` / `POST /api/tasks`), with WebSockets broadcasting `task:created` events to connected clients in real time. MongoDB Atlas is used for persistence.

Route handlers delegate persistence to a thin service layer (`server/src/services/taskService.js`), keeping HTTP concerns (status codes, request parsing, socket emission) separate from data access. A repository layer on top of Mongoose would be redundant as the Mongoose model already provides that abstraction. If domain logic grew, the service is the natural place to extend.

### Frontend

Vue 2 with Vuex for state. Component tree:

- `App.vue` — wires the store and subscribes to socket events
- `TaskForm.vue` — handles task creation, local submit state and client-side validation
- `TaskList.vue` — receives tasks via props and renders loading / empty / populated states as appropriate

API calls are centralized in `client/src/services/api.js`. Components interact with the store through Vuex actions which call the API layer. 

No component imports axios directly. This makes it easy to swap out the API implementation for testing.

### Why Vuex?

Vuex is used here specifically because task state arrives from two sources - the REST API (when the current user adds a task) and the WebSocket (when another user adds a task).

Having both sources funnel through a single store keeps the reducer logic in one place. This makes the "add task" flow consistent regardless of origin.

---

## Testing

### Backend

Integration tests using Jest + Supertest, with `mongodb-memory-server` for isolation from Atlas.

```bash
cd server
npm test
```

- Tests are colocated by resource (`tests/<resource>.test.js`).
- Shared setup would move into `jest.config.js` once a second resource appears.
- Tests cover the following use cases -
  - `GET /api/tasks`
    - Returns an empty array when no tasks exist
    - Returns all tasks sorted newest first
  - `POST /api/tasks`
    - Creates a task and returns status 201 with the saved document
    - Trims leading and trailing whitespace from the title
    - Returns status 400 when the title is missing
    - Returns status 400 when the title is an empty string
- Tests use an in-memory MongoDB rather than mocks, so schema validation is also covered.

### Frontend

Component tests using Vue Test Utils + Jest.

```bash
cd client
npm run test:unit
```

- Tests are colocated with components under `tests/unit/`.
- The API module is mocked to prevent real socket connections during tests.
- Tests cover the following use cases -
  - `TaskForm` -
    - Disables the submit button when the input is empty
    - Disables the submit button when the input is only whitespace
    - Enables the submit button when the input has text
    - Dispatches the createTask action with the trimmed title on submit
    - Clears the input after a successful submit
    - Keeps the input if the submit fails (so the user can retry)
  - `TaskList` —
    - Shows a loading message when loading
    - Shows an empty-state message when there are no tasks
    - Shows the list of tasks when tasks exist
    - Hides the loading and empty messages when tasks are rendered
  - `App` —
    - Shows the header correctly
    - Shows the TaskForm and TaskList components
    - Dispatches fetchTasks when the app mounts
    - Shows the error banner when the store has an error

### Socket broadcasting

The Socket.io `task:created` broadcast is smoke-tested manually — open the app in two browser tabs, create a task in one, and the second tab updates without a refresh.

I chose not to add a dedicated socket integration test given the scope. In a production codebase I would add a socket integration test using `socket.io-client` in the test process to check the event payload shape.

---

## Deployment

_(filled in after deployment)_

- **Frontend:** Vercel
- **Backend:** Render (free tier)
- **Database:** MongoDB Atlas (free tier)

**Note**: the backend is on Render's free tier, which spins the container down after 15 minutes of inactivity. An UptimeRobot health-check pings `/health` every 5 minutes to keep it warm. The first request after a deploy may be slow.

---

## Decisions and tradeoffs

A few choices I made that I thought were worth calling out:

**No TypeScript.** The brief specifies plain Vue 2 and the job description lists no TS requirement. I did not want to overcomplicate the implementation.

**No Vue Router.** Single-screen app. Adding a router would be pure ceremony.

**Flat service layer, no repository on top of Mongoose.** Explained above.

**Error states, not just happy path.** The UI distinguishes between loading, empty list, validation errors (400), and network failures (server unreachable).

**Scoped styles per component + a small global stylesheet.** Component styles are `<style scoped>`; global styles (body reset, app container) live in `client/src/styles/global.css`.

**Prettier + EditorConfig at the monorepo root.** Shared formatting rules, with a `server/.prettierrc.json` override for using single quotes (Node convention) while the client uses the Vue CLI default of double quotes (Vue convention).