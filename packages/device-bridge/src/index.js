import "dotenv/config";
import { WebSocketServer } from "ws";
import { openSerial } from "./serial/serialManager.js";

// Local WebSocket server the kiosk-app (running in the same Pi's browser) connects to.
const wss = new WebSocketServer({ port: process.env.BRIDGE_WS_PORT || 6060 });
console.log(`[bridge] WebSocket server on :${process.env.BRIDGE_WS_PORT || 6060}`);

function broadcast(event) {
  const payload = JSON.stringify(event);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(payload);
  });
}

openSerial(
  { path: process.env.SERIAL_PORT || "/dev/ttyUSB0", baudRate: Number(process.env.SERIAL_BAUD) || 115200 },
  broadcast
);

wss.on("connection", (ws) => {
  console.log("[bridge] kiosk-app connected");
  ws.on("close", () => console.log("[bridge] kiosk-app disconnected"));
});
