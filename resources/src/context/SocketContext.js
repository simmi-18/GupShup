import { createContext } from "react";
import { io } from "socket.io-client";

const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://gupshup-gulv.onrender.com"
    : "http://localhost:4009"; // your local backend

export const socket = io(BACKEND_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
});

export const SocketContext = createContext(socket);
