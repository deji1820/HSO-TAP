// Matches PDF: "Data Analytics" screen — trends on illness/fever rates,
// visit volume by service type, etc.
//
// NOT BUILT: unlike EMR/Forms/Admin, there is no backend endpoint that
// aggregates across students (e.g. "fever rate this week", "visits by
// service type this month"). The only data-fetching routes available today
// are per-student (getFullEmr) or raw lists capped at 100 rows
// (getStudents, getSyncLog) — nothing suited to computing trends across the
// whole clinic without pulling and aggregating a lot of data client-side.
//
// This page is left as an honest placeholder rather than faked with static
// numbers. To build it for real, the server needs a small new aggregation
// endpoint — e.g. GET /api/analytics/summary using MongoDB's aggregation
// pipeline over VitalsLog/QueueEntry (grouped by day/service type/fever
// flag). Happy to draft that endpoint if you want to unblock this page.
export default function AnalyticsPage() {
  return (
    <div className="analytics-page">
      <h1>Data Analytics</h1>
      <div className="analytics-placeholder">
        <p>This page isn't built yet — it needs a backend aggregation endpoint that doesn't exist in the server code yet.</p>
        <p>
          Every other admin page (EMR, Forms, Admin) is backed by an API that already computes what the
          page needs. Data Analytics is different — it needs to summarize <em>all</em> students' vitals and
          visits over time (fever rate trends, visit volume by service type, etc.), and there's currently no
          endpoint that does that aggregation server-side.
        </p>
        <p>Once a summary endpoint exists (e.g. <code>GET /api/analytics/summary</code>), this page can be built out properly.</p>
      </div>
    </div>
  );
}
