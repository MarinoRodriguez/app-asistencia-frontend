export default function ErrorModal({ open, title = "Error", message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-white shadow-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Alerta</p>
            <h3 className="text-lg font-black text-slate-900 mt-2">{title}</h3>
          </div>
          <button
            className="text-slate-400 hover:text-slate-600"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">{message}</p>
        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg"
            onClick={onClose}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
