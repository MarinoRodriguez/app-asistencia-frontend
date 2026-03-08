import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import Card from "../components/ui/Card";
import { attendanceApi, eventApi } from "../api/services";
import { formatDate } from "../lib/format";

function calculateAttendanceRate(list = []) {
  if (!list.length) return 0;
  const attended = list.filter((item) => item.status === 1 || item.status === 3).length;
  return Math.round((attended / list.length) * 100);
}

export default function Analytics() {
  const [events, setEvents] = useState([]);
  const [attendanceByEvent, setAttendanceByEvent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const eventsRes = await eventApi.getAll();
        const eventsData = eventsRes.data || [];
        if (!isMounted) return;
        setEvents(eventsData);

        const lastEvents = [...eventsData]
          .filter((evt) => evt.scheduledStartDate)
          .sort((a, b) => new Date(b.scheduledStartDate) - new Date(a.scheduledStartDate))
          .slice(0, 4);

        const attendanceLists = await Promise.all(
          lastEvents.map((evt) => attendanceApi.getByEvent(evt.id).then((res) => res.data || []))
        );

        if (!isMounted) return;
        setAttendanceByEvent(
          lastEvents.map((evt, index) => ({
            event: evt,
            attendance: attendanceLists[index],
            rate: calculateAttendanceRate(attendanceLists[index]),
          }))
        );
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Error al cargar analytics");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const overallRate = useMemo(() => {
    if (!attendanceByEvent.length) return 0;
    const sum = attendanceByEvent.reduce((acc, item) => acc + item.rate, 0);
    return Math.round(sum / attendanceByEvent.length);
  }, [attendanceByEvent]);

  const topParticipants = useMemo(() => {
    const tally = new Map();
    attendanceByEvent.forEach((item) => {
      item.attendance.forEach((att) => {
        if (!att.person) return;
        const key = att.person.id;
        const current = tally.get(key) || { person: att.person, total: 0, attended: 0 };
        current.total += 1;
        if (att.status === 1 || att.status === 3) current.attended += 1;
        tally.set(key, current);
      });
    });
    return [...tally.values()]
      .map((entry) => ({
        person: entry.person,
        rate: entry.total ? Math.round((entry.attended / entry.total) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  }, [attendanceByEvent]);

  const bottomParticipants = useMemo(() => {
    return [...topParticipants].reverse();
  }, [topParticipants]);

  return (
    <AdminLayout>
      <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Analytics de la Iglesia</h2>
          <p className="text-slate-500 text-sm">Indicadores clave de participación y asistencia.</p>
        </div>

        {loading && <p className="text-slate-500">Cargando analytics...</p>}
        {error && <p className="text-rose-600">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <p className="text-slate-500 text-sm font-medium">% Asistencia Promedio</p>
                <h3 className="text-3xl font-bold text-primary mt-2">{overallRate}%</h3>
              </Card>
              <Card className="p-6">
                <p className="text-slate-500 text-sm font-medium">Eventos Analizados</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{attendanceByEvent.length}</h3>
              </Card>
              <Card className="p-6">
                <p className="text-slate-500 text-sm font-medium">Total Eventos</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{events.length}</h3>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Personas con Mayor Participación</h3>
                <div className="space-y-3">
                  {topParticipants.map((entry) => (
                    <div key={entry.person.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                          {entry.person.photoUrl ? (
                            <img src={entry.person.photoUrl} alt={entry.person.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400">person</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{entry.person.name}</p>
                          <p className="text-xs text-slate-500">{entry.person.email || "Sin email"}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">{entry.rate}%</span>
                    </div>
                  ))}
                  {!topParticipants.length && <p className="text-slate-500">Sin datos de participación.</p>}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Personas con Menor Participación</h3>
                <div className="space-y-3">
                  {bottomParticipants.map((entry) => (
                    <div key={entry.person.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                          {entry.person.photoUrl ? (
                            <img src={entry.person.photoUrl} alt={entry.person.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400">person</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{entry.person.name}</p>
                          <p className="text-xs text-slate-500">{entry.person.email || "Sin email"}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-rose-600">{entry.rate}%</span>
                    </div>
                  ))}
                  {!bottomParticipants.length && <p className="text-slate-500">Sin datos de participación.</p>}
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">Resumen Últimos Eventos</h3>
              <div className="space-y-2">
                {attendanceByEvent.map((item) => (
                  <div key={item.event.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.event.title}</p>
                      <p className="text-xs text-slate-500">{formatDate(item.event.scheduledStartDate)}</p>
                    </div>
                    <span className="text-sm font-bold text-primary">{item.rate}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
