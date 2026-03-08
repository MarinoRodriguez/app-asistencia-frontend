import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import Card from "../components/ui/Card";
import { eventApi } from "../api/services";
import { EVENT_STATE, EVENT_STATE_LABEL, EVENT_STATE_BADGE } from "../lib/constants";
import { formatDate } from "../lib/format";

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [stateFilter, setStateFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await eventApi.getAll();
        if (!isMounted) return;
        setEvents(res.data || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Error al cargar eventos");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return events.filter((evt) => {
      const matchesState = stateFilter === "all" ? true : evt.state === Number(stateFilter);
      const matchesSearch = evt.title?.toLowerCase().includes(search.toLowerCase());
      return matchesState && matchesSearch;
    });
  }, [events, search, stateFilter]);

  const handleStartAndAttend = async (evtId) => {
    try {
      await eventApi.start(evtId);
      navigate(`/staff/attendance/event/${evtId}`);
    } catch (err) {
      setError(err.message || "No se pudo iniciar el evento");
    }
  };

  const handleFinish = async (evtId) => {
    try {
      await eventApi.finish(evtId);
      setEvents((prev) =>
        prev.map((evt) => (evt.id === evtId ? { ...evt, state: EVENT_STATE.Finished } : evt))
      );
    } catch (err) {
      setError(err.message || "No se pudo finalizar el evento");
    }
  };

  const confirmDelete = (eventItem) => {
    setDeleteTarget(eventItem);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await eventApi.remove(deleteTarget.id);
      setEvents((prev) => prev.filter((evt) => evt.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || "No se pudo eliminar el evento");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-xl font-bold text-slate-900 whitespace-nowrap">Administración de Eventos</h2>
          <div className="max-w-md w-full ml-4">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
                placeholder="Buscar eventos por nombre..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button
            onClick={() => navigate("/admin/events/new/config")}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Crear Nuevo Evento</span>
          </button>
        </div>
      </header>

      <div className="bg-white px-8 py-3 border-b border-slate-200 flex items-center gap-4 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <span className="material-symbols-outlined text-slate-400">calendar_month</span>
          <select className="border-none bg-slate-100 rounded-md py-1 px-3 pr-8 focus:ring-primary/20 cursor-pointer">
            <option>Este mes</option>
            <option>Próximo mes</option>
            <option>Este trimestre</option>
          </select>
        </div>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <span className="material-symbols-outlined text-slate-400">filter_alt</span>
          <select
            className="border-none bg-slate-100 rounded-md py-1 px-3 pr-8 focus:ring-primary/20 cursor-pointer"
            value={stateFilter}
            onChange={(event) => setStateFilter(event.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value={EVENT_STATE.Draft}>Borrador</option>
            <option value={EVENT_STATE.Scheduled}>Programado</option>
            <option value={EVENT_STATE.InProgress}>En curso</option>
            <option value={EVENT_STATE.Finished}>Finalizado</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-400">Vista:</span>
          <div className="bg-slate-100 p-1 rounded-md flex gap-1">
            <button className="p-1 bg-white rounded shadow-sm text-primary">
              <span className="material-symbols-outlined text-lg">grid_view</span>
            </button>
            <button className="p-1 text-slate-500 hover:bg-white rounded transition-all">
              <span className="material-symbols-outlined text-lg">list</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
        {loading && <p className="text-slate-500">Cargando eventos...</p>}
        {error && <p className="text-rose-600">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
            {filtered.map((evt) => (
              <Card key={evt.id} className="p-5 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                      EVENT_STATE_BADGE[evt.state] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {EVENT_STATE_LABEL[evt.state] || ""}
                  </span>
                  <button
                    className="text-slate-300 hover:text-rose-500"
                    onClick={() => confirmDelete(evt)}
                    title="Eliminar evento"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
                <h3 className="text-slate-900 font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                  {evt.title}
                </h3>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <span className="material-symbols-outlined text-base">event</span>
                    <span>{formatDate(evt.scheduledStartDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <span className="material-symbols-outlined text-base">group</span>
                    <span className="text-slate-900 font-bold">{evt.invitations?.length || 0}</span>
                    <span>Invitados totales</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold text-slate-400">Asistencia Actual</span>
                    <span className="text-xs font-bold text-emerald-600">--</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "45%" }} />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg"
                    onClick={() => navigate(`/admin/events/${evt.id}/config`)}
                  >
                    {evt.state === EVENT_STATE.Finished ? "Ver" : "Configurar"}
                  </button>
                  {evt.state === EVENT_STATE.InProgress ? (
                    <>
                      <button
                        className="flex-1 px-3 py-2 text-xs font-semibold bg-primary text-white rounded-lg"
                        onClick={() => navigate(`/staff/attendance/event/${evt.id}`)}
                      >
                        Tomar asistencia
                      </button>
                      <button
                        className="flex-1 px-3 py-2 text-xs font-semibold bg-rose-50 text-rose-600 rounded-lg border border-rose-200"
                        onClick={() => handleFinish(evt.id)}
                      >
                        Finalizar
                      </button>
                    </>
                  ) : evt.state === EVENT_STATE.Finished ? (
                    <button
                      className="flex-1 px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg"
                      onClick={() => navigate(`/staff/attendance/event/${evt.id}`)}
                    >
                      Ver asistencia
                    </button>
                  ) : (
                    <button
                      className="flex-1 px-3 py-2 text-xs font-semibold bg-primary/10 text-primary rounded-lg"
                      onClick={() => handleStartAndAttend(evt.id)}
                    >
                      Iniciar y tomar
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={cancelDelete} />
          <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Eliminar</p>
                <h3 className="text-lg font-black text-slate-900 mt-2">Eliminar evento</h3>
              </div>
              <button className="text-slate-400 hover:text-slate-600" onClick={cancelDelete}>
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-600 mt-3">
              Vas a eliminar <span className="font-semibold text-slate-900">{deleteTarget.title}</span> y toda su asistencia.
              Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg" onClick={cancelDelete}>
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg disabled:opacity-60"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
