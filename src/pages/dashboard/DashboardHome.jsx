import { CardShell, CardTopRow, TempSunIcon, AirHumidityIcon, SoilDropIcon, DropBadgeIcon } from './dashboardShared';
import { Donut } from './dashboardCharts';
import { CameraCard } from './CameraCard';

// Liquid Wave Animation Styles
const waveStyles = `
  @keyframes wave-move {
    0% { transform: translateX(0) translateZ(0) scaleY(1); }
    50% { transform: translateX(-25%) translateZ(0) scaleY(0.8); }
    100% { transform: translateX(-50%) translateZ(0) scaleY(1); }
  }
  .animate-wave {
    animation: wave-move 4s linear infinite;
  }
  .animate-wave-slow {
    animation: wave-move 7s linear infinite;
  }
`;

export function DashboardHome({ onGo, onSendAI, globalAutoMode, onOpenAssets }) {
  return (
    <>
      <style>{waveStyles}</style>
      <div className="w-full h-full overflow-auto p-5 min-h-0 page-enter" dir="rtl">
      <div className="w-full max-w-[1150px] mx-auto flex flex-col gap-5">

        {/* Page Header */}
        <div className="flex items-center gap-3 animate-fade-in-down mb-2 mt-2">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 border border-green-200">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-black text-gray-800">مركز العمليات والتحكم</h1>
            <p className="text-[14px] font-semibold text-[#2E7D32] mt-1">نظرة شاملة ومباشرة على أداء المحميات وكفاءة تشغيل المعدات.</p>
          </div>
        </div>

        {/* Top Section: Digital Twin Command Center */}
        <div className="animate-fade-in-up delay-1">
          <DigitalTwinCommandCenterCard onOpenAssets={onOpenAssets} />
        </div>


        {/* Middle Section Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-stretch w-full">

          {/* Main Grid: AI Modules Overview */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 min-w-0">
            <div className="animate-fade-in-up delay-2 h-full"><MicroclimateGlanceCard onGo={onGo} /></div>
            <div className="animate-fade-in-up delay-3 h-full"><SoilCropHealthGlanceCard onGo={onGo} /></div>
            <div className="animate-fade-in-up delay-4 h-full"><IrrigationGlanceCard onGo={onGo} globalAutoMode={globalAutoMode} /></div>
            <div className="animate-fade-in-up delay-5 h-full"><DSSGlanceCard onGo={onGo} /></div>
          </div>

          {/* Side Column: Camera / Live Monitoring */}
          <div className="w-full lg:w-[450px] shrink-0 animate-fade-in-up delay-4 flex flex-col min-w-0">
            <CameraCard />
          </div>

        </div>

      </div>
    </div>
    </>
  );
}

// --- NEW SEMANTIC ICONS ---
function PlantSoilIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Soil Mound */}
      <path d="M4 20c0-3 3-4 8-4s8 1 8 4" />
      {/* Plant/Seedling */}
      <path d="M12 16V8" />
      <path d="M12 8c-2-2-5-2-5 0 0 3 3 4 5 4" />
      <path d="M12 8c2-2 5-2 5 0 0 3-3 4-5 4" />
    </svg>
  );
}

function WaterValveIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16" />
      <path d="M12 12V8" />
      <circle cx="12" cy="6" r="3" />
      <path d="M12 12s-2 2-2 5 2 5 2 5 2-2 2-5-2-5-2-5Z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function WindIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.7 7.7A2.5 2.5 0 1 1 20 12H5" />
      <path d="M9.601 3.599A2.5 2.5 0 1 0 8 8h12" />
      <path d="M11.3 20.3A2.5 2.5 0 1 1 9 16h12" />
    </svg>
  );
}

/* =========================================================
   Glance Cards representing AI Modules
   Standardized with p-5 padding and Real-time indicators
========================================================= */

function LiveStatusFooter({ time = "منذ 5 دقائق" }) {
  // Logic Fix: Removing the footer as the timestamp is now in the header subtitle
  return null;
}

