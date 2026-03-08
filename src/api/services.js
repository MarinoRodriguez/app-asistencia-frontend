import { apiRequest } from "./http";

export const personApi = {
  getAll: () => apiRequest("api/persons"),
  search: (term) => apiRequest(`api/persons/search?term=${encodeURIComponent(term)}`),
  getById: (id) => apiRequest(`api/persons/${id}`),
  create: (person) => apiRequest("api/persons", { method: "POST", body: JSON.stringify(person) }),
  update: (id, person) => apiRequest(`api/persons/${id}`, { method: "PUT", body: JSON.stringify(person) }),
  remove: (id) => apiRequest(`api/persons/${id}`, { method: "DELETE" }),
};

export const groupApi = {
  getAll: (includeInactive = true) => apiRequest(`api/groups?includeInactive=${includeInactive}`),
  getById: (id) => apiRequest(`api/groups/${id}`),
  create: (group) => apiRequest("api/groups", { method: "POST", body: JSON.stringify(group) }),
  update: (id, group) => apiRequest(`api/groups/${id}`, { method: "PUT", body: JSON.stringify(group) }),
  remove: (id) => apiRequest(`api/groups/${id}`, { method: "DELETE" }),
};

export const eventApi = {
  getAll: (state) => {
    const query = typeof state === "number" ? `?state=${state}` : "";
    return apiRequest(`api/events${query}`);
  },
  getById: (id) => apiRequest(`api/events/${id}`),
  create: (event) => apiRequest("api/events", { method: "POST", body: JSON.stringify(event) }),
  update: (id, event) => apiRequest(`api/events/${id}`, { method: "PUT", body: JSON.stringify(event) }),
  start: (id) => apiRequest(`api/events/${id}/start`, { method: "POST" }),
  finish: (id) => apiRequest(`api/events/${id}/finish`, { method: "POST" }),
  remove: (id) => apiRequest(`api/events/${id}`, { method: "DELETE" }),
  invitePerson: (eventId, personId) => apiRequest(`api/events/${eventId}/invite/person/${personId}`, { method: "POST" }),
  inviteGroup: (eventId, groupId) => apiRequest(`api/events/${eventId}/invite/group/${groupId}`, { method: "POST" }),
  removeInvitation: (eventId, personId) => apiRequest(`api/events/${eventId}/invite/person/${personId}`, { method: "DELETE" }),
};

export const attendanceApi = {
  getByEvent: (eventId) => apiRequest(`api/attendance/event/${eventId}`),
  getRoster: (eventId) => apiRequest(`api/attendance/event/${eventId}/roster`),
  mark: (eventId, personId, type) =>
    apiRequest("api/attendance/mark", {
      method: "POST",
      body: JSON.stringify({ eventId, personId, type }),
    }),
  registerExternal: (eventId, person) =>
    apiRequest(`api/attendance/external/${eventId}`, {
      method: "POST",
      body: JSON.stringify(person),
    }),
  remove: (eventId, personId) =>
    apiRequest(`api/attendance/event/${eventId}/person/${personId}`, { method: "DELETE" }),
};

export const authApi = {
  login: (payload) => apiRequest("api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => apiRequest("api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
};

export const usersApi = {
  getAll: (search) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest(`api/users${query}`);
  },
  create: (payload) => apiRequest("api/users", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => apiRequest(`api/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  updateRoles: (id, payload) => apiRequest(`api/users/${id}/roles`, { method: "PUT", body: JSON.stringify(payload) }),
  setLock: (id, payload) => apiRequest(`api/users/${id}/lock`, { method: "PUT", body: JSON.stringify(payload) }),
  resetPassword: (id, payload) =>
    apiRequest(`api/users/${id}/reset-password`, { method: "POST", body: JSON.stringify(payload) }),
  changeMyPassword: (payload) =>
    apiRequest("api/users/me/change-password", { method: "POST", body: JSON.stringify(payload) }),
};

export const rolesApi = {
  getAll: () => apiRequest("api/roles"),
  getPermissions: () => apiRequest("api/roles/permissions"),
  create: (payload) => apiRequest("api/roles", { method: "POST", body: JSON.stringify(payload) }),
  updatePermissions: (id, payload) =>
    apiRequest(`api/roles/${id}/permissions`, { method: "PUT", body: JSON.stringify(payload) }),
  updatePermissionsBatch: (id, payload) =>
    apiRequest(`api/roles/${id}/permissions/batch`, { method: "POST", body: JSON.stringify(payload) }),
  remove: (id) => apiRequest(`api/roles/${id}`, { method: "DELETE" }),
};
