import { XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

interface GameResultModalProps {
  winner: string;
  onClose: () => void;
}

export default function GameResultModal({
  winner,
  onClose,
}: GameResultModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 text-white">
      <div className="relative bg-neutral-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <XMarkIcon className="size-7" />
        </button>
        <h2 className="text-2xl font-bold text-center mb-6">
          {winner === "white" ? "백 승리!" : "흑 승리!"}
        </h2>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex flex-col items-center">
            <div
              className={`${
                winner === "white" ? "border-green-600 border-4" : null
              }  p-2 rounded`}
            >
              <Image
                src="/king_white.png"
                alt="king_white"
                width={50}
                height={50}
              />
            </div>
            <span className="mt-2 text-sm">백</span>
          </div>
          <span className="text-lg font-semibold">vs</span>
          <div className="flex flex-col items-center">
            <div
              className={`${
                winner === "black" ? "border-green-600 border-4" : null
              }  p-2 rounded`}
            >
              <Image
                src="/king_black.png"
                alt="king_black"
                width={50}
                height={50}
              />
            </div>
            <span className="mt-2 text-sm">흑</span>
          </div>
        </div>
      </div>
    </div>
  );
}
