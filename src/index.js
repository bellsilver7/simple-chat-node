const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  io.emit("chat message", "some user connected");

  socket.broadcast.emit("hi");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    io.emit("chat message", "some user disconnected");
  });
});

io.emit("some event", {
  someProperty: "some value",
  otherProperty: "other value",
}); // This will emit the event to all connected sockets

server.listen(3002, () => {
  console.log("listening on *:3002");
});
