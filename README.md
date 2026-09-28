# Memoized Event Card (React + Vite)

    npm install
    npm run dev

## Features
- EventCard wrapped in React.memo (logs to console on every render)
- 3 hard-coded events rendered with map() and key={event.id}
- Counter button in the parent
- Extras: add/edit/delete (with Undo), RSVP, favorites, search, category + status filters, sorting, dark mode, localStorage persistence, on-page render log

## What to observe
- Counter click: NO card logs (props unchanged)
- RSVP toggle: only that one card logs
- Add event: only the new card logs
- Delete / search: existing cards do not log
