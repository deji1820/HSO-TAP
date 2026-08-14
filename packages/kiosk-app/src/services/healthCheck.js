import { api } from "./api.js";

const CHECK_INTERVAL_MS = 5000;
const FAILURES_BEFORE_OFFLINE = 2; // ~10s of downtime before we lock the kiosk out

/**
 * Polls GET /api/health on a fixed interval. Calls onStatusChange(isOnline)
 * only when the status actually flips, so the caller doesn't need to
 * debounce anything itself. Runs independently of whatever kiosk screen is
 * currently showing — this is deliberate: a health check tied to a specific
 * screen's lifecycle would stop running the moment the student navigates
 * away from that screen, which defeats the point.
 */
export function startHealthMonitor(onStatusChange) {
  let consecutiveFailures = 0;
  let isOnline = true;

  const intervalId = setInterval(async () => {
    try {
      await api.get("/health", { timeout: 3000 });
      if (!isOnline) {
        isOnline = true;
        consecutiveFailures = 0;
        onStatusChange(true);
      }
    } catch {
      consecutiveFailures += 1;
      if (isOnline && consecutiveFailures >= FAILURES_BEFORE_OFFLINE) {
        isOnline = false;
        onStatusChange(false);
      }
    }
  }, CHECK_INTERVAL_MS);

  return () => clearInterval(intervalId);
}
