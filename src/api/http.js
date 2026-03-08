const runtimeUrl =
  (typeof window !== "undefined" && window.__ENV__ && window.__ENV__.VITE_API_URL) || "";
const baseUrl = (runtimeUrl || import.meta.env.VITE_API_URL || "https://localhost:7224").replace(/\/$/, "");

function buildErrorMessage(status, payload) {
  if (payload?.message) return payload.message;
  if (status === 401) return "No autenticado. Inicia sesión.";
  if (status === 403) return "No autorizado para esta acción.";
  if (status === 404) return "Recurso no encontrado.";
  if (status >= 500) return "Error interno del servidor.";
  return `HTTP ${status}`;
}

export async function apiRequest(path, options = {}) {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
  let response;
  try {
    response = await fetch(`${baseUrl}/${path.replace(/^\//, "")}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app:error", {
          detail: { message: error?.message || "Error de red" },
        })
      );
    }
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";
  const hasJson = contentType.includes("application/json");
  let payload = null;
  if (hasJson) {
    try {
      payload = await response.json();
    } catch (_) {
      payload = null;
    }
  }

  if (!response.ok || payload?.success === false) {
    const message = buildErrorMessage(response.status, payload);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app:error", {
          detail: { message, status: response.status },
        })
      );
    }
    throw new Error(message);
  }

  return payload ?? { success: true, message: "Operación exitosa", data: null };
}
