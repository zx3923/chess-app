"use client";

import { useChess } from "@/lib/context/ChessContext ";
import Game, { Player } from "@/lib/game";
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
      Math.random() < 0.5 ? (color = "white") : (color = "black");
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
            <img src="/king_white.png" alt="" />
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
            <img src="/chess_board.png" alt="" />
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
            <img src="/king_black.png" alt="" />
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
