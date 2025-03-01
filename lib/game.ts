import Timer from "./timer";
import { Chess } from "chess.js";
import { Square } from "chess.js";

export type Player = "white" | "black";
export type GameMode = "playerVsPlayer" | "playerVsComputer" | null;

interface Move {
  from: string;
  to: string;
  promotion?: string;
}

class Game {
  private chess: Chess;
  private userColor: Player;
  private currentPlayer: Player;
  private gameMode: GameMode;
  private timers: { [key in Player]: Timer }; // 각 플레이어의 타이머
  private isGameOver: boolean;
  private isGameStarted: boolean;
  private currentPiece: string;

  constructor(gameMode: GameMode, userColor: Player, startingTime: number) {
    this.chess = new Chess();
    this.userColor = userColor;
    this.currentPlayer = "white";
    this.gameMode = gameMode;
    this.timers = {
      white: new Timer(startingTime),
      black: new Timer(startingTime),
    };
    this.isGameOver = false;
    this.isGameStarted = false;
    this.currentPiece = "";
  }

  public play(): void {
    if (!this.isGameStarted) {
      this.isGameStarted = true;
      this.isGameOver = false;
      if (this.getGameMode() !== "playerVsComputer") {
        this.timers[this.currentPlayer].start();
      } else if (this.getGameMode() === "playerVsComputer") {
        if (this.getUserColor() === "black") {
          (async () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const computerMove = await this.makeComputerMove();
            console.log(this.currentPlayer);
            this.switchPlayer();
          })();
        }
      }
      console.log("Game started");
    }
  }

  public stop(): void {
    if (this.isGameStarted) {
      this.isGameStarted = false;
      this.timers.white.stop();
      this.timers.black.stop();
      console.log("Game stopped");
    }
  }

  public makeMove(move: Move): boolean {
    if (!this.isGameStarted || this.isGameOver) {
      return false;
    }
    if (this.gameMode === "playerVsComputer") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      try {
        const result = this.chess.move(move);
        if (result) {
          return true;
        } else {
          return false;
        }
      } catch {
        return false;
      }
    } else {
      try {
        const result = this.chess.move(move);
        if (result) {
          this.timers[this.currentPlayer].stop(); // 현재 플레이어의 타이머 정지
          this.switchPlayer();
          this.timers[this.currentPlayer].start(); // 다음 플레이어의 타이머 시작

          if (this.chess.isGameOver()) {
            if (this.chess.isCheckmate()) {
              console.log(
                `Checkmate! ${
                  this.chess.turn() === "w" ? "black" : "white"
                } wins!`
              );
            } else if (this.chess.isDraw()) {
              console.log("Draw");
            } else {
              console.log("Game over");
            }
          }
          return true;
        }
        return false;
      } catch (e) {
        console.error(e);
        return false;
      }
    }
  }

  public async makeComputerMove(): Promise<any> {
    const data = await postChessApi({
      fen: this.chess.fen(),
      depth: 0,
      maxThinkingTime: 1,
    });
    const move = this.chess.move({ from: data.from, to: data.to });
    return move;
  }

  public handleGameOver(): void {
    this.isGameOver = true;
    this.stop(); // Stop the game when it's over
    if (this.chess.isCheckmate()) {
      console.log(
        `Checkmate! Winner: ${
          this.currentPlayer === "white" ? "black" : "white"
        }`
      );
    } else if (this.chess.isDraw()) {
      console.log("Draw");
    } else {
      console.log("Game over");
    }
  }

  public handleSquareClick(
    square: Square
  ): Partial<Record<Square, { boxShadow: string }>> {
    // 현재 클릭한 칸에 있는 기물이 무엇인지 확인
    const moves = this.chess.moves({ square, verbose: true });
    const newMoveSquares: Partial<Record<Square, { boxShadow: string }>> = {};
    moves.forEach((move) => {
      newMoveSquares[move.to] = {
        boxShadow: "inset 0 0 1px 6px rgba(255,255,255)",
      };
    });
    return newMoveSquares;
  }

  public checkTimeout(): Player | null {
    if (this.timers.white.getTime() <= 0) return "white";
    if (this.timers.black.getTime() <= 0) return "black";
    return null;
  }

  private switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
  }

  public savePieceSquare(piece: string): void {
    this.currentPiece = piece;
  }

  public getCurrentBoard(): string {
    return this.chess.fen();
  }

  public getCurrentPlayer(): Player {
    return this.currentPlayer;
  }

  public getTimers(): { white: number; black: number } {
    return {
      white: this.timers.white.getTime(),
      black: this.timers.black.getTime(),
    };
  }

  public getIsGameStarted(): boolean {
    return this.isGameStarted;
  }

  public getIsGameOver(): boolean {
    return this.isGameOver;
  }

  public getGameMode(): string | null {
    return this.gameMode;
  }

  public getUserColor(): string {
    return this.userColor;
  }

  public getCurrentPieceSquare(): string {
    return this.currentPiece;
  }
}

export default Game;

// 체스엔진 테스트 api
export async function postChessApi(data = {}) {
  const response = await fetch("https://chess-api.com/v1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
