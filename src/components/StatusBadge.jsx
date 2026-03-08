import { EVENT_STATE, EVENT_STATE_LABELS } from "../lib/constants";

export default function StatusBadge({ state }) {
  const colorClass = {
    [EVENT_STATE.Draft]: "badge-draft",
    [EVENT_STATE.Scheduled]: "badge-scheduled",
    [EVENT_STATE.InProgress]: "badge-progress",
    [EVENT_STATE.Finished]: "badge-finished",
  }[state] || "badge-draft";

  return <span className={`state-badge ${colorClass}`}>{EVENT_STATE_LABELS[state] || "Sin estado"}</span>;
}
