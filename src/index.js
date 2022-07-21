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
  socket.on("new user", (nickname) => {
    socket.nickname = nickname;
    io.emit("chat message", `${nickname}가 들어왔어요.`);
  });

  socket.on("chat message", (msg) => {
    const message = msg.trim();

    if (message === socket.chatMessage) return;
    socket.chatMessage = message;

    const date = new Date();
    const currentTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    io.emit("chat message", `${socket.nickname}: ${message} (${currentTime})`);
  });

  socket.on("disconnect", () => {
    io.emit("chat message", `${socket.nickname}가 나갔어요.`);
  });
});

io.emit("some event", {
  someProperty: "some value",
  otherProperty: "other value",
}); // This will emit the event to all connected sockets

server.listen(3002, () => {
  console.log("listening on *:3002");
});
