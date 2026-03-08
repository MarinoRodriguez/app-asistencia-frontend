import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { eventApi, groupApi, personApi } from "../../api/services";
import { EVENT_STATE } from "../../lib/constants";
import { fromDateTimeLocalInput, personFullName, toDateTimeLocalInput } from "../../lib/format";

const emptyEvent = {
  title: "",
  description: "",
  scheduledStartDate: new Date().toISOString(),
  allowUninvited: false,
  allowExternal: false,
  autoStart: false,
  state: EVENT_STATE.Draft,
  invitations: [],
};

export default function EventEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [eventData, setEventData] = useState(emptyEvent);
  const [activeTab, setActiveTab] = useState("details");
  const [inviteMode, setInviteMode] = useState("person");
  const [personTerm, setPersonTerm] = useState("");
  const [personResults, setPersonResults] = useState([]);
  const [groups, setGroups] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const invitedIds = useMemo(() => new Set((eventData.invitations || []).map((inv) => inv.personId)), [eventData.invitations]);
  const isFinished = eventData.state === EVENT_STATE.Finished;

  async function loadGroups() {
    try {
      const response = await groupApi.getAll();
      setGroups(response.data || []);
    } catch {
      setGroups([]);
    }
  }

  async function loadEvent() {
    if (!isEdit) return;
    setLoading(true);
    setError("");
    try {
      const response = await eventApi.getById(id);
      setEventData(response.data || emptyEvent);
    } catch (err) {
      setError(err.message || "No se pudo cargar el evento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroups();
    loadEvent();
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function searchPeople() {
      try {
        const response = personTerm.trim() ? await personApi.search(personTerm.trim()) : await personApi.getAll();
        if (!cancelled) setPersonResults(response.data || []);
      } catch {
        if (!cancelled) setPersonResults([]);
      }
    }

    if (activeTab !== "invitations") return;
    const timeout = setTimeout(searchPeople, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [personTerm, activeTab]);

  async function saveEvent(event) {
    event.preventDefault();
    if (isFinished) return;
    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      ...eventData,
      scheduledStartDate: eventData.scheduledStartDate,
    };

    try {
      if (isEdit) {
        await eventApi.update(id, payload);
        setMessage("Evento actualizado.");
        await loadEvent();
      } else {
        const response = await eventApi.create(payload);
        const newId = response.data?.id;
        setMessage("Evento creado. Continúa con invitaciones desde editar.");
        if (newId) navigate(`/admin/events/edit/${newId}`);
      }
    } catch (err) {
      setError(err.message || "No se pudo guardar el evento.");
    } finally {
      setSaving(false);
    }
  }

  async function onStart() {
    try {
      await eventApi.start(id);
      await loadEvent();
    } catch (err) {
      setError(err.message || "No se pudo iniciar.");
    }
  }

  async function onFinish() {
    try {
      await eventApi.finish(id);
      await loadEvent();
    } catch (err) {
      setError(err.message || "No se pudo finalizar.");
    }
  }

  async function invitePerson(personId) {
    if (invitedIds.has(personId)) return;
    try {
      await eventApi.invitePerson(id, personId);
      await loadEvent();
    } catch (err) {
      setError(err.message || "No se pudo invitar la persona.");
    }
  }

  async function inviteAllResults() {
    for (const person of personResults) {
      if (!invitedIds.has(person.id)) {
        await eventApi.invitePerson(id, person.id);
      }
    }
    await loadEvent();
  }

  async function removeInvitation(personId) {
    try {
      await eventApi.removeInvitation(id, personId);
      await loadEvent();
    } catch (err) {
      setError(err.message || "No se pudo quitar invitación.");
    }
  }

  async function inviteGroup(groupId) {
    try {
      await eventApi.inviteGroup(id, groupId);
      await loadEvent();
    } catch (err) {
      setError(err.message || "No se pudo invitar grupo.");
    }
  }

  function toggleGroup(groupId) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  return (
    <section>
      <PageHeader
        title={isEdit ? "Editar evento" : "Nuevo evento"}
        subtitle="Configura estado, flags e invitaciones."
        actions={
          isEdit ? (
            <div className="actions-inline">
              <StatusBadge state={eventData.state} />
              {(eventData.state === EVENT_STATE.Draft || eventData.state === EVENT_STATE.Scheduled) && (
                <button type="button" className="btn" onClick={onStart}>
                  Iniciar
                </button>
              )}
              {eventData.state === EVENT_STATE.InProgress && (
                <>
                  <button type="button" className="btn danger" onClick={onFinish}>
                    Finalizar
                  </button>
                  <Link className="btn secondary" to={`/attendance/${id}`}>
                    Tomar lista
                  </Link>
                </>
              )}
              {eventData.state === EVENT_STATE.Finished ? (
                <Link className="btn secondary" to={`/attendance/${id}`}>
                  Ver asistencia
                </Link>
              ) : null}
            </div>
          ) : null
        }
      />

      <div className="tabs">
        <button className={`tab-btn ${activeTab === "details" ? "active" : ""}`} onClick={() => setActiveTab("details")}>
          Detalles
        </button>
        {isEdit ? (
          <button className={`tab-btn ${activeTab === "invitations" ? "active" : ""}`} onClick={() => setActiveTab("invitations")}>
            Invitaciones ({eventData.invitations?.length || 0})
          </button>
        ) : null}
      </div>

      {isFinished ? (
        <p className="panel warning-text">Este evento está finalizado. Solo puedes visualizar la información.</p>
      ) : null}
      {error ? <p className="error-text panel">{error}</p> : null}
      {message ? <p className="ok-text panel">{message}</p> : null}

      {activeTab === "details" ? (
        <form className="panel form-panel" onSubmit={saveEvent}>
          {loading ? <p className="muted">Cargando...</p> : null}

          {!loading ? (
            <>
              <label className="field">
                <span>Título</span>
                <input
                  className="input"
                  value={eventData.title || ""}
                  onChange={(event) => setEventData((prev) => ({ ...prev, title: event.target.value }))}
                  required
                  disabled={isFinished}
                />
              </label>

              <label className="field">
                <span>Fecha y hora de inicio</span>
                <input
                  className="input"
                  type="datetime-local"
                  value={toDateTimeLocalInput(eventData.scheduledStartDate)}
                  onChange={(event) =>
                    setEventData((prev) => ({
                      ...prev,
                      scheduledStartDate: fromDateTimeLocalInput(event.target.value),
                    }))
                  }
                  disabled={isFinished}
                />
              </label>

              <label className="field">
                <span>Descripción</span>
                <textarea
                  className="input"
                  rows={4}
                  value={eventData.description || ""}
                  onChange={(event) => setEventData((prev) => ({ ...prev, description: event.target.value }))}
                  disabled={isFinished}
                />
              </label>

              <div className="check-grid">
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={Boolean(eventData.allowUninvited)}
                    onChange={(event) => setEventData((prev) => ({ ...prev, allowUninvited: event.target.checked }))}
                    disabled={isFinished}
                  />
                  <span>Permitir no invitados</span>
                </label>

                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={Boolean(eventData.allowExternal)}
                    onChange={(event) => setEventData((prev) => ({ ...prev, allowExternal: event.target.checked }))}
                    disabled={isFinished}
                  />
                  <span>Permitir externos</span>
                </label>

                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={Boolean(eventData.autoStart)}
                    onChange={(event) => setEventData((prev) => ({ ...prev, autoStart: event.target.checked }))}
                    disabled={isFinished}
                  />
                  <span>Auto inicio programado</span>
                </label>
              </div>

              <div className="actions-inline">
                <Link className="btn ghost" to="/admin/events">
                  Cancelar
                </Link>
                {!isFinished ? (
                  <button className="btn" type="submit" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                ) : null}
              </div>
            </>
          ) : null}
        </form>
      ) : null}

      {activeTab === "invitations" ? (
        <div className="grid-two">
          <article className="panel">
            <h3>Agregar invitados</h3>
            <div className="actions-inline">
              <button className={`btn tiny ${inviteMode === "person" ? "" : "secondary"}`} onClick={() => setInviteMode("person")} type="button">
                Personas
              </button>
              <button className={`btn tiny ${inviteMode === "group" ? "" : "secondary"}`} onClick={() => setInviteMode("group")} type="button">
                Grupos
              </button>
            </div>

            {inviteMode === "person" ? (
              <>
                <input
                  className="input"
                  placeholder="Buscar persona"
                  value={personTerm}
                  onChange={(event) => setPersonTerm(event.target.value)}
                />

                {personResults.length > 1 ? (
                  <button className="btn tiny ghost" onClick={inviteAllResults} type="button">
                    Invitar resultados
                  </button>
                ) : null}

                <div className="stack max-list">
                  {personResults.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      className={`list-row-btn ${invitedIds.has(person.id) ? "disabled" : ""}`}
                      onClick={() => invitePerson(person.id)}
                      disabled={invitedIds.has(person.id)}
                    >
                      <span>{personFullName(person)}</span>
                      <span className="pill muted">{invitedIds.has(person.id) ? "Invitado" : "Invitar"}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="stack max-list">
                {groups.map((group) => (
                  <div key={group.id} className="group-accordion">
                    <div className="group-head">
                      <button className="btn tiny ghost" type="button" onClick={() => toggleGroup(group.id)}>
                        {expandedGroups.has(group.id) ? "Ocultar" : "Ver"}
                      </button>
                      <strong>{group.name}</strong>
                      <button className="btn tiny" type="button" onClick={() => inviteGroup(group.id)}>
                        Invitar
                      </button>
                    </div>
                    {expandedGroups.has(group.id) ? (
                      <div className="group-body">
                        {(group.personGroups || []).length > 0 ? (
                          (group.personGroups || []).map((pg) => <p key={`${group.id}-${pg.personId}`}>{personFullName(pg.person)}</p>)
                        ) : (
                          <p className="muted">Sin miembros</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel">
            <h3>Invitados actuales ({eventData.invitations?.length || 0})</h3>
            <div className="stack max-list">
              {(eventData.invitations || []).length === 0 ? <p className="muted">Sin invitados por ahora.</p> : null}
              {(eventData.invitations || []).map((invitation) => (
                <div key={`${invitation.eventId}-${invitation.personId}`} className="list-row">
                  <div>
                    <strong>{personFullName(invitation.person)}</strong>
                    <p>{invitation.person?.email || "Sin email"}</p>
                  </div>
                  <button className="btn tiny danger" type="button" onClick={() => removeInvitation(invitation.personId)}>
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
