"use client";

import ChessGame from "@/components/chess-board";
import { ChessProvider } from "@/lib/context/ChessContext ";

export default function PlayLayout({ children }: any) {
  return (
    <ChessProvider>
      <div className="flex justify-center items-center gap-4 min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
        <ChessGame />
        <div>{children}</div>
      </div>
    </ChessProvider>
  );
}
