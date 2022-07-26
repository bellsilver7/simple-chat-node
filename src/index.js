const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let rooms = {
  room_1: { title: "채팅방1", users: [] },
  room_2: { title: "채팅방2", users: [] },
  room_3: { title: "채팅방3", users: [] },
};
let users = [];
io.on("connection", (socket) => {
  let currentRoomId = "";
  let roomIo = null;

  socket.on("new user", (nickname) => {
    socket.nickname = nickname;
    io.emit("room list", rooms);
  });

  socket.on("join room", (roomId) => {
    // roomId = "room_" + socket.id;
    roomIo = io.to(roomId);
    socket.join(roomId);
    rooms[roomId].users.push(socket.nickname);
    roomIo.emit("online", rooms[roomId].users);
    roomIo.emit("chat message", `${socket.nickname}이(가) 들어왔어요.`);
  });

  socket.on("is typing", (nickname) => {
    socket.join(currentRoomId).broadcast.emit("is typing", nickname);
  });

  socket.on("chat message", (msg) => {
    const message = msg.trim();

    if (message === socket.chatMessage) return;
    socket.chatMessage = message;

    const date = new Date();
    const currentTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    roomIo.emit(
      "chat message",
      `${socket.nickname}: ${message} (${currentTime})`
    );
  });

  socket.on("disconnect", () => {
    users.splice(socket.nickname);
    roomIo.emit("offline", socket.nickname);
    roomIo.emit("chat message", `${socket.nickname}이(가) 나갔어요.`);
  });
});

server.listen(3002, () => {
  console.log("listening on *:3002");
});
