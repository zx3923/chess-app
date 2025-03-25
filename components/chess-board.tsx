"use client";

import { Square } from "chess.js";
import { socket } from "@/lib/socket";
import { Chessboard } from "react-chessboard";
import { useState, useEffect, Suspense } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

import "./chess-board.css";
import Rating from "./rating";
import { playSound } from "@/lib/sound";
import GameResultModal from "./GameResultModal";
import { msToSec, timeString } from "@/lib/timer";
import { useUser } from "@/lib/context/UserContext";
import { useMenu } from "@/lib/context/MenuContext";
import { redirect, useSearchParams } from "next/navigation";

interface Player {
  id: string;
  username: string;
  color: string;
  rating: number;
}

interface Room {
  roomId: string;
  players: Player[];
  gameMode: "rapid" | "blitz" | "bullet";
  fen: string;
}

interface GameOverData {
  roomId: string;
  eloResult: number;
  gameMode: "blitz" | "bullet" | "rapid";
  gameTime: string;
  reason: string;
  winColor: "white" | "black";
  winner: {
    color: "white" | "black";
    id: number;
    rating: number;
    socketId: string;
    username: string;
  };
}

type Arrow = [Square, Square, (string | undefined)?];
type GameType = "playerVsPlayer" | "playerVsComputer" | null;

