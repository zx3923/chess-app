import { Chess } from "chess.js";
import { socket } from "@/lib/socket";
import { Chessboard } from "react-chessboard";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, useCallback, useEffect } from "react";

import "./chess-board.css";

export default function ChessGame() {
  const chess = useMemo(() => new Chess(), []);
  const [fen, setFen] = useState(chess.fen());
  const [over, setOver] = useState("");
  const searchParams = useSearchParams();
  const room = searchParams.get("room");

  const [userColor, setUserColor] = useState("");
  const [timers, setTimers] = useState({ white: 0, black: 0 });

  useEffect(() => {
    // 서버에서 초기 타이머 설정 요청
    if (room) {
      socket.emit("getRoomInfo", room, (room: any) => {
        if (room) {
          console.log("getRoomInfo", room);
          setTimers(room.timers);

          const fetchUserData = async () => {
            const response = await fetch("/api/getUser");
            if (response.ok) {
              const userData = await response.json();
              if (userData.user_name === room.players[0].username) {
                setUserColor(room.players[0].color);
              } else {
                setUserColor(room.players[1].color);
              }
            } else {
              console.error("User not authenticated");
            }
          };
          fetchUserData();
        } else {
          setOver("Failed to fetch room");
        }
      });
    }

    // 서버로부터 타이머 업데이트를 수신
    const interval = setInterval(() => {
      if (room) {
        socket.emit("getTimers", room, ({ timers }: any) => {
          if (timers) {
            if (timers.white <= 0) {
              console.log("black win");
              setOver("black win");
              if (interval) clearInterval(interval); // interval 종료
            } else if (timers.black <= 0) {
              console.log("white win");
              setOver("white win");
              if (interval) clearInterval(interval); // interval 종료
            }
            setTimers(timers);
          }
        });
      }
    }, 200);

    return () => clearInterval(interval);
  }, [room]);

  function onDrop(sourceSquare: any, targetSquare: any) {
    console.log(chess.turn());
    console.log(userColor);
    if (chess.turn() !== userColor[0]) return false; // w, b 를 확인하여 본인 말만 움직이게

    // if (players.length < 2) return false;

    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      promotion: "q",
    };

    const move = makeAMove(moveData);

    if (move === null) return false; // null 은 정상적이지 않은 움직임

    socket.emit("move", {
      move,
      room,
    });

    return true;
  }

  const makeAMove = useCallback(
    (move: any) => {
      console.log("check move");
      try {
        const result = chess.move(move); // chess 업데이트
        setFen(chess.fen()); // fen 상태를 업데이트하여 리렌더링
        console.log(chess.fen());

        console.log("over, checkmate", chess.isGameOver(), chess.isCheckmate());

        if (chess.isGameOver()) {
          // 게임오버 체크
          if (chess.isCheckmate()) {
            setOver(
              `Checkmate! ${chess.turn() === "w" ? "black" : "white"} wins!`
            );
            // 승자는 마지막으로 움직인 쪽을 확인하여 체크
          } else if (chess.isDraw()) {
            setOver("Draw");
          } else {
            setOver("Game over");
          }
        }

        return result;
      } catch (e) {
        return null;
      } // 정상적이지 않은 움직임은 null
    },
    [chess]
  );

  useEffect(() => {
    socket.on("move", (move) => {
      makeAMove(move);
    });
  }, [makeAMove]);

  useEffect(() => {
    socket.on("playerDisconnected", (player) => {
      console.log(player.username);
      setOver(`${player.username} has disconnected`);
    });
  }, []);

  useEffect(() => {
    socket.on("gameOver", (data) => {
      console.log(data);
    });
  }, []);

  function formatTime(seconds: number) {
    if (seconds >= 20) {
      // 20초 이상은 mm:ss 형식
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    } else {
      // 20초 미만은 m:ss.xx 형식
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 100); // 소수점 이하 두 자리
      return `${mins}:${secs < 10 ? "0" : ""}${secs}.${
        ms < 10 ? "0" : ""
      }${ms}`;
    }
  }

  return (
    <>
      <div className="flex items-center justify-center flex-col h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
        <div className="text-white">
          {userColor === "white" ? "black" : "white"}
          <div>
            {userColor === "black"
              ? formatTime(timers.white)
              : formatTime(timers.black)}
          </div>
        </div>
        <div className="w-full max-w-[500px]">
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            boardOrientation={userColor === "white" ? "white" : "black"}
            // boardWidth={boardWidth}
          />
        </div>

        <div className="text-white">
          {userColor}
          <div>
            {userColor === "white"
              ? formatTime(timers.white)
              : formatTime(timers.black)}
          </div>
        </div>
        {/* <div className="text-white">
          <div>White: {formatTime(timers.white)}</div>
          <div>Black: {formatTime(timers.black)}</div>
        </div> */}
      </div>
    </>
  );
}
