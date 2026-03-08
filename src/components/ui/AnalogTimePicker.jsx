import { useMemo } from "react";

const HOUR_POSITIONS = [
  { value: 12, angle: 270 },
  { value: 1, angle: 300 },
  { value: 2, angle: 330 },
  { value: 3, angle: 0 },
  { value: 4, angle: 30 },
  { value: 5, angle: 60 },
  { value: 6, angle: 90 },
  { value: 7, angle: 120 },
  { value: 8, angle: 150 },
  { value: 9, angle: 180 },
  { value: 10, angle: 210 },
  { value: 11, angle: 240 },
];

const MINUTE_POSITIONS = Array.from({ length: 12 }, (_, index) => ({
  value: index * 5,
  angle: (index * 30 - 90 + 360) % 360,
}));

function polarToCartesian(angle, radius) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: radius * Math.cos(rad),
    y: radius * Math.sin(rad),
  };
}

export default function AnalogTimePicker({ value, onChange }) {
  const current = useMemo(() => {
    if (!value) return { hour: 12, minute: 0, period: "AM" };
    const [rawHour, rawMinute] = value.split(":");
    const hour24 = Number(rawHour || 0);
    const minute = Number(rawMinute || 0);
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return { hour: hour12, minute, period };
  }, [value]);

  const hourAngle = HOUR_POSITIONS.find((item) => item.value === current.hour)?.angle ?? 270;
  const minuteAngle = ((current.minute / 60) * 360 - 90 + 360) % 360;
  const handAngle = current.step === "minutes" ? minuteAngle : hourAngle;

  function updateTime(next) {
    const hour24 = next.period === "PM" ? ((next.hour % 12) + 12) % 24 : next.hour % 12;
    const minute = String(next.minute).padStart(2, "0");
    onChange(`${String(hour24).padStart(2, "0")}:${minute}`);
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">Seleccionar hora</p>
        <div className="flex gap-2">
          {[
            { id: "AM", label: "AM" },
            { id: "PM", label: "PM" },
          ].map((period) => (
            <button
              key={period.id}
              type="button"
              className={
                period.id === current.period
                  ? "px-3 py-1 text-xs font-semibold rounded-full bg-primary text-white"
                  : "px-3 py-1 text-xs font-semibold rounded-full border border-slate-200 text-slate-500"
              }
              onClick={() => updateTime({ ...current, period: period.id })}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 mb-2">Horas</p>
          <div className="relative mx-auto h-56 w-56">
            <div className="absolute inset-0 rounded-full border border-slate-200 bg-white" />
            {HOUR_POSITIONS.map((item) => {
              const pos = polarToCartesian(item.angle, 90);
              const selected = current.hour === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  className={
                    "absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full text-sm font-semibold" +
                    (selected ? " bg-primary text-white" : " text-slate-600 hover:bg-slate-100")
                  }
                  style={{ left: `calc(50% + ${pos.x}px)`, top: `calc(50% + ${pos.y}px)` }}
                  onClick={() => updateTime({ ...current, hour: item.value })}
                >
                  {String(item.value).padStart(2, "0")}
                </button>
              );
            })}
            <div
              className="absolute left-1/2 top-1/2 h-20 w-0.5 bg-primary origin-bottom"
              style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)` }}
            />
            <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 mb-2">Minutos</p>
          <div className="relative mx-auto h-56 w-56">
            <div className="absolute inset-0 rounded-full border border-slate-200 bg-white" />
            {MINUTE_POSITIONS.map((item) => {
              const pos = polarToCartesian(item.angle, 90);
              const selected = current.minute === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  className={
                    "absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full text-sm font-semibold" +
                    (selected ? " bg-primary text-white" : " text-slate-600 hover:bg-slate-100")
                  }
                  style={{ left: `calc(50% + ${pos.x}px)`, top: `calc(50% + ${pos.y}px)` }}
                  onClick={() => updateTime({ ...current, minute: item.value })}
                >
                  {String(item.value).padStart(2, "0")}
                </button>
              );
            })}
            <div
              className="absolute left-1/2 top-1/2 h-20 w-0.5 bg-primary origin-bottom"
              style={{ transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)` }}
            />
            <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
