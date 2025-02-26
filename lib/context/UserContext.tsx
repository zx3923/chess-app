"use client";

import { redirect } from "next/navigation";
import { createContext, ReactNode, useContext, useState } from "react";

type User = {
  id?: number;
  username?: string;
  isLoggedIn: boolean;
  email?: string;
};

interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  login: (username: string, id: number, email?: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({
    isLoggedIn: false,
  });

  // 로그인 및 로그아웃 상태 변경 함수
  const login = (username: string, id: number, email?: string) =>
    setUser({ isLoggedIn: true, username, id, email });
  const logout = () => {
    setUser({ isLoggedIn: false });
    redirect("/");
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Context 사용을 위한 커스텀 훅
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
