// import React, { createContext, useContext, useState, ReactNode } from "react";
// import Game, { GameMode, Player } from "../game";

// interface ChessContextType {
//   game: Game;
//   setGame: (gameMode?: GameMode, color?: Player, timer?: number) => void;
// }

// const ChessContext = createContext<ChessContextType | null>(null);

// export const ChessProvider = ({ children }: { children: ReactNode }) => {
//   const [game, setGameState] = useState<Game>(
//     () => new Game("playerVsComputer", "white", 180000)
//   );

//   // setGame 호출 시 기존 게임 객체 상태를 변경
//   const setGame = (gameMode?: GameMode, color?: Player, timer?: number) => {
//     setGameState((prevGame) => {
//       // 기존 game 객체의 값을 변경만 하고 새로 객체를 생성하지 않음
//       if (gameMode) game.setGameMode(gameMode);
//       if (color) game.setUserColor(color);
//       if (timer !== undefined) game.setTimers(timer);

//       // 기존 게임 객체를 그대로 반환 (새로 생성하지 않음)
//       return prevGame;
//     });
//   };

//   return (
//     <ChessContext.Provider value={{ game, setGame }}>
//       {children}
//     </ChessContext.Provider>
//   );
// };

// export const useChess = () => {
//   const context = useContext(ChessContext);
//   if (!context) {
//     throw new Error("useChess must be used within a ChessProvider");
//   }
//   return context;
// };
