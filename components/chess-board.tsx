"use client";

import { socket } from "@/lib/socket";
import { useState, useEffect, Suspense } from "react";
import { Chessboard } from "react-chessboard";
import { usePathname, useSearchParams } from "next/navigation";
import { ClockIcon } from "@heroicons/react/24/outline";

import "./chess-board.css";
import { msToSec } from "@/lib/timer";
import Game, { GameMode } from "@/lib/game";
import { useChess } from "@/lib/context/ChessContext ";
import { useMenu } from "@/lib/context/MenuContext";

function ChessGame() {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  // const [game, setGame] = useState<Game>(
  //   () => new Game("playerVsPlayer", "white", 0)
  // );

  const { game, setGame } = useChess();
  const [fen, setFen] = useState(game.getCurrentBoard());
  const [over, setOver] = useState("");
  const searchParams = useSearchParams();
  const path = usePathname();
  const room = searchParams.get("room");

  // const [userColor, setUserColor] = useState("white");
  const [timers, setTimers] = useState({ white: 300000, black: 300000 });
  const { isMenuOpen } = useMenu();

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
                // setUserColor(color);
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
          console.log(over);
        }
      });
    } else {
      const pathSegments = path.split("/").filter((segment) => segment);
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment === "computer") {
        setGameMode("playerVsComputer");
        console.log("?!");
        const newGame = new Game("playerVsComputer", "white", 1000);
        setGame(newGame);
      }
    }
  }, [room, gameMode, path, setGame]);

  useEffect(() => {
    if (game.getIsGameOver()) {
      setOver("Game Over");
    }
  }, [fen, game]);

  // 체스말움직임
  function onDrop(sourceSquare: any, targetSquare: any) {
    if (game.getCurrentPlayer() !== game.getUserColor()) return false;
    const moveData = { from: sourceSquare, to: targetSquare, promotion: "q" };
    if (game.getGameMode() === "playerVsComputer") {
      if (game.makeMove(moveData)) {
        console.log(gameMode);
        setFen(game.getCurrentBoard());
        (async () => {
          const computerMove = await game.makeComputerMove();
          console.log(computerMove);
          setFen(game.getCurrentBoard());
        })();
      }
      return true;
    }
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

  return (
    <div
      className={`flex items-center justify-center flex-col max-[768px]:mt-24 ${
        isMenuOpen ? "max-[768px]:mt-72" : ""
      }`}
    >
      <div className="text-white flex justify-between items-center w-full mb-4">
        {game.getUserColor() === "white" ? "black" : "white"}
        {gameMode === "playerVsComputer" ? null : (
          <div className="flex gap-6 bg-neutral-700 p-2 px-4 rounded">
            <ClockIcon className="size-6" />
            <p>
              {game.getUserColor() === "black"
                ? msToSec(timers.white)
                : msToSec(timers.black)}
            </p>
          </div>
        )}
      </div>
      <div className="w-96 sm:w-[450px] md:w-[620px]">
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          boardOrientation={game.getUserColor() === "white" ? "white" : "black"}
        />
      </div>

      <div className="text-white flex justify-between items-center w-full mt-4">
        {game.getUserColor()}
        {gameMode === "playerVsComputer" ? null : (
          <div className="flex gap-6 bg-white p-2 px-4 rounded text-black">
            <ClockIcon className="size-6" />
            <p>
              {game.getUserColor() === "white"
                ? msToSec(timers.white)
                : msToSec(timers.black)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChessGameBoard() {
  return (
    <Suspense>
      <ChessGame />
    </Suspense>
  );
}
