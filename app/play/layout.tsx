"use client";

import { ChessGameBoard } from "@/components/chess-board";
import { ChessProvider } from "@/lib/context/ChessContext ";

export default function PlayLayout({ children }: any) {
  return (
    <ChessProvider>
      <div className="max-[768px]:flex-col flex justify-center items-center gap-4 min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
        <ChessGameBoard />
        <div className="max-[768px]:w-full max-[768px]:p-12">{children}</div>
      </div>
    </ChessProvider>
  );
}
