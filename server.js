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
const waitingRapid = [];
const waitingBlitz = [];
const waitingBullet = [];

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);
  // let users = {};

  // function getUsersArray() {
  //   return Object.keys(users).map((id) => ({ id, nickname: users[id] }));
  // }

  io.on("connection", (socket) => {
    // ...
    console.log("a user connected");
    /**
     * msg는 {type:string, nickName:string}
     */
    // socket.on("joinAndLeave", (msg) => {
    //   console.log("joinAndLeave", msg.type, msg.nickName);
    //   if (msg.type === "join" && !users[socket.id]) {
    //     io.emit("chat message", `${msg.nickName}님이 입장하셨습니다.`);
    //     users[socket.id] = msg.nickName;
    //   }
    // else if (msg.type === 'leave') {
    //   io.emit('chat message', `${msg.nickName}님이 퇴장하셨습니다.`)
    //   users = users.filter((user) => user !== msg.nickName);

    // }

    //   io.emit("users", getUsersArray());
    // });

    // socket.on("chat message", (msg) => {
    //   console.log("message: " + msg.message);
    //   io.emit("chat message", msg);
    // });

    // 매칭요청
    // socket.on("joinQueue", ({ user, gameMode }) => {
    //   if (gameMode === "rapid") {
    //     waitingRapid.push({ socketId: socket.id, ...user });
    //     tryToMatch(waitingRapid, gameMode, io);
    //   } else if (gameMode === "blitz") {
    //     waitingBlitz.push({ socketId: socket.id, ...user });
    //     tryToMatch(waitingBlitz, gameMode, io);
    //   } else if (gameMode === "bullet") {
    //     waitingBullet.push({ socketId: socket.id, ...user });
    //     tryToMatch(waitingBullet, gameMode, io);
    //   }
    // });
    // 매칭 요청
    socket.on("joinQueue", ({ user, gameMode }) => {
      let matchFound = false;

      if (gameMode === "rapid") {
        waitingRapid.push({ socketId: socket.id, ...user });
        const match = tryToMatch(waitingRapid, gameMode);
        if (match) {
          const { player1, player2 } = match;
          matchFound = true;

          const player1Color = Math.random() < 0.5 ? "white" : "black";
          const player2Color = player1Color === "white" ? "black" : "white";

          const roomId = uuidv4();

          // 방에 참가
          io.to(player1.socketId).socketsJoin(roomId); // player1 방 참가
          io.to(player2.socketId).socketsJoin(roomId); // player2 방 참가
          // socket.join(roomId);
          rooms.set(roomId, {
            roomId,
            players: [
              { id: player1.socketId, username: user.user_name },
              { id: player2.socketId, username: user.user_name },
            ],
          });

          // 매칭 이벤트 전송
          io.to(player1.socketId).emit("matchFound", {
            opponent: player2,
            color: player1Color,
            roomId: roomId,
          });
          io.to(player2.socketId).emit("matchFound", {
            opponent: player1,
            color: player2Color,
            roomId: roomId,
          });
        }
      } else if (gameMode === "blitz") {
        waitingBlitz.push({ socketId: socket.id, ...user });
        const match = tryToMatch(waitingBlitz, gameMode);
        if (match) {
          const { player1, player2 } = match;
          matchFound = true;

          const player1Color = Math.random() < 0.5 ? "white" : "black";
          const player2Color = player1Color === "white" ? "black" : "white";

          const roomId = uuidv4();

          // 방에 참가
          io.to(player1.socketId).socketsJoin(roomId); // player1 방 참가
          io.to(player2.socketId).socketsJoin(roomId); // player2 방 참가
          // socket.join(roomId);
          rooms.set(roomId, {
            roomId,
            players: [
              { id: player1.socketId, username: user.user_name },
              { id: player2.socketId, username: user.user_name },
            ],
          });

          // 매칭 이벤트 전송
          io.to(player1.socketId).emit("matchFound", {
            opponent: player2,
            color: player1Color,
            roomId: roomId,
          });
          io.to(player2.socketId).emit("matchFound", {
            opponent: player1,
            color: player2Color,
            roomId: roomId,
          });
        }
      } else if (gameMode === "bullet") {
        waitingBullet.push({ socketId: socket.id, ...user });
        const match = tryToMatch(waitingBullet, gameMode);
        if (match) {
          const { player1, player2 } = match;
          matchFound = true;

          const player1Color = Math.random() < 0.5 ? "white" : "black";
          const player2Color = player1Color === "white" ? "black" : "white";

          const roomId = uuidv4();

          // 방에 참가
          io.to(player1.socketId).socketsJoin(roomId); // player1 방 참가
          io.to(player2.socketId).socketsJoin(roomId); // player2 방 참가
          // socket.join(roomId);
          rooms.set(roomId, {
            roomId,
            players: [
              { id: player1.socketId, username: user.user_name },
              { id: player2.socketId, username: user.user_name },
            ],
          });

          // 매칭 이벤트 전송
          io.to(player1.socketId).emit("matchFound", {
            opponent: player2,
            color: player1Color,
            roomId: roomId,
          });
          io.to(player2.socketId).emit("matchFound", {
            opponent: player1,
            color: player2Color,
            roomId: roomId,
          });
        }
      }

      if (!matchFound) {
        console.log("매칭 실패, 대기열에 추가되었습니다.");
      }
    });

    socket.on("createRoom", async ({ username, rating }, callback) => {
      console.log("create room");
      console.log(rating);
      const roomId = uuidv4();
      await socket.join(roomId);

      rooms.set(roomId, {
        roomId,
        players: [{ id: socket.id, username }],
      });
      callback(roomId);
    });

    socket.on("joinRoom", async ({ roomId, username }, callback) => {
      console.log("join test");
      const room = rooms.get(roomId);
      console.log(room);

      let error, message;

      if (!room) {
        // 방이 없으면
        error = true;
        message = "방이존재하지않습니다.";
      } else if (room.players.length <= 0) {
        // 방이 비어있으면
        error = true;
        message = "방이비어있습니다.";
      } else if (room.players.length >= 2) {
        // 방이 꽉 차 있으면
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

      await socket.join(roomId); //방참가
      console.log(room);

      const roomUpdate = {
        ...room,
        players: [...room.players, { id: socket.id, username }],
      };

      rooms.set(roomId, roomUpdate);

      callback(roomUpdate);

      // 상대방이 참여했음을 알리는 "opponentJoined" 이벤트 전송
      socket.to(roomId).emit("opponentJoined", roomUpdate);
    });

    socket.on("move", (data) => {
      console.log("data 확인");
      console.log(data);
      console.log(rooms);
      console.log(rooms.get(data.room));
      socket.to(data.room).emit("move", data.move);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
      const gameRooms = Array.from(rooms.values());
      console.log(gameRooms);
      gameRooms.forEach((room) => {
        console.log("!!!");
        console.log(room);
        const userInRoom = room.players.find(
          (player) => player.id === socket.id
        );

        if (userInRoom) {
          if (room.players.length < 2) {
            rooms.delete(room.roomId);
            return;
          }

          socket.to(room.roomId).emit("playerDisconnected", userInRoom);
        }
      });
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

// 매칭 로직
// tryToMatch 함수 수정: 매칭된 플레이어들 반환
function tryToMatch(waitingQueue, gameMode) {
  if (waitingQueue.length < 2) return null; // 대기열에 2명 미만이면 null 반환

  // 대기열을 순차적으로 확인
  for (let i = 0; i < waitingQueue.length; i++) {
    const player1 = waitingQueue[i];
    console.log("대기열비교");
    console.log(player1);

    for (let j = i + 1; j < waitingQueue.length; j++) {
      const player2 = waitingQueue[j];

      // 현재 게임 모드에 따른 레이팅 참조
      const player1Rating = getRatingByMode(player1, gameMode);
      const player2Rating = getRatingByMode(player2, gameMode);

      // 레이팅 차이가 100 이내인지 확인
      if (Math.abs(player1Rating - player2Rating) <= 100) {
        console.log("점수차 확인성공");

        // 매칭된 플레이어들 제거
        waitingQueue.splice(j, 1); // player2 제거 (뒤에서부터 제거)
        waitingQueue.splice(i, 1); // player1 제거

        // 매칭된 플레이어들 반환
        return { player1, player2 };
      }
    }
  }

  // 적합한 매칭이 없으면 null 반환
  console.log("No suitable match found. Waiting...");
  return null;
}

// 게임 모드에 따른 레이팅 가져오기
function getRatingByMode(player, gameMode) {
  switch (gameMode) {
    case "rapid":
      return player.rapidRating;
    case "blitz":
      return player.blitzRating;
    case "bullet":
      return player.bulletRating;
    default:
      throw new Error(`Unknown game mode: ${gameMode}`);
  }
}
