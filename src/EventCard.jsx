import React, { useEffect } from "react";
import { addLog } from "./logger.js";

function when(date) {
  if (!date) return "No date";
  const today = new Date().setHours(0, 0, 0, 0);
  const d = Math.round((new Date(date + "T00:00:00") - today) / 864e5);
  if (d === 0) return "Today";
  return d > 0 ? `In ${d} day${d > 1 ? "s" : ""}` : `${-d} day${d < -1 ? "s" : ""} ago`;
}

// 1. EventCard wrapped in React.memo
const EventCard = React.memo(function EventCard({ event, onToggle, onFav, onEdit, onDelete }) {
  // 4. Logs only when this card really re-renders
  console.log("EventCard rendered:", event.title);
  useEffect(() => { addLog(`EventCard rendered: ${event.title}`); });

  return (
    <div className={"card" + (event.going ? " going" : "")}>
      <div className="info">
        <div className="titleRow">
          <button className={"star" + (event.fav ? " on" : "")} onClick={() => onFav(event.id)} title="Favorite">
            {event.fav ? "★" : "☆"}
          </button>
          <strong>{event.title}</strong>
          <span className="chip">{event.category}</span>
        </div>
        <div className="meta">
          📅 {event.date || "—"} · {when(event.date)} &nbsp; 📍 {event.location || "TBA"}
        </div>
        <div className="meta">{event.going ? "✅ You're going" : "Not registered"}</div>
      </div>
      <div className="actions">
        <button onClick={() => onToggle(event.id)}>{event.going ? "Cancel RSVP" : "RSVP"}</button>
        <button className="ghost" onClick={() => onEdit(event.id)}>Edit</button>
        <button className="danger" onClick={() => onDelete(event.id)}>Delete</button>
      </div>
    </div>
  );
});

export default EventCard;
