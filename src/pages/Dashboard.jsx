import { useMemo, useState, useEffect } from "react";
import { translations } from "../i18n";
import { Sidebar, DashboardHome, RecommendationsPage, IrrigationPage, TemperaturePage, AirHumidityPage, SoilMoisturePage, PlaceholderPage, AccountAndSettingsPages } from "./dashboard/dashboardSections";

/* =========================================================
   WARIF | Dashboard (Scope: Sensors + Irrigation + Recs + Account/Settings)
   - RTL Arabic UI
   - Pages:
     dashboard | temp | airHumidity | soilMoisture | irrigation | recs | weather
     profile | settings
========================================================= */

export default function Dashboard({ onLogout, lang: propLang, onLangChange }) {
  const [userFullName, setUserFullName] = useState('');
  const [language, setLanguage] = useState(propLang || 'ar');

  useEffect(() => {
    if (propLang) setLanguage(propLang);
  }, [propLang]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('warif_user') || '{}');
    if (saved.fullName) setUserFullName(saved.fullName);
  }, []);

  const T = translations[language];
  const isRtl = language === 'ar';

  function handleNameUpdate(newName) {
    setUserFullName(newName);
    const saved = JSON.parse(localStorage.getItem('warif_user') || '{}');
    localStorage.setItem('warif_user', JSON.stringify({ ...saved, fullName: newName }));
  }

  function handleLanguageChange(lang) {
    setLanguage(lang);
    if (onLangChange) onLangChange(lang);
    const saved = JSON.parse(localStorage.getItem('warif_user') || '{}');
    localStorage.setItem('warif_user', JSON.stringify({ ...saved, language: lang }));
  }

  const firstName = userFullName ? userFullName.split(' ')[0] : (isRtl ? 'مستخدم' : 'User');

  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Initialize chat greeting with user name
  useEffect(() => {
    setChatMessages([{ role: "bot", text: `مرحباً ${firstName}! أنا مساعدك الذكي. كيف أساعدك اليوم؟` }]);
  }, [firstName]);

  const [mode, setMode] = useState("auto");

  // Navigation scaffold
  const [page, setPage] = useState("dashboard");
  // dashboard | temp | airHumidity | soilMoisture | irrigation | recs | weather | profile | settings
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSensorsPopup, setShowSensorsPopup] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (showUserMenu && !e.target.closest('[data-user-menu]')) setShowUserMenu(false);
      if (showChat && !e.target.closest('[data-chatbot]')) setShowChat(false);
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
          - درجة الحرارة: 31°C (أعلى من المثالي 22-28°C)
          - رطوبة الهواء: 58% (ضمن النطاق المثالي)
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
        className="relative w-full h-full bg-[#F7F7F4] font-['IBM_Plex_Sans_Arabic']"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="w-full h-full flex flex-col">
          {/* ================= Header ================= */}
          <header className="w-full h-16 bg-white/90 backdrop-blur-md flex items-center justify-between px-5 flex-shrink-0 z-10 animate-fade-in-down" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 12px rgba(0,0,0,0.03)' }}>
            {/* Right: Temp + Time */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[15px] text-gray-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                <span>{T.farmTemp}</span>
                <span className="font-bold text-[#ea580c]">31°C</span>
              </div>
              <div className="w-px h-4 bg-gray-100" />
              <div className="text-[15px] text-gray-400">
                {T.lastUpdate}: <span className="font-medium text-gray-600">{new Date().toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Left: alerts + sensors + irrigation toggle + lang + user */}
            <div className="flex items-center gap-3">

              {/* Alert */}
              <div className="badge-warning flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] transition-all duration-300 hover:shadow-md cursor-default">
                <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse" />
                {T.highTemp}
              </div>

              {/* Connected sensors — clickable */}
              <div className="relative" data-sensors-popup>
                <button
                  onClick={() => setShowSensorsPopup(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[#f0fdf4] text-[#2E7D32] border border-[#bbf7d0] hover:bg-[#dcfce7] hover:shadow-sm transition-all duration-300 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                  {connectedSensors.length} {T.sensorsConnected}
                </button>
              </div>


              {/* Irrigation toggle */}
              <div className="flex items-center border border-gray-200 rounded-2xl overflow-hidden bg-gray-50" style={{ width: '120px' }}>
                <button
                  onClick={() => setMode("auto")}
                  className={`flex-1 py-1.5 text-center text-sm font-medium transition-all ${mode === "auto"
                    ? "bg-[#16a34a] text-white rounded-2xl mx-0.5 my-0.5"
                    : "text-gray-400"
                    }`}
                >
                  {T.auto}
                </button>
                <button
                  onClick={() => setMode("manual")}
                  className={`flex-1 py-1.5 text-center text-sm font-medium transition-all ${mode === "manual"
                    ? "bg-[#ef4444] text-white rounded-2xl mx-0.5 my-0.5"
                    : "text-gray-400"
                    }`}
                >
                  {T.manual}
                </button>
              </div>

              {/* Language toggle */}
              <button
                onClick={() => handleLanguageChange(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-[#2E7D32] hover:border-[#2E7D32]/30 hover:bg-[#f0fdf4] transition-all duration-300"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                {T.langToggle}
              </button>

              {/* User dropdown */}
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 bg-gray-50/80 hover:bg-gray-100 transition-all duration-300 hover:shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M6 20c0-4 3-6 6-6s6 2 6 6" />
                    </svg>
                  </div>
                  {userFullName || 'المستخدم'}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {showUserMenu && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-lg border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in" style={{ transformOrigin: 'top left' }}>
                    <button onClick={() => { go("profile"); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 text-right">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-4 3-6 6-6s6 2 6 6" /></svg> {T.myAccount}
                    </button>
                    <button onClick={() => { go("settings"); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 text-right border-t border-gray-50">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> {T.settings}
                    </button>
                    <button
                      onClick={() => { localStorage.removeItem('warif_remember'); onLogout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 text-right border-t border-gray-50">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg> {T.logout}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ================= Body with Persistent Sidebar ================= */}
          <main className="flex-1 min-h-0 flex">
            {/* Sidebar — always visible */}
            <Sidebar currentPage={page} onGo={go} T={T} />

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-auto">
              {page === "dashboard" ? (
                <DashboardHome onGo={go} onSendAI={sendToAI} />
              ) : page === "recs" ? (
                <RecommendationsPage onBack={() => go("dashboard")} />
              ) : page === "irrigation" ? (
                <IrrigationPage onBack={() => go("dashboard")} mode={mode} />
              ) : page === "temp" ? (
                <TemperaturePage onBack={() => go("dashboard")} />
              ) : page === "airHumidity" ? (
                <AirHumidityPage onBack={() => go("dashboard")} />
              ) : page === "soilMoisture" ? (
                <SoilMoisturePage onBack={() => go("dashboard")} />
              ) : page === "profile" ? (
                <AccountAndSettingsPages initialPage="profile" onBack={() => go("dashboard")} onLogout={onLogout} onNameUpdate={handleNameUpdate} language={language} onLanguageChange={handleLanguageChange} sensors={connectedSensors} onSensorsChange={handleSensorsChange} />
              ) : page === "settings" ? (
                <AccountAndSettingsPages initialPage="settings" onBack={() => go("dashboard")} onLogout={onLogout} onNameUpdate={handleNameUpdate} language={language} onLanguageChange={handleLanguageChange} sensors={connectedSensors} onSensorsChange={handleSensorsChange} />
              ) : (
                <PlaceholderPage page={page} onBack={() => go("dashboard")} />
              )}
            </div>
          </main>

          {/* Chatbot FAB */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`fixed bottom-6 left-6 w-16 h-16 bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:shadow-green-600/25 transition-all duration-500 z-50 ${!showChat ? 'animate-pulse-glow' : ''}`}
            style={{ transform: showChat ? 'rotate(0deg)' : 'rotate(0deg)' }}
            data-chatbot
          >
            <div className={`transition-all duration-300 ${showChat ? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}>
              {showChat ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              )}
            </div>
          </button>

          {showChat && (
            <div className="fixed bottom-24 left-6 w-96 h-[480px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/80 flex flex-col overflow-hidden z-50 animate-chat-slide-up" data-chatbot>
              <div className="bg-gradient-to-l from-[#16a34a] to-[#15803d] px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg></div>
                <div>
                  <div className="text-white font-semibold text-[15px]">مساعد وارِف</div>
                  <div className="text-white/100 text-[12px]">يساعد في الاستفسارات والخدمات الزراعية</div>
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
                {["كيف حال المحمية؟", "متى الري القادم؟", "ما التوصيات؟"].map(q => (
                  <button key={q} onClick={() => sendToAI(q)}
                    className="text-[13px] px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-[#f0fdf4] hover:text-[#16a34a] hover:border-[#bbf7d0] transition-all duration-300">
                    {q}
                  </button>
                ))}
              </div>
              <div className="px-3 py-2.5 flex gap-2 border-t border-gray-100/60 bg-white">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && chatInput.trim()) { sendToAI(chatInput); setChatInput(""); } }}
                  placeholder="اسألني عن محميتك..."
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

      {/* ===== Sensors Popup Modal (root level) ===== */}
      {showSensorsPopup && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[9999]" dir="rtl" onClick={() => setShowSensorsPopup(false)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[420px] max-w-[92vw] overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-[16px] font-bold text-gray-800">الحساسات المتصلة</div>
                <div className="text-[13px] text-gray-400 mt-0.5">آخر تحديث قبل 5 دقائق</div>
              </div>
              <button onClick={() => setShowSensorsPopup(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {connectedSensors.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-[#fafafa] hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.status === 'warning' ? 'bg-[#FFF7ED]' : 'bg-[#E8F5E9]'}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={s.status === 'warning' ? '#ea580c' : '#2E7D32'} strokeWidth="2" strokeLinecap="round">
                        <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill={s.status === 'warning' ? '#ea580c' : '#2E7D32'} />
                      </svg>
                    </div>
                    <div className="text-right leading-tight">
                      <div className="text-[14px] font-semibold text-gray-800">{s.name}</div>
                      <div className="text-[12px] text-gray-400">{s.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[14px] font-bold ${s.status === 'warning' ? 'text-[#ea580c]' : 'text-[#2E7D32]'}`}>{s.value}</span>
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.status === 'warning' ? 'bg-[#ea580c] animate-pulse' : 'bg-[#16a34a]'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </>
  );
}

/* =========================================================
   Sidebar (Persistent — always visible)
========================================================= */