function SoilSparkline() {
  // Static path simulating a 24h moisture trend
  return (
    <div className="flex flex-col gap-1.5 h-full justify-center">
      <div className="flex items-center justify-between opacity-70">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">اتجاه الرطوبة (24h)</div>
        <div className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded-md">Max: 48%</div>
      </div>
      
      <div className="relative w-36 h-16 bg-gray-50/30 rounded-xl overflow-hidden border border-gray-100/50 flex items-center">
        {/* Y-Axis Scales */}
        <div className="absolute left-1 h-full py-2 flex flex-col justify-between text-[8px] font-black text-gray-300 pointer-events-none z-10">
          <span>60%</span>
          <span>30%</span>
          <span>0%</span>
        </div>

        <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d ml-4">
          <defs>
            <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Baseline runners */}
          <line x1="0" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="0" y1="30" x2="100" y2="30" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2" />
          
          <path 
            d="M0 30 Q 15 10, 30 20 T 60 5 T 100 15" 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="2" 
            strokeLinecap="round"
            className="drop-shadow-[0_0_4px_rgba(16,185,129,0.2)]"
          />
          <path 
            d="M0 30 Q 15 10, 30 20 T 60 5 T 100 15 L 100 40 L 0 40 Z" 
            fill="url(#sparklineGradient)" 
          />
        </svg>
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-[9px] font-bold text-gray-400">تحليل الميول مستقر</span>
        <span className="text-[9px] font-black text-gray-300">Min: 32%</span>
      </div>
    </div>
  );
}

function MicroclimateGlanceCard({ onGo }) {
  const temp = 31;
  const hum = 58;

  return (
    <CardShell className="p-5 h-full cursor-pointer hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 group flex flex-col justify-between" onClick={() => onGo("microclimate")}>
      <CardTopRow 
        title="المناخ والتهوية" 
        subtitle="آخر تحديث: منذ 5 دقائق" 
        icon={<WindIcon />} 
      />

      <div className="mt-4 flex items-end justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <div className="text-[12px] text-gray-400 font-bold uppercase mb-0.5 tracking-tight">درجة الحرارة</div>
            <div className="text-4xl font-black text-gray-800 leading-none">{temp}<span className="text-[14px] font-bold text-gray-400 mr-1.5">°C</span></div>
          </div>
          <div className="flex flex-col">
            <div className="text-[12px] text-gray-400 font-bold uppercase mb-0.5 tracking-tight">رطوبة الجو</div>
            <div className="text-4xl font-black text-gray-800 leading-none">{hum}<span className="text-[14px] font-bold text-gray-400 mr-1.5">%</span></div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm min-w-[70px]">
           <div className="text-[10px] font-bold text-emerald-600 mb-0.5">الوضع</div>
           <div className="text-[13px] font-black text-[#2E7D32]">مثالي</div>
        </div>
      </div>
    </CardShell>
  );
}

function SoilCropHealthGlanceCard({ onGo }) {
  return (
    <CardShell className="p-5 h-full cursor-pointer hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 group flex flex-col justify-between" onClick={() => onGo("soil")}>
      <CardTopRow 
        title="حالة وبيئة التربة" 
        subtitle="آخر تحديث: منذ 5 دقائق" 
        icon={<PlantSoilIcon />} 
      />

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col">
            <div className="text-[12px] text-gray-400 font-bold uppercase mb-0.5 tracking-tight">حرارة التربة</div>
            <div className="text-4xl font-black text-gray-800 leading-none">24<span className="text-[14px] font-bold text-gray-400 mr-1.5">°C</span></div>
          </div>
          <div className="flex flex-col">
            <div className="text-[12px] text-gray-400 font-bold uppercase mb-0.5 tracking-tight">رطوبة التربة</div>
            <div className="text-4xl font-black text-gray-800 leading-none">42<span className="text-[14px] font-bold text-gray-400 mr-1.5">%</span></div>
          </div>
        </div>

        <div className="flex-1 max-w-[140px]">
           <SoilSparkline />
        </div>
      </div>
    </CardShell>
  );
}

