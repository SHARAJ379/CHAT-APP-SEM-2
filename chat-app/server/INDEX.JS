const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ─── Message History (in-memory, per room) ────────────────────────────────────
const messageHistory = {};
const MAX_HISTORY = 50;

function addToHistory(room, msgObj) {
  if (!messageHistory[room]) messageHistory[room] = [];
  messageHistory[room].push(msgObj);
  if (messageHistory[room].length > MAX_HISTORY) {
    messageHistory[room].shift();
  }
}

// ─── Online Users (per room) ──────────────────────────────────────────────────
const rooms = {};

io.on('connection', (socket) => {
  console.log(`[+] User connected: ${socket.id}`);

  socket.on('join_room', ({ username, room }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;

    if (!rooms[room]) rooms[room] = [];
    rooms[room].push({ id: socket.id, username });

    const history = messageHistory[room] || [];
    socket.emit('message_history', history);

    io.to(room).emit('user_list', rooms[room]);

    const joinMsg = {
      username: 'System',
      message: `${username} joined #${room}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'system'
    };
    addToHistory(room, joinMsg);
    io.to(room).emit('receive_message', joinMsg);
  });

  socket.on('send_message', ({ room, message }) => {
    const msgObj = {
      username: socket.username,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'user'
    };
    addToHistory(room, msgObj);
    io.to(room).emit('receive_message', msgObj);
  });

  socket.on('typing', ({ room, username }) => {
    socket.to(room).emit('user_typing', username);
  });

  socket.on('stop_typing', ({ room }) => {
    socket.to(room).emit('user_stop_typing');
  });

  socket.on('disconnect', () => {
    const room = socket.room;
    if (room && rooms[room]) {
      rooms[room] = rooms[room].filter(u => u.id !== socket.id);
      io.to(room).emit('user_list', rooms[room]);

      const leaveMsg = {
        username: 'System',
        message: `${socket.username} left the room`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'system'
      };
      addToHistory(room, leaveMsg);
      io.to(room).emit('receive_message', leaveMsg);
    }
    console.log(`[-] User disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log('✅ Server running on http://localhost:3001');
});