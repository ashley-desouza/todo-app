# Realtime To-Do

A full-stack to-do list application with real-time updates.

> **Live demo:** [https://todo-app-henna-ten-57.vercel.app](https://todo-app-henna-ten-57.vercel.app)

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

- **Add tasks** via a form with client-side and server-side validation
- **View all tasks** sorted by creation time, newest first
- **Real-time updates** - New tasks appear in every connected browser tab without a refresh, via WebSockets
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

- `App.vue` - wires the store and subscribes to socket events
- `TaskForm.vue` - handles task creation along with client-side validation
- `TaskList.vue` - receives tasks via props and renders loading / empty / populated states as appropriate

API calls are centralized in `client/src/services/api.js`. Components interact with the store through Vuex actions which call the API layer. 

No component imports axios directly. This makes it easy to swap out the API implementation for testing.

### Why Vuex?

For an app this small, I was tempted to skip Vuex and just use Vue's built-in reactivity.
The reason I chose to use Vuex is that the task state comes from two sources -
1. The REST API when the current user adds a task, and
2. The socket when another user has created a task.

Without a central store, I would have two slightly different code paths doing almost the same thing, and that is the kind of drift I would like to avoid.

Funneling through Vuex means that the 'add task' flow is identical regardless of the source.
There is one code path for adding a task to the store, one set of mutations and one place to debug in case something goes wrong.

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
    - Creates a task and returns status 201
    - Trims whitespace from the title
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
    - Disables the submit button when the input is whitespace only
    - Enables the submit button when the input has text
    - Dispatches the createTask action with the trimmed title on submit
    - Clears the input after a successful submit
    - Persists the input if the submit fails (so the user can retry)
  - `TaskList` -
    - Shows a loading message when loading
    - Shows an empty-state message when there are no tasks
    - Shows the list of tasks when tasks exist
    - Does not show the loading and empty messages when tasks exist
  - `App` -
    - Shows the header correctly
    - Shows the TaskForm and TaskList components
    - Dispatches fetchTasks when the app mounts
    - Shows the error message when the store has an error

### Socket broadcasting

The Socket.io `task:created` broadcast is smoke-tested manually. Open the app in two browser tabs, create a task in one, and the second tab updates without a refresh.

I chose not to add a dedicated socket integration test given the scope. In a production codebase I would add a socket integration test using `socket.io-client` in the test process to check the event payload shape.

---

## Deployment

- **Frontend:** [Vercel](https://todo-app-henna-ten-57.vercel.app)
- **Backend:** Render — API-only, root returns 404 by design. Health endpoint: [[Render](https://todo-app-server-rxpb.onrender.com/health)](https://todo-app-server-rxpb.onrender.com/health)
- **Database:** MongoDB Atlas

**Note**: The backend is on Render's free tier, which spins the container down after 15 minutes of inactivity. An UptimeRobot health-check pings `/health` every 5 minutes to keep it warm. The first request after a deploy may be slow.

---

## Decisions and tradeoffs

A few choices I made that I thought were worth calling out:

**No TypeScript.** The brief specifies plain Vue 2 and the job description lists no TS requirement. I did not want to overcomplicate the implementation.

**No Vue Router.** For a single-screen app, adding a router would be pure ceremony.

**Socket.io over SSE.** For a broadcast-only pattern like this, Server-Sent Events (SSE) would be a leaner fit - one-way, HTTP-native, built-in reconnection. I chose Socket.io because "real-time updates" is conventionally WebSocket territory in the Node ecosystem, and Socket.io's features such as rooms, automatic transport fallback etc. scale better if the feature grew. At this scale, the overhead difference is negligible. If I were aggressively cost-optimizing infrastructure or the feature stayed strictly one-way forever, I would switch to SSE.

**Flat service layer, no repository on top of Mongoose.** Explained above.

**CommonJS on the backend, ESM on the frontend.** Node runs CommonJS without configuration, and Vue CLI ships with ESM + bundler tooling. I decided against consistency as unifying them would have cost more than it saved.

**Error states, not just happy path.** The UI distinguishes between a loading state, an empty list, validation errors (400), and network failures (server unreachable).

**Scoped styles per component + a small global stylesheet.** Component styles are `<style scoped>`; global styles (body reset, app container) live in `client/src/styles/global.css`.

**Prettier + EditorConfig at the monorepo root.** Shared formatting rules, with a `server/.prettierrc.json` override for using single quotes (Node convention) while the client uses the Vue CLI default of double quotes (Vue convention).