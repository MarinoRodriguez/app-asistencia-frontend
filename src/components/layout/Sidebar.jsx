import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/admin/people-and-groups", label: "Personas", icon: "person" },
  { to: "/admin/events", label: "Eventos", icon: "calendar_today" },
  { to: "/staff/attendance", label: "Asistencia", icon: "how_to_reg" },
  { to: "/admin/analytics", label: "Reportes", icon: "bar_chart" },
  { to: "/admin/security", label: "administración", icon: "lock" },
];

export default function Sidebar() {
  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined">church</span>
          </div>
          <div>
            <h1 className="text-slate-900 font-bold text-sm leading-tight">Gestión Iglesia</h1>
            <p className="text-slate-500 text-xs font-normal">Admin Central</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")
            }
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <button
          className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors w-full"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
