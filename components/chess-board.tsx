import { socket } from "@/lib/socket";
import { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { useSearchParams } from "next/navigation";

import "./chess-board.css";
import { msToSec } from "@/lib/timer";
import Game, { GameMode } from "@/lib/game";

export default function ChessGame() {
  const [gameMode, setGameMode] = useState<GameMode>("playerVsPlayer");
  const [game, setGame] = useState<Game>(
    () => new Game("playerVsPlayer", "white", 0)
  );

  const [fen, setFen] = useState(game.getCurrentBoard());
  const [over, setOver] = useState("");
  const searchParams = useSearchParams();
  const room = searchParams.get("room");

  const [userColor, setUserColor] = useState("white");
  const [timers, setTimers] = useState({ white: 300000, black: 300000 });

  // 초기 방 정보
  useEffect(() => {
    if (room) {
      socket.emit("getRoomInfo", room, (roomInfo: any) => {
        if (roomInfo) {
          const fetchUserData = async () => {
            const response = await fetch("/api/getUser");
            if (response.ok) {
              const userData = await response.json();
              console.log(roomInfo);
              console.log(userData);
              const player = roomInfo.players.find(
                (p: any) => p.username === userData.user_name
              );
              if (player) {
                const color = player.color;
                setUserColor(color);
                const newGame = new Game(gameMode, color, 10000);
                setGame(newGame);
              }
            } else {
              console.error("User not authenticated");
            }
          };
          fetchUserData();
        } else {
          setOver("Failed to fetch room");
        }
      });
    }
  }, [room]);

  useEffect(() => {
    if (game.getIsGameOver()) {
      setOver("Game Over");
    }
  }, [fen, game]);

  // 체스말움직임
  function onDrop(sourceSquare: any, targetSquare: any) {
    if (game.getCurrentPlayer() !== userColor) return false;
    const moveData = { from: sourceSquare, to: targetSquare, promotion: "q" };
    if (game.makeMove(moveData)) {
      setFen(game.getCurrentBoard());
      if (room) {
        socket.emit("move", { move: moveData, room });
      }
      return true;
    }
    return false;
  }

  // 상대 움직임 반영
  useEffect(() => {
    socket.on("move", (move) => {
      console.log(move);
      game.makeMove(move);
      setFen(game.getCurrentBoard());
    });
  }, [game]);

  // 타이머 갱신
  useEffect(() => {
    const interval = setInterval(() => {
      if (game) {
        const timeoutPlayer = game.checkTimeout();
        if (timeoutPlayer) {
          setOver(
            `Time's up! ${timeoutPlayer === "white" ? "Black" : "White"} wins!`
          );
          game.handleGameOver();
          clearInterval(interval);
        } else {
          setTimers(game.getTimers());
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [game]);

  useEffect(() => {
    if (game) {
      game.play();
    }
  }, [game]);

  // 게임 모드 선택 UI 구현
  return (
    <>
      <div className="game-mode-selector">
        <button onClick={() => setGameMode("playerVsPlayer")}>
          Player vs Player
        </button>
        <button onClick={() => setGameMode("playerVsComputer")}>
          Player vs Computer
        </button>
      </div>

      <div className="flex items-center justify-center flex-col h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
        <div className="text-white">
          {userColor === "white" ? "black" : "white"}
          <div>
            {userColor === "black"
              ? msToSec(timers.white)
              : msToSec(timers.black)}
          </div>
        </div>
        <div className="w-full max-w-[500px]">
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            boardOrientation={userColor === "white" ? "white" : "black"}
          />
        </div>

        <div className="text-white">
          {userColor}
          <div>
            {userColor === "white"
              ? msToSec(timers.white)
              : msToSec(timers.black)}
          </div>
        </div>
      </div>
    </>
  );
}
