import { useState } from "react";
import Home from "./views/Home";
import AdminLayout from "./components/AdminLayout";

export default function App() {
  const [screen, setScreen] = useState<"home" | "admin">("home");

  if (screen === "admin") {
    return <AdminLayout onExit={() => setScreen("home")} />;
  }

  return <Home onEnterAdmin={() => setScreen("admin")} />;
}
