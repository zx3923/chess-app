"use client";

import { useChess } from "@/lib/context/ChessContext ";

export default function PlayComputer() {
  const { game, setGame } = useChess();
  return (
    <div className="bg-black opacity-20 h-[700px] w-[300px] text-white">
      <button
        className="text-white"
        onClick={() => {
          game.play();
        }}
      >
        시작
      </button>
    </div>
  );
}
