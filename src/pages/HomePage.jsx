import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { eventApi } from "../api/services";
import { EVENT_STATE } from "../lib/constants";
import { formatDateTime } from "../lib/format";

export default function HomePage() {
  const [activeEvents, setActiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await eventApi.getAll(EVENT_STATE.InProgress);
        if (mounted) setActiveEvents(response.data || []);
      } catch (err) {
        if (mounted) setError(err.message || "No se pudieron cargar los eventos activos.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section>
      <PageHeader
        title="Panel operativo"
        subtitle="Supervisa eventos en curso y accede al flujo de administración."
      />

      <div className="grid-two">
        <article className="panel panel-primary">
          <h3>Eventos activos</h3>
          {loading ? <p className="muted">Cargando eventos...</p> : null}
          {!loading && error ? <p className="error-text">{error}</p> : null}

          {!loading && !error && activeEvents.length === 0 ? (
            <p className="muted">No hay eventos en curso.</p>
          ) : null}

          <div className="stack">
            {activeEvents.map((evt) => (
              <Link key={evt.id} to={`/attendance/${evt.id}`} className="event-card-link">
                <div>
                  <strong>{evt.title}</strong>
                  <p>Inicio: {formatDateTime(evt.scheduledStartDate)}</p>
                </div>
                <span className="pill success">Tomar lista</span>
              </Link>
            ))}
          </div>
        </article>

        <article className="panel">
          <h3>Accesos administrativos</h3>
          <p className="muted">Gestiona personas, grupos y eventos desde aquí.</p>
          <div className="actions-col">
            <Link className="btn secondary" to="/admin/events">
              Gestionar eventos
            </Link>
            <Link className="btn secondary" to="/admin/people">
              Gestionar personas
            </Link>
            <Link className="btn secondary" to="/admin/groups">
              Gestionar grupos
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
