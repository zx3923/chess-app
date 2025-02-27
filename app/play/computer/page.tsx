"use client";

import { useChess } from "@/lib/context/ChessContext ";
import Game, { Player } from "@/lib/game";
import Image from "next/image";
import { useState } from "react";

export default function PlayComputer() {
  const { game, setGame } = useChess();
  const [selectColor, setSelectColor] = useState(0);
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
    const newGame = new Game("playerVsComputer", color, 0);
    setGame(newGame);
  };

  return (
    <div className="bg-neutral-900 h-[700px] w-[300px] text-white max-[768px]:w-full rounded flex flex-col justify-center items-center gap-4">
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
        onClick={() => {
          game.play();
        }}
      >
        플레이
      </button>
    </div>
  );
}
