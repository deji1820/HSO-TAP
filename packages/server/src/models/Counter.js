import mongoose from "mongoose";

/**
 * Generic atomic counter, keyed by an arbitrary string (e.g. "M-20260814").
 * Used by queueNumbering.service.js to hand out gap-free, race-safe
 * per-service-type daily sequence numbers (QueueEntry.queueNumber).
 *
 * Not tied to any one collection on purpose — findOneAndUpdate with $inc
 * and upsert:true is atomic at the document level in MongoDB, which is
 * what makes this safe under concurrent kiosk submissions (the same class
 * of race condition already hit once during kiosk-app testing, per the
 * handoff notes — two near-simultaneous requests must not get the same
 * queue number).
 */
const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model("Counter", counterSchema);
