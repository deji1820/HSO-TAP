import { useEffect, useState } from "react";
import { getQueue, updateQueueStatus } from "../services/api.js";
import { socket } from "../services/socket.js";

// Matches PDF: Active Queue / High Priority / Completed Today + Live Dynamic Queue List
export default function DashboardPage() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    getQueue().then(setQueue);
    socket.connect();
    socket.on("queue:new", (entry) => setQueue((q) => [...q, entry]));
    socket.on("queue:update", (updated) =>
      setQueue((q) => q.map((e) => (e._id === updated._id ? updated : e)))
    );
    return () => socket.disconnect();
  }, []);

  const highPriorityCount = queue.filter((q) => q.priorityLevel === "High Priority").length;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stat-cards">
        <div>Active Queue: {queue.length}</div>
        <div>High Priority: {highPriorityCount}</div>
      </div>
      <ul>
        {queue.map((entry) => (
          <li key={entry._id}>
            {entry.priorityLevel} — {entry.student?.firstName} {entry.student?.lastName} — {entry.reason}
            <button onClick={() => updateQueueStatus(entry._id, "in_session")}>Start</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
