import { useState } from 'react';

export function Sidebar({ currentPage, onGo, T, weatherData }) {
  const [activeFarm, setActiveFarm] = useState(0);
  const quickMenu = [
    { label: T.recommendations, icon: "recs", page: "recs", badge: "2" },
    { label: T.irrigation, icon: "irrigation", page: "irrigation" },
    { label: T.dashboard, icon: "sensors", page: "dashboard" },
  ];

  const farms = ["محمية الخضروات", "محمية الفواكه", "محمية الورقيات"];

  return (
    <div className="w-64 bg-white/80 backdrop-blur-sm border-l border-gray-100/60 flex flex-col flex-shrink-0 h-full">
      {/* Logo */}
      <div className="py-0 flex flex-col items-center justify-center gap-2">
        <img src="/logo.png" alt="وارِف" className="w-36 h-36 object-contain cursor-pointer" onClick={() => onGo("dashboard")} />
      </div>

      {/* المحميات */}
      <div className="p-3 border-b border-gray-50">
        <div className="text-sm text-gray-400 font-semibold mb-2 px-1">المحميات</div>
        {farms.map((farm, i) => (
          <div key={farm} onClick={() => { setActiveFarm(i); onGo("dashboard"); }} className={`sidebar-item flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-[15px] mb-0.5 transition-all duration-300 ${activeFarm === i ? "active bg-[#f0fdf4] text-[#16a34a] font-medium shadow-sm" : "text-gray-500 hover:bg-gray-50"
            }`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-500 ${activeFarm === i ? "bg-[#16a34a] shadow-sm shadow-green-400/50" : "bg-gray-300"}`} />
            {farm}
          </div>
        ))}
      </div>

      {/* القائمة السريعة */}
      <div className="p-3 flex-1">
        <div className="text-sm text-gray-400 font-semibold mb-2 px-1">القائمة السريعة</div>
        {quickMenu.map((item) => (
          <div key={item.label} onClick={() => onGo(item.page)}
            className={`sidebar-item flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-[15px] mb-0.5 transition-all duration-300 ${currentPage === item.page ? "active bg-[#f0fdf4] text-[#16a34a] font-medium shadow-sm" : "text-gray-500 hover:bg-gray-50"
              }`}>
            <span className="w-5 h-5 flex items-center justify-center">{item.icon === "recs" ? <svg width="17" height="17" viewBox="0 0 24 24" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> : item.icon === "irrigation" ? <svg width="17" height="17" viewBox="0 0 24 24" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg> : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="#8b5cf6" /></svg>}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-[#fff7ed] text-[#ea580c] text-[11px] px-2 py-0.5 rounded-full font-medium">{item.badge}</span>
            )}
          </div>
        ))}
      </div>

      {/* الطقس */}
      <div className="p-3 border-t border-gray-50">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-3.5 border border-gray-100/50">
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg> 
            مكة المكرمة - مخطط الهدا
          </div>
          <div className="text-lg font-bold text-gray-800">{weatherData?.temp || 31}°C</div>
          <div className="text-xs text-gray-400 mt-0.5">{weatherData?.condition || "مشمس"} — رطوبة {weatherData?.humidity || 45}%</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Dashboard Content (Cards Grid only — sidebar is separate)
========================================================= */
