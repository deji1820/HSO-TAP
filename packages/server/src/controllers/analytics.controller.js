import VitalsLog from "../models/VitalsLog.js";
import QueueEntry from "../models/QueueEntry.js";

/**
 * GET /api/analytics/summary?days=30
 * Aggregates clinic-wide trends for the admin portal's Data Analytics page.
 * Nothing here reads from Student directly — it's all derived from
 * VitalsLog (capturedAt) and QueueEntry (createdAt) within the window.
 */
export async function getSummary(req, res) {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

  const [visitsByServiceType, feverTrend, bmiDistribution, queueStatusBreakdown, studentsScreenedAgg] =
    await Promise.all([
      QueueEntry.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        { $group: { _id: "$serviceType", count: { $sum: 1 } } },
        { $project: { _id: 0, serviceType: "$_id", count: 1 } },
        { $sort: { count: -1 } },
      ]),

      VitalsLog.aggregate([
        { $match: { capturedAt: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$capturedAt" } },
            totalReadings: { $sum: 1 },
            feverCount: { $sum: { $cond: ["$isFeverFlagged", 1, 0] } },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            totalReadings: 1,
            feverCount: 1,
            feverRatePct: {
              $cond: [
                { $eq: ["$totalReadings", 0] },
                0,
                { $round: [{ $multiply: [{ $divide: ["$feverCount", "$totalReadings"] }, 100] }, 1] },
              ],
            },
          },
        },
        { $sort: { date: 1 } },
      ]),

      VitalsLog.aggregate([
        { $match: { capturedAt: { $gte: from, $lte: to }, bmiCategory: { $ne: null } } },
        { $group: { _id: "$bmiCategory", count: { $sum: 1 } } },
        { $project: { _id: 0, category: "$_id", count: 1 } },
      ]),

      QueueEntry.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]),

      // Distinct students who had at least one vitals reading in range
      VitalsLog.aggregate([
        { $match: { capturedAt: { $gte: from, $lte: to } } },
        { $group: { _id: "$student" } },
        { $count: "total" },
      ]),
    ]);

  res.json({
    range: { from, to, days },
    visitsByServiceType,
    feverTrend,
    bmiDistribution,
    queueStatusBreakdown,
    totalStudentsScreened: studentsScreenedAgg[0]?.total || 0,
  });
}
