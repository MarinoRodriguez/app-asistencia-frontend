import { attendanceApi, eventApi } from "../api/services";
import { EVENT_STATE } from "./constants";

export async function resolveActiveEvent() {
  const active = await eventApi.getAll(EVENT_STATE.InProgress);
  const activeList = active.data || [];
  if (activeList.length) return activeList[0];
  const all = await eventApi.getAll();
  const allList = all.data || [];
  return allList[0] || null;
}

export async function loadAttendanceForEvent(eventId) {
  if (!eventId) return [];
  const res = await attendanceApi.getRoster(eventId);
  return res.data || [];
}

export async function loadEventById(eventId) {
  if (!eventId) return null;
  const res = await eventApi.getById(eventId);
  return res.data || null;
}
