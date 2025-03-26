"use client";

import { Move } from "chess.js";
import { useEffect, useRef, useState } from "react";
import {
  FlagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

import { useChess } from "@/lib/context/ChessContext";

export default function NewPage() {
  const { game } = useChess();
  const [isGameOver, setIsGameOver] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMove, setSelectedMove] = useState<number>(-1);
  const [notation, setNotation] = useState<
    { moveNumber: number; whiteMove: string; blackMove: string }[]
  >([]);

  const [history, setHistory] = useState<Move[]>([]);

  // 스크롤 액션
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notation]);

  useEffect(() => {
    const handleGameOver = () => {
      setIsGameOver(true);
    };

    const handleMove = (move: any, history: Move[]) => {
      setNotation((prev) => {
        if (move.color === "w") {
          const movedata = {
            moveNumber: prev.length + 1,
            whiteMove: move.san,
            blackMove: "",
          };
          return [...prev, movedata];
        } else {
          const updated = [...prev];
          updated[updated.length - 1].blackMove = move.san;
          return updated;
        }
      });
      setHistory(history);
      setSelectedMove((prev) => prev + 1);
    };

    game.on("gameOver", handleGameOver);
    game.on("move", handleMove);

    return () => {
      game.off("gameOver", handleGameOver);
      game.off("move", handleMove);
    };
  }, [game]);

  const handleRestartBtn = () => {
    game.restartGame();
    setIsGameOver(false);
    setNotation([]);
  };

  const handleSurrender = () => {
    game.surrender();
  };

  const handlePrevMove = () => {
    if (selectedMove === -1 || selectedMove === 0) return;
    console.log(selectedMove);
    const prevMove = selectedMove - 1;
    setSelectedMove(prevMove);
    handleMoveClick(
      Math.floor(prevMove / 2),
      prevMove % 2 === 1 ? "black" : "white"
    );
  };

  const handleNextMove = () => {
    if (selectedMove === -1 || selectedMove >= notation.length * 2 - 1) return;
    console.log(selectedMove);
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
    <div className="bg-neutral-900 h-[700px] w-[300px] text-white max-[768px]:w-full rounded flex flex-col justify-center items-center gap-4 mt-24 max-[768px]:mt-0">
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
                    <td className="py-2 px-4">{move.moveNumber}.</td>
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
      {isGameOver ? (
        <>
          <button
            className="text-white bg-purple-500 w-11/12 rounded hover:bg-purple-700 p-4"
            onClick={handleRestartBtn}
          >
            재대결
          </button>
        </>
      ) : null}
    </div>
  );
}
