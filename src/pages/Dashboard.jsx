import { useMemo, useState, useEffect } from "react";
import { translations } from "../i18n";
import { Sidebar, DashboardHome, DecisionSupportPage, IrrigationPage, MicroclimatePage, SoilRootDataPage, PlaceholderPage, AccountAndSettingsPages } from "./dashboard/dashboardSections";
import { WeatherIcon, Account_ModalShell } from "./dashboard/dashboardShared";

/* =========================================================
   WARIF | Dashboard (Scope: Sensors + Irrigation + Recs + Account/Settings)
   - RTL Arabic UI
   - Pages:
     dashboard | temp | airHumidity | soilMoisture | irrigation | recs | weather
     profile | settings
========================================================= */

export default function Dashboard({ onLogout, lang: propLang, onLangChange }) {
  const [userFullName, setUserFullName] = useState('');
  const [userFullNameEn, setUserFullNameEn] = useState('');
  const [language, setLanguage] = useState(propLang || 'ar');

  useEffect(() => {
    if (propLang) setLanguage(propLang);
  }, [propLang]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('warif_user') || '{}');
    if (saved.fullName) setUserFullName(saved.fullName);
    if (saved.fullNameEn) setUserFullNameEn(saved.fullNameEn);
  }, []);

  const T = translations[language];
  const isRtl = language === 'ar';
  const isEn = language === 'en';

  function handleNameUpdate(newName, isEnField = false) {
    const saved = JSON.parse(localStorage.getItem('warif_user') || '{}');
    if (isEnField) {
      setUserFullNameEn(newName);
      localStorage.setItem('warif_user', JSON.stringify({ ...saved, fullNameEn: newName }));
    } else {
      setUserFullName(newName);
      localStorage.setItem('warif_user', JSON.stringify({ ...saved, fullName: newName }));
    }
  }

  function handleLanguageChange(lang) {
    setLanguage(lang);
    if (onLangChange) onLangChange(lang);
    const saved = JSON.parse(localStorage.getItem('warif_user') || '{}');
    localStorage.setItem('warif_user', JSON.stringify({ ...saved, language: lang }));
  }

  const currentDisplayName = (language === 'en' && userFullNameEn) ? userFullNameEn : (userFullName || (isRtl ? 'المستخدم' : 'User'));
  const firstName = currentDisplayName.split(' ')[0];

  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Initialize chat greeting with user name
  useEffect(() => {
    setChatMessages([{ role: "bot", text: `مرحباً ${firstName}! أنا مساعدك الذكي. كيف أساعدك اليوم؟` }]);
  }, [firstName]);

  const [mode, setMode] = useState("auto");
  const [weatherData, setWeatherData] = useState({ temp: 31, humidity: 45, condition: "مشمس", code: 0, isDay: true, locationName: "جاري تحديد الموقع..." });

  useEffect(() => {
    async function fetchWeather() {
      try {
        // الإحداثيات الدقيقة للمزرعة بناءً على خرائط جوجل
        const lat = "21.331608";
        const lon = "40.061178";
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,is_day&timezone=auto`);
        const data = await res.json();
        
        let fetchLocName = "مزرعة مكة";
        try {
           // جلب اسم الحي أو المنطقة بناءً على الإحداثيات
           const locRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ar`);
           if (locRes.ok) {
              const locData = await locRes.json();
              if (locData.address) {
                 fetchLocName = locData.address.hamlet || locData.address.suburb || locData.address.neighbourhood || locData.address.city || fetchLocName;
                 // Add the region to the name if needed
                 if (locData.address.city && fetchLocName !== locData.address.city) {
                    fetchLocName = `${fetchLocName} - ${locData.address.city}`;
                 }
              }
           }
        } catch (e) {
           console.log("Geocoding failed", e);
        }

        if (data.current) {
          const code = data.current.weather_code;
          const isDay = data.current.is_day === 1;

          let cond = isDay ? "مشمس" : "صافي";
          if (code >= 1 && code <= 3) cond = "غائم جزئياً";
          else if (code >= 45 && code <= 48) cond = "ضباب";
          else if (code >= 51 && code <= 67) cond = "ممطر";
          else if (code >= 71 && code <= 77) cond = "ثلوج";
          else if (code >= 80 && code <= 82) cond = "زخات مطر";
          else if (code >= 95) cond = "عاصفة رعدية";

          setWeatherData({
            temp: Math.round(data.current.temperature_2m),
            humidity: Math.round(data.current.relative_humidity_2m),
            condition: cond,
            conditionKey: code >= 95 ? "condStorm" : (code >= 80 ? "condShowers" : (code >= 71 ? "condSnow" : (code >= 51 ? "condRain" : (code >= 45 ? "condFog" : (code >= 1 ? "condCloudy" : (isDay ? "condSunny" : "condClear")))))),
            code: code,
            isDay: isDay,
            locationName: fetchLocName
          });
        }
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); 
    return () => clearInterval(interval);
  }, []);

  // Navigation scaffold
  const [page, setPage] = useState("dashboard");
  const [activeFarm, setActiveFarm] = useState(0); 
  const [globalAutoMode, setGlobalAutoMode] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSensorsPopup, setShowSensorsPopup] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const farms = isRtl 
    ? ["محمية الخضروات", "محمية الفواكه", "محمية الورقيات"]
    : ["Vegetable Greenhouse", "Fruit Greenhouse", "Leafy Greens"];
  const currentFarmName = farms[activeFarm];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (showUserMenu && !e.target.closest('[data-user-menu]')) setShowUserMenu(false);
      if (showChat && !e.target.closest('[data-chatbot]')) setShowChat(false);
      if (showMobileSidebar && !e.target.closest('[data-sidebar]') && !e.target.closest('[data-menu-toggle]')) setShowMobileSidebar(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu, showChat]);

  const DEFAULT_SENSOR_READINGS = {
    'رطوبة التربة':  { value: '42%',  status: 'normal' },
    'درجة الحرارة': { value: '31°C', status: 'warning' },
    'رطوبة الهواء': { value: '58%',  status: 'normal' },
    'الري':          { value: '60%',  status: 'normal' },
    'التحكم بالري': { value: '60%',  status: 'normal' },
  };

  const [connectedSensors, setConnectedSensors] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('warif_user') || '{}');
    return saved.sensorList || [
      { id: "S1", name: "حساس التربة",   type: "رطوبة التربة",  value: "42%",  status: "normal" },
      { id: "S2", name: "حساس الحرارة", type: "درجة الحرارة",  value: "31°C", status: "warning" },
      { id: "S3", name: "حساس الرطوبة", type: "رطوبة الهواء",  value: "58%",  status: "normal" },
      { id: "P1", name: "مضخة الري الرئيسية", type: "مضخة مياه", value: "تعمل", status: "normal" },
      { id: "F1", name: "مروحة تبريد 1", type: "مروحة", value: "نشط", status: "normal" },
      { id: "A1", name: "وحدة التكييف", type: "مكيف", value: "خامل", status: "normal" },
    ];
  });

  function handleSensorsChange(newSensors) {
    const enriched = newSensors.map(s => ({
      ...s,
      value:  s.value  || DEFAULT_SENSOR_READINGS[s.type]?.value  || '—',
      status: s.status || DEFAULT_SENSOR_READINGS[s.type]?.status || 'normal',
    }));
    setConnectedSensors(enriched);
    const saved = JSON.parse(localStorage.getItem('warif_user') || '{}');
    localStorage.setItem('warif_user', JSON.stringify({ ...saved, sensorList: enriched }));
  }

  const go = (to) => setPage(to);

  const sendToAI = async (userMessage) => {
    setChatMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setChatMessages(prev => [...prev, { role: "bot", text: "جاري التفكير..." }]);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 1024,
          system: `أنت مساعد ذكي لنظام وارِف لإدارة المحميات الزراعية. 
          المستخدم اسمه ${userFullName || 'مستخدم'}.
          بيانات المحمية الحالية:
          - اسم المحمية: محمية الخضروات
          - درجة الحرارة الخارجية: ${weatherData.temp}°C
          - رطوبة الهواء الخارجية: ${weatherData.humidity}%
          - حالة الجو: ${weatherData.condition}
          - درجة الحرارة الداخلية (حساس): 31°C (أعلى من المثالي 22-28°C)
          - رطوبة الهواء الداخلية (حساس): 58% (ضمن النطاق المثالي)
          - رطوبة التربة: 42% (ضمن النطاق المثالي)
          - معدل الري: 60% (متوسط)
          أجب باللغة العربية بشكل مختصر وواضح.`,
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      const data = await response.json();
      const aiText = data.content[0].text;

      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "bot", text: aiText };
        return updated;
      });
    } catch (error) {
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "bot", text: "حدث خطأ، حاول مرة ثانية." };
        return updated;
      });
    }
  };

  return (
    <>
      <div
        className="relative w-full h-full bg-[#f7f7f4] font-['IBM_Plex_Sans_Arabic']"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="w-full h-full flex flex-col">
          {/* ================= Header ================= */}
          <header className="w-full h-16 bg-white/90 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 z-10 animate-fade-in-down" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 12px rgba(0,0,0,0.03)' }}>
            
            {/* Start (Right in RTL): Breadcrumb & Sensors */}
            <div className="flex items-center gap-3">
              {/* Hamburger Menu (Mobile only) */}
              <button 
                data-menu-toggle
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="lg:hidden p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>

              <div className="flex flex-col">
                 <div className="text-[10px] font-bold text-emerald-700/60 mb-0.5 tracking-widest uppercase">{T.physicalGreenhouses} / {currentFarmName} /</div>
                 <div className="text-[14px] md:text-[15px] font-black text-gray-800 flex items-center gap-2 tracking-tight">
                   {page === "dashboard" ? T.dashboardHome : page === "microclimate" ? T.microclimateTitle : page === "soil" ? T.soilHealthTitle : page === "irrigation" ? T.irrigationTitle : page === "dss" ? T.recsTitle : T.settingsTitle}
                 </div>
              </div>
            </div>

            {/* Center: Master AI Switch */}
            <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gray-50/80 border border-gray-200 rounded-2xl p-1 shadow-inner">
              <button
                onClick={() => setGlobalAutoMode(true)}
                className={`px-3 md:px-5 py-1.5 text-[10px] md:text-[11px] font-black transition-all duration-300 flex items-center justify-center gap-1.5 rounded-xl uppercase tracking-tighter ${globalAutoMode
                  ? "bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md shadow-green-500/20"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {globalAutoMode && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />} 
                <span className="lg:hidden">{T.auto}</span>
                <span className="hidden lg:inline">{T.smartAutoTitle}</span>
              </button>
              <button
                onClick={() => setGlobalAutoMode(false)}
                className={`px-3 md:px-5 py-1.5 text-[10px] md:text-[11px] font-black transition-all duration-300 flex items-center justify-center gap-1.5 rounded-xl uppercase tracking-tighter ${!globalAutoMode
                  ? "bg-gray-800 text-white shadow-md shadow-gray-900/20"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <span className="lg:hidden">{T.manual}</span>
                <span className="hidden lg:inline">{T.manualControlTitle}</span>
              </button>
            </div>

            {/* End (Left in RTL): Weather + Lang + User */}
            <div className="flex items-center gap-4">
              
              {/* Compact Weather Widget */}
              <div className={`hidden lg:flex items-center gap-2 ${isRtl ? 'border-l border-gray-200/80 pl-4' : 'border-r border-gray-200/80 pr-4'} py-1`}>
                 <span className="text-xl font-black text-gray-800" dir="ltr">{weatherData.temp}°C</span>
                 <div className={`${isRtl ? 'text-right' : 'text-left'} flex flex-col justify-center`}>
                   <div className="text-[12px] font-bold text-gray-600 leading-tight">{T[weatherData.conditionKey] || weatherData.condition}</div>
                   <div className="text-[10px] font-bold text-gray-400 leading-tight mt-0.5">{T.humidityLabel} {weatherData.humidity}%</div>
                 </div>
              </div>

              {/* Language toggle */}
              <button
                onClick={() => handleLanguageChange(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center justify-center w-8 h-8 rounded-xl border border-gray-200 text-[11px] font-extrabold text-gray-500 hover:text-[#2E7D32] hover:border-[#2E7D32]/30 hover:bg-[#f0fdf4] transition-all duration-300"
              >
                {language === 'ar' ? 'EN' : 'عربي'}
              </button>

              {/* User dropdown */}
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] font-bold text-gray-700 bg-gray-50/80 hover:bg-gray-100 transition-all duration-300 hover:shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M6 20c0-4 3-6 6-6s6 2 6 6" />
                    </svg>
                  </div>
                  <span className="hidden md:inline">{currentDisplayName}</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {showUserMenu && (
                  <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-2 w-48 bg-white/95 backdrop-blur-lg border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in`} style={{ transformOrigin: isRtl ? 'top left' : 'top right' }}>
                    <button onClick={() => { go("profile"); setShowUserMenu(false); }} className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-4 3-6 6-6s6 2 6 6" /></svg> {T.myAccount}
                    </button>
                    <button onClick={() => { go("settings"); setShowUserMenu(false); }} className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 border-t border-gray-50 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> {T.settings}
                    </button>
                  <button
                    onClick={() => { 
                      localStorage.removeItem('warif_remember'); 
                      localStorage.removeItem('warif_logged_in');
                      onLogout(); 
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 border-t border-gray-50 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg> {T.logout}
                  </button>
                </div>
               )}
            </div>
          </div>
        </header>

        {/* ================= Body with Responsive Sidebar ================= */}
        <main className="flex-1 min-h-0 flex relative">
          {/* Sidebar — hidden on mobile, drawer style */}
          <div 
            data-sidebar
            className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-[60] transform lg:relative lg:translate-x-0 lg:z-0 transition-transform duration-300 ease-in-out ${showMobileSidebar ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')} lg:translate-x-0`}
          >
            <Sidebar currentPage={page} onGo={(p) => { go(p); setShowMobileSidebar(false); }} T={T} weatherData={weatherData} activeFarm={activeFarm} setActiveFarm={setActiveFarm} />
          </div>

          {/* Overlay for mobile sidebar */}
          {showMobileSidebar && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden animate-fade-in"
              onClick={() => setShowMobileSidebar(false)}
            />
          )}

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-auto w-full">
            {page === "dashboard" ? (
              <DashboardHome onGo={go} onSendAI={sendToAI} globalAutoMode={globalAutoMode} onOpenAssets={() => setShowSensorsPopup(true)} activeFarm={activeFarm} />
            ) : page === "dss" ? (
              <DecisionSupportPage onBack={() => go("dashboard")} activeFarm={activeFarm} />
            ) : page === "irrigation" ? (
              <IrrigationPage onBack={() => go("dashboard")} globalAutoMode={globalAutoMode} activeFarm={activeFarm} />
            ) : page === "microclimate" ? (
              <MicroclimatePage onBack={() => go("dashboard")} globalAutoMode={globalAutoMode} activeFarm={activeFarm} />
            ) : page === "soil" ? (
              <SoilRootDataPage onBack={() => go("dashboard")} globalAutoMode={globalAutoMode} activeFarm={activeFarm} />
            ) : page === "profile" ? (
              <AccountAndSettingsPages initialPage="profile" onBack={() => go("dashboard")} onLogout={onLogout} onNameUpdate={handleNameUpdate} language={language} onLanguageChange={handleLanguageChange} sensors={connectedSensors} onSensorsChange={handleSensorsChange} />
            ) : page === "settings" ? (
              <AccountAndSettingsPages initialPage="settings" onBack={() => go("dashboard")} onLogout={onLogout} onNameUpdate={handleNameUpdate} language={language} onLanguageChange={handleLanguageChange} sensors={connectedSensors} onSensorsChange={handleSensorsChange} />
            ) : (
              <PlaceholderPage page={page} onBack={() => go("dashboard")} />
            )}
          </div>
          </main>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} w-20 h-20 bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:shadow-green-600/25 transition-all duration-500 z-50 ${!showChat ? 'animate-pulse-glow' : ''}`}
            style={{ transform: showChat ? 'rotate(0deg)' : 'rotate(0deg)' }}
            data-chatbot
          >
            <div className={`transition-all duration-300 ${showChat ? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}>
              {showChat ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              )}
            </div>
          </button>

          {showChat && (
            <div className={`fixed bottom-24 ${isRtl ? 'left-6' : 'right-6'} w-96 h-[480px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/80 flex flex-col overflow-hidden z-50 animate-chat-slide-up`} data-chatbot>
              <div className={`bg-gradient-to-l ${isRtl ? 'from-[#16a34a] to-[#15803d]' : 'from-[#15803d] to-[#16a34a]'} px-4 py-3.5 flex items-center gap-3`}>
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg></div>
                <div>
                  <div className="text-white font-semibold text-[15px]">{isEn ? 'Warif Assistant' : 'مساعد وارِف'}</div>
                  <div className="text-white/100 text-[12px]">{isEn ? 'Helping with agricultural queries and services' : 'يساعد في الاستفسارات والخدمات الزراعية'}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 bg-gray-50/50">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex animate-message-pop ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${msg.role === "user"
                      ? "bg-gradient-to-l from-[#16a34a] to-[#22c55e] text-white rounded-bl-md shadow-sm"
                      : "bg-white text-gray-700 border border-gray-100 rounded-br-md shadow-sm"
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-3 py-2 flex gap-1.5 flex-wrap border-t border-gray-100/60 bg-white/80">
                {(isEn ? ["How's the greenhouse?", "When's next irrigation?", "What are the recs?"] : ["كيف حال المحمية؟", "متى الري القادم؟", "ما التوصيات؟"]).map(q => (
                  <button key={q} onClick={() => sendToAI(q)}
                    className="text-[13px] px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-[#f0fdf4] hover:text-[#16a34a] hover:border-[#bbf7d0] transition-all duration-300">
                    {q}
                  </button>
                ))}
              </div>
              <div className="px-3 py-2.5 flex gap-2 border-t border-gray-100/60 bg-white">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && chatInput.trim()) { sendToAI(chatInput); setChatInput(""); } }}
                  placeholder={isEn ? "Ask me about your farm..." : "اسألني عن محميتك..."}
                  className="input-enhanced flex-1 text-[15px] border border-gray-200 rounded-xl px-3 py-2.5 outline-none bg-gray-50/50"
                />
                <button onClick={() => { if (chatInput.trim()) { sendToAI(chatInput); setChatInput(""); } }}
                  className="w-10 h-10 bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-xl flex items-center justify-center hover:shadow-md hover:shadow-green-600/20 transition-all duration-300 active:scale-95 flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Unified Sensors Popup Modal ===== */}
      {showSensorsPopup && (
        <Account_ModalShell onClose={() => setShowSensorsPopup(false)} isRtl={isRtl}>
          <div className="bg-white rounded-[28px] overflow-hidden shadow-2xl animate-modal-in max-h-[85vh] flex flex-col w-[320px] max-w-[92vw]" dir={isRtl ? 'rtl' : 'ltr'} onClick={e => e.stopPropagation()}>
            {/* Compact Header */}
            <div className="bg-emerald-600 p-3 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3" /><path d="M12 7v-3" /></svg>
                </div>
                <div>
                  <h2 className="text-[15px] font-bold leading-tight">{isEn ? 'Sensors & Devices' : 'الحساسات والأجهزة المتصلة'}</h2>
                  <p className="text-emerald-100 text-[10px] opacity-90 font-bold leading-tight">{isEn ? 'Live Telemetry Status' : 'حالة الاتصال والبيانات اللحظية'}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSensorsPopup(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Content Container */}
            <div className="p-1.5 flex flex-col gap-1.5 overflow-auto custom-scrollbar">
              {connectedSensors.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 rounded-[20px] border border-gray-50 bg-[#fafafa]/50 hover:bg-white hover:border-emerald-100 hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${s.status === 'warning' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}`}>
                      {s.type.includes('مضخة') ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      ) : s.type.includes('مروحة') || s.type.includes('مكيف') ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1.5" fill="currentColor" />
                        </svg>
                      )}
                    </div>
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <div className="text-[14.5px] font-black text-gray-800">
                        {s.name === "حساس التربة" ? T.sensorSoilName : 
                         s.name === "حساس الحرارة" ? T.sensorTempName :
                         s.name === "حساس الرطوبة" ? T.sensorHumName :
                         s.name === "مضخة الري الرئيسية" ? T.pumpMainName :
                         s.name === "مروحة تبريد 1" ? T.fanCoolingName :
                         s.name === "وحدة التكييف" ? T.acUnitName : s.name}
                      </div>
                      <div className="text-[11px] font-bold text-gray-400 mt-0.5">
                        {s.type === "رطوبة التربة" ? T.soilHumLabel :
                         s.type === "درجة الحرارة" ? T.tempLabel :
                         s.type === "رطوبة الهواء" ? T.humLabel :
                         s.type === "مضخة مياه" ? (isEn ? "Water Pump" : "مضخة مياه") :
                         s.type === "مروحة" ? (isEn ? "Fan" : "مروحة") :
                         s.type === "مكيف" ? (isEn ? "AC" : "مكيف") : s.type}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`${isRtl ? 'text-left' : 'text-right'} flex flex-col items-end`}>
                      <div className="text-[10px] font-black text-gray-400 mb-0.5 tracking-tighter uppercase">{T.liveValueLabel}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[16px] font-black ${s.status === 'warning' ? 'text-orange-600' : 'text-emerald-700'}`}>
                          {s.value === "تعمل" ? T.statusWorking :
                           s.value === "نشط" ? T.statusActive :
                           s.value === "خامل" ? T.statusIdle : s.value}
                        </span>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'warning' ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer buttons */}
            <div className="p-3 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
              <button 
                onClick={() => { go("settings"); setShowSensorsPopup(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-black text-gray-700 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                {isEn ? 'Hardware' : 'تعديل الأجهزة'}
              </button>
              <button 
                onClick={() => setShowSensorsPopup(false)}
                className="px-8 py-2 rounded-xl bg-emerald-600 text-white font-black text-[13px] shadow-lg shadow-emerald-100 active:scale-95 transition-all hover:bg-emerald-700"
              >
                {isEn ? 'Close' : 'إغلاق'}
              </button>
            </div>
          </div>
        </Account_ModalShell>
      )}

    </>
  );
}

/* =========================================================
   Sidebar (Persistent — always visible)
========================================================= */
