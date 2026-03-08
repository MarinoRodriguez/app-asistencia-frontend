import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../components/layout/StaffLayout";
import Card from "../components/ui/Card";
import { eventApi } from "../api/services";
import { EVENT_STATE, EVENT_STATE_BADGE, EVENT_STATE_LABEL } from "../lib/constants";
import { formatDate } from "../lib/format";

export default function AttendanceHome() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    return events.filter((evt) => evt.title?.toLowerCase().includes(search.toLowerCase()));
  }, [events, search]);

  const handleStartAndAttend = async (evtId) => {
    try {
      await eventApi.start(evtId);
      navigate(`/staff/attendance/event/${evtId}`);
    } catch (err) {
      setError(err.message || "No se pudo iniciar el evento");
    }
  };

  return (
    <StaffLayout>
      <div className="min-h-screen bg-background-light text-slate-900">
        <header className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Selecciona un evento</h1>
              <p className="text-xs md:text-sm text-slate-500">Elige el evento al que registrarás asistencia.</p>
            </div>
          </div>
          <div className="mt-4 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              placeholder="Buscar evento..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </header>

        <div className="p-6">
          {loading && <p className="text-slate-500">Cargando eventos...</p>}
          {error && <p className="text-rose-600">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((evt) => (
                <Card key={evt.id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        EVENT_STATE_BADGE[evt.state] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {EVENT_STATE_LABEL[evt.state] || ""}
                    </span>
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg leading-tight mb-2">{evt.title}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <span className="material-symbols-outlined text-base">event</span>
                    <span>{formatDate(evt.scheduledStartDate)}</span>
                  </div>
                  <div className="mt-4">
                    {evt.state === EVENT_STATE.InProgress ? (
                      <button
                        className="w-full px-3 py-2 text-xs font-semibold bg-primary text-white rounded-lg"
                        onClick={() => navigate(`/staff/attendance/event/${evt.id}`)}
                      >
                        Tomar asistencia
                      </button>
                    ) : evt.state === EVENT_STATE.Finished ? (
                      <button className="w-full px-3 py-2 text-xs font-semibold bg-slate-200 text-slate-400 rounded-lg" disabled>
                        Evento finalizado
                      </button>
                    ) : (
                      <button
                        className="w-full px-3 py-2 text-xs font-semibold bg-primary/10 text-primary rounded-lg"
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
      </div>
    </StaffLayout>
  );
}
