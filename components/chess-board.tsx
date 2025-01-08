import { useState, useMemo, useCallback, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { socket } from "@/lib/socket";
import { useSearchParams } from "next/navigation";
import "./chess-board.css";

export default function ChessGame() {
  const chess = useMemo(() => new Chess(), []);
  const [fen, setFen] = useState(chess.fen());
  const [over, setOver] = useState("");
  const searchParams = useSearchParams();
  const room = searchParams.get("room");
  const orientation = searchParams.get("orientation");

  console.log(room, orientation);

  const makeAMove = useCallback(
    (move: any) => {
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

  function onDrop(sourceSquare: any, targetSquare: any) {
    console.log(chess.turn());
    console.log(orientation![0]);
    if (chess.turn() !== orientation![0]) return false; // w, b 를 확인하여 본인 말만 움직이게

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

  return (
    <>
      <div className="custom-chessboard flex items-center h-screen bg-neutral-900">
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          boardOrientation={"white"}
          boardWidth={600}
        />
      </div>
    </>
  );
}
