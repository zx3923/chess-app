const express = require("express");
const { Server } = require("socket.io");
const { v4: uuidV4 } = require("uuid");
const http = require("http");

const app = express();

const server = http.createServer(app);

const port = process.env.PORT || 8080;

const io = new Server(server, {
  cors: "*",
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});

// io.connection
io.on("connection", (socket) => {
  // socket 은 방금 연결된 클라이언트
  // 각 socket 에는 id가 할당
  console.log(socket.id, "connected");
});
