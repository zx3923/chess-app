"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  FlagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

import Game, { Player } from "@/lib/game";
import { useChess } from "@/lib/context/ChessContext";
import { Move } from "chess.js";
import ToggleSwitch from "@/components/toggle-switch";

export default function PlayComputer() {
  const { game, setGame } = useChess();
  const [selectColor, setSelectColor] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMove, setSelectedMove] = useState<number>(-1);
  const [showWinBar, setShowWinBar] = useState(false);
  const [showBestMoves, setShowBestMoves] = useState(false);

  const [notation, setNotation] = useState<
    { moveNumber: number; whiteMove: string; blackMove: string }[]
  >([]);

  const [history, setHistory] = useState<Move[]>([]);

  useEffect(() => {
    game.setGameMode("playerVsComputer");
  }, []);

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

  const handleColorChange = (num: number) => {
    setSelectColor(num);
    let color: Player = "white";
    if (num === 0) {
      color = "white";
    } else if (num === 1) {
      color = "black";
    } else if (num === 2) {
      color = Math.random() < 0.5 ? "white" : "black";
    }
    game.setUserColor(color);
    const newGame = new Game("playerVsComputer", color, 0);
    setGame("playerVsComputer", color);
  };

  const hnandleStartBtn = () => {
    game.play();
    setIsStarted(true);
  };

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
    game.setCurrentBoard(
      history[color === "white" ? moveNumber * 2 : moveNumber * 2 + 1].after
    );
  };

  return (
    <div className="bg-neutral-900 h-[700px] w-[300px] text-white max-[768px]:w-full rounded flex flex-col justify-center items-center gap-4 mt-24 max-[768px]:mt-0">
      {isStarted ? (
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
      ) : (
        <div className="flex gap-2">
          <div
            className={`size-11 rounded flex justify-center items-center ${
              selectColor === 0 ? "border-2 border-purple-500" : null
            }`}
          >
            <button
              className="size-8 bg-white rounded"
              onClick={() => handleColorChange(0)}
            >
              <Image
                src="/king_white.png"
                alt="king_white"
                width={100}
                height={100}
              />
            </button>
          </div>
          <div
            className={`size-11 rounded flex justify-center items-center ${
              selectColor === 2 ? "border-2 border-purple-500" : null
            }`}
          >
            <button
              className="size-8 bg-white rounded"
              onClick={() => handleColorChange(2)}
            >
              <Image
                src="/chess_board.png"
                alt="chess_board"
                width={100}
                height={100}
              />
            </button>
          </div>
          <div
            className={`size-11 rounded flex justify-center items-center ${
              selectColor === 1 ? "border-2 border-purple-500" : null
            }`}
          >
            <button
              className="size-8 bg-white rounded"
              onClick={() => handleColorChange(1)}
            >
              <Image
                src="/king_black.png"
                alt="king_black"
                width={100}
                height={100}
              />
            </button>
          </div>
        </div>
      )}
      {isStarted ? (
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
      ) : (
        <>
          <button
            className="text-white bg-purple-500 w-11/12 rounded hover:bg-purple-700 p-4"
            onClick={hnandleStartBtn}
          >
            플레이
          </button>
          <div className="w-full max-w-md mx-auto p-6 bg-neutral-900 rounded-lg shadow text-white">
            <h2 className="text-xl font-bold mb-6 text-center">설정</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <ToggleSwitch
                  label="평가 막대"
                  isOn={showWinBar}
                  onToggle={setShowWinBar}
                />
                <span className="text-sm text-gray-400">
                  {showWinBar ? "켜짐" : "꺼짐"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <ToggleSwitch
                  label="수 보이기"
                  isOn={showBestMoves}
                  onToggle={setShowBestMoves}
                />
                <span className="text-sm text-gray-400">
                  {showBestMoves ? "켜짐" : "꺼짐"}
                </span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-neutral-800 rounded text-sm">
              <p className="font-medium mb-2">현재 설정:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>평가 막대: {showWinBar ? "활성화됨" : "비활성화됨"}</li>
                <li>수 보이기: {showBestMoves ? "활성화됨" : "비활성화됨"}</li>
              </ul>
            </div>
          </div>
        </>
      )}
      {isGameOver ? (
        <>
          <div className="flex gap-2">
            <div
              className={`size-11 rounded flex justify-center items-center ${
                selectColor === 0 ? "border-2 border-purple-500" : null
              }`}
            >
              <button
                className="size-8 bg-white rounded"
                onClick={() => handleColorChange(0)}
              >
                <Image
                  src="/king_white.png"
                  alt="king_white"
                  width={100}
                  height={100}
                />
              </button>
            </div>
            <div
              className={`size-11 rounded flex justify-center items-center ${
                selectColor === 2 ? "border-2 border-purple-500" : null
              }`}
            >
              <button
                className="size-8 bg-white rounded"
                onClick={() => handleColorChange(2)}
              >
                <Image
                  src="/chess_board.png"
                  alt="chess_board"
                  width={100}
                  height={100}
                />
              </button>
            </div>
            <div
              className={`size-11 rounded flex justify-center items-center ${
                selectColor === 1 ? "border-2 border-purple-500" : null
              }`}
            >
              <button
                className="size-8 bg-white rounded"
                onClick={() => handleColorChange(1)}
              >
                <Image
                  src="/king_black.png"
                  alt="king_black"
                  width={100}
                  height={100}
                />
              </button>
            </div>
          </div>
          <button
            className="text-white bg-purple-500 w-11/12 rounded hover:bg-purple-700 p-4"
            onClick={handleRestartBtn}
          >
            재대결
          </button>
          <div className="w-full max-w-md mx-auto p-6 bg-neutral-900 rounded-lg shadow text-white">
            <h2 className="text-xl font-bold mb-6 text-center">설정</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <ToggleSwitch
                  label="평가 막대"
                  isOn={showWinBar}
                  onToggle={setShowWinBar}
                />
                <span className="text-sm text-gray-400">
                  {showWinBar ? "켜짐" : "꺼짐"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <ToggleSwitch
                  label="수 보이기"
                  isOn={showBestMoves}
                  onToggle={setShowBestMoves}
                />
                <span className="text-sm text-gray-400">
                  {showBestMoves ? "켜짐" : "꺼짐"}
                </span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-neutral-800 rounded text-sm">
              <p className="font-medium mb-2">현재 설정:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>평가 막대: {showWinBar ? "활성화됨" : "비활성화됨"}</li>
                <li>수 보이기: {showBestMoves ? "활성화됨" : "비활성화됨"}</li>
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
