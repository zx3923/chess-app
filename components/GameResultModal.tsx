import { XMarkIcon } from "@heroicons/react/24/solid";
import { ClockIcon, TrophyIcon } from "@heroicons/react/24/outline";

interface GameResultModalProps {
  winColor: string;
  reason: string;
  gameTime: string;
  rating: number | undefined;
  opponentRating: number | undefined;
  userColor: string;
  eloResult: number;
  onClose: () => void;
}

export default function GameResultModal({
  winColor,
  reason,
  gameTime,
  rating,
  opponentRating,
  userColor,
  eloResult,
  onClose,
}: GameResultModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-neutral-900 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">게임 결과</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="size-7 text-white" />
          </button>
        </div>
        <div className="bg-emerald-600 text-white py-3 px-4 text-center font-bold text-lg">
          {winColor === "white" ? "백 승리!" : "흑 승리!"}
        </div>
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-900 font-bold text-lg">
                W
              </div>
              <div className="ml-3">
                <p className="font-semibold text-white">
                  {userColor === "white" ? "You (White)" : "Opponent"}
                </p>
                <p className="text-sm text-neutral-400">
                  {userColor === "white" ? rating : opponentRating}
                </p>
              </div>
            </div>
            <div className="bg-neutral-100 px-3 py-1 rounded-full flex items-center">
              {/* 트로피 아이콘 */}
              {winColor === "white" ? (
                <>
                  <TrophyIcon className="size-4 mr-2 text-yellow-500" />
                  <span className="text-sm font-medium">+{eloResult}</span>
                </>
              ) : (
                <span className="text-sm font-medium text-red-500">
                  -{eloResult}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-lg">
                B
              </div>
              <div className="ml-3">
                <p className="font-semibold text-white">
                  {userColor === "black" ? "You (black)" : "Opponent"}
                </p>
                <p className="text-sm text-neutral-400">
                  {userColor === "black" ? rating : opponentRating}
                </p>
              </div>
            </div>
            <div className="bg-neutral-100 px-3 py-1 rounded-full flex items-center">
              {/* 트로피 아이콘 */}
              {winColor === "black" ? (
                <>
                  <TrophyIcon className="size-4 mr-2 text-yellow-500" />
                  <span className="text-sm font-medium">+{eloResult}</span>
                </>
              ) : (
                <span className="text-sm font-medium text-red-500">
                  -{eloResult}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
          <h3 className="font-semibold text-white mb-3">게임 정보</h3>
          <div className="bg-neutral-700 rounded-lg p-4 grid grid-cols-1 gap-4">
            <div className="flex items-center">
              <ClockIcon className="size-5 text-white mr-2" />
              <div>
                <p className="text-sm text-neutral-300">게임 시간</p>
                <p className="font-medium text-white">{gameTime}</p>
              </div>
            </div>
            <div>
              {/* <p className="text-sm text-neutral-300">사유</p> */}
              <p className="font-medium text-white">
                {/* {game.getIsSurrender()
                  ? `${
                      game.getWinner() === "white" ? "black" : "white"
                    } 님의 항복`
                  : `${game.getMoveHistory().length}
                 수 체크메이트`} */}
                {reason === "timeOut" ? "시간종료" : null}
                {reason === "gameOver" ? "체크메이트" : null}
                {reason === "surrender" ? "항복" : null}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
