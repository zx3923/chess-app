"use client";

import { Move } from "chess.js";
import { useEffect, useRef, useState } from "react";
import {
  FlagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

import { useChess } from "@/lib/context/ChessContext";
import { socket } from "@/lib/socket";
import { useUser } from "@/lib/context/UserContext";
import { redirect } from "next/navigation";

export default function NewPage() {
  const { game } = useChess();
  const { user } = useUser();
  const [isGameOver, setIsGameOver] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMove, setSelectedMove] = useState<number>(-1);
  const [notation, setNotation] = useState<
    { moveRow: number; whiteMove: string; blackMove: string }[]
  >([]);

  const [history, setHistory] = useState<Move[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => {
      if (mounted) {
        socket.emit("deleteRoom", user.username);
      }
    };
  }, [mounted]);

  // 스크롤 액션
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notation]);

  // 새로고침
  useEffect(() => {
    if (socket) {
      socket.emit(
        "requestNotation",
        { username: user.username },
        (notation: any, history: any, moveRow: any, moveIndex: any) => {
          if (notation.error) {
            return;
          }
          console.log(notation);
          setNotation(notation);
          game.setNotation(notation);
          game.setMoveHistory(history);
          game.setMoveRow(moveRow);
          game.setMoveIndex(moveIndex);
          setHistory(history);
          setSelectedMove(moveIndex);
          // setIsStarted(true);
        }
      );
    }
    return () => {
      if (socket) {
        socket.off("requestNotation");
      }
    };
  }, [socket]);

  useEffect(() => {
    const handleGameOver = () => {
      setIsGameOver(true);
    };

    const handleMove = (move: any, history: Move[]) => {
      console.log(game.getNotation());
      setNotation([...game.getNotation()]);
      const newMove = history.pop();
      if (newMove) {
        setHistory((prev) => [...prev, newMove]);
      }
      setSelectedMove((prev) => prev + 1);
    };

    game.on("gameOver", handleGameOver);
    game.on("updateNotation", handleMove);

    return () => {
      game.off("gameOver", handleGameOver);
      game.off("updateNotation", handleMove);
    };
  }, [game]);

  const handleNewGameBtn = () => {
    game.restartGame();
    // setIsGameOver(false);
    // setNotation([]);
    socket.emit("deleteRoom", user.username);
    redirect("/play/online/new");
  };

  const handleSurrender = () => {
    game.surrender(game.getUserColor());
  };

  const handlePrevMove = () => {
    if (selectedMove === -1 || selectedMove === 0) return;
    const prevMove = selectedMove - 1;
    setSelectedMove(prevMove);
    handleMoveClick(
      Math.floor(prevMove / 2),
      prevMove % 2 === 1 ? "black" : "white"
    );
  };

  const handleNextMove = () => {
    if (selectedMove === -1 || selectedMove >= notation.length * 2 - 1) return;
    const nextMove = selectedMove + 1;
    setSelectedMove(nextMove);
    handleMoveClick(
      Math.floor(nextMove / 2),
      nextMove % 2 === 1 ? "black" : "white"
    );
  };

  const handleMoveClick = (moveNumber: number, color: "white" | "black") => {
    const moveIndex = moveNumber * 2 + (color === "black" ? 1 : 0);
    setSelectedMove(moveIndex);
    game.setReloadBoard(
      history[color === "white" ? moveNumber * 2 : moveNumber * 2 + 1].after
    );
  };

  return (
    <div className="bg-neutral-900 min-h-[600px] w-[300px] text-white max-[768px]:w-full rounded flex flex-col justify-center items-center gap-4 mt-24 max-[768px]:mt-0">
      <div className="w-full max-w-md mx-auto p-4 bg-neutral-900 rounded-lg shadow text-white">
        <h2 className="text-xl font-bold mb-4 text-center">체스 기보</h2>
        <div className="rounded overflow-hidden">
          <div ref={scrollRef} className="max-h-[210px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-800">
                  <th className="py-2 px-4 text-left font-medium text-gray-200 w-1/5">
                    #
                  </th>
                  <th className="py-2 px-4 text-left font-medium text-gray-200 w-2/5">
                    백
                  </th>
                  <th className="py-2 px-4 text-left font-medium text-gray-200 w-2/5">
                    흑
                  </th>
                </tr>
              </thead>
              <tbody className="max-h-7">
                {notation.map((move, index) => (
                  <tr
                    key={index}
                    className={
                      index % 2 === 1 ? "bg-neutral-900" : "bg-neutral-700"
                    }
                  >
                    <td className="py-2 px-4">{move.moveRow}.</td>
                    <td className="py-2 px-4">
                      <span
                        className={`hover:cursor-pointer ${
                          selectedMove === index * 2
                            ? "bg-neutral-500 p-1 rounded"
                            : ""
                        }`}
                        onClick={() => handleMoveClick(index, "white")}
                      >
                        {move.whiteMove}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`hover:cursor-pointer ${
                          selectedMove === index * 2 + 1
                            ? "bg-neutral-500 p-1 rounded"
                            : ""
                        }`}
                        onClick={() => handleMoveClick(index, "black")}
                      >
                        {move.blackMove}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="border-t-[1px] border-neutral-700 w-full flex justify-center">
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleSurrender}
            className="p-3 px-5 bg-neutral-600 rounded hover:bg-neutral-500"
          >
            <FlagIcon className="size-5" />
          </button>
          <button
            onClick={handlePrevMove}
            className="p-3 px-5 bg-neutral-600 rounded hover:bg-neutral-500"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <button
            onClick={handleNextMove}
            className="p-3 px-5 bg-neutral-600 rounded hover:bg-neutral-500"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </div>
      </div>
      {game.getIsGameOver() ? (
        <>
          <button
            className="text-white bg-purple-500 w-11/12 rounded hover:bg-purple-700 p-4"
            onClick={handleNewGameBtn}
          >
            새로운 게임
          </button>
        </>
      ) : null}
    </div>
  );
}
