"use client";

import { useChess } from "@/lib/context/ChessContext ";

export default function PlayComputer() {
  const { game } = useChess();
  return (
    <div className="bg-neutral-900 h-[700px] w-[300px] text-white max-[768px]:w-full rounded">
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
