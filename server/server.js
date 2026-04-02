const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 📁 Serve frontend
app.use(express.static(path.join(__dirname, "../client")));

// 🧠 Game state
let players = {};

// 🔌 Socket connection
io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // 🎯 Create new player
  players[socket.id] = {
    id: socket.id,
    x: Math.random() * 700 + 50,
    y: 400,
    score: 0
  };

  // Send all players to new user
  socket.emit("currentPlayers", players);

  // Notify others
  socket.broadcast.emit("newPlayer", players[socket.id]);

  // 🏹 Shoot event
  socket.on("shoot", (data) => {
    socket.broadcast.emit("shoot", {
      id: socket.id,
      angle: data.angle,
      power: data.power
    });
  });

  // 💥 Hit event
  socket.on("hit", (data) => {
    let shooter = players[socket.id];
    let target = players[data.target];

    if (!shooter || !target) return;

    // Add score
    shooter.score += data.points;

    // 🔄 Respawn target
    target.x = Math.random() * 700 + 50;
    target.y = 400;

    // Update all clients
    io.emit("updatePlayers", players);
  });

  // ❌ Disconnect
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    delete players[socket.id];

    io.emit("playerDisconnected", socket.id);
  });
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
