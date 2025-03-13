"use client";

import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
import { useUser } from "@/lib/context/UserContext";
import { useChess } from "@/lib/context/ChessContext";

export default function PlayNew() {
  const { game } = useChess();
  const { user } = useUser();

  const router = useRouter();
  const [isMatching, setIsMatching] = useState(false);
  const [selectedType, setSelectedType] = useState("blitz");

  const hnandleStartBtn = () => {
    setIsMatching(true);
    socket.emit("joinQueue", {
      user: user,
      gameMode: selectedType,
    });
  };

  const handleSelect = (gameType: string) => {
    setSelectedType(gameType);
    const timer =
      gameType === "rapid"
        ? 600000
        : gameType === "blitz"
        ? 180000
        : gameType === "bullet"
        ? 60000
        : 0;
    game.setTimers(timer);
    console.log(game.getTimers());
  };

  const cancelMatching = () => {
    setIsMatching(false);
    socket.emit("cancelMatching", selectedType);
  };

  useEffect(() => {
    if (socket) {
      socket.on("matchFound", (data) => {
        handleRedirect(data.roomId);
        // setGame("playerVsPlayer");
        console.log("match", data.color);
        game.gameInit();
        game.setGameMode("playerVsPlayer");
        game.setRoomId(data.roomId);
        game.setUserColor(data.color);
        game.play();
      });
    }
    return () => {
      if (socket) {
        socket.off("matchFound");
      }
    };
  }, [socket]);

  const handleRedirect = (roomId: string) => {
    router.push(`/play/online/new/${roomId}`);
  };

  const gameTypes = [
    {
      id: "bullet",
      name: "불릿",
      description: "1분",
      icon: "⚡",
    },
    {
      id: "blitz",
      name: "블리츠",
      description: "3분",
      icon: "🔥",
    },
    {
      id: "rapid",
      name: "래피드",
      description: "10분",
      icon: "🕒",
    },
  ];
  return (
    <div className="bg-neutral-900 h-[700px] w-[300px] text-white max-[768px]:w-full rounded flex flex-col justify-center items-center gap-4 mt-24 max-[768px]:mt-0">
      {isMatching ? (
        <div className="bg-neutral-800 p-12 rounded-lg shadow-lg flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-xl font-semibold mb-6">매칭중...</p>
          <button
            onClick={cancelMatching}
            className="px-4 py-2 text-red-500 border border-red-500 rounded hover:bg-red-100 transition-colors duration-200"
          >
            매칭 취소
          </button>
        </div>
      ) : (
        <>
          <button
            className="text-white bg-purple-500 w-11/12 rounded hover:bg-purple-700 p-4"
            onClick={hnandleStartBtn}
          >
            플레이
          </button>
          <div className="w-full max-w-md mx-auto p-4 bg-neutral-900 rounded-lg shadow text-white">
            <h2 className="text-xl font-bold mb-4 text-center">
              게임 타입 선택
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {gameTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSelect(type.id)}
                  className={`
              flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 text-nowrap
              ${
                selectedType === type.id
                  ? "bg-neutral-700 border-2 border-green-500 shadow-lg"
                  : "bg-neutral-800 border-2 border-transparent hover:bg-neutral-700"
              }
            `}
                  aria-pressed={selectedType === type.id}
                >
                  <span className="text-2xl mb-2" aria-hidden="true">
                    {type.icon}
                  </span>
                  <span className="font-medium">{type.name}</span>
                  <span className="text-xs text-gray-400 mt-1">
                    {type.description}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                선택된 게임 타입:{" "}
                <span className="text-white font-medium">
                  {gameTypes.find((t) => t.id === selectedType)?.name}
                </span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
