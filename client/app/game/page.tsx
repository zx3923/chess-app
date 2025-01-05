"use client";

import { useActionState, useEffect, useState } from "react";
// import { matchStart } from "./action";
import { socket } from "@/lib/socket";
import { v4 as uuidv4 } from "uuid";

interface MessageLog {
  room: string;
  message: string;
  name: string;
}

export default function Game() {
  // const [state, action] = useActionState(matchStart, null);
  const [name, setName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [logs, setLogs] = useState<String[]>([]);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<String[]>([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    if (socket.connected) {
      onConnect();
      socket.emit("joinAndLeave", { type: "join", name });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    function onSetLog(msg: MessageLog | string) {
      if (typeof msg === "string") {
        setLogs((prev) => [...prev, msg]);
      } else {
        setLogs((prev) => [...prev, `${msg.name}의 말 : ${msg.message}`]);
      }
    }

    socket.on("chat message", onSetLog);

    function onUsers(inputUsers: { id: string; name: string }[]) {
      console.log({ inputUsers });
      setUsers(inputUsers.map((inputUser) => inputUser.name));
    }
    socket.on("users", onUsers);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat message", onSetLog);
      socket.off("users", onUsers);
    };
  }, [name]);

  const onClickSubmitBtn = () => {
    socket.emit("chat message", { room: "room1", message, name });
    setMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-neutral-200 p-4">
      {/* <div>
        <form action={action}>
          <select name="gamemode">
            <option value="rapid">래피드</option>
            <option value="blitz">블리츠</option>
            <option value="bullet">불릿</option>
          </select>
          <button className="bg-blue-500 px-6 py-2 rounded-sm">매칭</button>
        </form>
        <button
          className="bg-blue-500 px-6 py-2 rounded-sm"
          onClick={() => {
            console.log(socket);
            socket.emit("createRoom", (r: any) => {
              console.log(r);
            });
          }}
        >
          생성
        </button>
      </div> */}
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
      <div>
        <h3>닉네임</h3>
        <input
          type="text"
          placeholder="닉네임을 적어주세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <h3>메시지</h3>
        <input
          className="text-black"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" onClick={onClickSubmitBtn}>
          전송
        </button>
      </div>
      <div className="bg-white text-black w-full">
        <div className="bg-white">
          <h3>채팅 로그</h3>
          {logs && logs.map((log) => <p key={uuidv4()}>{log}</p>)}
        </div>

        <div>
          <h3>접속 유저</h3>
          {users && users.map((user) => <p key={uuidv4()}>{user}</p>)}
        </div>
      </div>
    </div>
  );
}
