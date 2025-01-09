"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";

interface MessageLog {
  room: string;
  message: string;
  name: string;
}

export default function Game() {
  // const [name, setName] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [gameMode, setGameMode] = useState("rapid");
  // const [isConnected, setIsConnected] = useState(false);
  // const [transport, setTransport] = useState("N/A");
  // const [logs, setLogs] = useState<String[]>([]);
  // const [message, setMessage] = useState("");
  // const [users, setUsers] = useState<String[]>([]);
  // const [orientation, setOrientation] = useState("");
  const router = useRouter();

  useEffect(() => {
    console.log("getuser start");
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
        console.log("#@!#@!#@!#@!@#!#!@#@!@!#");
        console.log(data);
        handleRedirect(data.color, data.roomId);
      });
    }
    return () => {
      if (socket) {
        socket.off("matchFound");
      }
    };
  }, [socket]);

  // useEffect(() => {
  //   function onConnect() {
  //     setIsConnected(true);
  //     setTransport(socket.io.engine.transport.name);

  //     socket.io.engine.on("upgrade", (transport) => {
  //       setTransport(transport.name);
  //     });
  //   }

  //   if (socket.connected) {
  //     onConnect();
  //     socket.emit("joinAndLeave", { type: "join", name });
  //   }

  //   function onDisconnect() {
  //     setIsConnected(false);
  //     setTransport("N/A");
  //   }

  //   socket.on("connect", onConnect);
  //   socket.on("disconnect", onDisconnect);

  //   function onSetLog(msg: MessageLog | string) {
  //     if (typeof msg === "string") {
  //       setLogs((prev) => [...prev, msg]);
  //     } else {
  //       setLogs((prev) => [...prev, `${msg.name}의 말 : ${msg.message}`]);
  //     }
  //   }

  //   socket.on("chat message", onSetLog);

  //   function onUsers(inputUsers: { id: string; name: string }[]) {
  //     console.log({ inputUsers });
  //     setUsers(inputUsers.map((inputUser) => inputUser.name));
  //   }
  //   socket.on("users", onUsers);

  //   return () => {
  //     socket.off("connect", onConnect);
  //     socket.off("disconnect", onDisconnect);
  //     socket.off("chat message", onSetLog);
  //     socket.off("users", onUsers);
  //   };
  // }, [name]);

  // const onClickSubmitBtn = () => {
  //   socket.emit("chat message", { room: "room1", message, name });
  //   setMessage("");
  // };

  const onClickCreateBtn = () => {
    socket.emit("createRoom", { username: "test" }, (r: any) => {
      console.log(r);
    });
  };

  const handleRedirect = (orientation: string, roomId: string) => {
    router.push(`/chess?orientation=${orientation}&room=${roomId}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGameMode(e.target.value);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-neutral-200 p-4">
      <div>
        <form>
          <select name="gamemode" onChange={handleChange}>
            <option value="rapid">래피드</option>
            <option value="blitz">블리츠</option>
            <option value="bullet">불릿</option>
          </select>
          {/* <button className="bg-blue-500 px-6 py-2 rounded-sm">매칭</button> */}
        </form>
        <div className="flex gap-5">
          <button
            className="bg-blue-500 px-6 py-2 rounded-sm"
            onClick={() => {
              // socket.emit(
              //   "createRoom",
              //   { username: user?.user_name, rating: user?.rating },
              //   (r: any) => {
              //     console.log(r);
              //     // setOrientation("white");
              //     handleRedirect("white", r);
              //   }
              // );
              socket.emit("joinQueue", {
                user: user,
                gameMode: gameMode,
              });
            }}
          >
            매칭
          </button>
          <button
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
          </button>
          <button
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
          </button>
        </div>
      </div>
      {/* <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p> */}
      {/* <div>
        <h3>닉네임</h3>
        <input
          type="text"
          placeholder="닉네임을 적어주세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div> */}
      {/* <div>
        <h3>메시지</h3>
        <input
          className="text-black"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" onClick={onClickSubmitBtn}>
          전송
        </button>
      </div> */}
      {/* <div className="bg-white text-black w-full">
        <div className="bg-white">
          <h3>채팅 로그</h3>
          {logs && logs.map((log) => <p key={uuidv4()}>{log}</p>)}
        </div>

        <div>
          <h3>접속 유저</h3>
          {users && users.map((user) => <p key={uuidv4()}>{user}</p>)}
        </div>
      </div> */}
    </div>
  );
}
