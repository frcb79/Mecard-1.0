import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  School,
  Users,
  LogOut
} from "lucide-react";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-slate-100">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-5 text-xl font-black tracking-tight">
          MeCard Admin
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem to="/schools" icon={<School size={18} />} label="Escuelas" />
          <NavItem to="/students" icon={<Users size={18} />} label="Alumnos" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">
            Panel Administrativo
          </h1>

          <div className="text-sm text-slate-500">
            Super Admin
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

/* ---------- Helper ---------- */

function NavItem({
  to,
  icon,
  label
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition
        ${
          isActive
            ? "bg-indigo-600 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
