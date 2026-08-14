import "dotenv/config";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { initQueueSocket } from "./sockets/queueSocket.js";

async function main() {
  await connectDB();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: { origin: (process.env.CORS_ORIGIN || "").split(",") },
  });
  app.set("io", io);
  initQueueSocket(io);

  const port = process.env.PORT || 5000;
  httpServer.listen(port, () => console.log(`[server] listening on :${port}`));
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
