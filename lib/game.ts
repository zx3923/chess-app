import Timer from "./timer";
import { Chess } from "chess.js";

type Player = "white" | "black";
export type GameMode = "playerVsPlayer" | "playerVsComputer";

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
  }

  public play(): void {
    if (!this.isGameStarted) {
      this.isGameStarted = true;
      this.isGameOver = false;
      this.timers[this.currentPlayer].start();
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
    console.log("현재 턴 : ", this.chess.turn());
    console.log("유저 : ", this.userColor[0]);
    if (!this.isGameStarted || this.isGameOver) {
      return false;
    }
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
      return false;
    }
  }

  private makeComputerMove(): void {
    const moves = this.chess.moves();
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      this.chess.move(randomMove);
      this.switchPlayer();
    }
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

  public checkTimeout(): Player | null {
    if (this.timers.white.getTime() <= 0) return "white";
    if (this.timers.black.getTime() <= 0) return "black";
    return null;
  }

  private switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
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
}

export default Game;
