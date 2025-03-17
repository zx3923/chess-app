"use client";

import { io } from "socket.io-client";

export const socket = io("https://chess-server-production.up.railway.app");
