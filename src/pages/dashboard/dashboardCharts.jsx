import { useState, useMemo } from 'react';
import { CardShell, TempSunIcon, AirHumidityIcon, SoilDropIcon } from './dashboardShared';

// --- SHARED UI COMPONENTS ---

export function Donut({ value }) {
  const v = Math.max(0, Math.min(100, value));
  const size = 70; // Shrunk for compact look
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (v / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#10b981"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="15" fill="#111827" fontWeight="800">
        {v}%
      </text>
    </svg>
  );
}

export function IrrigationActionButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-2xl border text-sm text-right transition-all duration-300 ${
        active
          ? "bg-gradient-to-l from-[#2E7D32] to-[#388E3C] text-white border-[#2E7D32] shadow-md shadow-green-900/15"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:shadow-sm"
      }`}
    >
      {label}
    </button>
  );
}

export function IrrigationDonut({ value }) {
  const v = Math.max(0, Math.min(100, value));
  const size = 90; // Balanced compact size
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (v / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#10b981"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="20" fill="#111827" fontWeight="900">
        {v}%
      </text>
    </svg>
  );
}

export function IrrigationBarChart2D({ data, yLabel, unit }) {
  const pad = 36;
  const h = 260;
  const n = data.length;
  const w = Math.max(860, pad * 2 + n * 18);
  const barW = 10;
  const gap = 8;
  const ys = data.map((d) => d.value);
  const yMin = Math.floor(Math.min(...ys, 0) - 2);
  const yMax = Math.ceil(Math.max(...ys, 10) + 2);

  const x = (i) => pad + i * (barW + gap);
  const y = (val) => h - pad - ((val - yMin) / (yMax - yMin || 1)) * (h - pad * 2);
  const barH = (val) => h - pad - y(val);

  const colorFor = (v) => {
    const t = (v - yMin) / (yMax - yMin || 1);
    const hue = 145 - t * 25; // Keeping it in green shades (145 down to 120)
    return `hsl(${hue} 55% 45%)`;
  };

  return (
    <div className="w-full h-full relative">
      <svg 
        width="100%" 
        height={h} 
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        className="block"
      >
        {Array.from({ length: 6 }).map((_, i) => {
          const v = yMin + ((yMax - yMin) * i) / 5;
          const yy = y(v);
          return (
            <g key={i}>
              <line x1={pad} y1={yy} x2={w - pad} y2={yy} stroke="#F3F4F6" strokeDasharray="4 4" />
              <text x={pad - 8} y={yy + 4} fontSize="10" fill="#9CA3AF" textAnchor="end">{v.toFixed(0)}</text>
            </g>
          );
        })}
        {data.map((d, i) => (
          <rect key={d.day} x={x(i)} y={y(d.value)} width={barW} height={barH(d.value)} rx="3" fill={colorFor(d.value)} />
        ))}
      </svg>
    </div>
  );
}

// --- CORE CHART: HealthStyleBarChart ---

export function HealthStyleBarChart({ 
  range, 
  onRangeChange, 
  data, 
  unit, 
  metricName, 
  color = "#10b981", 
  xAxisTitle = "الوقت",
  yAxisTitle = "القيمة"
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  const ranges = [
    { key: 'D', label: 'اليوم' },
    { key: 'W', label: 'الأسبوع' },
    { key: 'M', label: 'الشهر' },
    { key: 'Y', label: 'السنة' },
  ];

  const h = 240; 
  const padLeft = 40; 
  const padRight = 20;
  const padTop = 5; 
  const padBottom = 15; 
  
  const n = data.length;
  const w = 1000; 
  const barW = Math.min(45, (w - padLeft - padRight) / (n * 1.5));
  const gap = (w - padLeft - padRight - n * barW) / n;

  const ys = data.map(d => d.value);
  const yMax = Math.ceil(Math.max(...ys, 5) / 10) * 10 + 10; 
  const yPos = (v) => h - padBottom - (v / (yMax || 1)) * (h - padTop - padBottom);
  const barH = (v) => Math.max(2, (h - padBottom) - yPos(v));

  const getDateRangeLabel = () => {
    const now = new Date();
    const monthsAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    
    if (range === 'D') return `${now.getDate()} ${monthsAr[now.getMonth()]}`;
    if (range === 'W') {
      const start = new Date();
      start.setDate(now.getDate() - 6);
      if (start.getMonth() === now.getMonth()) {
        return `${start.getDate()} - ${now.getDate()} ${monthsAr[now.getMonth()]}`;
      }
      return `${start.getDate()} ${monthsAr[start.getMonth()]} - ${now.getDate()} ${monthsAr[now.getMonth()]}`;
    }
    if (range === 'M') return `1 - ${now.getDate()} ${monthsAr[now.getMonth()]}`;
    if (range === 'Y') return `عام ${now.getFullYear()}`;
    return '';
  };

  const dateRangeLabel = getDateRangeLabel();

  return (
    <CardShell className="p-5 relative group/chart" dir="rtl">
      
      {/* Header Aligned with other Cards */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[16px] font-black text-gray-800 flex items-center gap-2">
            {metricName}
            <span className="bg-emerald-50 text-[#10b981] text-[10px] px-2 py-0.5 rounded-full border border-emerald-100 font-bold tracking-tight">تحليل فوري</span>
          </h2>
          <div className="text-[12px] font-medium text-gray-400 mt-1 leading-none">{dateRangeLabel}</div>
        </div>
        <div className="text-left bg-gray-50/50 px-3 py-1.5 rounded-xl border border-gray-100 shadow-inner">
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-2xl font-black text-gray-800 tracking-tight">
              {range === 'D' ? data[n-1]?.value : (data.reduce((a, b) => a + b.value, 0) / n).toFixed(1)}
            </span>
            <span className="text-[12px] font-bold text-gray-400 uppercase">{unit}</span>
          </div>
          <div className="text-[10px] font-bold text-[#10b981] text-right mt-0.5">متوسط الفترة</div>
        </div>
      </div>

      <div className="flex bg-gray-50 p-1 rounded-xl mb-0 gap-1 w-max self-center border border-gray-100">
        {ranges.map(r => (
          <button
            key={r.key}
            onClick={() => onRangeChange(r.key)}
            className={`px-4 py-1.5 text-[11px] font-black rounded-lg transition-all duration-300 ${
              range === r.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="w-full h-full relative min-h-[170px] mt-2">
        <svg 
          width="100%" 
          height={195} 
          viewBox={`-60 0 ${w + 80} 305`}
          preserveAspectRatio="xMidYMid meet"
          className="block overflow-visible" 
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <text x={- (h-padBottom)/2 - padTop + 10} y={-25} transform="rotate(-90)" textAnchor="middle" fontSize="24" fontWeight="1000" fill="#2E7D32" opacity="0.15">{yAxisTitle}</text>

          <line x1={padLeft} y1={padTop} x2={padLeft} y2={h - padBottom} stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          <line x1={padLeft} y1={h - padBottom} x2={w - padRight} y2={h - padBottom} stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          
          {[0, 0.25, 0.5, 0.75, 1].map(i => {
              const v = yMax * i;
              const yy = yPos(v);
              return (
                <g key={i}>
                  <line x1={padLeft} x2={w-padRight} y1={yy} y2={yy} stroke="#F8FAFC" strokeWidth="1" strokeDasharray="4 4" />
                  <text x={padLeft - 15} y={yy + 8} textAnchor="end" fontSize="22" fontWeight="black" fill="#94A3B8">{Math.round(v)}</text>
                </g>
              );
          })}

          {data.map((d, i) => {
            const xx = padLeft + i * (barW + gap) + gap / 2;
            const yy = yPos(d.value);
            const hh = barH(d.value);
            const isHovered = hoveredIdx === i;
            
            let showLabel = false;
            let labelText = d.label;
            if (range === 'D' && [0,6,12,18].includes(i)) {
                showLabel = true;
                labelText = i === 0 ? "12ص" : i === 6 ? "6ص" : i === 12 ? "12م" : "6م";
            } else if (range === 'W') showLabel = true;
            else if (range === 'M' && i % 7 === 0) showLabel = true;
            else if (range === 'Y' && i % 3 === 0) showLabel = true;

            return (
              <g key={i} onMouseEnter={() => setHoveredIdx(i)} className="cursor-pointer">
                <rect x={xx - gap/2} y={padTop} width={barW + gap} height={h - padTop - padBottom} fill="transparent" />
                <rect x={xx} y={yy} width={barW} height={hh} fill={color} rx="6" opacity={hoveredIdx !== null && !isHovered ? 0.3 : 1} className="transition-all duration-300 origin-bottom" />
                
                {showLabel && (
                  <text x={xx + barW / 2} y={h-padBottom+32} textAnchor="middle" fontSize="22" fill="#94A3B8" fontWeight="black">{labelText}</text>
                )}

                {isHovered && (
                  <g pointerEvents="none">
                    <rect x={xx + barW/2 - 28} y={yy - 40} width="56" height="30" rx="8" fill="#111827" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.3))" />
                    <text x={xx + barW/2} y={yy - 20} textAnchor="middle" fontSize="14" fontWeight="1000" fill="white">{d.value}</text>
                  </g>
                )}
              </g>
            );
          })}
          <text x={padLeft + (w - padLeft - padRight)/2} y={h+52} textAnchor="middle" fontSize="26" fontWeight="1000" fill="#2E7D32" opacity="0.3">{xAxisTitle}</text>
        </svg>
      </div>
    </CardShell>
  );
}
