import { io } from "socket.io-client";

// Single shared socket for live queue updates on the Dashboard page.
export const socket = io(import.meta.env.VITE_SOCKET_URL, { autoConnect: false });
