import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { attendanceApi, eventApi, personApi } from "../api/services";
import { EVENT_STATE_BADGE, EVENT_STATE_LABEL } from "../lib/constants";
import { formatDate, isToday } from "../lib/format";

function calculateAttendanceRate(list = []) {
  if (!list.length) return 0;
  const attended = list.filter((item) => item.status === 1 || item.status === 3).length;
  return Math.round((attended / list.length) * 100);
}

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [people, setPeople] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const [eventsRes, peopleRes] = await Promise.all([eventApi.getAll(), personApi.getAll()]);
        const eventsData = eventsRes.data || [];
        const peopleData = peopleRes.data || [];

        if (!isMounted) return;
        setEvents(eventsData);
        setPeople(peopleData);

        const lastEvents = [...eventsData]
          .filter((evt) => evt.scheduledStartDate)
          .sort((a, b) => new Date(b.scheduledStartDate) - new Date(a.scheduledStartDate))
          .slice(0, 4);

        const attendanceLists = await Promise.all(
          lastEvents.map((evt) => attendanceApi.getByEvent(evt.id).then((res) => res.data || []))
        );

        if (!isMounted) return;
        const chart = lastEvents.map((evt, index) => ({
          label: evt.title,
          rate: calculateAttendanceRate(attendanceLists[index]),
        }));
        setChartData(chart);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Error al cargar el dashboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const eventsToday = useMemo(
    () => events.filter((evt) => isToday(evt.scheduledStartDate)).length,
    [events]
  );

  const attendanceAverage = useMemo(() => {
    if (!chartData.length) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.rate, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const sorted = [...events].sort(
      (a, b) => new Date(a.scheduledStartDate || 0) - new Date(b.scheduledStartDate || 0)
    );
    const upcoming = sorted.filter((evt) => (evt.scheduledStartDate ? new Date(evt.scheduledStartDate) >= now : true));
    return (upcoming.length ? upcoming : sorted).slice(0, 4);
  }, [events]);

  return (
    <AdminLayout>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <h2 className="text-slate-800 font-semibold text-lg">Panel de Control</h2>
        <div className="flex items-center gap-6">
          <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800 leading-tight">Admin</p>
              <p className="text-xs text-slate-500">Superusuario</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
              <img
                className="w-full h-full object-cover"
                alt="Admin"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrL-XU_e_frXsaWlGd_Vobc3NjoW7s4YwQg6eSY4WgA9kF4qZ7CDOZR4LJq6C06nYbmvwa3FIj6Vrw--qNcDMrRRQIezT9oWMhcx5HVKg4r-Mqj9uuwHdWJQjxv21CBVRk69UHVtuspPnyllYGJU1irfzFXAcyUM2iLBEAi6u2P4txW_hqT4UsZTG1Cqu2jpRkCFUJ9BLU6U_DWbCBBEkUph8xUiT8uQ5_c-gVSgdE6TSDSz_jAQ4KCgKZS8SJTxkXkLe4lFNG6uw"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {loading && <p className="text-slate-500">Cargando dashboard...</p>}
        {error && <p className="text-rose-600">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="material-symbols-outlined text-primary">event</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    Hoy
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Eventos Hoy</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{eventsToday}</h3>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <span className="material-symbols-outlined text-indigo-600">group</span>
                  </div>
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    Total Activo
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Total Personas</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{people.length}</h3>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <span className="material-symbols-outlined text-amber-600">monitoring</span>
                  </div>
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    Últimos 4 eventos
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium">% Asistencia Promedio</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{attendanceAverage}%</h3>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Próximos Eventos</h3>
                  <button className="text-primary text-sm font-semibold hover:underline">Ver todos</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Nombre del Evento
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {upcomingEvents.map((evt) => (
                        <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-800">{evt.title}</span>
                              <span className="text-xs text-slate-500">Evento</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {formatDate(evt.scheduledStartDate)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              text={EVENT_STATE_LABEL[evt.state] || ""}
                              className={EVENT_STATE_BADGE[evt.state] || "bg-slate-100 text-slate-600"}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="p-6 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-2">Asistencia</h3>
                <p className="text-xs text-slate-500 mb-8 italic">Últimos 4 eventos</p>
                <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4">
                  {chartData.map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-2 w-full">
                      <div className="w-full bg-primary/20 rounded-t-lg relative group h-24">
                        <div
                          className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-300"
                          style={{ height: `${item.rate}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{item.rate}%</span>
                    </div>
                  ))}
                  {!chartData.length && <p className="text-slate-400">Sin datos</p>}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