function ChessGame() {
  const { user, setUser } = useUser();
  const { isMenuOpen } = useMenu();
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const pathGameType = searchParams.get("pathGameType");

  const [winColor, setWinColor] = useState("");
  const [reason, setReason] = useState("");
  const [gameTime, setGameTime] = useState("0");
  const [userColor, setUserColor] = useState<string>("white");
  const [eloResult, setEloResult] = useState(0);
  const [opponent, setOpponent] = useState<Player | undefined>();
  const [closeModal, setCloseModal] = useState(false);
  const [room, setRoom] = useState<Room>();
  const [fen, setFen] = useState<string>();
  const [prevFen, setPrevFen] = useState<string>();
  const [gameType, setGameType] = useState<GameType>(null);
  const [timers, setTimers] = useState({ white: 180000, black: 180000 });

  const [duration, setDuration] = useState(300);
  const [winChance, setWinChance] = useState(50);
  const [showWinBar, setShowWinBar] = useState(false);
  const [bestMove, setBestMove] = useState<Arrow[]>([]);
  const [canMoveSquares, setCanMoveSquares] = useState({});
  const [showBestMoves, setShowBestMoves] = useState(false);

  const whiteAdvantage = Math.min(Math.max(winChance, 0), 100); // 0~100 제한
  const blackAdvantage = 100 - whiteAdvantage;

  // 새로고침
  useEffect(() => {
    socket.emit(
      "requestGameState",
      { username: user.username, socketId: socket.id },
      (
        roomInfo: any,
        player: any,
        opponent: any,
        showBestMove: any,
        showWinBar: any,
        bestMove: any,
        winChance: any
      ) => {
        if (pathGameType === "computer") {
          setGameType("playerVsComputer");
          if (roomInfo.error) {
            return;
          }
          setUserColor(player.color);
          setRoom(roomInfo);
          if (roomInfo.fen) {
            console.log(roomInfo.fen);
            setFen(roomInfo.fen);
            setPrevFen(roomInfo.fen);
          }
          if (showBestMove) {
            setShowBestMoves(showBestMove);
            setBestMove(bestMove);
          }
          if (showWinBar) {
            setShowWinBar(showWinBar);
            setWinChance(winChance);
          }
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        } else {
          if (roomInfo.error) {
            redirect("/play/online/new");
          }
          if (roomInfo.game.isGameOver) {
            socket.emit("deleteRoom", user.username);
            redirect("/play/online/new");
          }
          console.log(roomInfo);
          setRoom(roomInfo);
          setOpponent(opponent);
          setUserColor(player.color);
          if (roomInfo.fen) {
            setFen(roomInfo.fen);
            setPrevFen(roomInfo.fen);
          }
          startTimer(roomInfo);
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
          redirect(`/play/online/new/${roomInfo.roomId}`);
        }
      }
    );
  }, [user.username]);

  useEffect(() => {
    if (socket) {
      socket.on("colorChange", (color) => {
        setUserColor(color);
      });
      socket.on("barChange", (state) => {
        setShowWinBar(state);
      });
      socket.on("bestMoveChange", (state) => {
        setShowBestMoves(state);
      });
      socket.on("winChanceBar", (winBar) => {
        setWinChance(winBar);
      });
      socket.on("bestMove", (bestMove) => {
        console.log(bestMove);
        setBestMove(bestMove);
      });
    }

    return () => {
      socket.off("colorChange");
      socket.off("barChange");
      socket.off("bestMoveChange");
      socket.off("winChanceBar");
      socket.off("bestMove");
    };
  }, [socket]);

  // 게임시작
  useEffect(() => {
    if (socket) {
      socket.on("gameStart", (data) => {
        if (pathGameType === "computer") {
          console.log(data);
          setRoom(data);
          setUserColor(data.players[0].color);
          setIsLoading(false);
          playSound("start");
        } else {
          console.log(data);
          setRoom(data);
          const player = data.players.find(
            (p: any) => p.username === user.username
          );
          setUserColor(player.color);
          const opponent = data.players.find(
            (p: any) => p.username !== user.username
          );
          console.log(opponent);
          setOpponent(opponent);
          setIsLoading(false);
          startTimer(data);
          playSound("start");
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("gameStart");
      }
    };
  }, [socket]);

  // 게임종료
  useEffect(() => {
    if (socket) {
      socket.on("gameOver", (data: GameOverData) => {
        if (data.reason === "timeOut" || data.reason === "surrender") {
          playSound("gameover");
        } else {
          playSound("#");
        }
        if (pathGameType === "computer") {
          console.log(data);
          setWinColor(data.winColor);
          setReason(data.reason);
          setGameTime(data.gameTime);
          setCloseModal(true);
          socket.emit("computerRoomDelete", data.roomId);
        } else {
          setWinColor(data.winColor);
          setReason(data.reason);
          setGameTime(data.gameTime);
          setCloseModal(true);
          setEloResult(data.eloResult);
          const win = data.winner.id === user.id;

          if (win) {
            setOpponent((prev) =>
              prev
                ? {
                    ...prev,
                    rating: prev.rating - data.eloResult,
                  }
                : prev
            );
          } else {
            setOpponent((prev) =>
              prev
                ? {
                    ...prev,
                    rating: prev.rating + data.eloResult,
                  }
                : prev
            );
          }
          updateRating(data.eloResult, win, data.gameMode);
          setUser((prev) => ({
            ...prev,
            [`${data.gameMode}Rating`]:
              (prev[`${data.gameMode}Rating`] || 0) +
              (win ? data.eloResult : -data.eloResult),
          }));
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("gameOver");
      }
    };
  }, [socket]);

  // 움직임
  useEffect(() => {
    if (socket) {
      socket.on("move", (fen, move) => {
        setFen(fen);
        setPrevFen(fen);
        if (move.captured) {
          playSound(move.san, true);
        } else {
          playSound(move.san);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("move");
      }
    };
  }, [socket]);

  // 컴퓨터 움직임
  useEffect(() => {
    if (socket) {
      socket.on("computerMove", (fen, move) => {
        setFen(fen);
        if (move.captured) {
          playSound(move.san, true);
        } else {
          playSound(move.san);
        }
      });
    }

    return () => {};
  }, [socket]);

  // 업데이트 보드
  useEffect(() => {
    if (socket) {
      socket.on("updateBoard", (history) => {
        setDuration(0);
        setFen(history);
      });
    }
    return () => {
      if (socket) {
        socket.off("updateBoard");
      }
    };
  }, [socket]);

  async function updateRating(
    eloResult: number,
    win: boolean,
    gameMode: string
  ) {
    const response = await fetch("/api/updateRating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        win,
        eloResult,
        gameMode,
      }),
    });
  }

  // 체스말움직임
  function onDrop(sourceSquare: any, targetSquare: any) {
    if (!room) return false;
    if (duration === 0) {
      setDuration(300);
    }
    const roomId = room.roomId;
    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    };
    socket.emit(
      "onDrop",
      moveData,
      roomId,
      // showWinBar,
      userColor,
      (isValidMove: boolean, fen: any, move: any) => {
        if (isValidMove) {
          if (pathGameType === "computer") {
            setFen(fen);
            if (move.captured) {
              playSound(move.san, true);
            } else {
              playSound(move.san);
            }
            if (showBestMoves) {
              setBestMove([]);
            }
            socket.emit("computerMove", roomId);
          }
          return true;
        } else {
          setFen(prevFen);
          return false;
        }
      }
    );
    return true;
  }

  // 타이머 갱신
  const startTimer = (roomInfo: Room) => {
    const interval = setInterval(() => {
      socket.emit(
        "getTimers",
        roomInfo.roomId,
        ({ timers, timeoutPlayer, gameOver }: any) => {
          if (gameOver) {
            clearInterval(interval);
            setTimers({ white: 0, black: 0 });
          }
          if (timeoutPlayer === "white" || timeoutPlayer === "black") {
            setTimers({ white: 0, black: 0 });
            clearInterval(interval);
          }
          setTimers(timers);
        }
      );
    }, 200);

    return () => clearInterval(interval);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handlePieceClick(piece: any, square: any) {
    if (!room) return;
    const roomId = room.roomId;
    socket.emit(
      "pieceClick",
      piece,
      square,
      userColor,
      roomId,
      (canMoveSquares: any) => {
        setCanMoveSquares(canMoveSquares);
      }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleSquareClick(square: any, piece: any) {
    if (!room) return;
    const roomId = room.roomId;
    socket.emit(
      "squareClick",
      roomId,
      square,
      (boolean: boolean, from: string) => {
        if (boolean) {
          onDrop(from, square);
          setCanMoveSquares({});
        }
      }
    );
  }

  function onPieceDragEnd() {
    setCanMoveSquares({});
  }

  const onClose = () => {
    setCloseModal(false);
  };

  return (
    <div
      className={`flex items-center justify-center flex-col mt-24 ${
        isMenuOpen ? "max-[768px]:mt-72" : ""
      }`}
    >
      <div className="text-white flex justify-between items-center w-full mb-4">
        {gameType === "playerVsComputer" ? (
          <div className="text-sm">컴퓨터</div>
        ) : (
          <>
            {opponent ? (
              <div className="flex text-sm gap-1">
                <span>{opponent.username}</span>
                <Rating rating={opponent.rating} />
              </div>
            ) : (
              <div className="text-sm">상대</div>
            )}
          </>
        )}
        {gameType === "playerVsComputer" ? null : (
          <div className="flex gap-6 bg-neutral-700 p-2 px-4 rounded">
            <ClockIcon className="size-6" />
            <p>
              {userColor === "black"
                ? timeString(Number(msToSec(timers.white)))
                : timeString(Number(msToSec(timers.black)))}
            </p>
          </div>
        )}
      </div>
      <div className="w-80 sm:w-[450px] md:w-[620px]">
        {isLoading ? (
          <Chessboard
            boardOrientation={userColor === "white" ? "white" : "black"}
          />
        ) : (
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            boardOrientation={userColor === "white" ? "white" : "black"}
            areArrowsAllowed={true}
            onSquareClick={handleSquareClick}
            onPieceClick={handlePieceClick}
            customSquareStyles={canMoveSquares}
            onPieceDragEnd={onPieceDragEnd}
            animationDuration={duration}
            customArrows={bestMove}
          />
        )}
        {showWinBar ? (
          <div className="w-full h-6 bg-gray-800 rounded-lg overflow-hidden flex border border-gray-600 mt-4">
            <div
              className="bg-black transition-all duration-1000"
              style={{ width: `${blackAdvantage}%` }}
            />
            <div
              className="bg-white transition-all duration-1000"
              style={{ width: `${whiteAdvantage}%` }}
            />
          </div>
        ) : null}
      </div>

      <div className="text-white flex justify-between items-center w-full mt-4">
        <div className="flex text-sm gap-1">
          <span>{user.username}</span>
          {room ? (
            <Rating rating={user[`${room!.gameMode}Rating`] ?? 0} />
          ) : null}
        </div>
        {gameType === "playerVsComputer" ? null : (
          <div className="flex gap-6 bg-white p-2 px-4 rounded text-black">
            <ClockIcon className="size-6" />
            <p>
              {userColor === "white"
                ? timeString(Number(msToSec(timers.white)))
                : timeString(Number(msToSec(timers.black)))}
            </p>
          </div>
        )}
      </div>
      {closeModal ? (
        <GameResultModal
          winColor={winColor}
          reason={reason}
          gameTime={gameTime}
          rating={user[`${room!.gameMode}Rating`]}
          opponentRating={opponent?.rating}
          userColor={userColor}
          eloResult={eloResult}
          onClose={onClose}
        />
      ) : null}
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
