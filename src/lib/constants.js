export const EVENT_STATE = {
  Draft: 0,
  Scheduled: 1,
  InProgress: 2,
  Finished: 3,
};

export const EVENT_STATE_LABEL = {
  0: "Borrador",
  1: "Programado",
  2: "En curso",
  3: "Finalizado",
};

export const EVENT_STATE_BADGE = {
  0: "bg-slate-100 text-slate-600",
  1: "bg-blue-100 text-blue-800",
  2: "bg-emerald-100 text-emerald-700",
  3: "bg-slate-100 text-slate-500",
};

export const ASSISTANCE_TYPE = {
  Pending: 0,
  Present: 1,
  Absent: 2,
  Late: 3,
  Excused: 4,
};

export const ASSISTANCE_LABEL = {
  0: "Pendiente",
  1: "Presente",
  2: "Ausente",
  3: "Tarde",
  4: "Justificado",
};

export const ASSISTANCE_BADGE = {
  0: "bg-slate-100 text-slate-500",
  1: "bg-emerald-100 text-emerald-700",
  2: "bg-rose-100 text-rose-700",
  3: "bg-amber-100 text-amber-700",
  4: "bg-indigo-100 text-indigo-700",
};
