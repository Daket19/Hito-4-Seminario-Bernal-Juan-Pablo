import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"

createRoot(document.getElementById("root")).render(
  <StrictMode><App apiUrl="http://localhost:8000/query" useDemoFallback={false} /></StrictMode>
)
