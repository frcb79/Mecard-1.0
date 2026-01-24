import { useState } from "react";

export default function AdminLayout({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState<"dashboard" | "schools">("dashboard");

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: 200, padding: 20, background: "#f2f2f2" }}>
        <h3>Admin</h3>

        <button onClick={() => setView("dashboard")}>
          Dashboard
        </button>

        <button onClick={() => setView("schools")}>
          Escuelas
        </button>

        <hr />
        <button onClick={onExit}>Salir</button>
      </aside>

      <main style={{ flex: 1, padding: 20 }}>
        {view === "dashboard" && <h2>Dashboard Admin</h2>}
        {view === "schools" && <h2>Gestión de Escuelas</h2>}
      </main>
    </div>
  );
}
