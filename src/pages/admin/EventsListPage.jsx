import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { eventApi } from "../../api/services";
import { EVENT_STATE } from "../../lib/constants";
import { formatDateTime } from "../../lib/format";

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents() {
    setLoading(true);
    setError("");
    try {
      const response = await eventApi.getAll();
      setEvents(response.data || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los eventos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <section>
      <PageHeader
        title="Eventos"
        subtitle={`${events.length} eventos registrados`}
        actions={
          <Link className="btn" to="/admin/events/create">
            + Nuevo evento
          </Link>
        }
      />

      <div className="panel">
        {loading ? <p className="muted">Cargando...</p> : null}
        {!loading && error ? <p className="error-text">{error}</p> : null}

        {!loading && !error && events.length === 0 ? <p className="muted">No hay eventos creados.</p> : null}

        {!loading && !error && events.length > 0 ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Título</th>
                  <th>Inicio</th>
                  <th>Flags</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => (
                  <tr key={evt.id}>
                    <td>
                      <StatusBadge state={evt.state} />
                    </td>
                    <td>{evt.title}</td>
                    <td>{formatDateTime(evt.scheduledStartDate)}</td>
                    <td>
                      <div className="badges-inline">
                        {evt.allowUninvited ? <span className="pill muted">No invitados</span> : null}
                        {evt.allowExternal ? <span className="pill muted">Externos</span> : null}
                        {evt.autoStart ? <span className="pill muted">Auto inicio</span> : null}
                      </div>
                    </td>
                    <td>
                      <div className="actions-inline">
                        <Link className="btn tiny secondary" to={`/admin/events/edit/${evt.id}`}>
                          Editar
                        </Link>
                        {evt.state === EVENT_STATE.InProgress ? (
                          <Link className="btn tiny" to={`/attendance/${evt.id}`}>
                            Tomar lista
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
