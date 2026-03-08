import React from "react";

export default function ExternalModal({ open, onClose, onSave }) {
  const [form, setForm] = React.useState({ name: "", lastName: "", email: "" });

  React.useEffect(() => {
    if (open) setForm({ name: "", lastName: "", email: "" });
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold">Registrar Externo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
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
