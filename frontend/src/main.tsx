// frontend/src/main.tsx
import './utils/canvas-polyfill'; // Import canvas polyfill first
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Your main App component

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);