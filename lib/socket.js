"use client";

import { io } from "socket.io-client";

export const socket = io("https://chess-app-beryl.vercel.app", {
  transports: ["websocket"], // 폴링을 비활성화하고 WebSocket만 사용
});
