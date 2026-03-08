import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import StaffLayout from "../components/layout/StaffLayout";
import ExternalModal from "../components/ui/ExternalModal";
import { attendanceApi } from "../api/services";
import { ASSISTANCE_TYPE, ASSISTANCE_BADGE, ASSISTANCE_LABEL, EVENT_STATE } from "../lib/constants";
import { loadAttendanceForEvent, loadEventById } from "../lib/attendance";
import { formatDateTime } from "../lib/format";

function AttendanceActionModal({ open, onClose, onSelect, title, subtitle }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
        </div>
        <div className="p-6 grid grid-cols-1 gap-2">
          <button
            className="py-3 rounded-xl text-sm font-semibold bg-emerald-600 text-white"
            onClick={() => onSelect(ASSISTANCE_TYPE.Present)}
          >
            Presente
          </button>
          <button
            className="py-3 rounded-xl text-sm font-semibold bg-amber-500 text-white"
            onClick={() => onSelect(ASSISTANCE_TYPE.Late)}
          >
            Tarde
          </button>
          <button
            className="py-3 rounded-xl text-sm font-semibold bg-rose-600 text-white"
            onClick={() => onSelect(ASSISTANCE_TYPE.Absent)}
          >
            Ausente
          </button>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function statusCardClass(status) {
  if (status === ASSISTANCE_TYPE.Present) return "border-emerald-200 bg-emerald-50/50";
  if (status === ASSISTANCE_TYPE.Late) return "border-amber-200 bg-amber-50/50";
  if (status === ASSISTANCE_TYPE.Absent) return "border-slate-200 bg-white";
  return "border-slate-200 bg-white";
}

export default function Attendance() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [externalOpen, setExternalOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [actionTarget, setActionTarget] = useState(null);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState(new Set());

  const loadData = async () => {
    try {
      setLoading(true);
      const currentEvent = await loadEventById(eventId);
      setEvent(currentEvent);
      if (currentEvent) {
        const list = await loadAttendanceForEvent(currentEvent.id);
        setAttendance(list);
      }
    } catch (err) {
      setError(err.message || "Error al cargar asistencia");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const groupOptions = useMemo(() => {
    const map = new Map();
    attendance.forEach((item) => {
      (item.person?.groups || []).forEach((group) => {
        if (!map.has(group.id)) map.set(group.id, group);
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [attendance]);

  const filtered = useMemo(() => {
    return attendance.filter((item) => {
      const fullName = `${item.person?.name || ""} ${item.person?.lastName || ""}`.toLowerCase();
      const matchesSearch = fullName.includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (selectedGroupIds.size === 0) return true;
      const personGroupIds = new Set((item.person?.groups || []).map((g) => g.id));
      return Array.from(selectedGroupIds).some((groupId) => personGroupIds.has(groupId));
    });
  }, [attendance, search, selectedGroupIds]);

  const pendingList = useMemo(
    () => filtered.filter((item) => item.status === ASSISTANCE_TYPE.Absent),
    [filtered]
  );
  const completedList = useMemo(
    () => filtered.filter((item) => item.status !== ASSISTANCE_TYPE.Absent),
    [filtered]
  );

  const isLocked = event && event.state !== EVENT_STATE.InProgress;

  const resetSelection = () => {
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const toggleSelect = (personId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(personId)) next.delete(personId);
      else next.add(personId);
      return next;
    });
  };

  const selectAll = (list) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      list.forEach((item) => next.add(item.personId));
      return next;
    });
  };

  const selectGroup = (groupId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filtered.forEach((item) => {
        const groupIds = (item.person?.groups || []).map((g) => g.id);
        if (groupIds.includes(groupId)) next.add(item.personId);
      });
      return next;
    });
  };

  const clearAll = () => setSelectedIds(new Set());

  const toggleGroupFilter = (groupId) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const applySingle = async (personId, status) => {
    if (!event || event.state !== EVENT_STATE.InProgress) return;
    try {
      await attendanceApi.mark(event.id, personId, status);
      await loadData();
      setInfo("Asistencia actualizada");
      setTimeout(() => setInfo(""), 1500);
    } catch (err) {
      setError(err.message || "No se pudo actualizar la asistencia");
    }
  };

  const applyBulk = async (status) => {
    if (!event || event.state !== EVENT_STATE.InProgress) return;
    if (!selectedIds.size) return;
    try {
      for (const personId of selectedIds) {
        await attendanceApi.mark(event.id, personId, status);
      }
      await loadData();
      resetSelection();
      setInfo("Asistencia actualizada en bloque");
      setTimeout(() => setInfo(""), 1500);
    } catch (err) {
      setError(err.message || "No se pudo actualizar la asistencia");
    }
  };

  const handleExternal = async (form) => {
    if (!event || event.state !== EVENT_STATE.InProgress) return;
    await attendanceApi.registerExternal(event.id, form);
    setExternalOpen(false);
    await loadData();
  };

  const selectedCount = selectedIds.size;

  return (
    <StaffLayout>
      <div className="min-h-screen bg-background-light text-slate-900">
        <header className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{event?.title || "Evento"}</h1>
              <p className="text-xs md:text-sm text-slate-500">
                {event?.scheduledStartDate
                  ? `Asistencia • ${formatDateTime(event.scheduledStartDate)}`
                  : "Control de asistencia en tiempo real"}
              </p>
            </div>
            <button
              className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${
                isLocked ? "bg-slate-300 cursor-not-allowed" : "bg-primary"
              }`}
              onClick={() => setExternalOpen(true)}
              disabled={isLocked}
            >
              Nuevo externo
            </button>
          </div>
          {isLocked && (
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-xs text-amber-700">
              Este evento no está en curso. Solo puedes registrar asistencia cuando el evento esté en estado "En curso".
            </div>
          )}
          <div className="mt-4 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              placeholder="Buscar persona..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          {groupOptions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {groupOptions.map((group) => (
                <button
                  key={group.id}
                  onClick={() => toggleGroupFilter(group.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                    selectedGroupIds.has(group.id)
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className={`px-3 py-2 text-xs font-semibold rounded-lg border ${
                selectMode ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200"
              }`}
              onClick={() => {
                if (selectMode) resetSelection();
                else setSelectMode(true);
              }}
            >
              {selectMode ? "Salir de selección" : "Seleccionar"}
            </button>
            {selectMode && (
              <>
                <button
                  className="px-3 py-2 text-xs font-semibold rounded-lg border bg-white text-slate-600 border-slate-200"
                  onClick={() => selectAll(pendingList)}
                >
                  Seleccionar pendientes
                </button>
                <button
                  className="px-3 py-2 text-xs font-semibold rounded-lg border bg-white text-slate-600 border-slate-200"
                  onClick={() => selectAll(filtered)}
                >
                  Seleccionar todos
                </button>
                <button
                  className="px-3 py-2 text-xs font-semibold rounded-lg border bg-white text-slate-600 border-slate-200"
                  onClick={clearAll}
                >
                  Limpiar
                </button>
              </>
            )}
          </div>
          {selectMode && groupOptions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {groupOptions.map((group) => (
                <button
                  key={group.id}
                  onClick={() => selectGroup(group.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full border bg-white text-slate-600 border-slate-200"
                >
                  Seleccionar {group.name}
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="p-6">
          {loading && <p className="text-slate-500">Cargando asistencia...</p>}
          {error && <p className="text-rose-600">{error}</p>}
          {info && <p className="text-emerald-600 text-sm">{info}</p>}

          {!loading && !error && (
            <div className="space-y-6">
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-600">Pendientes</h2>
                  <span className="text-xs text-slate-400">{pendingList.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {pendingList.map((item) => (
                    <div
                      key={item.personId}
                      className={`rounded-2xl p-3 flex flex-col gap-2 border ${statusCardClass(item.status)} ${
                        selectedIds.has(item.personId) ? "ring-2 ring-primary/20" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {selectMode && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.personId)}
                            onChange={() => toggleSelect(item.personId)}
                          />
                        )}
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                          {item.person?.photoUrl ? (
                            <img src={item.person.photoUrl} alt={item.person?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400">person</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate text-slate-900">
                            {item.person?.name} {item.person?.lastName}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(item.person?.groups || []).slice(0, 3).map((group) => (
                              <span
                                key={group.id}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                              >
                                {group.name}
                              </span>
                            ))}
                            {(item.person?.groups || []).length > 3 && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                +{(item.person?.groups || []).length - 3}
                              </span>
                            )}
                            {!item.invited && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                Sin invitación
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ASSISTANCE_BADGE[item.status]}`}>
                          {ASSISTANCE_LABEL[item.status]}
                        </span>
                      </div>
                      {!selectMode && (
                        <button
                          className={`py-2 rounded-xl text-xs font-semibold ${
                            isLocked ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-primary text-white"
                          }`}
                          onClick={() => setActionTarget(item)}
                          disabled={isLocked}
                        >
                          Tomar asistencia
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-600">Ya registrados</h2>
                  <span className="text-xs text-slate-400">{completedList.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {completedList.map((item) => (
                    <div
                      key={item.personId}
                      className={`rounded-2xl p-3 flex flex-col gap-2 border ${statusCardClass(item.status)} ${
                        selectedIds.has(item.personId) ? "ring-2 ring-primary/20" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {selectMode && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.personId)}
                            onChange={() => toggleSelect(item.personId)}
                          />
                        )}
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                          {item.person?.photoUrl ? (
                            <img src={item.person.photoUrl} alt={item.person?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400">person</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate text-slate-900">
                            {item.person?.name} {item.person?.lastName}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(item.person?.groups || []).slice(0, 3).map((group) => (
                              <span
                                key={group.id}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                              >
                                {group.name}
                              </span>
                            ))}
                            {(item.person?.groups || []).length > 3 && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                +{(item.person?.groups || []).length - 3}
                              </span>
                            )}
                            {!item.invited && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                Sin invitación
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ASSISTANCE_BADGE[item.status]}`}
                          onClick={() => {
                            if (!selectMode && !isLocked) setActionTarget(item);
                          }}
                          disabled={selectMode || isLocked}
                        >
                          {ASSISTANCE_LABEL[item.status]}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      <ExternalModal open={externalOpen} onClose={() => setExternalOpen(false)} onSave={handleExternal} />

      {selectMode && !isLocked && (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-50">
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-lg p-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="text-sm text-slate-600">
              Seleccionados: <span className="font-semibold text-slate-900">{selectedCount}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="px-3 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg"
                onClick={() => setBulkActionOpen(true)}
                disabled={!selectedCount}
              >
                Tomar asistencia en bloque
              </button>
            </div>
          </div>
        </div>
      )}

      <AttendanceActionModal
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onSelect={(status) => {
          applySingle(actionTarget.personId, status);
          setActionTarget(null);
        }}
        title="Tomar asistencia"
        subtitle={
          actionTarget
            ? `${actionTarget.person?.name || ""} ${actionTarget.person?.lastName || ""}`.trim()
            : ""
        }
      />

      <AttendanceActionModal
        open={bulkActionOpen}
        onClose={() => setBulkActionOpen(false)}
        onSelect={(status) => {
          applyBulk(status);
          setBulkActionOpen(false);
        }}
        title="Asistencia en bloque"
        subtitle={selectedCount ? `${selectedCount} personas seleccionadas` : ""}
      />
    </StaffLayout>
  );
}
