import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import EventCard from "./EventCard.jsx";
import LogPanel from "./LogPanel.jsx";
import { addLog } from "./logger.js";

const CATEGORIES = ["Workshop", "Hackathon", "Meetup", "Conference"];

// 2. Hard-coded events (initial data)
const initialEvents = [
  { id: 1, title: "React Workshop", date: "2026-10-12", location: "Room 204", category: "Workshop", going: false, fav: false },
  { id: 2, title: "Hackathon 2026", date: "2026-11-02", location: "Main Hall", category: "Hackathon", going: false, fav: false },
  { id: 3, title: "Tech Meetup", date: "2026-10-20", location: "Auditorium A", category: "Meetup", going: false, fav: false },
];
const emptyForm = { title: "", date: "", location: "", category: "Workshop" };

const load = () => {
  try { const s = localStorage.getItem("events-v2"); return s ? JSON.parse(s) : initialEvents; }
  catch { return initialEvents; }
};

export default function App() {
  const [events, setEvents] = useState(load);
  const [count, setCount] = useState(0);              // 3. Counter in the parent
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState("All");            // All | Going | Favorites
  const [sort, setSort] = useState("date");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [dark, setDark] = useState(false);

  const eventsRef = useRef(events);
  eventsRef.current = events;
  const nextId = useRef(Math.max(0, ...events.map((e) => e.id)) + 1);
  const timer = useRef(null);

  useEffect(() => { try { localStorage.setItem("events-v2", JSON.stringify(events)); } catch {} }, [events]);
  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);

  const showToast = (msg, undo) => {
    clearTimeout(timer.current);
    setToast({ msg, undo });
    timer.current = setTimeout(() => setToast(null), 5000);
  };

  // Stable callbacks (useCallback) so React.memo can skip unchanged cards
  const toggleRsvp = useCallback((id) => {
    setEvents((p) => p.map((e) => (e.id === id ? { ...e, going: !e.going } : e)));
    addLog("--- RSVP toggled (only that card re-renders) ---");
  }, []);

  const toggleFav = useCallback((id) => {
    setEvents((p) => p.map((e) => (e.id === id ? { ...e, fav: !e.fav } : e)));
    addLog("--- favorite toggled (only that card re-renders) ---");
  }, []);

  const startEdit = useCallback((id) => {
    const ev = eventsRef.current.find((e) => e.id === id);
    if (!ev) return;
    setForm({ title: ev.title, date: ev.date, location: ev.location, category: ev.category });
    setEditingId(id);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const deleteEvent = useCallback((id) => {
    const list = eventsRef.current;
    const index = list.findIndex((e) => e.id === id);
    if (index < 0) return;
    const removed = list[index];
    setEvents((p) => p.filter((e) => e.id !== id));
    addLog("--- event deleted (other cards do NOT re-render) ---");
    showToast(`Deleted "${removed.title}"`, () => {
      setEvents((p) => { const c = [...p]; c.splice(Math.min(index, c.length), 0, removed); return c; });
      setToast(null);
    });
  }, []);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    const clean = { ...form, title: form.title.trim(), location: form.location.trim() };
    if (editingId) {
      setEvents((p) => p.map((e) => (e.id === editingId ? { ...e, ...clean } : e)));
      addLog("--- event edited (only that card re-renders) ---");
      showToast("Event updated");
    } else {
      setEvents((p) => [...p, { id: nextId.current++, ...clean, going: false, fav: false }]);
      addLog("--- event added (only the new card renders) ---");
      showToast("Event added");
    }
    setForm(emptyForm); setEditingId(null); setError("");
  };

  const cancelEdit = () => { setForm(emptyForm); setEditingId(null); setError(""); };

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return events
      .filter((e) => (e.title + " " + e.location).toLowerCase().includes(q))
      .filter((e) => category === "All" || e.category === category)
      .filter((e) => view === "All" || (view === "Going" ? e.going : e.fav))
      .sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : (a.date || "9").localeCompare(b.date || "9"));
  }, [events, query, category, view, sort]);

  return (
    <div className="wrap">
      <div className="row between">
        <h1>Memoized Event Card</h1>
        <button className="ghost" onClick={() => setDark(!dark)}>{dark ? "☀️ Light" : "🌙 Dark"}</button>
      </div>
      <p className="sub">Interact with anything below and watch the render log: only cards whose props change re-render.</p>

      <div className="stats">
        <span>Total <b>{events.length}</b></span>
        <span>Going <b>{events.filter((e) => e.going).length}</b></span>
        <span>Favorites <b>{events.filter((e) => e.fav).length}</b></span>
        <span>Counter <b>{count}</b></span>
      </div>

      <div className="panel">
        <h2>{editingId ? "Edit event" : "Add event"}</h2>
        <div className="grid">
          <input placeholder="Title *" value={form.title} onChange={setField("title")} onKeyDown={(e) => e.key === "Enter" && submit()} />
          <input type="date" value={form.date} onChange={setField("date")} />
          <input placeholder="Location" value={form.location} onChange={setField("location")} />
          <select value={form.category} onChange={setField("category")}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="row">
          <button onClick={submit}>{editingId ? "Save changes" : "Add event"}</button>
          {editingId && <button className="ghost" onClick={cancelEdit}>Cancel</button>}
        </div>
      </div>

      <div className="panel">
        <div className="row">
          <input placeholder="🔍 Search title or location…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date">Sort: Date</option>
            <option value="title">Sort: Title</option>
          </select>
        </div>
        <div className="chips">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} className={"pill" + (category === c ? " active" : "")} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        <div className="chips">
          {["All", "Going", "Favorites"].map((v) => (
            <button key={v} className={"pill" + (view === v ? " active" : "")} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
        <div className="row">
          <button onClick={() => { setCount(count + 1); addLog("--- counter clicked (parent re-rendered, cards should NOT) ---"); }}>
            Counter: {count}
          </button>
          <button className="ghost" onClick={() => { setEvents(initialEvents); showToast("Demo data restored"); }}>Reset demo data</button>
        </div>
      </div>

      <h2>Events ({visible.length})</h2>
      {visible.map((event) => (
        <EventCard key={event.id} event={event} onToggle={toggleRsvp} onFav={toggleFav} onEdit={startEdit} onDelete={deleteEvent} />
      ))}
      {visible.length === 0 && <p className="muted">No events match your filters.</p>}

      <LogPanel />

      {toast && (
        <div className="toast">
          <span>{toast.msg}</span>
          {toast.undo && <button className="ghost" onClick={toast.undo}>Undo</button>}
        </div>
      )}
    </div>
  );
}
