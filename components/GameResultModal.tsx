import { useChess } from "@/lib/context/ChessContext";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { ClockIcon, TrophyIcon } from "@heroicons/react/24/outline";

interface GameResultModalProps {
  winner: string;
  onClose: () => void;
}

export default function GameResultModal({
  winner,
  onClose,
}: GameResultModalProps) {
  const { game } = useChess();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-neutral-900 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Game Results</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="size-7 text-white" />
          </button>
        </div>
        <div className="bg-emerald-600 text-white py-3 px-4 text-center font-bold text-lg">
          {winner === "white" ? "백 승리!" : "흑 승리!"}
        </div>
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-900 font-bold text-lg">
                W
              </div>
              <div className="ml-3">
                <p className="font-semibold text-white">
                  {game.getUserColor() === "white" ? "You" : "Opponent"}
                </p>
                <p className="text-sm text-neutral-400">Rating: 1250</p>
              </div>
            </div>
            <div className="bg-neutral-100 px-3 py-1 rounded-full flex items-center">
              {/* 트로피 아이콘 */}
              {game.getWinner() === "white" ? (
                <TrophyIcon className="size-4 mr-2 text-yellow-500" />
              ) : null}
              <span className="text-sm font-medium">+15</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
                B
              </div>
              <div className="ml-3">
                <p className="font-semibold text-white">
                  {" "}
                  {game.getUserColor() === "black" ? "You" : "Opponent"}
                </p>
                <p className="text-sm text-neutral-400">Rating: 1235</p>
              </div>
            </div>
            <div className="bg-neutral-100 px-3 py-1 rounded-full flex items-center">
              {/* 트로피 아이콘 */}
              {game.getWinner() === "black" ? (
                <TrophyIcon className="size-4 mr-2 text-yellow-500" />
              ) : null}
              <span className="text-sm font-medium text-red-500">-15</span>
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
          <h3 className="font-semibold text-white mb-3">Game Statistics</h3>
          <div className="bg-neutral-700 rounded-lg p-4 grid grid-cols-1 gap-4">
            <div className="flex items-center">
              <ClockIcon className="size-5 text-white mr-2" />
              <div>
                <p className="text-sm text-neutral-300">Game Duration</p>
                <p className="font-medium text-white">
                  {game.getGameDuration()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-300">Moves</p>
              <p className="font-medium text-white">
                {game.getIsSurrender()
                  ? `${
                      game.getWinner() === "white" ? "black" : "white"
                    } 님의 항복`
                  : `${game.getMoveHistory().length}
                 수 체크메이트`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
