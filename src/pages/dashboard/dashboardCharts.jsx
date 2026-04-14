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
        {v}٪
      </text>
    </svg>
  );
}

export function IrrigationActionButton({ children, active, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-5 py-4 rounded-2xl border text-sm text-right transition-all duration-300 flex items-center justify-between group ${
        active
          ? "bg-gradient-to-l from-[#2E7D32] to-[#388E3C] text-white border-[#2E7D32] shadow-lg shadow-green-900/20 scale-[0.98]"
          : "bg-white text-gray-700 border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md"
      }`}
    >
      <span className="font-bold tracking-tight">{children}</span>
      {icon && (
        <div className={`p-2 rounded-xl transition-all duration-300 ${active ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
          {icon}
        </div>
      )}
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
        {v}٪
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
  const padLeft = 65; 
  const padRight = 20;
  const padTop = 15; 
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
          viewBox={`-40 0 ${w + 60} 330`}
          preserveAspectRatio="xMidYMid meet"
          className="block overflow-visible" 
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <text x={- (h-padBottom)/2 - padTop + 10} y={-30} transform="rotate(-90)" textAnchor="middle" fontSize="24" fontWeight="1000" fill="#2E7D32" opacity="0.75">{yAxisTitle}</text>

          <line x1={padLeft} y1={padTop} x2={padLeft} y2={h - padBottom} stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          <line x1={padLeft} y1={h - padBottom} x2={w - padRight} y2={h - padBottom} stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          
          {[0, 0.25, 0.5, 0.75, 1].map(i => {
              const v = yMax * i;
              const yy = yPos(v);
              return (
                <g key={i}>
                  <line x1={padLeft} x2={w-padRight} y1={yy} y2={yy} stroke="#F8FAFC" strokeWidth="1" strokeDasharray="4 4" />
                  <text x={padLeft - 35} y={yy + 8} textAnchor="end" fontSize="22" fontWeight="black" fill="#94A3B8">{Math.round(v)}</text>
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
                    <rect x={xx + barW/2 - 40} y={yy - 55} width="80" height="42" rx="10" fill="#111827" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.4))" />
                    <text x={xx + barW/2} y={yy - 27} textAnchor="middle" fontSize="24" fontWeight="1000" fill="white">{d.value}</text>
                  </g>
                )}
              </g>
            );
          })}
          <text x={padLeft + (w - padLeft - padRight)/2} y={h+70} textAnchor="middle" fontSize="26" fontWeight="1000" fill="#2E7D32" opacity="0.75">{xAxisTitle}</text>
        </svg>
      </div>
    </CardShell>
  );
}

