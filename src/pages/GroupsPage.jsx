import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import { groupApi } from "../api/services";
import Badge from "../components/ui/Badge";

function GroupModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({ name: "", description: "", active: true });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        description: initial.description || "",
        active: !!initial.active,
      });
    } else {
      setForm({ name: "", description: "", active: true });
    }
  }, [initial, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold">{initial ? "Editar Grupo" : "Añadir Nuevo Grupo"}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Nombre</label>
            <input
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Descripción</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg min-h-[96px]"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
            />
            Grupo activo
          </label>
        </div>
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600">
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, group }) {
  if (!open) return null;

  const name = group?.name || "este grupo";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Confirmar eliminación</h3>
          <p className="mt-2 text-sm text-slate-600">
            ¿Seguro que deseas eliminar <span className="font-semibold">{name}</span>? Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const res = await groupApi.getAll(true);
      setGroups(res.data || []);
    } catch (err) {
      setError(err.message || "Error al cargar grupos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredGroups = useMemo(() => {
    if (!search) return groups;
    const term = search.toLowerCase();
    return groups.filter(
      (group) =>
        group.name?.toLowerCase().includes(term) ||
        group.description?.toLowerCase().includes(term)
    );
  }, [groups, search]);

  const handleSaveGroup = async (form) => {
    const payload = {
      name: form.name,
      description: form.description,
      active: form.active,
    };
    try {
      if (selectedGroup) {
        await groupApi.update(selectedGroup.id, payload);
      } else {
        await groupApi.create(payload);
      }
      setGroupModalOpen(false);
      setSelectedGroup(null);
      await loadAll();
    } catch (err) {
      setError(err.message || "Error al guardar grupo");
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    try {
      await groupApi.remove(selectedGroup.id);
      setConfirmModalOpen(false);
      setSelectedGroup(null);
      await loadAll();
    } catch (err) {
      setError(err.message || "Error al eliminar grupo");
    }
  };

  return (
    <AdminLayout>
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Administración de Grupos</h2>
            <p className="text-slate-500 text-sm">Organiza y administra los grupos de la comunidad.</p>
          </div>
          <button
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm shadow-primary/20"
            onClick={() => {
              setSelectedGroup(null);
              setGroupModalOpen(true);
            }}
          >
            <span className="material-symbols-outlined text-xl">group_add</span>
            Añadir Grupo
          </button>
        </div>
      </header>

      <div className="p-8 flex-1 overflow-auto">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all"
              placeholder="Buscar por nombre o descripción..."
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {loading && <p className="text-slate-500">Cargando grupos...</p>}
        {error && <p className="text-rose-600">{error}</p>}

        {!loading && !error && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{group.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{group.description || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={!!group.active}
                            onChange={async () => {
                              try {
                                await groupApi.update(group.id, {
                                  name: group.name,
                                  description: group.description,
                                  active: !group.active,
                                });
                                await loadAll();
                              } catch (err) {
                                setError(err.message || "Error al actualizar estado");
                              }
                            }}
                          />
                        <Badge
                          text={group.active ? "Activo" : "Inactivo"}
                          className={group.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}
                        />
                        {/* <label className="inline-flex items-center gap-2 text-xs text-slate-500">
                          
                          Cambiar
                        </label> */}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-1.5 text-red-600 hover:text-red-900 transition-colors"
                          onClick={() => {
                            setSelectedGroup(group);
                            setConfirmModalOpen(true);
                          }}
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                          onClick={() => {
                            setSelectedGroup(group);
                            setGroupModalOpen(true);
                          }}
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredGroups.length && (
              <div className="p-6 text-sm text-slate-500">No hay grupos registrados.</div>
            )}
          </div>
        )}
      </div>

      <GroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onSave={handleSaveGroup}
        initial={selectedGroup}
      />
      <ConfirmModal
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedGroup(null);
        }}
        onConfirm={handleDeleteGroup}
        group={selectedGroup}
      />
    </AdminLayout>
  );
}
