"use client";

import { Loader2 } from "lucide-react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  id?: number;
  username?: string;
  isLoggedIn: boolean;
  email?: string;
  blitzRating?: number;
  bulletRating?: number;
  rapidRating?: number;
};

interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  // login: (username: string, id: number, email?: string) => void;
  login: (userData: Omit<User, "isLoggedIn">) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({
    isLoggedIn: false,
  });
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    async function getUser() {
      const response = await fetch("/api/getUser", {
        cache: "no-store",
      });
      if (response.ok) {
        const userData = await response.json();
        setUser({
          isLoggedIn: true,
          id: userData.id,
          username: userData.user_name,
          email: userData.email,
          blitzRating: userData.blitzRating,
          bulletRating: userData.bulletRating,
          rapidRating: userData.rapidRating,
        });
      }
      setIsLoading(false); // 데이터 가져오기가 끝나면 로딩 상태 해제
    }
    getUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-800">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <span className="text-xl font-semibold mb-6">로딩 중...</span>
        </div>
      </div>
    ); // 데이터를 기다리는 동안 로딩 화면 표시
  }

  const login = (userData: Omit<User, "isLoggedIn">) => {
    setUser((prev) => ({ ...prev, ...userData, isLoggedIn: true }));
  };

  const logout = () => {
    setUser({
      isLoggedIn: false,
      id: undefined,
      username: undefined,
      email: undefined,
    });
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
