const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let users = [];
io.on("connection", (socket) => {
  let number = users.length + 1;
  socket.nickname = `Guest${number}`;
  users.push(socket.nickname);
  console.log(`${socket.nickname} connected / ${socket.id}`);
  io.emit("chat message", `${socket.nickname} connected`);
  io.emit("online", users);

  socket.on("disconnect", () => {
    console.log(`${socket.nickname} disconnected`);
    io.emit("chat message", `${socket.nickname} disconnected`);
    users.pop(socket.nickname);
    io.emit("offline", socket.nickname);
  });

  socket.on("typing", (bool) => {
    let user = bool ? socket.nickname : "";
    io.emit("typing", user);
  });

  socket.on("chat message", (msg) => {
    if (msg !== socket.prevMessage) {
      socket.prevMessage = msg;
      console.log(`${socket.nickname}: ${msg}`);
      io.emit("chat message", `${socket.nickname}: ${msg}`);
    }
  });

  socket.on("private message", (msg) => {
    let message = msg.split("#");
    console.log(`private ${socket.nickname}: ${message[1]}`);
    io.to(socket.id).emit(
      "private message",
      `${socket.nickname}: ${message[1]}`
    );
  });
});

server.listen(3002, () => {
  console.log("listening on *:3002");
});
