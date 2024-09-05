import React from "react";
import ReactDOM from "react-dom/client";
import Sandbox from "./Sandbox";
import './main.css'

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Sandbox />
  </React.StrictMode>,
);
