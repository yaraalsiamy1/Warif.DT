import { useState, useEffect } from 'react';
import { WeatherIcon } from './dashboardShared';

export function Sidebar({ currentPage, onGo, T }) {
  const [activeFarm, setActiveFarm] = useState(0);

  const modulesMenu = [
    { label: "الرئيسية", icon: "dashboard", page: "dashboard" },
    { label: "المناخ والتهوية", icon: "microclimate", page: "microclimate" },
    { label: "بيانات التربة والري", icon: "soil", page: "soil" },
    { label: "إدارة الموارد المائية", icon: "irrigation", page: "irrigation" },
    { label: "التوصيات الذكية", icon: "dss", page: "dss", badge: "تنبيه" },
  ];

  const farms = ["محمية الخضروات", "محمية الفواكه", "محمية الورقيات"];

  return (
    <div className="w-64 bg-white/80 backdrop-blur-sm border-l border-gray-100/60 flex flex-col flex-shrink-0 h-full">
      {/* Logo and System Name */}
      <div className="pt-6 pb-4 flex flex-col items-center justify-center gap-1 border-b border-gray-100/60 mx-4">
        <img src="/logo.png" alt="نظام وارِف" className="w-36 h-auto object-contain cursor-pointer drop-shadow-sm hover:scale-105 transition-transform duration-300" onClick={() => onGo("dashboard")} />
        <div className="text-[15px] font-extrabold text-gray-800 tracking-wide mt-2">نظام وارِف</div>
        <div className="text-[10px] font-black text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded border border-green-200 mt-1 uppercase tracking-widest flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" /> التوأم الرقمي
        </div>
      </div>

      {/* المحميات */}
      <div className="p-4 border-b border-gray-50/80">
        <div className="text-[11px] text-gray-400 font-bold mb-3 px-1 uppercase tracking-widest">اختيار المحمية</div>
        {farms.map((farm, i) => (
          <div key={farm} onClick={() => { setActiveFarm(i); onGo("dashboard"); }} className={`sidebar-item flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-[13px] mb-1 transition-all duration-300 ${activeFarm === i ? "active bg-[#f0fdf4] text-[#16a34a] font-bold shadow-sm border border-green-100" : "text-gray-500 hover:bg-gray-50"
            }`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={activeFarm === i ? "text-[#16a34a]" : "text-gray-400"}><path d="M5 21v-4a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v4M12 3v10M8.5 7.5l7 7M15.5 7.5l-7 7"/></svg>
            {farm}
          </div>
        ))}
      </div>

      {/* الوحدات التحليلية للمشروع (Modules) */}
      {/* الوحدات التحليلية للمشروع (Modules) */}
      <div className="p-4 flex-1">
        <div className="text-[11px] text-gray-400 font-bold mb-3 px-1 uppercase tracking-widest">تنسيق وتشغيل الوحدات</div>
        {modulesMenu.map((item) => (
          <div key={item.page} onClick={() => onGo(item.page)}
            className={`sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-[13px] font-bold mb-1 transition-all duration-300 ${currentPage === item.page ? "active bg-[#f0fdf4] text-[#16a34a] shadow-sm border border-green-200" : "text-gray-600 hover:bg-gray-50/80"
              }`}>
            <span className={`w-6 h-6 flex items-center justify-center rounded-lg ${currentPage === item.page ? 'bg-green-100 text-[#16a34a]' : 'text-gray-400'}`}>
              {item.icon === "dashboard" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>}
              {item.icon === "microclimate" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>}
              {item.icon === "soil" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
              {item.icon === "irrigation" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>}
              {item.icon === "dss" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>}
            </span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-[#fff7ed] text-[#ea580c] text-[10px] px-1.5 py-0.5 rounded font-bold border border-orange-200">{item.badge}</span>
            )}
          </div>
        ))}
      </div>
      
    </div>
  );
}

/* =========================================================
   Dashboard Content (Cards Grid only — sidebar is separate)
========================================================= */
