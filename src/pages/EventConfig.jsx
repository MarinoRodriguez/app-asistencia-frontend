import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import { eventApi, groupApi } from "../api/services";
import { formatDateTime } from "../lib/format";
import TimePickerPopover from "../components/ui/TimePickerPopover";
import { EVENT_STATE } from "../lib/constants";

function splitDateTime(dateString) {
  if (!dateString) return { date: "", time: "" };
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };
  const iso = date.toISOString();
  return {
    date: iso.slice(0, 10),
    time: iso.slice(11, 16),
  };
}

export default function EventConfig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [eventState, setEventState] = useState(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [allowUninvited, setAllowUninvited] = useState(true);
  const [allowExternal, setAllowExternal] = useState(false);
  const [autoStart, setAutoStart] = useState(true);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const groupsRes = await groupApi.getAll(true);
        if (!isMounted) return;
        setGroups(groupsRes.data || []);

        if (!isNew) {
          const eventRes = await eventApi.getById(id);
          if (!isMounted) return;
          const evt = eventRes.data;
          setTitle(evt.title || "");
          setDescription(evt.description || "");
          const split = splitDateTime(evt.scheduledStartDate);
          setDate(split.date);
          setTime(split.time);
          setEventState(evt.state);
          setAllowUninvited(Boolean(evt.allowUninvited));
          setAllowExternal(Boolean(evt.allowExternal));
          setAutoStart(Boolean(evt.autoStart));
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Error al cargar el evento");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [id, isNew]);


  const selectedGroupObjects = useMemo(
    () => groups.filter((group) => selectedGroups.includes(group.id)),
    [groups, selectedGroups]
  );

  const timeParts = useMemo(() => {
    if (!time) return { hour: "12", minute: "00", period: "AM" };
    const [rawHour, rawMinute] = time.split(":");
    const hour24 = Number(rawHour || 0);
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return {
      hour: String(hour12).padStart(2, "0"),
      minute: String(rawMinute || "00").padStart(2, "0"),
      period,
    };
  }, [time]);

  const handleToggleGroup = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((idValue) => idValue !== groupId) : [...prev, groupId]
    );
  };

  const handleSave = async () => {
    if (!isNew && eventState === EVENT_STATE.Finished) return;
    setSaving(true);
    setError("");
    setInfo("");
    try {
      const scheduledStartDate = date ? new Date(`${date}T${time || "00:00"}:00`).toISOString() : null;
      const payload = {
        title,
        description,
        scheduledStartDate,
        allowUninvited,
        allowExternal,
        autoStart,
      };

      let eventId = id;
      if (isNew) {
        const created = await eventApi.create(payload);
        eventId = created.data.id;
      } else {
        await eventApi.update(id, payload);
      }

      for (const groupId of selectedGroups) {
        await eventApi.inviteGroup(eventId, groupId);
      }

      setInfo("Evento guardado correctamente");
      if (isNew) {
        navigate(`/admin/events/${eventId}/config`, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Error al guardar el evento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configuración de Evento</h2>
            <p className="text-slate-500 mt-1">
              {isNew ? "Complete los detalles para programar un nuevo evento." : "Actualice los datos del evento."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              onClick={() => navigate("/admin/events")}
            >
              Cancelar
            </button>
            {eventState !== EVENT_STATE.Finished ? (
              <button
                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-blue-700 shadow-sm shadow-primary/20 transition-all"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar Evento"}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {loading && <p className="text-slate-500">Cargando configuración...</p>}
          {error && <p className="text-rose-600">{error}</p>}
          {info && <p className="text-emerald-600">{info}</p>}
          {!isNew && eventState === EVENT_STATE.Finished ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Este evento está finalizado. Puedes visualizar la información, pero no modificarla.
            </div>
          ) : null}

          {!loading && (
            <>
              <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <h3 className="text-xl font-bold text-slate-900">Información General</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nombre del Evento</label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                      placeholder="Ej. Retiro Espiritual 2024"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      disabled={!isNew && eventState === EVENT_STATE.Finished}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Descripción</label>
                    <textarea
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                      rows={3}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Detalle breve del evento"
                      disabled={!isNew && eventState === EVENT_STATE.Finished}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Fecha</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">
                        calendar_month
                      </span>
                      <input
                        className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        disabled={!isNew && eventState === EVENT_STATE.Finished}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Hora</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">
                        schedule
                      </span>
                      <input
                        className="w-full pl-11 pr-12 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                        type="text"
                        readOnly
                        value={`${timeParts.hour}:${timeParts.minute} ${timeParts.period}`}
                        onClick={() =>
                          !isNew && eventState === EVENT_STATE.Finished ? null : setTimePickerOpen((prev) => !prev)
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        onClick={() =>
                          !isNew && eventState === EVENT_STATE.Finished ? null : setTimePickerOpen((prev) => !prev)
                        }
                      >
                        <span className="material-symbols-outlined text-xl">schedule</span>
                      </button>

                      <TimePickerPopover
                        open={timePickerOpen}
                        value={time}
                        onChange={setTime}
                        onClose={() => setTimePickerOpen(false)}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Grupos Invitados</label>
                    <div className="min-h-[56px] p-2 rounded-lg border border-slate-300 bg-white flex flex-wrap gap-2 items-center">
                      {selectedGroupObjects.map((group) => (
                        <span
                          key={group.id}
                          className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20"
                        >
                          {group.name}
                          <button
                            type="button"
                            className="material-symbols-outlined text-sm"
                            onClick={() => handleToggleGroup(group.id)}
                            disabled={!isNew && eventState === EVENT_STATE.Finished}
                          >
                            close
                          </button>
                        </span>
                      ))}
                      <div className="ml-auto text-primary text-sm font-semibold flex items-center gap-1 pr-2">
                        <span className="material-symbols-outlined text-base">add</span>
                        Seleccionar Grupo
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                      {groups.map((group) => (
                        <label
                          key={group.id}
                          className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.id)}
                            onChange={() => handleToggleGroup(group.id)}
                            disabled={!isNew && eventState === EVENT_STATE.Finished}
                          />
                          {group.name}
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedGroups.length ? `Seleccionados: ${selectedGroups.length}` : "Seleccione los ministerios o grupos que participarán."}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
                  <span className="material-symbols-outlined text-primary">rule</span>
                  <h3 className="text-xl font-bold text-slate-900">Reglas del Evento</h3>
                </div>
                <div className="space-y-8">
                  <div className="flex items-start justify-between group">
                    <div className="max-w-2xl">
                      <h4 className="text-base font-bold text-slate-900">Permitir No Invitados</h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        Permite que personas que no están en los grupos seleccionados marquen asistencia.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        className="sr-only peer"
                        type="checkbox"
                        checked={allowUninvited}
                        onChange={(event) => setAllowUninvited(event.target.checked)}
                        disabled={!isNew && eventState === EVENT_STATE.Finished}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
                    </label>
                  </div>
                  <div className="flex items-start justify-between group">
                    <div className="max-w-2xl">
                      <h4 className="text-base font-bold text-slate-900">Permitir Externos</h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        Habilita la opción de registrar personas que no son miembros de la iglesia.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        className="sr-only peer"
                        type="checkbox"
                        checked={allowExternal}
                        onChange={(event) => setAllowExternal(event.target.checked)}
                        disabled={!isNew && eventState === EVENT_STATE.Finished}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
                    </label>
                  </div>
                  <div className="flex items-start justify-between group">
                    <div className="max-w-2xl">
                      <h4 className="text-base font-bold text-slate-900">Auto-Inicio</h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        El evento se marcará 'En Curso' automáticamente a la hora programada.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        className="sr-only peer"
                        type="checkbox"
                        checked={autoStart}
                        onChange={(event) => setAutoStart(event.target.checked)}
                        disabled={!isNew && eventState === EVENT_STATE.Finished}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
                    </label>
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-end gap-4 pb-12">
                <button
                  className="px-8 py-3 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  onClick={() => navigate("/admin/events")}
                >
                  Volver
                </button>
                {eventState !== EVENT_STATE.Finished ? (
                  <button
                    className="px-10 py-3 text-sm font-bold text-white bg-primary rounded-lg hover:bg-blue-700 shadow-xl shadow-primary/30 transition-all"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar Evento"}
                  </button>
                ) : null}
              </div>

              {!isNew && (
                <p className="text-xs text-slate-400">
                  Última actualización: {formatDateTime(new Date().toISOString())}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
