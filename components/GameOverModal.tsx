import { XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
interface GameResultModalProps {
  winner: string;
}

export function GameOverModal({ winner }: GameResultModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 text-white">
      <div className="relative bg-neutral-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          // onClick={onClose}
        >
          <XMarkIcon className="size-7" />
        </button>
        <h2 className="text-2xl font-bold text-center mb-6">
          {winner === "white" ? "백 승리!" : "흑 승리!"}
        </h2>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex flex-col items-center">
            <Image
              src="/king_white.png"
              alt="king_white"
              width={50}
              height={50}
            />
            <span className="mt-2 text-sm">백</span>
          </div>
          <span className="text-lg font-semibold">vs</span>
          <div className="flex flex-col items-center">
            <Image
              src="/king_black.png"
              alt="king_black"
              width={50}
              height={50}
            />
            <span className="mt-2 text-sm">흑</span>
          </div>
        </div>
        <button
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          // onClick={onRematch}
        >
          재대결
        </button>
      </div>
    </div>
  );
}
