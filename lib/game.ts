import Timer, { timeString } from "./timer";
import { Chess } from "chess.js";
import { Square } from "chess.js";
// import { soundPlayer } from "./sound";
import EventEmitter from "events";

export type Player = "white" | "black";
export type GameMode = "playerVsPlayer" | "playerVsComputer" | null;
export type Arrow = [Square, Square, (string | undefined)?];

interface Move {
  from: string;
  to: string;
  promotion?: string;
}

class Game extends EventEmitter {
  private chess: Chess;
  private userColor: Player;
  private currentPlayer: Player;
  private gameMode: GameMode;
  private timers: { [key in Player]: Timer }; // 각 플레이어의 타이머
  private isGameOver: boolean;
  private isGameStarted: boolean;
  private currentPiece: string;
  private winner: string;
  // private gameOverListeners: Callback[] = [];
  private isSurrender: boolean;
  private moveHistory: string[];
  private gameDuration: Timer;
  private showWinBar: boolean;
  private showBestMoves: boolean;
  private winChance: number;
  private bestMove: Arrow[];
  private roomId: string;

  constructor(gameMode: GameMode, userColor: Player, startingTime: number) {
    super();
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
    this.winner = "";
    this.isSurrender = false;
    this.moveHistory = [];
    this.gameDuration = new Timer(0);
    this.showWinBar = false;
    this.showBestMoves = false;
    this.winChance = 50;
    this.bestMove = [];
    this.roomId = "";
  }

