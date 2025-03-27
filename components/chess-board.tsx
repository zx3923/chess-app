"use client";

import { Move } from "chess.js";
import { socket } from "@/lib/socket";
import { Chessboard } from "react-chessboard";
import { useState, useEffect, Suspense } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

import "./chess-board.css";
import Rating from "./rating";
import { playSound } from "@/lib/sound";
import { Arrow, GameType } from "@/lib/game";
import GameResultModal from "./GameResultModal";
import { msToSec, timeString } from "@/lib/timer";
import { useUser } from "@/lib/context/UserContext";
import { useMenu } from "@/lib/context/MenuContext";
import { useChess } from "@/lib/context/ChessContext";
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
}

function ChessGame() {
  const { user } = useUser();
  const { isMenuOpen } = useMenu();
  const { game, setGame } = useChess();
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const pathGameType = searchParams.get("pathGameType");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [over, setOver] = useState(false);
  const [opponent, setOpponent] = useState<Player | undefined>();
  const [isGameOver, setIsGameOver] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [room, setRoom] = useState<Room>();
  const [fen, setFen] = useState(game.getCurrentBoard());
  const [gameType, setGameType] = useState<GameType>(null);
  const [timers, setTimers] = useState({ white: 180000, black: 180000 });

  const [duration, setDuration] = useState(300);
  const [winChance, setWinChance] = useState(50);
  const [showWinBar, setShowWinBar] = useState(false);
  const [bestMove, setBestMove] = useState<Arrow[]>([]);
  const [canMoveSquares, setCanMoveSquares] = useState({});
  const [showBestMoves, setShowBestMoves] = useState(false);
  const [userColor, setUserColor] = useState("white");

  const whiteAdvantage = Math.min(Math.max(winChance, 0), 100); // 0~100 제한
  const blackAdvantage = 100 - whiteAdvantage;

  useEffect(() => {
    if (socket) {
      socket.on("roomGameOver", (winner) => {
        setIsGameOver(true);
        game.setWinner(winner);
      });
    }
    return () => {
      socket.off("roomGameOver");
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.emit(
        "requestGameState",
        { username: user.username, socketId: socket.id },
        (roomInfo: any, player: any, opponent: any) => {
          if (pathGameType === "computer") {
            setGameType("playerVsComputer");
            if (roomInfo.error) {
              return;
            }
            setUserColor(player.color);
            game.setUserColor(player.color);
            game.setCurrentPlayer(roomInfo.currentTurn);
            setRoom(roomInfo);
            game.setRoomId(roomInfo.roomId);
            if (roomInfo.fen) {
              setFen(roomInfo.fen);
              game.setCurrentBoard(roomInfo.fen);
            }
            if (roomInfo.showBestMove) {
              setShowBestMoves(roomInfo.showBestMove);
              game.setShowBestMoves(roomInfo.showBestMove);
              setBestMove(roomInfo.bestMove);
            }
            if (roomInfo.showWinBar) {
              setShowWinBar(roomInfo.showWinBar);
              game.setShowWinBar(roomInfo.showWinBar);
              setWinChance(roomInfo.winBar);
            }
            if (roomInfo.isGameStarted) {
              game.setIsGameStarted(true);
            }
            setTimeout(() => {
              setIsLoading(false);
            }, 500);
          } else {
            if (roomInfo.error) {
              redirect("/play/online/new");
            }
            console.log(roomInfo);
            // if (roomInfo.game.isGameOver) {
            //   socket.emit("deleteRoom", user.username);
            //   redirect("/play/online/new");
            // }
            setUserColor(player.color);
            game.setUserColor(player.color);
            game.setCurrentPlayer(roomInfo.currentTurn);
            setRoom(roomInfo);
            if (roomInfo.fen) {
              setFen(roomInfo.fen);
              game.setCurrentBoard(roomInfo.fen);
            }
            setRoom(roomInfo);
            setOpponent(opponent);
            setGame(
              "playerVsPlayer",
              player.color,
              roomInfo.timers[player.color].overallTime
            );
            game.setRoomId(roomInfo.roomId);
            game.setIsGameStarted(true);
            startTimer();
            setTimeout(() => {
              setIsLoading(false);
            }, 500);
            redirect(`/play/online/new/${roomInfo.roomId}`);
          }
        }
      );
    }
    return () => {
      if (socket) {
        socket.off("requestGameState");
      }
    };
  }, [socket]);

  // 초기 방 정보
  useEffect(() => {
    if (pathGameType === "computer") {
      setGameType("playerVsComputer");
    } else {
      setGameType("playerVsPlayer");
    }
    const handleGameStart = () => {
      setFen(game.getCurrentBoard());
      const roomId = game.getRoomId();
      setIsLoading(false);
      if (game.getGameType() === "playerVsPlayer") {
        startTimer();
        socket.emit("getRoomInfo", roomId, (roomInfo: any) => {
          if (roomInfo) {
            console.log(roomInfo);
            setRoom(roomInfo);
            if (user.isLoggedIn) {
              const player = roomInfo.players.find(
                (p: any) => p.username === user.username
              );
              setOpponent(() => {
                const opponent: Player | undefined = roomInfo.players.find(
                  (player: any) => player.username !== user.username
                );
                return opponent ?? undefined;
              });
              if (player) {
                setGame(gameType);
              } else {
                console.error("User not authenticated");
              }
            }
          }
        });
      } else if (game.getGameType() === "playerVsComputer") {
        if (game.getUserColor() === "black") {
          computerMove();
        }
      }
      playSound("start");
      setFen(game.getCurrentBoard());
      if (showBestMoves) {
        if (game.getUserColor() === "black") return;
        setBestMove(game.getBestMove());
      }
    };

    const handleGameOver = (isCheckmate: boolean, winner: any) => {
      if (!isCheckmate) {
        playSound("gameover");
      }
      socket.emit("gameover", game.getRoomId(), winner);
      setIsGameOver(true);
    };

    const handleMove = (move: Move) => {
      if (move.captured) {
        playSound(move.san, true);
      } else {
        playSound(move.san);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleComputerMove = (move: Move) => {
      setFen(game.getCurrentBoard());
    };

    const handleReload = (fen: any) => {
      setDuration(0);
      setFen(fen);
    };

    const handleGameType = () => {
      setTimers(game.getTimers());
    };

    game.on("gameOver", handleGameOver); // 이벤트 리스너 등록
    game.on("computerMove", handleComputerMove);
    game.on("gameStart", handleGameStart);
    game.on("move", handleMove);
    game.on("reload", handleReload);
    game.on("gameType", handleGameType);

    return () => {
      game.off("gameOver", handleGameOver); // 클린업
      game.off("computerMove", handleMove);
      game.off("gameStart", handleGameStart);
      game.off("move", handleMove);
      game.off("reload", handleReload);
      game.off("gameType", handleGameType);
    };
  }, [game]);

  useEffect(() => {
    const handleShowWinBar = () => {
      setShowWinBar(game.getShowWinBar());
    };
    const handleShowBestMoves = async (state: any) => {
      setShowBestMoves(state);
      if (state) {
        if (game.getUserColor() === "black") {
          return;
        }
        await game.setWinChanceAndBestMove();
        setBestMove(game.getBestMove());
      } else {
        setBestMove([]);
      }
    };
    const handleBestMove = () => {
      console.log(game.getBestMove());
      setBestMove(game.getBestMove());
    };
    const handleColorChange = (color: any) => {
      setUserColor(color);
    };

    game.on("showWinBar", handleShowWinBar);
    game.on("showBestMoves", handleShowBestMoves);
    game.on("bestMove", handleBestMove);
    game.on("colorChange", handleColorChange);

    return () => {
      game.off("showWinBar", handleShowWinBar);
      game.off("showBestMoves", handleShowBestMoves);
      game.off("bestMove", handleBestMove);
      game.off("colorChange", handleColorChange);
    };
  }, [game]);

  // 체스말움직임
  function onDrop(sourceSquare: any, targetSquare: any) {
    if (game.getCurrentPlayer() !== game.getUserColor()) return false;
    if (duration === 0) {
      setDuration(300);
    }
    const moveData = { from: sourceSquare, to: targetSquare, promotion: "q" };
    if (game.getGameType() === "playerVsComputer") {
      if (game.makeMove(moveData)) {
        setFen(game.getCurrentBoard());
        setCanMoveSquares({});
        game.setCurrentPieceSquare("");
        setBestMove([]);
        socket.emit("computerModeMove", {
          roomId: game.getRoomId(),
          color: game.getCurrentPlayer(),
          fen: game.getCurrentBoard(),
          notation: game.getNotation(),
          moveHistory: game.getLastHistory(),
          moveRow: game.getMoveRow(),
          moveIndex: game.getMoveIndex(),
          bestMove: game.getBestMove(),
          winBar: game.getWinChance(),
        });
        computerMove();
      } else {
        setCanMoveSquares({});
        game.setCurrentPieceSquare("");
      }
      return true;
    } else {
      console.log(1);
      if (game.makeMove(moveData)) {
        console.log(moveData);
        console.log(game.getCurrentBoard());
        setFen(game.getCurrentBoard());
        setCanMoveSquares({});
        game.setCurrentPieceSquare("");
        const roomId = game.getRoomId();
        if (roomId) {
          socket.emit("move", {
            move: moveData,
            room: roomId,
            color: game.getCurrentPlayer(),
            fen: game.getCurrentBoard(),
            notation: game.getNotation(),
            moveHistory: game.getLastHistory(),
            moveRow: game.getMoveRow(),
            moveIndex: game.getMoveIndex(),
          });
        }
        return true;
      }
    }
    return false;
  }

  // 컴퓨터가 움직인 후 소켓 이벤트를 보냄
  async function computerMove() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const computerMove = await game.makeComputerMove(); // 비동기 완료 후 진행
    if (showWinBar) {
      setWinChance(game.getWinChance());
    }
    setFen(game.getCurrentBoard());

    socket.emit("computerModeMove", {
      roomId: game.getRoomId(),
      color: game.getCurrentPlayer(),
      fen: game.getCurrentBoard(),
      notation: game.getNotation(),
      moveHistory: game.getLastHistory(),
      moveRow: game.getMoveRow(),
      moveIndex: game.getMoveIndex(),
      bestMove: game.getBestMove(),
      winBar: game.getWinChance(),
    });
  }

  // 상대 움직임 반영
  useEffect(() => {
    socket.on("move", (move) => {
      game.makeMove(move);
      setFen(game.getCurrentBoard());
    });
  }, [game]);

  // 타이머 갱신
  const startTimer = () => {
    if (!game) return;
    if (!game.getIsGameStarted()) return;

    const interval = setInterval(() => {
      if (game) {
        const timeoutPlayer = game.checkTimeout();
        if (timeoutPlayer) {
          setOver(true);
          game.handleGameOver();
          clearInterval(interval);
        } else {
          socket.emit("getTimers", game.getRoomId(), ({ timers }: any) => {
            if (!timers) {
              clearInterval(interval);
            }
            setTimers(timers);
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handlePieceClick(piece: any, square: any) {
    if (!game.getIsGameStarted() || game.getIsGameOver()) {
      return;
    }
    // 상대 피스 클릭시
    if (game.getUserColor()[0] !== piece[0]) return;

    game.setCurrentPieceSquare(square);
    const canMoveSquares = game.handleSquareClick(square);
    setCanMoveSquares(canMoveSquares);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleSquareClick(square: any, piece: any) {
    if (!game.getIsGameStarted() || game.getIsGameOver()) {
      return;
    }
    if (game.getCurrentPieceSquare() === square) return;
    onDrop(game.getCurrentPieceSquare(), square);
  }

  function onPieceDragEnd() {
    setCanMoveSquares({});
  }

  const onClose = () => {
    setIsGameOver(false);
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
                ? timeString(Number(msToSec(timers?.white ?? 0)))
                : timeString(Number(msToSec(timers?.black ?? 0)))}
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
            <>
              {gameType === "playerVsComputer" ? null : (
                <Rating rating={user[`${room!.gameMode}Rating`] ?? 0} />
              )}
            </>
          ) : null}
        </div>
        {gameType === "playerVsComputer" ? null : (
          <div className="flex gap-6 bg-white p-2 px-4 rounded text-black">
            <ClockIcon className="size-6" />
            <p>
              {userColor === "white"
                ? timeString(Number(msToSec(timers?.white ?? 0)))
                : timeString(Number(msToSec(timers?.black ?? 0)))}
            </p>
          </div>
        )}
      </div>
      {isGameOver ? (
        <GameResultModal winner={game.getWinner()} onClose={onClose} />
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
