import { useEffect, useRef } from "react";
import AnalogTimePicker from "./AnalogTimePicker";

export default function TimePickerPopover({ open, value, onChange, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose?.();
      }
    }

    if (open) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="absolute z-30 mt-2 w-[620px] max-w-[90vw] rounded-2xl border border-slate-200 bg-white shadow-2xl p-4" ref={ref}>
      <AnalogTimePicker value={value} onChange={onChange} />
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg"
          onClick={onClose}
        >
          Listo
        </button>
      </div>
    </div>
  );
}
