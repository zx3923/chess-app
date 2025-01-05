import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);
  let users = {};

  function getUsersArray() {
    return Object.keys(users).map((id) => ({ id, nickname: users[id] }));
  }

  io.on("connection", (socket) => {
    // ...
    console.log("a user connected");
    /**
     * msg는 {type:string, nickName:string}
     */
    socket.on("joinAndLeave", (msg) => {
      console.log("joinAndLeave", msg.type, msg.nickName);
      if (msg.type === "join" && !users[socket.id]) {
        io.emit("chat message", `${msg.nickName}님이 입장하셨습니다.`);
        users[socket.id] = msg.nickName;
      }
      // else if (msg.type === 'leave') {
      //   io.emit('chat message', `${msg.nickName}님이 퇴장하셨습니다.`)
      //   users = users.filter((user) => user !== msg.nickName);

      // }

      io.emit("users", getUsersArray());
    });

    socket.on("chat message", (msg) => {
      console.log("message: " + msg);
      io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
      const nickName = users[socket.id];
      if (nickName) {
        io.emit("chat message", `${nickName}님이 퇴장하셨습니다.`);
        delete users[socket.id];
        io.emit("users", getUsersArray());
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
