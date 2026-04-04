import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./config/i18n"; // Initialize i18n before app renders
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
