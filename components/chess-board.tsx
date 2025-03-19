"use client";

import { Move } from "chess.js";
import { socket } from "@/lib/socket";
import { Chessboard } from "react-chessboard";
import { useState, useEffect, Suspense } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

import "./chess-board.css";
import { playSound } from "@/lib/sound";
import { Arrow, GameMode } from "@/lib/game";
import GameResultModal from "./GameResultModal";
import { msToSec, timeString } from "@/lib/timer";
import { useUser } from "@/lib/context/UserContext";
import { useMenu } from "@/lib/context/MenuContext";
import { useChess } from "@/lib/context/ChessContext";

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [over, setOver] = useState(false);
  const [opponent, setOpponent] = useState<Player | undefined>();
  const [isGameOver, setIsGameOver] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [room, setRoom] = useState<Room>();
  const [fen, setFen] = useState(game.getCurrentBoard());
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [timers, setTimers] = useState({ white: 180000, black: 180000 });

  const [duration, setDuration] = useState(300);
  const [winChance, setWinChance] = useState(50);
  const [showWinBar, setShowWinBar] = useState(false);
  const [bestMove, setBestMove] = useState<Arrow[]>([]);
  const [canMoveSquares, setCanMoveSquares] = useState({});
  const [showBestMoves, setShowBestMoves] = useState(false);

  const whiteAdvantage = Math.min(Math.max(winChance, 0), 100); // 0~100 제한
  const blackAdvantage = 100 - whiteAdvantage;

  // useEffect(() => {
  //   socket.emit(
  //     "requestGameState",
  //     { username: user.username },
  //     (roomInfo: any, player: any, opponent: any) => {
  //       setRoom(roomInfo);
  //       setOpponent(opponent);
  //       setGame(
  //         "playerVsPlayer",
  //         player.color,
  //         roomInfo.timers[player.color].overallTime
  //       );
  //       game.setRoomId(roomInfo.roomId);
  //       game.setIsGameStarted(true);
  //       setFen(roomInfo.fen);
  //       startTimer();
  //     }
  //   );
  // }, [user.username]);

  // 초기 방 정보
  useEffect(() => {
    const handleGameStart = () => {
      setFen(game.getCurrentBoard());
      const roomId = game.getRoomId();
      if (game.getGameMode() === "playerVsPlayer") {
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
                setGame(gameMode);
              } else {
                console.error("User not authenticated");
              }
            }
          }
        });
      } else if (roomId === "computer") {
        setGameMode("playerVsComputer");
        setGame("playerVsComputer", "white");
      }
      playSound("start");
      setFen(game.getCurrentBoard());
      if (showBestMoves) {
        if (game.getUserColor() === "black") return;
        setBestMove(game.getBestMove());
      }
    };

    const handleGameOver = (isCheckmate: boolean) => {
      if (!isCheckmate) {
        playSound("gameover");
      }
      socket.emit("gameover", game.getRoomId());
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
      // soundPlayer.playMoveSound(move);
      // if (move.captured) {
      //   console.log(3);
      //   const captureAudio = new Audio("/audios/capture.mp3");
      //   captureAudio.play();
      //   playMoveSound(move.san, true);
      // } else {
      //   console.log(4);
      //   const moveAudio = new Audio("/audios/move.mp3");
      //   moveAudio.play();
      //   playMoveSound(move.san);
      // }
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
    game.on("showWinBar", handleShowWinBar);

    return () => {
      game.off("showWinBar", handleShowWinBar);
    };
  }, [showWinBar, game]);

  useEffect(() => {
    const handleShowBestMoves = async (state: any) => {
      setShowBestMoves(state);
      if (state) {
        if (game.getUserColor() === "black") {
          return;
        }
        // await game.setBestMove();
        await game.setWinChanceAndBestMove();
        setBestMove(game.getBestMove());
      } else {
        setBestMove([]);
      }
    };
    game.on("showBestMoves", handleShowBestMoves);

    return () => {
      game.off("showBestMoves", handleShowBestMoves);
    };
  }, [showBestMoves, bestMove, game]);

  useEffect(() => {
    const handleBestMove = () => {
      console.log(game.getBestMove());
      setBestMove(game.getBestMove());
    };

    game.on("bestMove", handleBestMove);

    return () => {
      game.off("bestMove", handleBestMove);
    };
  });

  // 체스말움직임
  function onDrop(sourceSquare: any, targetSquare: any) {
    if (game.getCurrentPlayer() !== game.getUserColor()) return false;
    if (duration === 0) {
      setDuration(300);
    }
    const moveData = { from: sourceSquare, to: targetSquare, promotion: "q" };
    if (game.getGameMode() === "playerVsComputer") {
      if (game.makeMove(moveData)) {
        // if (showWinBar) {
        //   game.setWinChanceAndBestMove();
        //   setWinChance(game.getWinChance());
        // }
        setFen(game.getCurrentBoard());
        setCanMoveSquares({});
        game.setCurrentPieceSquare("");
        setBestMove([]);
        (async () => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const computerMove = await game.makeComputerMove();
          if (showWinBar) {
            setWinChance(game.getWinChance());
          }
          setFen(game.getCurrentBoard());
          // setCurrentPice(null);
        })();
      } else {
        setCanMoveSquares({});
        game.setCurrentPieceSquare("");
      }
      return true;
    } else {
      if (game.makeMove(moveData)) {
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
          });
        }
        // setCurrentPice(null);
        return true;
      }
    }

    // setCurrentPice(null);
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
  const startTimer = () => {
    console.log(game.getRoomId());
    if (!game) return;
    if (!game.getIsGameStarted()) return;
    console.log(game.getRoomId());

    const interval = setInterval(() => {
      if (game) {
        const timeoutPlayer = game.checkTimeout();
        if (timeoutPlayer) {
          setOver(true);
          game.handleGameOver();
          clearInterval(interval);
        } else {
          // setTimers(game.getTimers());
          socket.emit("getTimers", game.getRoomId(), ({ timers }: any) => {
            setTimers(timers);
          });
        }
      }
    }, 200);

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
        {opponent ? (
          <div className="flex text-sm gap-1">
            <span>{opponent.username}</span>
            <span className="text-gray-500">({opponent.rating})</span>
          </div>
        ) : (
          <>상대</>
        )}
        {gameMode === "playerVsComputer" ? null : (
          <div className="flex gap-6 bg-neutral-700 p-2 px-4 rounded">
            <ClockIcon className="size-6" />
            <p>
              {game.getUserColor() === "black"
                ? timeString(Number(msToSec(timers.white)))
                : timeString(Number(msToSec(timers.black)))}
            </p>
          </div>
        )}
      </div>
      <div className="w-80 sm:w-[450px] md:w-[620px]">
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          boardOrientation={game.getUserColor() === "white" ? "white" : "black"}
          areArrowsAllowed={true}
          onSquareClick={handleSquareClick}
          onPieceClick={handlePieceClick}
          customSquareStyles={canMoveSquares}
          onPieceDragEnd={onPieceDragEnd}
          animationDuration={duration}
          customArrows={bestMove}
        />
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
          <span className="text-gray-500">
            {room ? <>({user[`${room!.gameMode}Rating`]})</> : null}
          </span>
        </div>
        {gameMode === "playerVsComputer" ? null : (
          <div className="flex gap-6 bg-white p-2 px-4 rounded text-black">
            <ClockIcon className="size-6" />
            <p>
              {game.getUserColor() === "white"
                ? timeString(Number(msToSec(timers.white)))
                : timeString(Number(msToSec(timers.black)))}
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
