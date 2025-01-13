"use client";

import { User } from "@prisma/client";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MatchingComponent } from "@/components/MatchingComponent";

export default function Game() {
  const [gameMode, setGameMode] = useState("rapid");
  const [user, setUser] = useState<User | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  const router = useRouter();

  useEffect(() => {
    console.log("getUser start");
    const fetchUserData = async () => {
      const response = await fetch("/api/getUser");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error("User not authenticated");
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("matchFound", (data) => {
        console.log("data : ", data);
        handleRedirect(data.color, data.roomId);
      });
    }
    return () => {
      if (socket) {
        socket.off("matchFound");
      }
    };
  }, [socket]);

  const handleRedirect = (orientation: string, roomId: string) => {
    router.push(`/chess?orientation=${orientation}&room=${roomId}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGameMode(e.target.value);
  };
  const startMatching = () => {
    setIsMatching(true);
  };

  const cancelMatching = () => {
    setIsMatching(false);
    console.log(gameMode);
    socket.emit("cancelMatching", gameMode);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-neutral-200 p-4">
      <div>
        <select name="gamemode" onChange={handleChange} className="text-black">
          <option value="rapid">래피드</option>
          <option value="blitz">블리츠</option>
          <option value="bullet">불릿</option>
        </select>
        <div className="flex gap-5">
          <div>
            <button
              className="bg-blue-500 px-6 py-2 rounded-sm"
              onClick={() => {
                startMatching();
                socket.emit("joinQueue", {
                  user: user,
                  gameMode: gameMode,
                });
              }}
              disabled={isMatching}
            >
              매칭
            </button>
            {isMatching && <MatchingComponent onCancel={cancelMatching} />}
          </div>
          {/* <button
            className="bg-blue-500 px-6 py-2 rounded-sm"
            onClick={() => {
              socket.emit(
                "createRoom",
                { username: user?.user_name, rating: user?.rapidRating },
                (r: any) => {
                  console.log(r);
                  // setOrientation("white");
                  handleRedirect("white", r);
                }
              );
            }}
          >
            생성
          </button> */}
          {/* <button
            className="bg-blue-500 px-6 py-2 rounded-sm"
            onClick={() => {
              const roomId = prompt("Enter the room ID:");
              console.log(roomId);
              if (roomId) {
                socket.emit(
                  "joinRoom",
                  {
                    roomId: roomId,
                    username: user?.user_name,
                  },
                  (r: any) => {
                    console.log(r);
                    // setOrientation("black");
                    handleRedirect("black", r.roomId);
                  }
                );
              } else {
                console.log("Room ID is required.");
              }
            }}
          >
            참가
          </button> */}
        </div>
      </div>
    </div>
  );
}
