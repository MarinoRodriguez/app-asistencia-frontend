import { NavLink, Outlet } from "react-router-dom";

const menu = [
  { to: "/", label: "Inicio" },
  { to: "/admin/events", label: "Eventos" },
  { to: "/admin/people", label: "Personas" },
  { to: "/admin/groups", label: "Grupos" },
];

export default function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="brand-kicker">Asistencia</p>
          <h1>Control en tiempo real</h1>
          <p>Admin desktop + Staff mobile en una sola app.</p>
        </div>
        <nav className="main-nav">
          {menu.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} end={item.to === "/"}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content-area">
        <Outlet />
      </main>

      <nav className="mobile-nav">
        {menu.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `mobile-item ${isActive ? "active" : ""}`} end={item.to === "/"}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
