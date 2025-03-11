"use client";

import { Move } from "chess.js";
import { socket } from "@/lib/socket";
import { Chessboard } from "react-chessboard";
import { useState, useEffect, Suspense } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import { usePathname, useSearchParams } from "next/navigation";

import "./chess-board.css";
import { msToSec } from "@/lib/timer";
import useSoundPlayer from "@/lib/sound";
import GameResultModal from "./GameResultModal";
import Game, { Arrow, GameMode } from "@/lib/game";
import { useUser } from "@/lib/context/UserContext";
import { useMenu } from "@/lib/context/MenuContext";
import { useChess } from "@/lib/context/ChessContext";

function ChessGame() {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const { game, setGame } = useChess();
  const [fen, setFen] = useState(game.getCurrentBoard());
  const [over, setOver] = useState(false);
  const searchParams = useSearchParams();
  const path = usePathname();
  const room = searchParams.get("room");
  const [canMoveSquares, setCanMoveSquares] = useState({});
  // const [currentPiece, setCurrentPice] = useState(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [timers, setTimers] = useState({ white: 300000, black: 300000 });
  const { isMenuOpen } = useMenu();
  const [isGameOver, setIsGameOver] = useState(false);
  const { playSound, playMoveSound } = useSoundPlayer();
  const [duration, setDuration] = useState(300);
  const { user } = useUser();
  const [showWinBar, setShowWinBar] = useState(false);
  const [showBestMoves, setShowBestMoves] = useState(false);
  const [winChance, setWinChance] = useState(50);
  const [bestMove, setBestMove] = useState<Arrow[]>([]);

  const whiteAdvantage = Math.min(Math.max(winChance, 0), 100); // 0~100 제한
  const blackAdvantage = 100 - whiteAdvantage;

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
                const newGame = new Game(gameMode, color, 10000);
                setGame(newGame);
              }
            } else {
              console.error("User not authenticated");
            }
          };
          fetchUserData();
        } else {
          // setOver("Failed to fetch room");
          setOver(true);
          console.log(over);
        }
      });
    } else {
      const pathSegments = path.split("/").filter((segment) => segment);
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment === "computer") {
        setGameMode("playerVsComputer");
        const newGame = new Game("playerVsComputer", "white", 1000);
        setGame(newGame);
      }
    }
  }, [room, gameMode, path, setGame]);

  useEffect(() => {
    const handleGameStart = () => {
      // soundPlayer.start();
      playSound("start");
      setFen(game.getCurrentBoard());
      // if (showWinBar) {
      //   game.setWinChanceAndBestMove();
      // }
      if (showBestMoves) {
        if (game.getUserColor() === "black") return;
        setBestMove(game.getBestMove());
      }
    };

    const handleGameOver = (isCheckmate: boolean) => {
      if (!isCheckmate) {
        // soundPlayer.gameover();
        playSound("gameover");
      }
      setIsGameOver(true);
    };

    const handleMove = (move: Move) => {
      // soundPlayer.playMoveSound(move);
      if (move.captured) {
        playMoveSound(move.san, true);
      } else {
        playMoveSound(move.san);
      }
    };

    const handleComputerMove = (move: Move) => {
      // soundPlayer.playMoveSound(move);
      if (move.captured) {
        playMoveSound(move.san, true);
      } else {
        playMoveSound(move.san);
      }
      setFen(game.getCurrentBoard());
    };

    const handleReload = (fen: any) => {
      // console.log(game.getCurrentBoard());
      setDuration(0);
      setFen(fen);
    };

    game.on("gameOver", handleGameOver); // 이벤트 리스너 등록
    game.on("computerMove", handleComputerMove);
    game.on("gameStart", handleGameStart);
    game.on("move", handleMove);
    game.on("reload", handleReload);

    return () => {
      game.off("gameOver", handleGameOver); // 클린업
      game.off("computerMove", handleMove);
      game.off("gameStart", handleGameStart);
      game.off("move", handleMove);
      game.off("reload", handleReload);
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
    }
    if (game.makeMove(moveData)) {
      setFen(game.getCurrentBoard());
      if (room) {
        socket.emit("move", { move: moveData, room });
      }
      // setCurrentPice(null);
      return true;
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
  // useEffect(() => {
  //   if (!game) return;
  //   const intervalTime = game.getGameMode() === "playerVsComputer" ? 2000 : 200;
  //   const interval = setInterval(() => {
  //     if (game.getGameMode() === "playerVsComputer") {
  //       setFen(game.getCurrentBoard());
  //     } else {
  //       if (game) {
  //         const timeoutPlayer = game.checkTimeout();
  //         if (timeoutPlayer) {
  //           // setOver(
  //           //   `Time's up! ${
  //           //     timeoutPlayer === "white" ? "Black" : "White"
  //           //   } wins!`
  //           // );

  //           setOver(true);
  //           game.handleGameOver();
  //           clearInterval(interval);
  //         } else {
  //           setTimers(game.getTimers());
  //         }
  //       }
  //     }
  //   }, intervalTime);

  //   return () => clearInterval(interval);
  // }, [game]);

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
        {user.username}
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
