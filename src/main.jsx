import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// StrictMode is intentionally NOT used: in development it renders
// components twice, which would show duplicate console.log lines.
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
