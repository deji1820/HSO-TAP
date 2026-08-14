/**
 * Wires Socket.IO for the Live Nurse/Doctor Dashboard.
 * kiosk.controller.js emits "queue:new"; staff clients listen for it
 * and for "queue:update" (called / in_session / completed transitions).
 */
export function initQueueSocket(io) {
  io.on("connection", (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);
    socket.on("disconnect", () => console.log(`[socket] client disconnected: ${socket.id}`));
  });
}