// --- NEW COMPONENT: DualResourceBarChart ---
export function DualResourceBarChart({ 
  range, 
  onRangeChange, 
  data, 
  metricName = "استهلاك الموارد الموحد",
  xAxisTitle = "الفترة الزمنية",
  yAxisTitle = "معدل الاستهلاك (٪)"
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [hoveredMetric, setHoveredMetric] = useState(null); // 'water' or 'power'
  
  const ranges = [
    { key: 'D', label: 'اليوم' },
    { key: 'W', label: 'الأسبوع' },
    { key: 'M', label: 'الشهر' },
    { key: 'Y', label: 'السنة' },
  ];

  const h = 240; 
  const padLeft = 65; 
  const padRight = 20;
  const padTop = 15; 
  const padBottom = 15; 
  
  const n = data.length;
  const w = 1000; 
  const barW = Math.min(20, (w - padLeft - padRight) / (n * 2.5));
  const gapBetweenGroups = (w - padLeft - padRight - n * (barW * 2 + 4)) / n;

  // Find max across both metrics
  const allValues = data.flatMap(d => [d.water, d.power]);
  const yMax = Math.ceil(Math.max(...allValues, 5) / 10) * 10 + 10; 
  const yPos = (v) => h - padBottom - (v / (yMax || 1)) * (h - padTop - padBottom);
  const barH = (v) => Math.max(2, (h - padBottom) - yPos(v));

  return (
    <CardShell className="p-5 relative group/chart" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[16px] font-black text-gray-800 flex items-center gap-2">
            {metricName}
            <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full border border-blue-100 font-bold tracking-tight uppercase">موارد مدمجة</span>
          </h2>
          <div className="text-[12px] font-medium text-gray-400 mt-1 leading-none">تتبع استهلاك الطاقة والمياه الموحد</div>
        </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
               <div className="w-3 h-3 rounded bg-[#059669] shadow-sm" />
               <span className="text-[11px] font-bold text-gray-600">المياه</span>
            </div>
            <div className="flex items-center gap-1.5">
               <div className="w-3 h-3 rounded bg-[#34d399] shadow-sm" />
               <span className="text-[11px] font-bold text-gray-600">الكهرباء</span>
            </div>
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
          viewBox={`-40 0 ${w + 60} 330`}
          preserveAspectRatio="xMidYMid meet"
          className="block overflow-visible" 
          onMouseLeave={() => { setHoveredIdx(null); setHoveredMetric(null); }}
        >
          <text x={- (h-padBottom)/2 - padTop + 10} y={-30} transform="rotate(-90)" textAnchor="middle" fontSize="24" fontWeight="1000" fill="#2E7D32" opacity="0.6">{yAxisTitle}</text>

          <line x1={padLeft} y1={padTop} x2={padLeft} y2={h - padBottom} stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          <line x1={padLeft} y1={h - padBottom} x2={w - padRight} y2={h - padBottom} stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          
          {[0, 0.25, 0.5, 0.75, 1].map(i => {
              const v = yMax * i;
              const yy = yPos(v);
              return (
                <g key={i}>
                  <line x1={padLeft} x2={w-padRight} y1={yy} y2={yy} stroke="#F8FAFC" strokeWidth="1" strokeDasharray="4 4" />
                  <text x={padLeft - 35} y={yy + 8} textAnchor="end" fontSize="22" fontWeight="black" fill="#94A3B8">{Math.round(v)}</text>
                </g>
              );
          })}

          {data.map((d, i) => {
            const groupX = padLeft + i * (barW * 2 + 4 + gapBetweenGroups) + gapBetweenGroups / 2;
            const yyWater = yPos(d.water);
            const hhWater = barH(d.water);
            const yyPower = yPos(d.power);
            const hhPower = barH(d.power);
            
            let showLabel = false;
            let labelText = d.label;
            if (range === 'D' && [0,6,12,18].includes(i)) {
                showLabel = true;
                labelText = i === 0 ? "12ص" : i === 6 ? "6ص" : i === 12 ? "12م" : "6م";
            } else if (range === 'W') showLabel = true;
            else if (range === 'M' && i % 4 === 0) showLabel = true;
            else if (range === 'Y' && i % 3 === 0) showLabel = true;

            return (
              <g key={i} className="cursor-pointer">
                {/* Water Bar */}
                <rect 
                   x={groupX} y={yyWater} width={barW} height={hhWater} rx="4" fill="#059669" 
                   onMouseEnter={() => { setHoveredIdx(i); setHoveredMetric('water'); }}
                   opacity={hoveredIdx === i && hoveredMetric === 'water' ? 1 : hoveredIdx === null ? 1 : 0.3}
                   className="transition-all duration-300 origin-bottom"
                />
                {/* Power Bar */}
                <rect 
                   x={groupX + barW + 4} y={yyPower} width={barW} height={hhPower} rx="4" fill="#34d399" 
                   onMouseEnter={() => { setHoveredIdx(i); setHoveredMetric('power'); }}
                   opacity={hoveredIdx === i && hoveredMetric === 'power' ? 1 : hoveredIdx === null ? 1 : 0.3}
                   className="transition-all duration-300 origin-bottom"
                />
                
                {showLabel && (
                  <text x={groupX + barW + 2} y={h-padBottom+32} textAnchor="middle" fontSize="22" fill="#94A3B8" fontWeight="black">{labelText}</text>
                )}

                {hoveredIdx === i && (
                  <g pointerEvents="none">
                    <rect x={groupX - 30} y={Math.min(yyWater, yyPower) - 60} width="110" height="48" rx="12" fill="#111827" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.4))" />
                    <text x={groupX + barW + 2} y={Math.min(yyWater, yyPower) - 28} textAnchor="middle" fontSize="22" fontWeight="1000" fill="white">
                      {hoveredMetric === 'water' ? `ماء: ${d.water}` : `كهرباء: ${d.power}`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          <text x={padLeft + (w - padLeft - padRight)/2} y={h+70} textAnchor="middle" fontSize="26" fontWeight="1000" fill="#2E7D32" opacity="0.6">{xAxisTitle}</text>
        </svg>
      </div>
    </CardShell>
  );
}

// --- NEW COMPONENT: SustainabilityLineChart ---
export function SustainabilityLineChart({ 
  range, 
  onRangeChange, 
  data, 
  metricName = "استهلاك الموارد الموحد",
  xAxisTitle = "الفترة الزمنية",
  yAxisTitle = "معدل الاستهلاك (٪)"
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  const ranges = [
    { key: 'D', label: 'اليوم' },
    { key: 'W', label: 'الأسبوع' },
    { key: 'M', label: 'الشهر' },
    { key: 'Y', label: 'السنة' },
  ];

  const h = 240; 
  const pLeft = 65; 
  const pRight = 30;
  const pTop = 20; 
  const pBottom = 20; 
  
  const n = data.length;
  const w = 1000; 
  const segmentW = (w - pLeft - pRight) / (n - 1 || 1);

  const allValues = data.flatMap(d => [d.water || 0, d.power || 0]);
  const yMax = Math.ceil(Math.max(...allValues, 10) / 10) * 10 + 10; 
  const getY = (v) => h - pBottom - (v / (yMax || 1)) * (h - pTop - pBottom);
  const getX = (i) => pLeft + i * segmentW;

  const getPath = (key) => {
    if (n < 2) return "";
    let d = `M ${getX(0)} ${getY(data[0][key])}`;
    for (let i = 0; i < n - 1; i++) {
        const x1 = getX(i);
        const y1 = getY(data[i][key]);
        const x2 = getX(i + 1);
        const y2 = getY(data[i + 1][key]);
        const midX = (x1 + x2) / 2;
        d += ` C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
    }
    return d;
  };

  const getAreaPath = (key) => {
    const p = getPath(key);
    if (!p) return "";
    return `${p} L ${getX(n-1)} ${h - pBottom} L ${getX(0)} ${h - pBottom} Z`;
  };

  return (
    <CardShell className="p-6 relative group/chart overflow-visible" dir="rtl">
      <defs>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#059669" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[17px] font-black text-gray-800 flex items-center gap-2">
            {metricName}
            <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2.5 py-1 rounded-full border border-emerald-100 font-black tracking-tight uppercase">تحليل الاستدامة</span>
          </h2>
          <div className="text-[12px] font-bold text-gray-400 mt-1 leading-none">تتبع حي ومقارن لاستهلاك الطاقة والمياه</div>
        </div>
        <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 group/leg">
               <div className="w-3 h-3 rounded-full bg-[#059669] shadow-[0_0_8px_rgba(5,150,105,0.4)]" />
               <span className="text-[11px] font-black text-gray-500 group-hover/leg:text-emerald-700 transition-colors">المياه</span>
            </div>
            <div className="flex items-center gap-2 group/leg">
               <div className="w-3 h-3 rounded-full bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
               <span className="text-[11px] font-black text-gray-500 group-hover/leg:text-emerald-500 transition-colors">الكهرباء</span>
            </div>
        </div>
      </div>

      <div className="flex bg-gray-50/80 p-1 rounded-xl mb-4 gap-1 w-max self-center border border-gray-100 shadow-inner">
        {ranges.map(r => (
          <button
            key={r.key}
            onClick={() => onRangeChange(r.key)}
            className={`px-5 py-2 text-[11px] font-black rounded-lg transition-all duration-300 ${
              range === r.key ? 'bg-white text-emerald-900 shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="w-full h-full relative min-h-[180px] mt-2">
        <svg 
          width="100%" 
          height={205} 
          viewBox={`-40 0 ${w + 80} 340`}
          preserveAspectRatio="xMidYMid meet"
          className="block overflow-visible" 
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <text x={- (h-pBottom)/2 - pTop + 10} y={-35} transform="rotate(-90)" textAnchor="middle" fontSize="24" fontWeight="1000" fill="#2E7D32" opacity="0.5">{yAxisTitle}</text>
          
          {[0, 0.25, 0.5, 0.75, 1].map(i => {
              const v = yMax * i;
              const yy = getY(v);
              return (
                <g key={i}>
                  <line x1={pLeft} x2={w-pRight} y1={yy} y2={yy} stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="6 6" />
                  <text x={pLeft - 35} y={yy + 8} textAnchor="end" fontSize="22" fontWeight="black" fill="#94A3B8">{Math.round(v)}</text>
                </g>
              );
          })}

          {/* Area Fills */}
          <path d={getAreaPath('water')} fill="url(#waterGrad)" className="transition-all duration-700" />
          <path d={getAreaPath('power')} fill="url(#powerGrad)" className="transition-all duration-700" />

          {/* Lines */}
          <path d={getPath('water')} fill="none" stroke="#059669" strokeWidth="4.5" strokeLinecap="round" className="drop-shadow-[0_4px_10px_rgba(5,150,105,0.3)]" />
          <path d={getPath('power')} fill="none" stroke="#34d399" strokeWidth="4.5" strokeLinecap="round" className="drop-shadow-[0_4px_10px_rgba(52,211,153,0.3)]" />

          {data.map((d, i) => {
            const xx = getX(i);
            const isHovered = hoveredIdx === i;
            
            let showLabel = false;
            let labelText = d.label;
            if (range === 'D' && [0,6,12,18, 23].includes(i)) {
                showLabel = true;
                labelText = i === 0 ? "12ص" : i === 6 ? "6ص" : i === 12 ? "12م" : i === 18 ? "6م" : "11م";
            } else if (range === 'W') showLabel = true;
            else if (range === 'M' && i % 4 === 0) showLabel = true;
            else if (range === 'Y' && i % 2 === 0) showLabel = true;

            return (
              <g key={i}>
                <rect x={xx - segmentW/2} y={pTop} width={segmentW} height={h-pTop-pBottom} fill="transparent" onMouseEnter={() => setHoveredIdx(i)} className="cursor-pointer" />
                
                {showLabel && (
                  <text x={xx} y={h - pBottom + 40} textAnchor="middle" fontSize="22" fill="#94A3B8" fontWeight="black">{labelText}</text>
                )}

                {isHovered && (
                  <g pointerEvents="none">
                    <line x1={xx} y1={pTop} x2={xx} y2={h-pBottom} stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx={xx} cy={getY(d.water)} r="7" fill="#059669" stroke="white" strokeWidth="3" shadow="0 2px 5px rgba(0,0,0,0.2)" />
                    <circle cx={xx} cy={getY(d.power)} r="7" fill="#34d399" stroke="white" strokeWidth="3" shadow="0 2px 5px rgba(0,0,0,0.2)" />
                    
                    <rect x={xx - 75} y={Math.min(getY(d.water), getY(d.power)) - 95} width="150" height="75" rx="16" fill="#111827" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.5))" />
                    <text x={xx} y={Math.min(getY(d.water), getY(d.power)) - 65} textAnchor="middle" fontSize="22" fontWeight="black" fill="white">
                      ماء: {d.water}٪
                    </text>
                    <text x={xx} y={Math.min(getY(d.water), getY(d.power)) - 35} textAnchor="middle" fontSize="22" fontWeight="black" fill="#34d399">
                      كهرباء: {d.power}٪
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          <text x={pLeft + (w - pLeft - pRight)/2} y={h+90} textAnchor="middle" fontSize="26" fontWeight="1000" fill="#2E7D32" opacity="0.5">{xAxisTitle}</text>
        </svg>
      </div>
    </CardShell>
  );
}
