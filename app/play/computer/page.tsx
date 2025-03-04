"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FlagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

import Game, { Player } from "@/lib/game";
import { useChess } from "@/lib/context/ChessContext ";

export default function PlayComputer() {
  const { game, setGame } = useChess();
  const [selectColor, setSelectColor] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

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
    setGame(newGame);
  };

  const hnandleStartBtn = () => {
    game.play();
    setIsStarted(true);
  };

  const handleRestartBtn = () => {
    game.restartGame();
    setIsGameOver(false);
  };

  const handleSurrender = () => {
    game.surrender();
  };

  // gameover 리스너
  useEffect(() => {
    const handleGameOver = () => {
      setIsGameOver(true); // 게임 오버 시 상태 업데이트
    };

    // 게임 종료 리스너 등록
    game.onGameOver(handleGameOver);

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      game.offGameOver(handleGameOver);
    };
  }, [game]);

  return (
    <div className="bg-neutral-900 h-[700px] w-[300px] text-white max-[768px]:w-full rounded flex flex-col justify-center items-center gap-4 mt-24 max-[768px]:mt-0">
      {isStarted ? null : (
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
        <div className="flex gap-4">
          <button
            onClick={handleSurrender}
            className="p-3 px-5 bg-neutral-600 rounded hover:bg-neutral-500"
          >
            <FlagIcon className="size-5" />
          </button>
          <button className="p-3 px-5 bg-neutral-600 rounded hover:bg-neutral-500">
            <ChevronLeftIcon className="size-5" />
          </button>
          <button className="p-3 px-5 bg-neutral-600 rounded hover:bg-neutral-500">
            <ChevronRightIcon className="size-5" />
          </button>
        </div>
      ) : (
        <button
          className="text-white bg-purple-500 w-11/12 rounded hover:bg-purple-700 p-4"
          onClick={hnandleStartBtn}
        >
          플레이
        </button>
      )}
      {isGameOver ? (
        <button
          className="text-white bg-purple-500 w-11/12 rounded hover:bg-purple-700 p-4"
          onClick={handleRestartBtn}
        >
          재대결
        </button>
      ) : null}
    </div>
  );
}