function IrrigationGlanceCard({ onGo, globalAutoMode }) {
  return (
    <CardShell className="p-5 h-full cursor-pointer hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between" onClick={() => onGo("irrigation")}>
      <CardTopRow 
        title="إدارة الري" 
        subtitle="آخر تحديث: منذ 5 دقائق" 
        icon={<WaterValveIcon />} 
      />

      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <div className="text-[10px] text-emerald-600 font-black px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-lg w-max mb-3 shadow-sm flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5 ">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10b981]"></span>
              </span>
              المصادر محتجزة
            </div>
            
            <div className="flex flex-col">
              <div className="text-[12px] text-gray-400 font-bold uppercase mb-0.5 tracking-tight">الاستهلاك اليومي</div>
              <div className="text-4xl font-black text-gray-800 tracking-tight">120 <span className="text-[14px] font-bold text-gray-400 mr-1.5 tracking-normal">Litre</span></div>
            </div>
          </div>
        </div>

        <div className="relative w-20 h-20 mb-1 flex items-center justify-center">
          <Donut value={60} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[12px] font-black text-emerald-700">60%</div>
          </div>
        </div>
      </div>

      {globalAutoMode && (
        <div className="bg-emerald-50/40 border border-emerald-100/30 rounded-xl py-1.5 px-3 mt-4 flex items-center justify-center gap-2">
           <div className="w-1 h-1 rounded-full bg-emerald-500" />
           <span className="text-[11px] font-black text-[#15803d]">نظام الأتمتة الذكي نشط</span>
        </div>
      )}
    </CardShell>
  );
}

function DSSGlanceCard({ onGo }) {
  const decisions = [
    { text: "تأجيل الري: الرطوبة كافية ليوم إضافي", tone: "info" },
    { text: "تنسيق تبريد استباقي لمنع الإجهاد الحراري", tone: "alert" },
  ];
  return (
    <CardShell className="p-5 h-full cursor-pointer hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 group flex flex-col justify-between" onClick={() => onGo("dss")}>
      <CardTopRow 
        title="مساعد القرار الذكي" 
        subtitle="آخر تحديث: منذ 5 دقائق" 
        icon={<ListIcon />} 
      />

      <div className="mt-4 flex-1 flex flex-col gap-2.5">
        {decisions.map((item, idx) => (
          <div key={idx} className="flex items-start gap-4 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-[0_2px_4px_rgba(0,0,0,0.015)] hover:border-emerald-100 transition-colors">
            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${item.tone === 'alert' ? 'bg-[#2E7D32]' : 'bg-[#10b981]'}`} />
            <div className="text-[12px] font-black text-gray-700 leading-tight">{item.text}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-50/50">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">تحليل النظم نشط</div>
        <div className="bg-emerald-100/50 text-[#2E7D32] px-2 py-0.5 rounded-lg text-[10px] font-black border border-emerald-100">12 توصية يومية</div>
      </div>
    </CardShell>
  );
}

/* =========================================================
   Digital Twin Command Center Card (Simplified)
========================================================= */
/* =========================================================
   Digital Twin Command Center Card (Ultra-Minimalist)
========================================================= */
function DigitalTwinCommandCenterCard({ onOpenAssets }) {
  return (
    <CardShell className="p-5 lg:p-5 relative overflow-hidden bg-white border border-gray-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)] group/main">
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-10 relative z-10 w-full items-center">
        
        <div className="w-full lg:w-[45%] flex flex-col justify-center pr-0 lg:pr-8 text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 text-[11px] font-black text-[#2E7D32] mb-3 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            محرك التوأم الرقمي 
          </div>
          <h3 className="text-2xl font-black tracking-tight mb-2 text-gray-800 leading-tight">التوأم الرقمي للمزرعة</h3>
          <p className="text-[13px] text-gray-400 font-medium leading-relaxed">
            تمثيل رقمي دقيق متصل في الوقت الفعلي مع كافّة الحساسات لمراقبة بيئة المزرعة لحظياً وإدارة كفاءة التشغيل.
          </p>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-[2px] h-32 bg-gradient-to-b from-transparent via-gray-100 to-transparent mx-2" />

        <div className="w-full lg:w-[50%] cursor-pointer group/assets" onClick={onOpenAssets}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="text-[13px] font-black text-gray-800">سجل المعدات والأجهزة</div>
                <div className="text-[9px] text-[#2E7D32] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-50 rounded-lg">نشط</div>
            </div>

            <div className="grid grid-cols-4 gap-1">
              <MinimalStat value="4" label="حساسات" />
              <MinimalStat value="2" label="مضخات" />
              <MinimalStat value="1" label="كاميرا" />
              <MinimalStat value="6" label="تبريد" />
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function MinimalStat({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[28px] font-black text-gray-800 leading-none">{value}</div>
      <div className="text-[10px] text-gray-400 font-black mt-0.5 uppercase tracking-tighter">{label}</div>
    </div>
  );
}


function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}
