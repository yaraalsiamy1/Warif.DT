import { CardShell, CardTopRow, TempSunIcon, AirHumidityIcon, SoilDropIcon } from './dashboardShared';
import { Donut } from './dashboardCharts';

function DashboardHome({ onGo, onSendAI }) {
  return (
    <div className="w-full h-full overflow-auto p-6 min-h-0">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-5">

        {/* Page Header */}
        <div className="flex items-center gap-3 animate-fade-in-down">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-800">نظرة عامة</div>
            <div className="text-sm text-gray-500">ملخص حالة المحمية والحساسات</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 items-stretch">
          <div className="animate-fade-in-up delay-1 h-full"><TemperatureCard onGo={onGo} /></div>
          <div className="animate-fade-in-up delay-2 h-full"><AirHumidityCard onGo={onGo} /></div>
          <div className="animate-fade-in-up delay-3 h-full"><SoilMoistureCard onGo={onGo} /></div>
        </div>
        <div className="grid grid-cols-2 gap-5 items-stretch">
          <div className="animate-fade-in-up delay-4 h-full"><RecommendationsCard onGo={onGo} /></div>
          <div className="animate-fade-in-up delay-5 h-full"><IrrigationCard onGo={onGo} /></div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Shared UI
========================================================= */


function SoilMoistureCard({ onGo }) {
  const value = 42;
  const idealMin = 35;
  const idealMax = 55;

  let status = "ضمن النطاق المثالي";
  let color = "#2E7D32";
  if (value < idealMin) {
    status = "أقل من النطاق المثالي";
    color = "#1565C0";
  } else if (value > idealMax) {
    status = "أعلى من النطاق المثالي";
    color = "#c76a19";
  }

  const fill = Math.max(0, Math.min(100, value));

  return (
    <CardShell className="p-10">
      <CardTopRow
        title=" التربة"
        subtitle="آخر تحديث: قبل 5 دقائق"
        onDetails={() => onGo("soilMoisture")}
      />

      <div className="mt-12 flex items-center justify-between gap-3">
        <div className="text-right" style={{ color }}>
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-4xl font-bold">{value}</span>
            <span className="text-sm">%</span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-7 h-16 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-end">
            <div
              className="w-full transition-all"
              style={{
                height: `${fill}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl bg-[#F1F5F1] border border-gray-200 flex items-center justify-center">
            <SoilDropIcon />
          </div>
        </div>
      </div>

      <div className="mt-5 text-sm font-semibold text-center" style={{ color }}>
        {status}
      </div>
    </CardShell>
  );
}


function AirHumidityCard({ onGo }) {
  const value = 58;
  const idealMin = 45;
  const idealMax = 60;

  let status = "ضمن النطاق المثالي";
  let color = "#2E7D32";
  if (value < idealMin) {
    status = "أقل من النطاق المثالي";
    color = "#1565C0";
  } else if (value > idealMax) {
    status = "أعلى من النطاق المثالي";
    color = "#c76a19";
  }

  const fill = Math.max(0, Math.min(100, value));

  return (
    <CardShell className="p-10">
      <CardTopRow
        title="رطوبة الهواء"
        subtitle="آخر تحديث: قبل 5 دقائق"
        onDetails={() => onGo("airHumidity")}
      />

      <div className="mt-12 flex items-center justify-between gap-3">
        <div className="text-right" style={{ color }}>
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-4xl font-bold">{value}</span>
            <span className="text-sm">%</span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-7 h-16 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-end">
            <div
              className="w-full transition-all"
              style={{
                height: `${fill}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl bg-[#F1F5F1] border border-gray-200 flex items-center justify-center">
            <AirHumidityIcon />
          </div>
        </div>
      </div>

      <div className="mt-5 text-sm font-semibold text-center" style={{ color }}>
        {status}
      </div>
    </CardShell>
  );
}


function TemperatureCard({ onGo }) {
  const value = 31;
  const idealMin = 22;
  const idealMax = 28;

  let status = "ضمن النطاق المثالي";
  let color = "#2E7D32";
  if (value < idealMin) {
    status = "أقل من النطاق المثالي";
    color = "#1565C0";
  } else if (value > idealMax) {
    status = "أعلى من النطاق المثالي";
    color = "#EF6C00";
  }

  const fill = Math.max(0, Math.min(100, ((value - 10) / (45 - 10)) * 100));

  return (
    <CardShell className="p-10">
      <CardTopRow
        title="درجة الحرارة"
        subtitle="آخر تحديث: قبل 5 دقائق"
        onDetails={() => onGo("temp")}
      />

      <div className="mt-12 flex items-center justify-between gap-3">
        <div className="text-right" style={{ color }}>
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-4xl font-bold">{value}</span>
            <span className="text-sm">°C</span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-7 h-16 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-end">
            <div
              className="w-full transition-all"
              style={{
                height: `${fill}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] border border-gray-200 flex items-center justify-center">
            <TempSunIcon />
          </div>
        </div>
      </div>

      <div className="mt-5 text-sm font-semibold text-center" style={{ color }}>
        {status}
      </div>
    </CardShell>
  );
}

/* =========================================================
   Irrigation Card
========================================================= */


function IrrigationCard({ onGo }) {
  const percent = 60;
  const level = "متوسط";
  const barWidth =
    level === "90%" ? "مرتفع" : level === "متوسط" ? "60%" : "30%";

  return (
    <CardShell className="p-10">
      <CardTopRow
        title="حالة الري اليوم"
        subtitle="آخر تحديث: قبل 10 دقائق"
        onDetails={() => onGo("irrigation")}
      />

      <div className="flex-1 flex flex-col items-center justify-center mt-4">
        <Donut value={percent} />
        <div className="mt-4 text-center text-sm text-gray-700">
          معدل الري
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full bg-[#EF6C00]" style={{ width: barWidth }} />
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
          <span>منخفض</span>
          <span>متوسط</span>
          <span>مرتفع</span>
        </div>
      </div>
    </CardShell>
  );
}

/* =========================================================
   Recommendations (latest only)
========================================================= */


function RecommendationsCard({ onGo }) {
  const latest = [
    {
      id: "r1",
      text: "قم بالتبريد — درجة الحرارة بالمحمية أعلى من النطاق المثالي.",
      icon: <TempSunIcon />,
    },
    {
      id: "r2",
      text: "اضبط الري — رطوبة التربة اعلى من النطاق المثالي، قم بأعادة الجدولة.",
      icon: <SoilDropIcon />,
    },
  ];

  return (
    <CardShell className="p-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="text-right">
          <div className="text-xl font-bold text-gray-800">التوصيات</div>
          <div className="text-[13px] text-gray-500 mt-1">
            أحدث التوصيات المقترحة
          </div>
        </div>

        <button
          type="button"
          onClick={() => onGo("recs")}
          className="text-xs text-[#2E7D32] bg-[#E8F5E9] px-3 py-1.5 rounded-xl hover:bg-[#C8E6C9] hover:shadow-sm transition-all duration-300 shrink-0 font-semibold group"
        >
          عرض الكل <span className="inline-block transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
        </button>
      </div>

      {/* Recommendations list (2 فقط) */}
      <div className="mt-4 flex-1 flex flex-col gap-3">
        {latest.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 border border-gray-100 rounded-2xl px-3 py-3"
          >
            <div className="text-sm text-gray-700">{item.text}</div>

            <div className="w-10 h-10 rounded-2xl bg-[#F1F5F1] border border-gray-200 flex items-center justify-center shrink-0">
              {item.icon}
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

/* =========================================================
   Placeholder pages
========================================================= */

