import { useLogs, clearLogs } from "./logger.js";

export default function LogPanel() {
  const logs = useLogs();
  return (
    <div>
      <div className="row between">
        <h2>Render log (mirrors console.log)</h2>
        <button className="ghost" onClick={clearLogs}>Clear log</button>
      </div>
      <div className="log">
        {logs.length === 0 && <div className="muted">No renders logged yet.</div>}
        {logs.map((m, i) => (
          <div key={i} className={m.startsWith("---") ? "sep" : ""}>{m}</div>
        ))}
      </div>
    </div>
  );
}
