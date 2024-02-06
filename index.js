const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let msgHist = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for messages from clients
  socket.on('chat message', (data) => {
    // Broadcast the message to all connected clients
    io.emit('chat message', { user: socket.username, message: data.message });
    msgHist.push( {user: socket.username, message: data.message});
  });

  // Listen for username change
  socket.on('change username', (newUsername) => {
    const oldUsername = socket.username;
    socket.username = newUsername;
    io.emit('user change', { oldUsername, newUsername });
    io.emit('clear messages');
    msgHist.forEach((message) => {
      io.emit('chat message', {user: message.user, message: message.message});
    });
  });

  // Listen for disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
    io.emit('user disconnect', { username: socket.username });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
