"use client";

import { io } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
console.log("@!#!@#!@#", socketUrl);

export const socket = io(socketUrl);
