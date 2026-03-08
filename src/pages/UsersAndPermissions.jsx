import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import { rolesApi, usersApi } from "../api/services";

const emptyCreateUser = { userName: "", email: "", password: "", roles: [] };
const emptyCreateRole = { name: "" };

export default function UsersAndPermissions() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [panel, setPanel] = useState("usuarios");

  const [createUser, setCreateUser] = useState(emptyCreateUser);
  const [createRoles, setCreateRoles] = useState(new Set());
  const [createMessage, setCreateMessage] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingRolesUserId, setEditingRolesUserId] = useState(null);
  const [editRoles, setEditRoles] = useState(new Set());
  const [editUserForm, setEditUserForm] = useState({ userName: "", email: "" });
  const [showUserEditModal, setShowUserEditModal] = useState(false);

  const [resetUserId, setResetUserId] = useState(null);
  const [resetPassword, setResetPassword] = useState("");

  const [createRole, setCreateRole] = useState(emptyCreateRole);
  const [creatingRole, setCreatingRole] = useState(false);
  const [createRoleMessage, setCreateRoleMessage] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);

  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editPermissions, setEditPermissions] = useState(new Set());
  const [permissionFilter, setPermissionFilter] = useState("");
  const [permissionGroupTab, setPermissionGroupTab] = useState(null);

  const roleNames = useMemo(() => roles.map((role) => role.name), [roles]);
  const groupedPermissions = useMemo(
    () => groupPermissions(permissions, permissionFilter),
    [permissions, permissionFilter]
  );
  useEffect(() => {
    if (groupedPermissions.length && !permissionGroupTab) {
      setPermissionGroupTab(groupedPermissions[0].key);
    }
    if (!groupedPermissions.length) {
      setPermissionGroupTab(null);
    }
  }, [groupedPermissions, permissionGroupTab]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [usersResponse, rolesResponse, permissionsResponse] = await Promise.all([
        usersApi.getAll(),
        rolesApi.getAll(),
        rolesApi.getPermissions(),
      ]);

      setUsers(usersResponse?.data || []);
      setRoles(rolesResponse?.data || []);
      setPermissions(permissionsResponse?.data || []);
    } catch (err) {
      setError(err.message || "No se pudo cargar la seguridad.");
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers(term) {
    setSearchTerm(term);
    try {
      const response = await usersApi.getAll(term);
      setUsers(response?.data || []);
    } catch (err) {
      setError(err.message || "No se pudo buscar usuarios.");
    }
  }

  function toggleCreateRole(roleName) {
    const next = new Set(createRoles);
    if (next.has(roleName)) {
      next.delete(roleName);
    } else {
      next.add(roleName);
    }
    setCreateRoles(next);
  }

  async function handleCreateUser() {
    setCreatingUser(true);
    setCreateMessage("");
    try {
      const payload = { ...createUser, roles: Array.from(createRoles) };
      await usersApi.create(payload);
      setCreateUser(emptyCreateUser);
      setCreateRoles(new Set());
      setCreateMessage("Usuario creado.");
      setShowUserModal(false);
      await loadAll();
    } catch (err) {
      setCreateMessage(err.message || "No se pudo crear el usuario.");
    } finally {
      setCreatingUser(false);
    }
  }

  function startEditRoles(user) {
    setEditingRolesUserId(user.id);
    setEditRoles(new Set(user.roles || []));
  }

  function startEditUser(user) {
    setEditingUserId(user.id);
    setEditUserForm({ userName: user.userName || "", email: user.email || "" });
    setShowUserEditModal(true);
  }

  async function saveUserInfo() {
    if (!editingUserId) return;
    try {
      await usersApi.update(editingUserId, editUserForm);
      setShowUserEditModal(false);
      await loadAll();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el usuario.");
    }
  }

  function toggleEditRole(roleName) {
    const next = new Set(editRoles);
    if (next.has(roleName)) {
      next.delete(roleName);
    } else {
      next.add(roleName);
    }
    setEditRoles(next);
  }

  async function saveUserRoles() {
    if (!editingRolesUserId) return;
    try {
      await usersApi.updateRoles(editingRolesUserId, { roles: Array.from(editRoles) });
      setEditingRolesUserId(null);
      await loadAll();
    } catch (err) {
      setError(err.message || "No se pudieron guardar los roles.");
    }
  }

  function cancelEditRoles() {
    setEditingRolesUserId(null);
  }

  function startResetPassword(userId) {
    setResetUserId(userId);
    setResetPassword("");
  }

  async function confirmResetPassword() {
    if (!resetUserId || !resetPassword) return;
    try {
      await usersApi.resetPassword(resetUserId, { newPassword: resetPassword });
      setResetUserId(null);
      setResetPassword("");
    } catch (err) {
      setError(err.message || "No se pudo resetear la contraseña.");
    }
  }

  function cancelResetPassword() {
    setResetUserId(null);
    setResetPassword("");
  }

  async function handleCreateRole() {
    setCreatingRole(true);
    setCreateRoleMessage("");
    try {
      await rolesApi.create(createRole);
      setCreateRole(emptyCreateRole);
      setCreateRoleMessage("Rol creado.");
      setShowRoleModal(false);
      await loadAll();
    } catch (err) {
      setCreateRoleMessage(err.message || "No se pudo crear el rol.");
    } finally {
      setCreatingRole(false);
    }
  }

  function startEditPermissions(role) {
    setEditingRoleId(role.id);
    setEditPermissions(new Set(role.permissions || []));
    setPermissionFilter("");
    setPermissionGroupTab(null);
  }

  function togglePermission(permission) {
    const next = new Set(editPermissions);
    if (next.has(permission)) {
      next.delete(permission);
    } else {
      next.add(permission);
    }
    setEditPermissions(next);
  }

  async function saveRolePermissions() {
    if (!editingRoleId) return;
    try {
      const role = roles.find((item) => item.id === editingRoleId);
      const current = new Set(role?.permissions || []);
      const desired = new Set(editPermissions);

      const add = [];
      const remove = [];
      desired.forEach((perm) => {
        if (!current.has(perm)) add.push(perm);
      });
      current.forEach((perm) => {
        if (!desired.has(perm)) remove.push(perm);
      });

      if (add.length || remove.length) {
        await rolesApi.updatePermissionsBatch(editingRoleId, { add, remove });
      }

      setEditingRoleId(null);
      await loadAll();
    } catch (err) {
      setError(err.message || "No se pudieron guardar los permisos.");
    }
  }

  function cancelEditPermissions() {
    setEditingRoleId(null);
  }

  function selectAllPermissions() {
    setEditPermissions(new Set(permissions));
  }

  function clearAllPermissions() {
    setEditPermissions(new Set());
  }

  function selectViewPermissions() {
    setEditPermissions(new Set(permissions.filter((perm) => perm.endsWith(".view"))));
  }

  function selectGroupPermissions(items) {
    const next = new Set(editPermissions);
    items.forEach((perm) => next.add(perm));
    setEditPermissions(next);
  }

  function clearGroupPermissions(items) {
    const next = new Set(editPermissions);
    items.forEach((perm) => next.delete(perm));
    setEditPermissions(next);
  }

  function groupPermissions(list, filterValue) {
    const labelMap = {
      users: "Usuarios",
      roles: "Roles",
      persons: "Personas",
      groups: "Grupos",
      events: "Eventos",
      attendance: "Asistencia",
      reports: "Reportes",
      admin: "Administración",
    };

    const normalizedFilter = (filterValue || "").toLowerCase();
    const filtered = normalizedFilter
      ? list.filter((perm) => perm.toLowerCase().includes(normalizedFilter))
      : list;

    const bucket = new Map();
    filtered.forEach((perm) => {
      const groupKey = perm.split(".")[0] || "otros";
      const entry = bucket.get(groupKey) || { key: groupKey, label: labelMap[groupKey] || groupKey, items: [] };
      entry.items.push(perm);
      bucket.set(groupKey, entry);
    });

    return Array.from(bucket.values()).map((group) => ({
      ...group,
      items: group.items.sort(),
    }));
  }

  function summarizePermissions(list) {
    const summary = {};
    list.forEach((perm) => {
      const groupKey = perm.split(".")[0] || "otros";
      summary[groupKey] = (summary[groupKey] || 0) + 1;
    });
    return summary;
  }

  async function deleteRole(roleId) {
    try {
      await rolesApi.remove(roleId);
      await loadAll();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el rol.");
    }
  }

  return (
    <AdminLayout>
      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#111318]">Administración de Usuarios y Seguridad</h1>
              <p className="text-slate-500 text-sm mt-2">
                Gestión real de usuarios, roles y permisos, con reseteo de contraseñas.
              </p>
            </div>
            <button
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg"
              onClick={() => (panel === "usuarios" ? setShowUserModal(true) : setShowRoleModal(true))}
            >
              {panel === "usuarios" ? "Agregar usuario" : "Agregar rol"}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 flex flex-wrap gap-2">
            {[
              { id: "usuarios", label: "Usuarios" },
              { id: "roles", label: "Roles y permisos" },
            ].map((item) => (
              <button
                key={item.id}
                className={[
                  "px-4 py-2 text-sm font-semibold rounded-xl transition",
                  panel === item.id
                    ? "bg-primary text-white"
                    : "text-slate-600 hover:bg-slate-50",
                ].join(" ")}
                onClick={() => setPanel(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {panel === "usuarios" ? (
          <>
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#111318]">Usuarios</h2>
                <p className="text-xs text-slate-500 mt-1">Busca y edita roles o resetea contraseñas.</p>
              </div>
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm w-64"
                placeholder="Buscar por usuario o email"
                value={searchTerm}
                onChange={(event) => searchUsers(event.target.value)}
              />
            </div>
            {loading ? (
              <p className="text-sm text-slate-500">Cargando...</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="rounded-xl border border-slate-100 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{user.userName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(user.roles || []).map((role) => (
                          <span key={role} className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        className="px-3 py-1 text-xs font-semibold border border-slate-200 rounded-lg"
                        onClick={() => startEditRoles(user)}
                      >
                        Editar roles
                      </button>
                      <button
                        className="px-3 py-1 text-xs font-semibold border border-slate-200 rounded-lg"
                        onClick={() => startEditUser(user)}
                      >
                        Editar usuario
                      </button>
                      <button
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border ${
                          user.lockedOut ? "border-emerald-200 text-emerald-700" : "border-amber-200 text-amber-700"
                        }`}
                        onClick={async () => {
                          try {
                            await usersApi.setLock(user.id, { locked: !user.lockedOut });
                            await loadAll();
                          } catch (err) {
                            setError(err.message || "No se pudo actualizar el acceso.");
                          }
                        }}
                      >
                        {user.lockedOut ? "Desbloquear" : "Bloquear"}
                      </button>
                      <button
                        className="px-3 py-1 text-xs font-semibold border border-amber-200 text-amber-700 rounded-lg"
                        onClick={() => startResetPassword(user.id)}
                      >
                        Reset contraseña
                      </button>
                    </div>
                    {editingRolesUserId === user.id ? (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-semibold text-slate-600">Roles para {user.userName}</p>
                        <div className="flex flex-wrap gap-2">
                          {roleNames.map((roleName) => (
                            <label key={roleName} className="flex items-center gap-2 text-xs text-slate-600">
                              <input
                                type="checkbox"
                                checked={editRoles.has(roleName)}
                                onChange={() => toggleEditRole(roleName)}
                              />
                              {roleName}
                            </label>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-1 text-xs font-semibold text-white bg-primary rounded-lg" onClick={saveUserRoles}>
                            Guardar
                          </button>
                          <button className="px-3 py-1 text-xs font-semibold border border-slate-200 rounded-lg" onClick={cancelEditRoles}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {resetUserId === user.id ? (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-semibold text-amber-700">Nueva contraseña</p>
                        <div className="flex flex-col md:flex-row gap-2">
                          <input
                            type="password"
                            className="flex-1 rounded-lg border border-amber-200 px-3 py-2 text-sm"
                            value={resetPassword}
                            onChange={(event) => setResetPassword(event.target.value)}
                          />
                          <button className="px-3 py-2 text-xs font-semibold bg-amber-500 text-white rounded-lg" onClick={confirmResetPassword}>
                            Resetear
                          </button>
                          <button className="px-3 py-2 text-xs font-semibold border border-amber-200 text-amber-700 rounded-lg" onClick={cancelResetPassword}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
                {users.length === 0 ? <p className="text-sm text-slate-500">No hay usuarios.</p> : null}
              </div>
            )}
          </section>
          </>
          ) : null}

          {panel === "roles" ? (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#111318]">Roles y permisos</h2>
              <p className="text-xs text-slate-500 mt-1">Administra los permisos por rol.</p>
            </div>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="rounded-xl border border-slate-100 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{role.name}</p>
                      <p className="text-xs text-slate-500">{(role.permissions || []).length} permisos</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 text-xs font-semibold border border-slate-200 rounded-lg"
                        onClick={() => startEditPermissions(role)}
                      >
                        Editar permisos
                      </button>
                      <button
                        className="px-3 py-1 text-xs font-semibold border border-rose-200 text-rose-600 rounded-lg"
                        onClick={() => deleteRole(role.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(summarizePermissions(role.permissions || [])).map(([group, count]) => (
                      <span key={group} className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full">
                        {group} · {count}
                      </span>
                    ))}
                  </div>
                  {editingRoleId === role.id ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-3">
                      <>
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <p className="text-xs font-semibold text-slate-600">Permisos disponibles</p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="px-2 py-1 text-xs font-semibold border border-slate-200 rounded-lg"
                                onClick={selectAllPermissions}
                              >
                                Seleccionar todo
                              </button>
                              <button
                                className="px-2 py-1 text-xs font-semibold border border-slate-200 rounded-lg"
                                onClick={clearAllPermissions}
                              >
                                Limpiar
                              </button>
                              <button
                                className="px-2 py-1 text-xs font-semibold border border-slate-200 rounded-lg"
                                onClick={selectViewPermissions}
                              >
                                Solo ver
                              </button>
                            </div>
                          </div>
                          <div>
                            <input
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                              placeholder="Buscar permiso..."
                              value={permissionFilter}
                              onChange={(event) => setPermissionFilter(event.target.value)}
                            />
                          </div>
                          <div className="space-y-3">
                            {groupedPermissions.length === 0 ? (
                              <p className="text-xs text-slate-500">No hay permisos que coincidan.</p>
                            ) : (
                              <>
                                <div className="flex flex-wrap gap-2">
                                  {groupedPermissions.map((group) => (
                                    <button
                                      key={group.key}
                                      className={[
                                        "px-3 py-1 text-xs font-semibold rounded-lg border",
                                        permissionGroupTab === group.key
                                          ? "bg-slate-900 text-white border-slate-900"
                                          : "bg-white text-slate-600 border-slate-200",
                                      ].join(" ")}
                                      onClick={() => setPermissionGroupTab(group.key)}
                                    >
                                      {group.label} · {group.items.length}
                                    </button>
                                  ))}
                                </div>
                                {groupedPermissions
                                  .filter((group) => group.key === permissionGroupTab)
                                  .map((group) => (
                                    <div key={group.key} className="bg-white border border-slate-100 rounded-xl p-3">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-xs font-semibold text-slate-700">
                                          {group.label} · {group.items.length}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <button
                                            className="px-2 py-1 text-[11px] font-semibold border border-slate-200 rounded-lg"
                                            onClick={() => selectGroupPermissions(group.items)}
                                          >
                                            Seleccionar
                                          </button>
                                          <button
                                            className="px-2 py-1 text-[11px] font-semibold border border-slate-200 rounded-lg"
                                            onClick={() => clearGroupPermissions(group.items)}
                                          >
                                            Limpiar
                                          </button>
                                        </div>
                                      </div>
                                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {group.items.map((permission) => (
                                          <label key={permission} className="flex items-center gap-2 text-xs text-slate-600">
                                            <input
                                              type="checkbox"
                                              checked={editPermissions.has(permission)}
                                              onChange={() => togglePermission(permission)}
                                            />
                                            {permission}
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="px-3 py-1 text-xs font-semibold text-white bg-primary rounded-lg" onClick={saveRolePermissions}>
                              Guardar
                            </button>
                            <button className="px-3 py-1 text-xs font-semibold border border-slate-200 rounded-lg" onClick={cancelEditPermissions}>
                              Cancelar
                            </button>
                          </div>
                      </>
                    </div>
                  ) : null}
                </div>
              ))}
              {roles.length === 0 ? <p className="text-sm text-slate-500">No hay roles.</p> : null}
            </div>
          </section>
          ) : null}
        </div>
      </div>

      {showUserModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUserModal(false)} />
          <div className="relative w-full max-w-2xl mx-4 rounded-2xl bg-white shadow-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Usuarios</p>
                <h3 className="text-lg font-black text-slate-900 mt-2">Crear usuario</h3>
              </div>
              <button className="text-slate-400 hover:text-slate-600" onClick={() => setShowUserModal(false)}>✕</button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Usuario</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={createUser.userName}
                  onChange={(event) => setCreateUser({ ...createUser, userName: event.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Email</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={createUser.email}
                  onChange={(event) => setCreateUser({ ...createUser, email: event.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Contraseña</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={createUser.password}
                  onChange={(event) => setCreateUser({ ...createUser, password: event.target.value })}
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">Roles</p>
              <div className="flex flex-wrap gap-2">
                {roleNames.map((roleName) => (
                  <label key={roleName} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={createRoles.has(roleName)}
                      onChange={() => toggleCreateRole(roleName)}
                    />
                    {roleName}
                  </label>
                ))}
              </div>
            </div>

            {createMessage ? (
              <div className="mt-4 text-xs text-slate-500">{createMessage}</div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg" onClick={() => setShowUserModal(false)}>
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg disabled:opacity-60"
                onClick={handleCreateUser}
                disabled={creatingUser}
              >
                {creatingUser ? "Creando..." : "Crear usuario"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showRoleModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowRoleModal(false)} />
          <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-white shadow-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Roles</p>
                <h3 className="text-lg font-black text-slate-900 mt-2">Crear rol</h3>
              </div>
              <button className="text-slate-400 hover:text-slate-600" onClick={() => setShowRoleModal(false)}>✕</button>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600">Nombre</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={createRole.name}
                onChange={(event) => setCreateRole({ name: event.target.value })}
              />
            </div>

            {createRoleMessage ? (
              <div className="mt-4 text-xs text-slate-500">{createRoleMessage}</div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg" onClick={() => setShowRoleModal(false)}>
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg disabled:opacity-60"
                onClick={handleCreateRole}
                disabled={creatingRole}
              >
                {creatingRole ? "Creando..." : "Crear rol"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showUserEditModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUserEditModal(false)} />
          <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-white shadow-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Usuario</p>
                <h3 className="text-lg font-black text-slate-900 mt-2">Editar usuario</h3>
              </div>
              <button className="text-slate-400 hover:text-slate-600" onClick={() => setShowUserEditModal(false)}>✕</button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Usuario</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={editUserForm.userName}
                  onChange={(event) => setEditUserForm({ ...editUserForm, userName: event.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Email</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={editUserForm.email}
                  onChange={(event) => setEditUserForm({ ...editUserForm, email: event.target.value })}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg" onClick={() => setShowUserEditModal(false)}>
                Cancelar
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg" onClick={saveUserInfo}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
