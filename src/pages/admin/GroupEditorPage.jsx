import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { groupApi } from "../../api/services";

export default function GroupEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [group, setGroup] = useState({
    name: "",
    description: "",
    active: true,
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    let mounted = true;

    async function loadGroup() {
      try {
        const response = await groupApi.getById(id);
        if (mounted && response.data) setGroup(response.data);
      } catch (err) {
        if (mounted) setError(err.message || "No se pudo cargar el grupo.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadGroup();

    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isEdit) {
        await groupApi.update(id, group);
      } else {
        await groupApi.create(group);
      }
      navigate("/admin/groups");
    } catch (err) {
      setError(err.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <PageHeader title={isEdit ? "Editar grupo" : "Nuevo grupo"} subtitle="Configura grupos para invitaciones masivas." />

      <form className="panel form-panel" onSubmit={onSubmit}>
        {loading ? <p className="muted">Cargando...</p> : null}
        {!loading && error ? <p className="error-text">{error}</p> : null}

        {!loading ? (
          <>
            <label className="field">
              <span>Nombre</span>
              <input
                className="input"
                value={group.name || ""}
                onChange={(event) => setGroup((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </label>

            <label className="field">
              <span>Descripción</span>
              <textarea
                className="input"
                rows={4}
                value={group.description || ""}
                onChange={(event) => setGroup((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>

            <label className="check-row">
              <input
                type="checkbox"
                checked={Boolean(group.active)}
                onChange={(event) => setGroup((prev) => ({ ...prev, active: event.target.checked }))}
              />
              <span>Grupo activo</span>
            </label>

            <div className="actions-inline">
              <Link className="btn ghost" to="/admin/groups">
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
