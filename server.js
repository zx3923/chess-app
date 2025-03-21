import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import Timer from "./lib/timer.js";
import Game from "./lib/game.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const rooms = new Map();
const waitingQueues = {
  rapid: [],
  blitz: [],
  bullet: [],
};

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "https://chess-app-beryl.vercel.app",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected. id: ", socket.id);
    // 매칭 요청
    socket.on("joinQueue", ({ user, gameMode }, callback) => {
      if (!waitingQueues[gameMode]) {
        console.error(`Invalid game mode: ${gameMode}`);
        return;
      }

      const existingRoom = [...rooms.values()].find((room) =>
        room.players.some((player) => player.id === user.id)
      );

      if (existingRoom) {
        console.log(`User ${user.username} is already in a room.`);
        console.log(existingRoom);
        if (existingRoom.game.getIsGameOver()) {
          // 방이 있지만 게임이 이미 종료되었을 경우 방 삭제 후 매칭 시도
          rooms.delete(existingRoom.roomId);
        } else {
          return callback({ success: false, message: "Already in a room" });
        }
      }

      waitingQueues[gameMode].push({ socketId: socket.id, ...user });
      const match = tryToMatch(waitingQueues[gameMode], gameMode);

      console.log("!!");
      // 적합한 매칭이 있다면
      if (match) {
        const { player1, player2 } = match;
        const player1Color = Math.random() < 0.5 ? "white" : "black";
        const player2Color = player1Color === "white" ? "black" : "white";
        const roomId = uuidv4();

        const initialTime = getInitialTime(gameMode); // 초기 시간 가져오기

        // 방 입장
        [player1, player2].forEach((player) =>
          io.to(player.socketId).socketsJoin(roomId)
        );

        const roomPlayer1 = {
          socketId: player1.socketId,
          id: player1.id,
          username: player1.username,
          color: player1Color,
          rating: getRatingByMode(player1, gameMode),
        };

        const roomPlayer2 = {
          socketId: player2.socketId,
          id: player2.id,
          username: player2.username,
          color: player2Color,
          rating: getRatingByMode(player2, gameMode),
        };

        rooms.set(roomId, {
          roomId,
          players: [roomPlayer1, roomPlayer2],
          // timers: { white: initialTime, black: initialTime },
          timers: {
            white: new Timer(initialTime),
            black: new Timer(initialTime),
          },
          // lastMoveTime: Date.now(),
          currentTurn: "white",
          gameMode,
          fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          game: new Game(
            "playerVsPlayer",
            initialTime,
            roomPlayer1,
            roomPlayer2
          ),
        });

        io.to(player1.socketId).emit("matchFound", {
          opponent: player2,
          color: player1Color,
          gameMode,
          roomId,
          initialTime,
        });

        io.to(player2.socketId).emit("matchFound", {
          opponent: player1,
          color: player2Color,
          gameMode,
          roomId,
          initialTime,
        });
        const room = rooms.get(roomId);
        console.log(room);

        room.timers.white.start();
        room.game.play();

        io.in(room.roomId).emit("gameStart", room);
      } else {
        console.log("No match found, added to queue");
      }
      callback({ success: true });
    });

    // 매칭 취소
    socket.on("cancelMatching", (gameMode) => {
      if (!waitingQueues[gameMode]) {
        console.error(`Invalid game mode: ${gameMode}`);
        return;
      }

      const index = waitingQueues[gameMode].findIndex(
        (player) => player.socketId === socket.id
      );
      if (index !== -1) {
        waitingQueues[gameMode].splice(index, 1);
        console.log(`User removed from ${gameMode} queue`);
      }
    });

    // 재 요청
    socket.on("requestGameState", ({ username, socketId }, callback) => {
      const room = [...rooms.values()].find((r) =>
        r.players.some((p) => p.username === username)
      );
      if (!room) return callback({ error: "Room not found" });

      const player = room.players.find((p) => p.username === username);
      const opponent = room.players.find((p) => p.username !== username);

      if (player) {
        player.socketId = socketId;

        socket.join(room.roomId);
      }
      callback(room, player, opponent);
    });

    socket.on("requestNotation", ({ username }, callback) => {
      const room = [...rooms.values()].find((r) =>
        r.players.some((p) => p.username === username)
      );
      if (!room) return callback({ error: "Room not found" });
      callback(
        room.game.getNotation(),
        room.game.chess.history({ verbose: true }),
        room.game.getMoveNumber()
      );
    });

    // 항복
    socket.on("surrender", (username) => {
      const room = [...rooms.values()].find((r) =>
        r.players.some((p) => p.username === username)
      );
      if (!room) return callback({ error: "Room not found" });
      room.game.surrender();
      const winner = room.players.find(
        (p) => p.color === room.game.getWinner()
      );
      io.in(room.roomId).emit("gameOver", {
        winner,
        winColor: room.game.getWinner(),
        reason: "surrender",
        gameTime: room.game.getGameDuration(),
        eloResult: room.game.getEloResult(),
        gameMode: room.gameMode,
      });
      io.in(room.roomId).emit("endGame");

      // rooms.delete(room.roomId);
    });

    // 체스말 움직임
    socket.on("onDrop", (moveData, roomId, showWinBar, userColor, callback) => {
      const room = rooms.get(roomId);
      if (!room) {
        callback(false);
        return;
      } else {
        if (userColor !== room.game.getCurrentPlayer()) {
          console.log("not your turn");
          callback(false);
          return;
        }
        if (room.game.getGameType() === "playerVsComputer") {
          console.log("vsComputer");
          if (room.game.makeMove(moveData)) {
            // room.game.increaseMoveIndex();
            if (showWinBar) {
              room.game.setWinChanceAndBestMove();
              // 소켓으로 값보내주기 ?
            }
            // 소켓으로 보드값 보내주기 ?
            (async () => {
              const computerMove = await room.game.makeComakeComputerMove();
              // room.game.increaseMoveIndex();
              if (showWinBar) {
                //소켓으로 값보내주기
              }
              // 보드 보내주기
            })();
          } else {
            callback(false);
            return;
          }
          callback(true);
          return;
        } else {
          console.log("vsPlayer");
          if (room.game.makeMove(moveData)) {
            // room.game.increaseMoveIndex();
            room.fen = room.game.getCurrentBoard();
            room.game.setCurrentPieceSquare("");
            io.in(roomId).emit(
              "move",
              room.game.getCurrentBoard(),
              room.game.getCurrentMove()
            );
            io.in(roomId).emit(
              "updateNotation",
              room.game.getNotation(),
              room.game.chess.history({ verbose: true }),
              room.game.getMoveNumber()
            );
            if (room.game.chess.isGameOver()) {
              const winner = room.players.find(
                (p) => p.color === room.game.getWinner()
              );
              io.in(roomId).emit("gameOver", {
                winner,
                winColor: room.game.getWinner(),
                reason: "gameOver",
                gameTime: room.game.getGameDuration(),
                eloResult: room.game.getEloResult(),
                gameMode: room.gameMode,
              });

              io.in(room.roomId).emit("endGame");
              // rooms.delete(room.roomId);
            }
            callback(true);
            return;
          } else {
            callback(false);
            return;
          }
        }
      }
    });

    // 피스 클릭
    socket.on("pieceClick", (piece, square, userColor, roomId, callback) => {
      const room = rooms.get(roomId);
      if (!room) return;

      if (userColor[0] !== piece[0]) return;
      room.game.setCurrentPieceSquare(square);
      const canMoveSquares = room.game.handleSquareClick(square);
      callback(canMoveSquares);
    });

    // 스퀘어 클릭
    socket.on("squareClick", (roomId, square, callback) => {
      const room = rooms.get(roomId);
      if (!room) return;
      if (room.game.getCurrentPieceSquare() === square) return;
      callback(true, room.game.getCurrentPieceSquare());
    });

    // 업데이트 보드
    socket.on("moveClick", (history, username) => {
      const room = [...rooms.values()].find((r) =>
        r.players.some((p) => p.username === username)
      );
      if (!room) return callback({ error: "Room not found" });
      room.game.setCurrentBoard(history);
      socket.emit("updateBoard", history);
    });

    // 체스말 움직임
    // socket.on("move", (data) => {
    //   console.log("data : ", data);

    //   const room = rooms.get(data.room);
    //   if (!room) return;
    //   const color = data.color;
    //   room.timers[room.currentTurn].stop();
    //   room.currentTurn = color;
    //   console.log(room.currentTurn);
    //   room.timers[room.currentTurn].start();
    //   room.fen = data.fen;
    // const now = Date.now();
    // console.log(now);
    // const elapsedTime = (now - room.lastMoveTime) / 1000; // 경과 시간 (초 단위)
    // console.log(elapsedTime);
    // room.timers[room.currentTurn] -= elapsedTime; // 현재 턴의 타이머 감소

    // if (room.timers[room.currentTurn] <= 0) {
    // io.to(room.roomId).emit("gameOver", {
    // winner: room.currentTurn === "white" ? "black" : "white",
    // reason: "timeout",
    // });
    // rooms.delete(room.roomId);
    // return;
    // }

    // room.lastMoveTime = now;
    // room.currentTurn = room.currentTurn === "white" ? "black" : "white";

    //   socket.to(data.room).emit("move", data.move);
    // });

    socket.on("getRoomInfo", (roomId, callback) => {
      const room = rooms.get(roomId);
      if (!room) return callback({ error: "Room not found" });

      callback(room);
    });

    socket.on("getTimers", (roomId, callback) => {
      const room = rooms.get(roomId);
      if (!room) return callback({ error: "Room not found" });
      const timers = {
        white: room.game.timers.white.getTime(),
        black: room.game.timers.black.getTime(),
      };
      const timeoutPlayer = room.game.checkTimeout();
      const gameOver = room.game.getIsGameOver();
      if (timeoutPlayer === "white" || timeoutPlayer === "black") {
        room.game.handleGameOver();
        const winner = room.players.find(
          (p) => p.color === room.game.getWinner()
        );
        io.in(roomId).emit("gameOver", {
          winner,
          winColor: room.game.getWinner(),
          reason: "timeOut",
          gameTime: room.game.getGameDuration(),
          eloResult: room.game.getEloResult(),
          gameMode: room.gameMode,
        });

        io.in(room.roomId).emit("endGame");
        // rooms.delete(roomId);
      }
      callback({ timers, timeoutPlayer, gameOver });
    });

    // socket.on("timeOver", (roomId) => {
    //   const room = rooms.get(roomId);
    //   if (!room) return;
    //   const winner = room.players.find(
    //     (p) => p.color === room.game.getWinner()
    //   );
    //   io.in(roomId).emit("gameOver", {
    //     winner,
    //     winColor: room.game.getWinner(),
    //     reason: "timeOut",
    //     gameTime: room.game.getGameDuration(),
    //     eloResult: room.game.getEloResult(),
    //     gameMode: room.gameMode,
    //   });
    //   io.in(room.roomId).emit("endGame");
    // });

    socket.on("deleteRoom", (username) => {
      console.log("delete room");
      for (let [roomId, room] of rooms) {
        const player = room.players.find((p) => p.username === username);
        if (player) {
          console.log(`${roomId} ${player.username}`);
          rooms.delete(roomId);

          socket.to(roomId).emit("roomDeleted");
          return;
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
      const gameRooms = Array.from(rooms.values());
      gameRooms.forEach((room) => {
        console.log("disconnect room : ", room);
        const userInRoom = room.players.find(
          (player) => player.socketId === socket.id
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
      console.log(player1Rating);
      console.log(player2Rating);

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

// 게임 모드에 따른 초기 시간 가져오기
function getInitialTime(gameMode) {
  switch (gameMode) {
    case "rapid":
      return 10 * 60 * 1000; // 10분
    case "blitz":
      return 3 * 60 * 1000; // 3분
    case "bullet":
      return 1 * 60 * 1000; // 1분
    default:
      throw new Error(`Unknown game mode: ${gameMode}`);
  }
}
