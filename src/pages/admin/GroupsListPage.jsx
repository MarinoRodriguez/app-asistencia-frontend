import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { groupApi } from "../../api/services";

export default function GroupsListPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadGroups() {
    setLoading(true);
    setError("");
    try {
      const response = await groupApi.getAll();
      setGroups(response.data || []);
    } catch (err) {
      setError(err.message || "No se pudo cargar grupos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  return (
    <section>
      <PageHeader
        title="Grupos"
        subtitle={`${groups.length} grupos registrados`}
        actions={
          <Link className="btn" to="/admin/groups/create">
            + Nuevo grupo
          </Link>
        }
      />

      <div className="panel">
        {loading ? <p className="muted">Cargando...</p> : null}
        {!loading && error ? <p className="error-text">{error}</p> : null}

        {!loading && !error && groups.length === 0 ? <p className="muted">No hay grupos registrados.</p> : null}

        {!loading && !error && groups.length > 0 ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td>{group.name}</td>
                    <td>{group.description || "-"}</td>
                    <td>
                      <span className={`pill ${group.active ? "success" : "warning"}`}>{group.active ? "Activo" : "Inactivo"}</span>
                    </td>
                    <td>
                      <Link className="btn tiny secondary" to={`/admin/groups/edit/${group.id}`}>
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