  public play(): void {
    if (!this.isGameStarted) {
      // soundPlayer.start();
      this.isGameStarted = true;
      this.isGameOver = false;
      this.gameDuration.start();
      this.emit("gameStart");
      if (this.getGameMode() !== "playerVsComputer") {
        this.timers[this.currentPlayer].start();
      } else if (this.getGameMode() === "playerVsComputer") {
        if (this.getUserColor() === "black") {
          (async () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const computerMove = await this.makeComputerMove();
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

  public surrender(): void {
    this.isSurrender = true;
    this.handleGameOver();
  }

  // 체스 말 움직임
  public makeMove(move: Move): boolean {
    if (!this.isGameStarted || this.isGameOver) {
      return false;
    }
    if (this.gameMode === "playerVsComputer") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      try {
        const result = this.chess.move(move);
        if (result) {
          // soundPlayer.playMoveSound(result);
          this.emit("move", result, this.chess.history({ verbose: true }));
          this.switchPlayer();
          if (this.chess.isGameOver()) {
            this.handleGameOver();
          }
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
          this.emit("move", result, this.chess.history({ verbose: true }));
          this.timers[this.currentPlayer].stop(); // 현재 플레이어의 타이머 정지
          this.switchPlayer();
          this.timers[this.currentPlayer].start(); // 다음 플레이어의 타이머 시작

          if (this.chess.isGameOver()) {
            this.handleGameOver();
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // console.error(e);
        return false;
      }
    }
  }

  // 컴퓨터 대결 시 컴퓨터 움직임
  public async makeComputerMove(): Promise<any> {
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    await sleep(2000);
    const data = await postChessApi({
      fen: this.chess.fen(),
      depth: 1,
      maxThinkingTime: 1,
      searchmoves: "",
    });
    const move = this.chess.move({ from: data.from, to: data.to });
    if (move) {
      this.emit("computerMove", move);
      this.emit("move", move, this.chess.history({ verbose: true }));
      this.switchPlayer();
    }
    if (this.showWinBar) {
      await this.setWinChanceAndBestMove();
    }
    if (this.showBestMoves) {
      // this.bestMove = [[data.from, data.to, "#9fcf38"]];
      // await this.setWinChanceAndBestMove();
      this.emit("bestMove");
    }
    if (this.chess.isGameOver()) {
      this.handleGameOver();
    }
    return move;
  }

  // 게임종료 핸들러
  public handleGameOver(): void {
    this.isGameOver = true;
    this.isGameStarted = false;
    this.gameDuration.endGame();
    this.gameDuration.stop();
    this.stop(); // Stop the game when it's over
    if (this.isSurrender) {
      this.winner = this.currentPlayer === "white" ? "black" : "white";
      // soundPlayer.gameover();
    } else {
      if (this.chess.isCheckmate()) {
        console.log(
          `Checkmate! Winner: ${
            this.currentPlayer === "white" ? "black" : "white"
          }`
        );
        this.winner = this.currentPlayer === "white" ? "black" : "white";
        // soundPlayer.checkmate();
      } else if (this.chess.isDraw()) {
        this.winner = "draw";
        console.log("Draw");
        // soundPlayer.stalemate();
      } else {
        console.log("Game over");
      }
    }
    this.emit("gameOver", this.chess.isCheckmate());
    // this.triggerGameOver();
  }

  // 칸 클릭 핸들러 - 경로 미리 보여주기 용
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

  // 시간종료 확인
  public checkTimeout(): Player | null {
    if (this.timers.white.getTime() <= 0) return "white";
    if (this.timers.black.getTime() <= 0) return "black";
    return null;
  }

  public restartGame(): void {
    if (!this.isGameStarted) {
      // this.isSurrender = false;
      // this.currentPlayer = "white";
      // this.chess.reset();
      // this.gameDuration.reset();
      this.gameInit();
    }
    this.play();
  }

  public gameInit(): void {
    this.isGameStarted = false;
    this.isSurrender = false;
    this.currentPlayer = "white";
    this.chess.reset();
    this.gameDuration.reset();
  }

  // // 게임종료 리스너
  // public onGameOver(callback: Callback) {
  //   this.gameOverListeners.push(callback);
  // }

  // // 게임종료 리스너
  // public offGameOver(callback: Callback) {
  //   const index = this.gameOverListeners.indexOf(callback);
  //   if (index !== -1) {
  //     this.gameOverListeners.splice(index, 1);
  //   }
  // }

  // // 게임종료 리스너
  // private triggerGameOver() {
  //   this.gameOverListeners.forEach((callback) => callback());
  // }

  // 턴 변경
  private switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
  }

  // 보드상황
  public getCurrentBoard(): string {
    return this.chess.fen();
  }

  public setCurrentBoard(fen: string) {
    this.emit("reload", fen);
  }

  // 현재 플레이어
  public getCurrentPlayer(): Player {
    return this.currentPlayer;
  }

  public setTimers(timer: number) {
    this.timers = {
      white: new Timer(timer),
      black: new Timer(timer),
    };
    this.emit("gameType");
  }

  public getTimers(): { white: number; black: number } {
    return {
      white: this.timers.white.getTime(),
      black: this.timers.black.getTime(),
    };
  }

  public getRoomId(): string {
    return this.roomId;
  }

  public setRoomId(roomId: string): void {
    this.roomId = roomId;
  }

  public getIsGameStarted(): boolean {
    return this.isGameStarted;
  }

  public getIsGameOver(): boolean {
    return this.isGameOver;
  }

  public setGameMode(gameMode: GameMode) {
    this.gameMode = gameMode;
  }

  public getGameMode(): GameMode {
    return this.gameMode;
  }

  public setUserColor(userColor: Player) {
    this.userColor = userColor;
  }

  public getUserColor(): Player {
    return this.userColor;
  }

  public setMoveHistory(): void {
    this.moveHistory = this.chess.history();
  }

  public getMoveHistory(): string[] {
    this.setMoveHistory();
    return this.moveHistory;
  }

  public getIsSurrender(): boolean {
    return this.isSurrender;
  }

  public getGameDuration(): string {
    const totalGameTime = this.gameDuration.getTotalGameTime();
    const totalGameTimeString = timeString(totalGameTime / 1000);
    return totalGameTimeString;
  }

  // 현재 클릭 한 말
  public setCurrentPieceSquare(piece: string): void {
    this.currentPiece = piece;
  }

  public getCurrentPieceSquare(): string {
    return this.currentPiece;
  }

  public getWinner(): string {
    return this.winner;
  }

  public getShowBestMoves(): boolean {
    return this.showBestMoves;
  }

  public setShowBestMoves(state: boolean): void {
    this.emit("showBestMoves", state);
    this.showBestMoves = state;
  }

  public getShowWinBar(): boolean {
    // this.emit("reload");
    return this.showWinBar;
  }

  public setShowWinBar(state: boolean): void {
    this.showWinBar = state;
    this.emit("showWinBar");
  }

  public getWinChance(): number {
    return this.winChance;
  }

  public async setWinChanceAndBestMove(winChance?: string): Promise<void> {
    if (winChance) {
      this.winChance = Number(winChance);
    } else {
      const data = await postChessApi({
        fen: this.chess.fen(),
        depth: 18,
        maxThinkingTime: 100,
        variants: 5,
      });
      console.log(data);
      this.winChance = Number(data.winChance);
      this.bestMove = [[data.from, data.to, "#9fcf38"]];
    }
    // const winChance = Number(data.winChance);
    // this.winChance = winChance;
  }

  // public async setBestMove() {
  //   const data = await postChessApi({
  //     fen: this.chess.fen(),
  //     depth: 12,
  //     variants: 5,
  //   });
  //   this.bestMove = [[data.from, data.to, "#9fcf38"]];
  //   console.log(this.bestMove);
  // }

  public getBestMove(): Arrow[] {
    return this.bestMove;
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
