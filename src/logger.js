import { useSyncExternalStore } from "react";

// Small store so render logs can also be shown on the page (not just the console)
let logs = [];
const subs = new Set();
const emit = () => subs.forEach((f) => f());

export const addLog = (msg) => { logs = [...logs, msg]; emit(); };
export const clearLogs = () => { logs = []; emit(); };
export const useLogs = () =>
  useSyncExternalStore(
    (f) => { subs.add(f); return () => subs.delete(f); },
    () => logs
  );
