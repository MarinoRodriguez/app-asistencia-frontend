import { useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import { groupApi, personApi } from "../api/services";
import Badge from "../components/ui/Badge";

function PersonModal({ open, onClose, onSave, groups, initial }) {
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    photoUrl: "",
    groupIds: [],
    active: true,
  });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        lastName: initial.lastName || "",
        email: initial.email || "",
        photoUrl: initial.photoUrl || "",
        groupIds: (initial.personGroups || []).map((pg) => pg.groupId),
        active: initial.active ?? true,
      });
    } else {
      setForm({ name: "", lastName: "", email: "", photoUrl: "", groupIds: [], active: true });
    }
  }, [initial, open]);

  if (!open) return null;

  const toggleGroup = (groupId) => {
    setForm((prev) => ({
      ...prev,
      groupIds: prev.groupIds.includes(groupId)
        ? prev.groupIds.filter((id) => id !== groupId)
        : [...prev.groupIds, groupId],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold">{initial ? "Editar Persona" : "Añadir Nueva Persona"}</h3>
          {/* <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button> */}
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Nombre</label>
              <input
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Apellido</label>
              <input
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg"
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Foto (URL)</label>
              <input
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg"
                value={form.photoUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, photoUrl: event.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Grupos</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {groups.map((group) => (
                <label key={group.id} className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.groupIds.includes(group.id)}
                    onChange={() => toggleGroup(group.id)}
                  />
                  {group.name}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
            />
            Persona activa
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

function GroupModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({ name: "", description: "", active: true });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        description: initial.description || "",
        active: initial.active ?? true,
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
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg"
              rows={3}
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

function GroupConfirmModal({ open, onClose, onConfirm, group }) {
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


function ConfirmModal({ open, onClose, onConfirm, person }) {
  if (!open) return null;

  const fullName = person ? `${person.name || ""} ${person.lastName || ""}`.trim() : "esta persona";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Confirmar eliminación</h3>
          <p className="mt-2 text-sm text-slate-600">
            ¿Seguro que deseas eliminar a <span className="font-semibold">{fullName}</span>? Esta acción no se puede
            deshacer.
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


export default function PeopleAndGroups() {
  const [people, setPeople] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("people");
  const [search, setSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupConfirmOpen, setGroupConfirmOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [peopleRes, groupRes] = await Promise.all([personApi.getAll(), groupApi.getAll(true)]);
      setPeople(peopleRes.data || []);
      setGroups(groupRes.data || []);
    } catch (err) {
      setError(err.message || "Error al cargar personas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSearch = async (value) => {
    setSearch(value);
    if (!value) {
      await loadAll();
      return;
    }

    try {
      setLoading(true);
      const res = await personApi.search(value);
      setPeople(res.data || []);
    } catch (err) {
      setError(err.message || "Error al buscar personas");
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter((group) => {
    if (!groupSearch) return true;
    const term = groupSearch.toLowerCase();
    return `${group.name || ""} ${group.description || ""}`.toLowerCase().includes(term);
  });

  const handleSavePerson = async (form) => {
    const payload = {
      name: form.name,
      lastName: form.lastName,
      email: form.email,
      photoUrl: form.photoUrl,
      active: form.active,
      personGroups: form.groupIds.map((groupId) => ({ groupId })),
    };
    try {
      if (selectedPerson) {
        await personApi.update(selectedPerson.id, payload);
      } else {
        await personApi.create(payload);
      }
      setPersonModalOpen(false);
      setSelectedPerson(null);
      await loadAll();
    } catch (err) {
      setError(err.message || "Error al guardar persona");
    }
  };

  const handleDeletePerson = async () => {
    if (!selectedPerson) return;
    try {
      await personApi.remove(selectedPerson.id);
      setConfirmModalOpen(false);
      setSelectedPerson(null);
      await loadAll();
    } catch (err) {
      setError(err.message || "Error al eliminar persona");
    }
  };

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
      setGroupConfirmOpen(false);
      setSelectedGroup(null);
      await loadAll();
    } catch (err) {
      setError(err.message || "Error al eliminar grupo");
    }
  };

  const handleToggleActive = async (person) => {
    const payload = {
      name: person.name,
      lastName: person.lastName,
      email: person.email,
      photoUrl: person.photoUrl,
      active: !person.active,
      personGroups: (person.personGroups || []).map((pg) => ({ groupId: pg.groupId })),
    };
    try {
      await personApi.update(person.id, payload);
      await loadAll();
    } catch (err) {
      setError(err.message || "Error al actualizar estado");
    }
  };

  return (
    <AdminLayout>
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Personas y Grupos</h2>
            <p className="text-slate-500 text-sm">Administra miembros, colaboradores y sus agrupaciones.</p>
          </div>
          <button
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm shadow-primary/20"
            onClick={() => {
              if (activeTab === "people") {
                setSelectedPerson(null);
                setPersonModalOpen(true);
              } else {
                setSelectedGroup(null);
                setGroupModalOpen(true);
              }
            }}
          >
            <span className="material-symbols-outlined text-xl">{activeTab === "people" ? "person_add" : "group_add"}</span>
            {activeTab === "people" ? "Añadir Persona" : "Añadir Grupo"}
          </button>
        </div>
      </header>

      <div className="p-8 flex-1 overflow-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 flex flex-wrap gap-2 mb-6">
          {[
            { id: "people", label: "Personas" },
            { id: "groups", label: "Grupos" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={[
                "px-4 py-2 text-sm font-semibold rounded-xl transition",
                activeTab === tab.id ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50",
              ].join(" ")}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all"
              placeholder={activeTab === "people" ? "Buscar por nombre, email o grupo..." : "Buscar por nombre o descripción..."}
              type="text"
              value={activeTab === "people" ? search : groupSearch}
              onChange={(event) =>
                activeTab === "people" ? handleSearch(event.target.value) : setGroupSearch(event.target.value)
              }
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
            <span className="material-symbols-outlined text-xl">tune</span>
            Filtros
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
            <span className="material-symbols-outlined text-xl">file_download</span>
            Exportar
          </button>
        </div>

        {loading && <p className="text-slate-500">Cargando personas...</p>}
        {error && <p className="text-rose-600">{error}</p>}

        {!loading && !error && activeTab === "people" && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Grupos</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {people.map((person) => (
                  <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-100">
                          {person.photoUrl ? (
                            <img alt="Avatar" className="w-full h-full object-cover" src={person.photoUrl} />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400">person</span>
                          )}
                        </div>
                        <span className="font-medium text-slate-900">
                          {person.name} {person.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{person.email || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={!!person.active}
                            onChange={() => handleToggleActive(person)}
                          />
                        <Badge
                          text={person.active ? "Activo" : "Inactivo"}
                          className={person.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}
                        />
                        {/* <label className="inline-flex items-center gap-2 text-xs text-slate-500">
                          
                          Cambiar
                        </label> */}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(person.personGroups || []).map((pg) => (
                          <span
                            key={pg.groupId}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded leading-tight"
                          >
                            {pg.group?.name || "Grupo"}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-1.5 text-red-900 hover:text-red-600 transition-colors"
                          onClick={() => {
                            setSelectedPerson(person);
                            setConfirmModalOpen(true);
                          }}
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                          onClick={() => {
                            setSelectedPerson(person);
                            setPersonModalOpen(true);
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
          </div>
        )}

        {!loading && !error && activeTab === "groups" && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Miembros</th>
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
                      <Badge
                        text={group.active ? "Activo" : "Inactivo"}
                        className={group.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{group.personGroups?.length || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-1.5 text-red-900 hover:text-red-600 transition-colors"
                          onClick={() => {
                            setSelectedGroup(group);
                            setGroupConfirmOpen(true);
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
          </div>
        )}
      </div>

      <PersonModal
        open={personModalOpen}
        onClose={() => setPersonModalOpen(false)}
        onSave={handleSavePerson}
        groups={groups}
        initial={selectedPerson}
      />
      <ConfirmModal
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedPerson(null);
        }}
        onConfirm={handleDeletePerson}
        person={selectedPerson}
      />
      <GroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onSave={handleSaveGroup}
        initial={selectedGroup}
      />
      <GroupConfirmModal
        open={groupConfirmOpen}
        onClose={() => {
          setGroupConfirmOpen(false);
          setSelectedGroup(null);
        }}
        onConfirm={handleDeleteGroup}
        group={selectedGroup}
      />
    </AdminLayout>
  );
}
