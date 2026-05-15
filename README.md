# ChatRoom

Real-time chat application with rooms, typing indicators, and online user tracking. Built with React, Express, and Socket.IO.

## Prerequisites

- Node.js 18+
- npm

## Setup

### Server

```bash
cd chat-app/server
npm install
npm start
```

Server runs on `http://localhost:3001` by default.

### Client

```bash
cd chat-app/client
npm install
npm start
```

Client runs on `http://localhost:3000` and connects to the server automatically.

## Environment Variables

### Server (`chat-app/server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `CORS_ORIGIN` | `*` | Allowed CORS origin (set to your client URL in production) |

### Client (`chat-app/client/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_SERVER_URL` | `http://localhost:3001` | Socket.IO server URL |

## ngrok Tunneling

To expose the chat app over the internet:

1. Start the server:
   ```bash
   cd chat-app/server && npm start
   ```

2. In a new terminal, start ngrok:
   ```bash
   ngrok http 3001
   ```

3. Copy the ngrok forwarding URL (e.g. `https://xxxx-xx-xx.ngrok-free.app`).

4. Create `chat-app/client/.env` and set the server URL:
   ```
   REACT_APP_SERVER_URL=https://xxxx-xx-xx.ngrok-free.app
   ```

5. Optionally update `chat-app/server/.env` to restrict CORS:
   ```
   CORS_ORIGIN=http://localhost:3000
   ```

6. Start the client:
   ```bash
   cd chat-app/client && npm start
   ```

Users on the same network or internet can connect by opening the client in their browser.

## Features

- Room-based chat (general, tech-talk, random, announcements)
- Real-time messaging via Socket.IO
- Typing indicators
- Online user list per room
- Message history (last 50 messages per room)
- Color-coded user avatars
