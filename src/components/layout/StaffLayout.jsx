import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/staff/attendance", label: "Asistencia", icon: "how_to_reg" },
  // { to: "/admin/events", label: "Eventos", icon: "calendar_today" },
  { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
];

export default function StaffLayout({ children }) {
  return (
    <div className="min-h-screen bg-background-light text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">church</span>
            </div>
            <div>
              <h1 className="text-slate-900 font-bold text-base leading-tight">Gestión Iglesia</h1>
              <p className="text-slate-500 text-xs">Modo Asistencia</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50",
                  ].join(" ")
                }
              >
                <span className="material-symbols-outlined text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
