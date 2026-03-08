import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { attendanceApi, eventApi, personApi } from "../api/services";
import { ASSISTANCE_TYPE } from "../lib/constants";
import { personFullName } from "../lib/format";

export default function AttendancePage() {
  const { eventId } = useParams();

  const [currentEvent, setCurrentEvent] = useState(null);
  const [displayedPeople, setDisplayedPeople] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [invitedIds, setInvitedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [showExternalForm, setShowExternalForm] = useState(false);
  const [newExternal, setNewExternal] = useState({ name: "", lastName: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const presentCount = useMemo(() => Object.keys(attendanceMap).length, [attendanceMap]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [eventResp, attendanceResp] = await Promise.all([eventApi.getById(eventId), attendanceApi.getByEvent(eventId)]);
      const evt = eventResp.data;
      setCurrentEvent(evt);

      const invitations = evt?.invitations || [];
      const invitedSet = new Set(invitations.map((inv) => inv.personId));
      setInvitedIds(invitedSet);

      const allPeopleMap = {};
      invitations.forEach((inv) => {
        if (inv.person) allPeopleMap[inv.personId] = inv.person;
      });

      const nextAttendanceMap = {};
      (attendanceResp.data || []).forEach((attendance) => {
        nextAttendanceMap[attendance.personId] = attendance;
        if (!allPeopleMap[attendance.personId] && attendance.person) {
          allPeopleMap[attendance.personId] = attendance.person;
        }
      });

      setAttendanceMap(nextAttendanceMap);

      const people = Object.values(allPeopleMap).sort((a, b) => {
        const byLastName = (a.lastName || "").localeCompare(b.lastName || "");
        if (byLastName !== 0) return byLastName;
        return (a.name || "").localeCompare(b.name || "");
      });
      setDisplayedPeople(people);
    } catch (err) {
      setError(err.message || "No se pudo cargar la asistencia.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [eventId]);

  useEffect(() => {
    let cancelled = false;

    async function searchPeople() {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await personApi.search(searchTerm.trim());
        if (!cancelled) setSearchResults(response.data || []);
      } catch {
        if (!cancelled) setSearchResults([]);
      }
    }

    const timeout = setTimeout(searchPeople, 200);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchTerm]);

  async function markAttendance(personId) {
    try {
      await attendanceApi.mark(eventId, personId, ASSISTANCE_TYPE.Present);
      setSearchTerm("");
      setSearchResults([]);
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo marcar asistencia.");
    }
  }

  async function removeAttendance(personId) {
    try {
      await attendanceApi.remove(eventId, personId);
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo eliminar asistencia.");
    }
  }

  function openExternalFromSearch() {
    const parts = searchTerm.trim().split(/\s+/).filter(Boolean);
    setNewExternal({
      name: parts[0] || "",
      lastName: parts.slice(1).join(" "),
      email: "",
    });
    setShowExternalForm(true);
  }

  async function saveExternal() {
    if (!newExternal.name?.trim()) return;

    try {
      await attendanceApi.registerExternal(eventId, {
        ...newExternal,
        isCreatedAtRuntime: true,
      });
      setShowExternalForm(false);
      setSearchTerm("");
      setSearchResults([]);
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo registrar externo.");
    }
  }

  if (loading) {
    return (
      <section>
        <p className="panel muted">Cargando asistencia...</p>
      </section>
    );
  }

  if (!currentEvent) {
    return (
      <section>
        <p className="panel error-text">Evento no encontrado.</p>
      </section>
    );
  }

  return (
    <section className="attendance-screen">
      <PageHeader
        title={currentEvent.title}
        subtitle={`Presentes: ${presentCount} / ${displayedPeople.length}`}
        actions={
          <Link className="btn ghost" to="/">
            Volver
          </Link>
        }
      />

      {error ? <p className="error-text panel">{error}</p> : null}

      <article className="panel sticky-search">
        <input
          className="input input-strong"
          placeholder="Buscar persona para marcar asistencia"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </article>

      {searchTerm.trim() ? (
        <article className="panel">
          <h3>Resultados</h3>
          <div className="stack">
            {searchResults.length === 0 ? (
              <div className="empty-state">
                <p>No se encontraron coincidencias para "{searchTerm}".</p>
                {currentEvent.allowExternal ? (
                  <button className="btn" type="button" onClick={openExternalFromSearch}>
                    Registrar externo con este nombre
                  </button>
                ) : (
                  <p className="muted">Este evento no permite externos.</p>
                )}
              </div>
            ) : (
              searchResults.map((person) => {
                const isPresent = Boolean(attendanceMap[person.id]);
                return (
                  <div key={person.id} className="list-row">
                    <div>
                      <strong>{personFullName(person)}</strong>
                      <p>{person.email || "Sin email"}</p>
                    </div>
                    {isPresent ? (
                      <button className="btn tiny danger" onClick={() => removeAttendance(person.id)} type="button">
                        Deshacer
                      </button>
                    ) : (
                      <button className="btn tiny" onClick={() => markAttendance(person.id)} type="button">
                        Marcar
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </article>
      ) : (
        <article className="panel">
          <h3>Listado general</h3>
          <div className="stack">
            {displayedPeople.map((person) => {
              const isPresent = Boolean(attendanceMap[person.id]);
              const isUninvited = !invitedIds.has(person.id);

              return (
                <div key={person.id} className={`list-row ${isPresent ? "success-row" : ""}`}>
                  <div>
                    <strong>{personFullName(person)}</strong>
                    <p>
                      {isUninvited ? <span className="pill warning">Extra</span> : null}
                      {isPresent ? <span className="pill success">Presente</span> : <span className="pill muted">Pendiente</span>}
                    </p>
                  </div>

                  {isPresent ? (
                    <button className="btn tiny danger" onClick={() => removeAttendance(person.id)} type="button">
                      Deshacer
                    </button>
                  ) : (
                    <button className="btn tiny secondary" onClick={() => markAttendance(person.id)} type="button">
                      Marcar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </article>
      )}

      {showExternalForm ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Registrar externo</h3>
            <label className="field">
              <span>Nombre</span>
              <input
                className="input"
                value={newExternal.name}
                onChange={(event) => setNewExternal((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Apellido</span>
              <input
                className="input"
                value={newExternal.lastName}
                onChange={(event) => setNewExternal((prev) => ({ ...prev, lastName: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                className="input"
                value={newExternal.email}
                onChange={(event) => setNewExternal((prev) => ({ ...prev, email: event.target.value }))}
              />
            </label>
            <div className="actions-inline">
              <button className="btn ghost" onClick={() => setShowExternalForm(false)} type="button">
                Cancelar
              </button>
              <button className="btn" onClick={saveExternal} type="button">
                Guardar y marcar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
