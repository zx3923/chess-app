import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const rooms = new Map();

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
      console.log("message: " + msg.message);
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

    socket.on("createRoom", async (callback) => {
      console.log("create room");
      const roomId = uuidv4();
      await socket.join(roomId);

      rooms.set(roomId, {
        roomId,
        player: [{ id: socket.id, username: socket.data?.username }],
      });

      callback(roomId);
    });

    socket.on("joinRoom", async (args, callback) => {
      console.log("join test");
      const room = rooms.get(args.roomId);
      console.log(room);

      let error, message;

      if (!room) {
        // 방이없다면
        error = true;
        message = "방이존재하지않습니다.";
      } else if (room.length <= 0) {
        // 방이비어있다면
        error = true;
        message = "방이비어있습니다.";
      } else if (room.length >= 2) {
        // 방이차있다면
        error = true;
        message = "방이꽉차있습니다.";
      }

      if (error) {
        if (callback) {
          callback({
            error,
            message,
          });
        }

        return;
      }

      await socket.join(args.roomId); //방참가

      const roomUpdate = {
        ...room,
        players: [
          ...room.player,
          { id: socket.id, username: socket.data?.username },
        ],
      };

      rooms.set(args.roomId, roomUpdate);

      callback(roomUpdate);

      // 상대방이 참여했음을 알리는 "opponentJoined" 이벤트 전송
      socket.to(args.roomId).emit("opponentJoined", roomUpdate);
    });

    socket.on("move", (data) => {
      socket.to(data.room).emit("move", data.move);
      console.log("move@@@@@@@@");
      console.log(data);
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
