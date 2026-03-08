import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/services";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authApi.register(form);
      const token = response?.data?.token;
      if (token) {
        window.localStorage.setItem("auth_token", token);
        navigate("/admin/dashboard", { replace: true });
        return;
      }
      setMessage("Administrador creado. Ahora puedes iniciar sesión.");
    } catch (err) {
      setError(err.message || "No se pudo crear el administrador");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Bootstrap</p>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Crear administrador</h1>
          <p className="text-sm text-slate-500 mt-2">Solo disponible si no existe ningún usuario.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Usuario</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.userName}
              onChange={(event) => setForm({ ...form, userName: event.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</div>
          ) : null}
          {message ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{message}</div>
          ) : null}

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear administrador"}
          </button>
        </form>

        <div className="mt-6 text-xs text-slate-500">
          ¿Ya existe un admin?{" "}
          <button className="text-primary font-semibold" onClick={() => navigate("/login")}>
            Ingresar
          </button>
        </div>
      </div>
    </div>
  );
}
