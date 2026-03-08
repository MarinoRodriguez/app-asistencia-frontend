import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { groupApi, personApi } from "../../api/services";

export default function PersonEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [person, setPerson] = useState({
    name: "",
    lastName: "",
    email: "",
    idNumber: "",
    photoUrl: "",
    isActive: true,
    personGroups: [],
  });
  const [groups, setGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const groupsResponse = await groupApi.getAll(false);
        if (mounted) setGroups(groupsResponse.data || []);

        if (isEdit) {
          const personResponse = await personApi.getById(id);
          if (mounted && personResponse.data) {
            setPerson(personResponse.data);
            setSelectedGroupIds(new Set((personResponse.data.personGroups || []).map((pg) => pg.groupId)));
          }
        }
      } catch (err) {
        if (mounted) setError(err.message || "No se pudo cargar la pantalla.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  function toggleGroup(groupId) {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...person,
        personGroups: Array.from(selectedGroupIds).map((groupId) => ({ groupId })),
      };

      if (isEdit) {
        await personApi.update(id, payload);
      } else {
        await personApi.create(payload);
      }
      navigate("/admin/people");
    } catch (err) {
      setError(err.message || "No se pudo guardar la persona.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <PageHeader title={isEdit ? "Editar persona" : "Nueva persona"} subtitle="Configura datos y pertenencia a grupos." />

      <form className="panel form-panel" onSubmit={onSubmit}>
        {loading ? <p className="muted">Cargando...</p> : null}
        {!loading && error ? <p className="error-text">{error}</p> : null}

        {!loading ? (
          <>
            <div className="grid-two">
              <label className="field">
                <span>Nombre</span>
                <input
                  className="input"
                  value={person.name || ""}
                  onChange={(event) => setPerson((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </label>
              <label className="field">
                <span>Apellido</span>
                <input
                  className="input"
                  value={person.lastName || ""}
                  onChange={(event) => setPerson((prev) => ({ ...prev, lastName: event.target.value }))}
                  required
                />
              </label>
            </div>

            <div className="grid-two">
              <label className="field">
                <span>Email</span>
                <input
                  className="input"
                  type="email"
                  value={person.email || ""}
                  onChange={(event) => setPerson((prev) => ({ ...prev, email: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Documento</span>
                <input
                  className="input"
                  value={person.idNumber || ""}
                  onChange={(event) => setPerson((prev) => ({ ...prev, idNumber: event.target.value }))}
                />
              </label>
            </div>

            <label className="field">
              <span>Foto URL</span>
              <input
                className="input"
                value={person.photoUrl || ""}
                onChange={(event) => setPerson((prev) => ({ ...prev, photoUrl: event.target.value }))}
              />
            </label>

            <fieldset className="field">
              <legend>Grupos</legend>
              <div className="check-grid">
                {groups.map((group) => (
                  <label key={group.id} className="check-row">
                    <input
                      type="checkbox"
                      checked={selectedGroupIds.has(group.id)}
                      onChange={() => toggleGroup(group.id)}
                    />
                    <span>{group.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="check-row">
              <input
                type="checkbox"
                checked={Boolean(person.isActive)}
                onChange={(event) => setPerson((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
              <span>Persona activa</span>
            </label>

            <div className="actions-inline">
              <Link className="btn ghost" to="/admin/people">
                Cancelar
              </Link>
              <button className="btn" type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </>
        ) : null}
      </form>
    </section>
  );
}
