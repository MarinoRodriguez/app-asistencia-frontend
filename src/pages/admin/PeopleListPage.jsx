import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { personApi } from "../../api/services";
import { personFullName } from "../../lib/format";

export default function PeopleListPage() {
  const [people, setPeople] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const subtitle = useMemo(() => `${people.length} personas cargadas`, [people.length]);

  async function loadPeople() {
    setLoading(true);
    setError("");
    try {
      const response = await personApi.getAll();
      setPeople(response.data || []);
    } catch (err) {
      setError(err.message || "No se pudo cargar la lista de personas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPeople();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      setLoading(true);
      setError("");
      try {
        const response = searchTerm.trim() ? await personApi.search(searchTerm.trim()) : await personApi.getAll();
        if (!cancelled) setPeople(response.data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "No se pudo buscar.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timeout = setTimeout(runSearch, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchTerm]);

  return (
    <section>
      <PageHeader
        title="Personas"
        subtitle={subtitle}
        actions={
          <Link className="btn" to="/admin/people/create">
            + Nueva persona
          </Link>
        }
      />

      <div className="panel">
        <div className="toolbar-row">
          <input
            className="input"
            placeholder="Buscar por nombre, apellido o email"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button className="btn ghost" onClick={loadPeople} type="button">
            Recargar
          </button>
        </div>

        {loading ? <p className="muted">Cargando...</p> : null}
        {!loading && error ? <p className="error-text">{error}</p> : null}

        {!loading && !error && people.length === 0 ? <p className="muted">No hay personas para mostrar.</p> : null}

        {!loading && !error && people.length > 0 ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Email</th>
                  <th>Grupos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <div className="person-chip">
                        {person.photoUrl ? <img src={person.photoUrl} alt={personFullName(person)} /> : <span>{(person.name || "?").slice(0, 1)}</span>}
                        <div>
                          <strong>{personFullName(person)}</strong>
                          <p>{person.idNumber || "Sin documento"}</p>
                        </div>
                      </div>
                    </td>
                    <td>{person.email || "-"}</td>
                    <td>
                      <div className="badges-inline">
                        {(person.personGroups || []).map((pg) => (
                          <span key={`${person.id}-${pg.groupId}`} className="pill muted">
                            {pg.group?.name || `Grupo #${pg.groupId}`}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Link className="btn tiny secondary" to={`/admin/people/edit/${person.id}`}>
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
