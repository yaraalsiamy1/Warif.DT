function irrigationClamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function irrigationDaysInMonth(year, monthIndex0) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function generateIrrigationUsageSeries({
  days,
  base,
  amp,
  noise,
  min,
  max,
  seed = 7,
}) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const out = [];
  for (let d = 1; d <= days; d++) {
    const wave = Math.sin((d / 7) * Math.PI * 0.9) * amp;
    const jitter = (rnd() - 0.5) * noise;
    const v = irrigationClamp(base + wave + jitter, min, max);
    out.push({ day: d, value: Number(v.toFixed(1)) });
  }
  return out;
}

function IrrigationBarChart2D({ data, yLabel, unit }) {
  const pad = 36;
  const h = 260;

  const n = data.length;
  const w = Math.max(860, pad * 2 + n * 18);
  const barW = 10;
  const gap = 8;

  const ys = data.map((d) => d.value);
  const yMinRaw = Math.min(...ys);
  const yMaxRaw = Math.max(...ys);
  const yMin = Math.floor(yMinRaw - 2);
  const yMax = Math.ceil(yMaxRaw + 2);

  const x = (i) => pad + i * (barW + gap);
  const y = (val) =>
    h - pad - ((val - yMin) / (yMax - yMin || 1)) * (h - pad * 2);
  const barH = (val) => h - pad - y(val);

  const yTicks = 5;

  const colorFor = (v) => {
    const t = (v - yMin) / (yMax - yMin || 1);
    const hue = 125 - t * 115;
    return `hsl(${hue} 55% 50%)`;
  };

  return (
    <div className="w-full">
      {/* الرسم */}
      <div className="w-full overflow-hidden">
        <svg width={w} height={h} className="block">
          <rect x="0" y="0" width={w} height={h} fill="white" />

          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const v = yMin + ((yMax - yMin) * i) / yTicks;
            const yy = y(v);
            return (
              <g key={`yg-${i}`}>
                <line x1={pad} y1={yy} x2={w - pad} y2={yy} stroke="#E5E7EB" />
                <text
                  x={pad - 8}
                  y={yy + 4}
                  fontSize="10"
                  fill="#6B7280"
                  textAnchor="end"
                >
                  {v.toFixed(0)}
                </text>
              </g>
            );
          })}

          <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#D1D5DB" />
          <line
            x1={pad}
            y1={h - pad}
            x2={w - pad}
            y2={h - pad}
            stroke="#D1D5DB"
          />

          {data.map((d, i) => {
            const xx = x(i);
            const yy = y(d.value);
            const hh = barH(d.value);
            return (
              <g key={d.day}>
                <rect
                  x={xx}
                  y={yy}
                  width={barW}
                  height={hh}
                  rx="3"
                  fill={colorFor(d.value)}
                  opacity="0.95"
                />
                {i % 4 === 0 ? (
                  <text
                    x={xx + barW / 2}
                    y={h - 12}
                    fontSize="10"
                    fill="#6B7280"
                    textAnchor="middle"
                  >
                    {d.day}
                  </text>
                ) : null}
              </g>
            );
          })}

          <text
            x={w - pad}
            y={pad - 10}
            fontSize="11"
            fill="#374151"
            textAnchor="end"
          >
            {yLabel} {unit ? `(${unit})` : ""}
          </text>
        </svg>
      </div>

      {/* شرح الألوان */}
      <div className="mt-3 text-center text-[11px] text-gray-500">
        الألوان تعبّر عن مستوى استخدام الري.
      </div>

      {/* Legend بالمنتصف */}
      <div className="mt-2 w-full flex justify-center" dir="rtl">
        <div className="flex items-center gap-4 text-[11px] text-gray-600">
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="w-3 h-3 rounded-sm bg-[#2E7D32]" />
            <span>استخدام منخفض</span>
          </div>

          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="w-3 h-3 rounded-sm bg-[#FBC02D]" />
            <span>استخدام متوسط</span>
          </div>

          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="w-3 h-3 rounded-sm bg-[#EF6C00]" />
            <span>استخدام مرتفع</span>
          </div>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   Sensor Detail Pages (Temperature / Air Humidity / Soil)
   (same logic you provided, only integrated to dashboard routing)
========================================================= */

function sensorClamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function sensorDaysInMonth(year, monthIndex0) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function sensorMakeMonthOptionsAr() {
  return [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
}

// Helper: dynamic update text based on selected month
function sensorGetUpdateText(selectedMonth) {
  const currentMonth = new Date().getMonth(); // 0-indexed, April = 3
  const currentYear = new Date().getFullYear();
  const months = sensorMakeMonthOptionsAr();
  if (selectedMonth === currentMonth) return 'آخر تحديث: قبل 5 دقائق';
  if (selectedMonth > currentMonth) return `بيانات ${months[selectedMonth]} غير متوفرة بعد`;
  const lastDay = sensorDaysInMonth(currentYear, selectedMonth);
  return `آخر تحديث: ${lastDay} ${months[selectedMonth]}`;
}

function sensorIsFutureMonth(selectedMonth) {
  return selectedMonth > new Date().getMonth();
}

function sensorGenerateLineSeries({
  days,
  base,
  amp,
  noise,
  min,
  max,
  seed = 7,
}) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const out = [];
  for (let d = 1; d <= days; d++) {
    const wave = Math.sin((d / 7) * Math.PI * 0.9) * amp;
    const jitter = (rnd() - 0.5) * noise;
    const v = sensorClamp(base + wave + jitter, min, max);
    out.push({ day: d, value: Number(v.toFixed(1)) });
  }
  return out;
}

export function sensorBuildRecommendationsTemperature(current) {
  const rec = [];
  if (current >= 35) {
    rec.push(
      "درجة الحرارة مرتفعة: يوصى بتفعيل المكيفات وتقليل التعرض المباشر للشمس داخل المحمية."
    );
    rec.push("راقب الرطوبة بالتزامن لتفادي الإجهاد الحراري للنبات.");
  } else if (current <= 15) {
    rec.push(
      "درجة الحرارة منخفضة: يوصى بتقليل التهوية وتفعيل التدفئة إن وجدت."
    );
    rec.push("تأكد من ضبط التهوية لتفادي التكاثف وتسرب الرطوبة الزائدة.");
  } else {
    rec.push("الحرارة ضمن النطاق المقبول: استمر بالمراقبة الدورية.");
  }
  return rec;
}

export function sensorBuildRecommendationsHumidity(current) {
  const rec = [];
  if (current >= 80) {
    rec.push("الرطوبة مرتفعة: يوصى بزيادة التهوية وتقليل الرش/الري الضبابي.");
    rec.push("افحص منافذ التهوية وتأكد من جفاف الأسطح المحيطة.");
  } else if (current <= 35) {
    rec.push("الرطوبة منخفضة: يوصى بضبط نظام الترطيب أو إعادة جدولة الري.");
    rec.push("احرص على عدم تعريض الأوراق للجفاف لفترات طويلة.");
  } else {
    rec.push("الرطوبة ضمن النطاق المناسب: استمر على إعدادات التشغيل الحالية.");
  }
  return rec;
}

export function sensorBuildRecommendationsSoil(soilTemp, soilMoist) {
  const rec = [];
  if (soilMoist <= 25) {
    rec.push(
      "رطوبة التربة منخفضة: يوصى بزيادة الري تدريجيًا ومراقبة الاستجابة خلال 24 ساعة."
    );
  } else if (soilMoist >= 60) {
    rec.push(
      "رطوبة التربة مرتفعة: قلل الري وتأكد من التصريف لتفادي تعفن الجذور."
    );
  } else {
    rec.push("رطوبة التربة جيدة: حافظ على الجدول الحالي مع مراجعة أسبوعية.");
  }
  return rec;
}

function generateDataForRange(range, { base, amp, noise, min, max, seed }) {
  let s = seed || 7;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentDay = now.getDate();
  const currentHour = now.getHours();

  const getPoints = () => {
    switch (range) {
      case 'D': return 24;   
      case 'W': return 7;    
      case 'M': return 30;   
      case '6M': return 6;   
      case 'Y': return 12;   
      default: return 30;
    }
  };

  const points = getPoints();
  const out = [];
  for (let i = 0; i < points; i++) {
    // Logic to hide future data
    let isFuture = false;
    if (range === 'Y' && i > currentMonth) isFuture = true;
    if (range === 'M' && i + 1 > currentDay) isFuture = true;
    if (range === 'D' && i > currentHour) isFuture = true;
    // For 'W' and '6M', we'll simplify: if i > some threshold, it's future. 
    // In a real app we'd check actual dates.
    if (range === 'W' && i > 3) isFuture = false; // Just showing a few days for week demo

    if (isFuture) continue;

    const wave = Math.sin((i / (points/4)) * Math.PI) * amp;
    const jitter = (rnd() - 0.5) * noise;
    const v = Math.max(min, Math.min(max, base + wave + jitter));
    
    let label = '';
    if (range === 'D') label = `${i}:00`;
    else if (range === 'W') label = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"][i % 7];
    else if (range === 'M') label = `${i + 1}`;
    else if (range === '6M' || range === 'Y') label = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"][i % 12];

    out.push({ label, value: Number(v.toFixed(1)) });
  }
  return out;
}

export {
  irrigationClamp,
  irrigationDaysInMonth,
  generateIrrigationUsageSeries,
  sensorDaysInMonth,
  sensorGenerateLineSeries,
  sensorMakeMonthOptionsAr,
  sensorGetUpdateText,
  sensorIsFutureMonth,
  generateDataForRange
};
