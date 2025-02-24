import React, { createContext, useContext, useState, ReactNode } from "react";
import Game from "../game";

interface ChessContextType {
  game: Game;
  setGame: React.Dispatch<React.SetStateAction<Game>>;
}

const ChessContext = createContext<ChessContextType | null>(null);

export const ChessProvider = ({ children }: { children: ReactNode }) => {
  const [game, setGame] = useState<Game>(
    () => new Game("playerVsPlayer", "white", 0)
  );

  return (
    <ChessContext.Provider value={{ game, setGame }}>
      {children}
    </ChessContext.Provider>
  );
};

export const useChess = () => {
  const context = useContext(ChessContext);
  if (!context) {
    throw new Error("useChess must be used within a ChessProvider");
  }
  return context;
};
