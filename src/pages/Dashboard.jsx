import { useMemo, useState, useEffect } from "react";
import { translations } from "../i18n";

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
function Sidebar({ currentPage, onGo, T }) {
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
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><svg width="15" height="15" viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg> مكة المكرمة</div>
          <div className="text-lg font-bold text-gray-800">31°C</div>
          <div className="text-xs text-gray-400 mt-0.5">مشمس — رطوبة 45%</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Dashboard Content (Cards Grid only — sidebar is separate)
========================================================= */
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

function CardShell({ children, className = "" }) {
  return (
    <section
      className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 card-hover h-full flex flex-col ${className}`}
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
    >
      {children}
    </section>
  );
}

function CardTopRow({ title, subtitle, onDetails, detailsLabel = "التفاصيل" }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-right">
        {/* عنوان الكارد (درجة الحرارة، رطوبة التربة، رطوبة الهواء) */}
        <div className="text-xl font-bold text-gray-800">{title}</div>
        {subtitle && <div className="text-[13px] text-gray-400 mt-1">{subtitle}</div>}
      </div>
      <button
        type="button"
        onClick={onDetails}
        className="text-xs text-[#2E7D32] bg-[#E8F5E9] px-3 py-1.5 rounded-xl hover:bg-[#C8E6C9] hover:shadow-sm transition-all duration-300 shrink-0 font-semibold group"
      >
        {detailsLabel} <span className="inline-block transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
      </button>
    </div>
  );
}

/* =========================================================
   Sensor Cards
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

function PlaceholderPage({ page, onBack }) {
  const titleMap = {
    temp: "تفاصيل درجة الحرارة",
    airHumidity: "تفاصيل رطوبة الهواء",
    soilMoisture: "تفاصيل رطوبة التربة",
    irrigation: "تفاصيل حالة الري",
    recs: "كل التوصيات",
    weather: "تفاصيل الطقس",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
  };
  const title = titleMap[page] || "صفحة";

  return (
    <div className="w-full h-full p-6 overflow-auto">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <div className="text-xl font-bold text-gray-800">{title}</div>
            <div className="text-[13px] text-gray-500 mt-1">
              Placeholder — سيتم تصميم الصفحة وربطها لاحقًا.
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-[15px] text-gray-600 hover:text-[#2E7D32] hover:border-[#2E7D32]/30 hover:bg-[#f0fdf4] transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
            رجوع
          </button>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow border border-gray-200 p-6 text-gray-700">
          هنا مكان محتوى الصفحة (قريبًا).
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Mini Chart: Donut
========================================================= */

function Donut({ value }) {
  const v = Math.max(0, Math.min(100, value));
  const size = 60;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (v / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#E5E7EB"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#EF6C00"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="14"
        fill="#111827"
        fontWeight="600"
      >
        {v}%
      </text>
    </svg>
  );
}

/* =========================================================
   Recommendations Page
========================================================= */
function RecommendationsPage({ onBack }) {
  const items = useMemo(
    () => [
      {
        id: "r1",
        type: "heat",
        title: "قم بالتبريد",
        desc: "درجة الحرارة بالمحمية أعلى من النطاق المثالي.",
        meta: "قبل 5 دقائق",
        icon: <TempSunIcon />,
        tone: "warning",
      },
      {
        id: "r2",
        type: "irrigation",
        title: "اضبط الري",
        desc: "رطوبة التربة ضمن النطاق المثالي، استمر على الجدول.",
        meta: "قبل 12 دقيقة",
        icon: <SoilDropIcon />,
        tone: "ok",
      },
      {
        id: "r3",
        type: "humidity",
        title: "تهوية خفيفة",
        desc: "رطوبة الهواء قريبة من الحد الأعلى، زد التهوية.",
        meta: "قبل 20 دقيقة",
        icon: <AirHumidityIcon />,
        tone: "info",
      },

      // إضافات عشان يبان إنها كثيرة
      {
        id: "r4",
        type: "heat",
        title: "قلل التعرض للشمس",
        desc: "يفضل تفعيل التظليل خلال ساعات الظهيرة.",
        meta: "قبل 25 دقيقة",
        icon: <TempSunIcon />,
        tone: "warning",
      },
      {
        id: "r5",
        type: "irrigation",
        title: "جدولة ري مسائي",
        desc: "أفضل وقت للري لتقليل التبخر هو بعد المغرب.",
        meta: "قبل 30 دقيقة",
        icon: <SoilDropIcon />,
        tone: "ok",
      },
      {
        id: "r6",
        type: "humidity",
        title: "راقب التكاثف",
        desc: "إن لاحظت تكاثف، زِد التهوية لتجنب العفن.",
        meta: "قبل 35 دقيقة",
        icon: <AirHumidityIcon />,
        tone: "info",
      },
      {
        id: "r7",
        type: "heat",
        title: "تأكد من عمل المراوح",
        desc: "تحقق من تهوية الممرات لتوزيع الحرارة بشكل أفضل.",
        meta: "قبل 45 دقيقة",
        icon: <TempSunIcon />,
        tone: "warning",
      },
      {
        id: "r8",
        type: "irrigation",
        title: "تحقق من التصريف",
        desc: "تأكد من عدم تجمع المياه حول الجذور بعد الري.",
        meta: "قبل ساعة",
        icon: <SoilDropIcon />,
        tone: "ok",
      },
      {
        id: "r9",
        type: "humidity",
        title: "تهوية دورية",
        desc: "افتح التهوية 10 دقائق كل ساعة عند ارتفاع الرطوبة.",
        meta: "قبل ساعة و10 دقائق",
        icon: <AirHumidityIcon />,
        tone: "info",
      },
      {
        id: "r10",
        type: "heat",
        title: "تنبيه حرارة مرتفعة",
        desc: "القراءة تقترب من الحد الأعلى—راقب خلال 15 دقيقة.",
        meta: "قبل ساعة و20 دقيقة",
        icon: <TempSunIcon />,
        tone: "warning",
      },
      {
        id: "r11",
        type: "irrigation",
        title: "خفض الري تدريجيًا",
        desc: "إذا لاحظت رطوبة عالية، خفف الري خطوة بخطوة.",
        meta: "قبل ساعتين",
        icon: <SoilDropIcon />,
        tone: "ok",
      },
      {
        id: "r12",
        type: "humidity",
        title: "تجنب الرش الضبابي",
        desc: "عند ارتفاع الرطوبة، قلل الرش لتقليل المخاطر الفطرية.",
        meta: "قبل 3 ساعات",
        icon: <AirHumidityIcon />,
        tone: "info",
      },
    ],
    []
  );

  const [filter, setFilter] = useState("all"); // all | heat | irrigation | humidity

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((it) => it.type === filter);
  }, [items, filter]);

  const badgeClass = (tone) => {
    if (tone === "warning")
      return "bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]";
    if (tone === "ok") return "bg-[#E8F5E9] text-[#1B5E20] border-[#A5D6A7]";
    return "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]";
  };

  const filterBtn = (key) =>
    `px-3.5 py-2 rounded-xl text-sm border transition ${filter === key
      ? "bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20] font-semibold"
      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <div className="w-full h-full p-6 overflow-auto page-enter" dir="rtl">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
        <SensorTopBar
          title="التوصيات"
          subtitle="جميع التوصيات المقترحة"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>}
          onBack={onBack}
          onExport={() => {}}
        />

        {/* Filters */}
        <CardShell className="p-4 flex items-center justify-between gap-3">
          <div className="text-[15px] text-gray-700">عرض حسب:</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={filterBtn("all")}
              onClick={() => setFilter("all")}
            >
              الكل
            </button>
            <button
              type="button"
              className={filterBtn("heat")}
              onClick={() => setFilter("heat")}
            >
              حرارة
            </button>
            <button
              type="button"
              className={filterBtn("irrigation")}
              onClick={() => setFilter("irrigation")}
            >
              ري
            </button>
            <button
              type="button"
              className={filterBtn("humidity")}
              onClick={() => setFilter("humidity")}
            >
              رطوبة
            </button>
          </div>
        </CardShell>

        {/* List */}
        <CardShell className="overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-sm text-gray-700 text-right">
              لا توجد توصيات ضمن هذا التصنيف حاليًا.
            </div>
          ) : (
            filteredItems.map((it, idx) => (
              <div
                key={it.id}
                className={`p-4 flex items-center justify-between gap-3 ${idx !== filteredItems.length - 1
                  ? "border-b border-gray-100"
                  : ""
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#F1F5F1] border border-gray-200 flex items-center justify-center shrink-0">
                    {it.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-[16px] font-semibold text-gray-800">
                        {it.title}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] border ${badgeClass(
                          it.tone
                        )}`}
                      >
                        {it.meta}
                      </span>
                    </div>

                    <div className="text-[14px] text-gray-600 mt-1">
                      {it.desc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#2E7D32] hover:bg-[#f0fdf4] hover:border-[#2E7D32]/30 transition-all duration-300"
                    title="تم التنفيذ"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </CardShell>
      </div>
    </div>
  );
}

/* =========================================================
   Irrigation Page (Safe Version - no name collisions)
========================================================= */

function IrrigationPage({ onBack, mode }) {
  const MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const currentMonthIdx = new Date().getMonth();

  const [month, setMonth] = useState(currentMonthIdx);
  const [activeAction, setActiveAction] = useState("start");

  // Manual schedule state
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [morningTime, setMorningTime] = useState("06:00");
  const [eveningTime, setEveningTime] = useState("18:00");
  const [duration, setDuration] = useState(30);
  const [frequency, setFrequency] = useState("daily");

  // AI boundary settings state
  const [moistureMin, setMoistureMin] = useState(35);
  const [moistureMax, setMoistureMax] = useState(55);
  const [maxWater, setMaxWater] = useState(100);
  const [restrictedEnabled, setRestrictedEnabled] = useState(true);
  const [restrictedFrom, setRestrictedFrom] = useState("12:00");
  const [restrictedTo, setRestrictedTo] = useState("15:00");
  const [aiSensitivity, setAiSensitivity] = useState("moderate");

  const isFutureMonth = month > currentMonthIdx;

  const series = useMemo(() => {
    if (isFutureMonth) return [];
    const y = new Date().getFullYear();
    const d = irrigationDaysInMonth(y, month);
    return generateIrrigationUsageSeries({
      days: d,
      base: 55 + (month % 4) * 4,
      amp: 18,
      noise: 14,
      min: 10,
      max: 95,
      seed: 19 + month * 5,
    });
  }, [month, isFutureMonth]);

  const current = series[series.length - 1]?.value ?? 0;

  const lastUpdateLabel = (() => {
    if (month === currentMonthIdx) return "آخر تحديث: قبل 10 دقائق";
    if (isFutureMonth) return `بيانات ${MONTHS[month]} غير متوفرة بعد`;
    const lastDay = irrigationDaysInMonth(new Date().getFullYear(), month);
    return `آخر تحديث: ${lastDay} ${MONTHS[month]}`;
  })();

  return (
    <div className="w-full h-full p-6 overflow-auto page-enter" dir="rtl">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-4">

        <SensorTopBar
          title="تفاصيل حالة الري"
          subtitle="متابعة الاستخدام اليومي + إجراءات سريعة"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>}
          onBack={onBack}
          onExport={() => {}}
        />

        {/* Stats row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">معدل الري اليوم</div>
              <div className="text-[13px] text-gray-500 mt-1">{lastUpdateLabel}</div>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <IrrigationDonut value={Math.round(current)} />
            </div>
            <div className="mt-2 text-center text-[12px] text-gray-700">
              معدل الري {Math.round(current)}%
            </div>
          </CardShell>

          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">التحكم السريع</div>
              <div className="text-[13px] text-gray-500 mt-1">إجراءات فورية</div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <IrrigationActionButton label="تشغيل الري الآن" active={activeAction === "start"} onClick={() => setActiveAction("start")} />
              <IrrigationActionButton label="جدولة الري"      active={activeAction === "schedule"} onClick={() => setActiveAction("schedule")} />
              <IrrigationActionButton label="إيقاف الري"      active={activeAction === "stop"} onClick={() => setActiveAction("stop")} />
            </div>
          </CardShell>

          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">التوصيات</div>
              <div className="text-[13px] text-gray-500 mt-1">مقترحات حسب القراءة</div>
            </div>
            <ul className="mt-4 list-disc list-inside text-sm text-gray-700 leading-7 text-right">
              <li>معدل الري ضمن النطاق المتوسط، يُنصح بالاستمرار على الإعدادات الحالية.</li>
              <li>تجنب الري خلال ساعات الذروة الحرارية (12–15).</li>
            </ul>
          </CardShell>
        </div>

        {/* Monthly Chart */}
        <CardShell className="p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">الرسم البياني الشهري</div>
              <div className="text-[13px] text-gray-500 mt-1">
                {isFutureMonth
                  ? "لا تتوفر بيانات للأشهر المستقبلية"
                  : "يوضح الرسم نسبة استخدام الري خلال أيام الشهر"}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-start">
              {MONTHS.map((m, idx) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => idx <= currentMonthIdx && setMonth(idx)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs border transition ${
                    idx === month
                      ? "bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20] font-semibold"
                      : idx > currentMonthIdx
                      ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {isFutureMonth ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              <div className="mt-3 text-[15px] font-medium">بيانات {MONTHS[month]} غير متوفرة بعد</div>
              <div className="text-[13px] mt-1">سيتم عرضها عند بداية الشهر</div>
            </div>
          ) : (
            <div className="mt-4">
              <IrrigationBarChart2D data={series} yLabel="نسبة الاستخدام" unit="%" />
            </div>
          )}
        </CardShell>

        {/* Auto mode: AI boundary settings */}
        {mode === "auto" && <CardShell className="p-5" key="ai-settings">
          <div className="text-right mb-5">
            <div className="text-[16px] font-semibold text-gray-800">حدود الري الذكي</div>
            <div className="text-[13px] text-gray-500 mt-0.5">القيود التي يلتزم بها النظام عند اتخاذ قرارات الري تلقائياً بناءً على قراءات الحساسات</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Target moisture range */}
            <div className="border border-gray-100 rounded-xl p-4 bg-[#fafafa]">
              <div className="text-sm font-semibold text-gray-800 mb-3">نطاق رطوبة التربة المستهدف</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[13px] text-gray-500">
                  <span className="w-8">من</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {[25, 30, 35, 40].map(v => (
                      <button key={v} type="button" onClick={() => setMoistureMin(v)}
                        className={`px-2.5 py-1 rounded-lg border text-xs transition ${moistureMin === v ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20] font-semibold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-gray-500">
                  <span className="w-8">إلى</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {[50, 55, 60, 65].map(v => (
                      <button key={v} type="button" onClick={() => setMoistureMax(v)}
                        className={`px-2.5 py-1 rounded-lg border text-xs transition ${moistureMax === v ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20] font-semibold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Max daily water */}
            <div className="border border-gray-100 rounded-xl p-4 bg-[#fafafa]">
              <div className="text-sm font-semibold text-gray-800 mb-3">الحد الأقصى للمياه اليومية</div>
              <div className="flex gap-2 flex-wrap">
                {[{v:50,l:'50 لتر'},{v:100,l:'100 لتر'},{v:200,l:'200 لتر'},{v:0,l:'بلا حد'}].map(({v,l}) => (
                  <button key={v} type="button" onClick={() => setMaxWater(v)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${maxWater === v ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20] font-semibold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Restricted hours */}
            <div className="border border-gray-100 rounded-xl p-4 bg-[#fafafa]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-gray-800">ساعات محظورة</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">لا يُشغَّل الري خلال هذه الفترة</div>
                </div>
                <button type="button" onClick={() => setRestrictedEnabled(v => !v)}
                  className={`w-11 h-6 rounded-full relative transition-all duration-300 ${restrictedEnabled ? 'bg-[#2E7D32]' : 'bg-gray-300'}`}>
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow transition-all duration-300 ${restrictedEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              {restrictedEnabled && (
                <div className="flex items-center gap-2 text-[13px] text-gray-600">
                  <span>من</span>
                  <input type="time" value={restrictedFrom} onChange={e => setRestrictedFrom(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32]" />
                  <span>إلى</span>
                  <input type="time" value={restrictedTo} onChange={e => setRestrictedTo(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32]" />
                </div>
              )}
            </div>

            {/* AI sensitivity */}
            <div className="border border-gray-100 rounded-xl p-4 bg-[#fafafa]">
              <div className="text-sm font-semibold text-gray-800 mb-1">حساسية النظام الذكي</div>
              <div className="text-[12px] text-gray-400 mb-3">مدى سرعة استجابة النظام لتغيرات الحساسات</div>
              <div className="flex gap-2">
                {[{k:'conservative',l:'محافظ'},{k:'moderate',l:'معتدل'},{k:'active',l:'نشط'}].map(({k,l}) => (
                  <button key={k} type="button" onClick={() => setAiSensitivity(k)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${aiSensitivity === k ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-start">
            <button type="button"
              className="px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white text-sm font-medium hover:bg-[#1B5E20] transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-green-900/15">
              حفظ الحدود
            </button>
          </div>
        </CardShell>}

        {/* Manual mode: fixed schedule */}
        {mode === "manual" && <CardShell className="p-5" key="manual-settings">
          <div className="text-right mb-5">
            <div className="text-[16px] font-semibold text-gray-800">جدول الري اليدوي</div>
            <div className="text-[13px] text-gray-500 mt-0.5">حدد أوقات الري ومدته في الوضع اليدوي</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="border border-gray-100 rounded-xl p-4 bg-[#fafafa]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-gray-800">ري الصباح</div>
                <button type="button" onClick={() => setMorningEnabled(v => !v)}
                  className={`w-11 h-6 rounded-full relative transition-all duration-300 ${morningEnabled ? 'bg-[#2E7D32]' : 'bg-gray-300'}`}>
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow transition-all duration-300 ${morningEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              {morningEnabled && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">الوقت:</span>
                  <input type="time" value={morningTime} onChange={e => setMorningTime(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32]" />
                </div>
              )}
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-[#fafafa]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-gray-800">ري المساء</div>
                <button type="button" onClick={() => setEveningEnabled(v => !v)}
                  className={`w-11 h-6 rounded-full relative transition-all duration-300 ${eveningEnabled ? 'bg-[#2E7D32]' : 'bg-gray-300'}`}>
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow transition-all duration-300 ${eveningEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              {eveningEnabled && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">الوقت:</span>
                  <input type="time" value={eveningTime} onChange={e => setEveningTime(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32]" />
                </div>
              )}
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-[#fafafa]">
              <div className="text-sm font-semibold text-gray-800 mb-3">مدة الري</div>
              <div className="flex gap-2 flex-wrap">
                {[15,30,45,60].map(min => (
                  <button key={min} type="button" onClick={() => setDuration(min)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${duration === min ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20] font-semibold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {min} دقيقة
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-[#fafafa]">
              <div className="text-sm font-semibold text-gray-800 mb-3">تكرار الري</div>
              <div className="flex gap-2 flex-wrap">
                {[{key:"daily",label:"يومي"},{key:"every2",label:"كل يومين"},{key:"weekly",label:"أسبوعي"}].map(({key,label}) => (
                  <button key={key} type="button" onClick={() => setFrequency(key)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${frequency === key ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20] font-semibold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-start">
            <button type="button"
              className="px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white text-sm font-medium hover:bg-[#1B5E20] transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-green-900/15">
              حفظ الجدول
            </button>
          </div>
        </CardShell>}

      </div>
    </div>
  );
}


function IrrigationActionButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-2xl border text-sm text-right transition-all duration-300 ${active
        ? "bg-gradient-to-l from-[#2E7D32] to-[#388E3C] text-white border-[#2E7D32] shadow-md shadow-green-900/15"
        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:shadow-sm"
        }`}
    >
      {label}
    </button>
  );
}

function IrrigationDonut({ value }) {
  const v = Math.max(0, Math.min(100, value));
  const size = 84;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (v / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#E5E7EB"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#EF6C00"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="16"
        fill="#111827"
        fontWeight="700"
      >
        {v}%
      </text>
    </svg>
  );
}

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

function sensorBuildRecommendationsTemperature(current) {
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
    rec.push("تأكد من عدم حدوث تكاثف يزيد فرص الأمراض الفطرية.");
  } else {
    rec.push("الحرارة ضمن النطاق المقبول: استمر بالمراقبة الدورية.");
  }
  return rec;
}

function sensorBuildRecommendationsHumidity(current) {
  const rec = [];
  if (current >= 80) {
    rec.push("الرطوبة مرتفعة: يوصى بزيادة التهوية وتقليل الرش/الري الضبابي.");
    rec.push("ارفع وتيرة الفحص للأمراض الفطرية (البياض/العفن).");
  } else if (current <= 35) {
    rec.push("الرطوبة منخفضة: يوصى بضبط نظام الترطيب أو إعادة جدولة الري.");
    rec.push("احرص على عدم تعريض الأوراق للجفاف لفترات طويلة.");
  } else {
    rec.push("الرطوبة ضمن النطاق المناسب: استمر على إعدادات التشغيل الحالية.");
  }
  return rec;
}

function sensorBuildRecommendationsSoil(soilTemp, soilMoist) {
  const rec = [];
  if (soilMoist <= 25)
    rec.push(
      "رطوبة التربة منخفضة: يوصى بزيادة الري تدريجيًا ومراقبة الاستجابة خلال 24 ساعة."
    );
  else if (soilMoist >= 60)
    rec.push(
      "رطوبة التربة مرتفعة: قلل الري وتأكد من التصريف لتفادي تعفن الجذور."
    );
  else rec.push("رطوبة التربة جيدة: حافظ على الجدول الحالي مع مراجعة أسبوعية.");

  if (soilTemp >= 32)
    rec.push("حرارة التربة مرتفعة: يوصى بتظليل إضافي أو تقليل ساعات التعرض.");
  if (soilTemp <= 14)
    rec.push(
      "حرارة التربة منخفضة: راقب بطء النمو واضبط التهوية/التدفئة حسب توفرها."
    );
  return rec;
}

function SensorTopBar({ title, subtitle, icon, onBack, onExport }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] flex items-center justify-center">
          {icon}
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-800">{title}</div>
          <div className="text-sm text-gray-500">{subtitle}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-[15px] text-gray-600 hover:text-[#2E7D32] hover:border-[#2E7D32]/30 hover:bg-[#f0fdf4] transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            تصدير
          </button>
        )}
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-[15px] text-gray-600 hover:text-[#2E7D32] hover:border-[#2E7D32]/30 hover:bg-[#f0fdf4] transition-all duration-300 flex items-center gap-2 font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
          رجوع
        </button>
      </div>
    </div>
  );
}

function SensorPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs border transition ${active
        ? "bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20] font-semibold"
        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
    >
      {label}
    </button>
  );
}

function SensorPrimaryButton({ children, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-4 py-2 rounded-xl border text-sm text-right transition ${active
        ? "bg-[#2E7D32] text-white border-[#2E7D32]"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
    >
      {children}
    </button>
  );
}


function SensorBarChart2D({ data, yLabel, unit }) {
  const pad = 44;
  const h = 320;

  const n = data.length;

  // عرض الرسم يعتمد على عدد الأعمدة (بدون حد أدنى) لتفادي السكرول
  const barW = 12;
  const gap = 8;
  const w = pad * 2 + n * (barW + gap);

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

  // تدرّج اللون: أخضر (منخفض) → أصفر (متوسط) → برتقالي (مرتفع)
  const colorFor = (v) => {
    const t = (v - yMin) / (yMax - yMin || 1);
    const hue = 125 - t * 115;
    return `hsl(${hue} 55% 50%)`;
  };

  return (
    <div className="w-full">
      {/* توسيط الرسم بدون سكرول */}
      <div className="mt-3 w-full flex justify-center">
        <div className="overflow-hidden">
          <svg width={w} height={h} className="block">
            <rect x="0" y="0" width={w} height={h} fill="white" />

            {Array.from({ length: yTicks + 1 }).map((_, i) => {
              const v = yMin + ((yMax - yMin) * i) / yTicks;
              const yy = y(v);
              return (
                <g key={`yg-${i}`}>
                  <line
                    x1={pad}
                    y1={yy}
                    x2={w - pad}
                    y2={yy}
                    stroke="#E5E7EB"
                  />
                  <text
                    x={pad - 8}
                    y={yy + 5}
                    fontSize="13"
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
                  {i % 3 === 0 ? (
                    <text
                      x={xx + barW / 2}
                      y={h - 14}
                      fontSize="13"
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
              y={pad - 12}
              fontSize="14"
              fill="#374151"
              fontWeight="500"
              textAnchor="end"
            >
              {yLabel} {unit ? `(${unit})` : ""}
            </text>
          </svg>
        </div>
      </div>

      {/* Legend تحت الرسم بالمنتصف */}
      <div className="mt-3 text-center text-[13px] text-gray-500">
        الألوان تعبّر عن مستوى القراءة.
      </div>

      <div className="mt-2 w-full flex justify-center" dir="rtl">
        <div className="flex items-center gap-5 text-[13px] text-gray-600">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#2E7D32]" />
            <span>منخفض</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#FBC02D]" />
            <span>متوسط</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#EF6C00]" />
            <span>مرتفع</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemperaturePage({ onBack }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const months = sensorMakeMonthOptionsAr();
  const [activeAction, setActiveAction] = useState("cooling");
  const series = useMemo(() => {
    const y = new Date().getFullYear();
    const d = sensorDaysInMonth(y, month);
    return sensorGenerateLineSeries({
      days: d,
      base: 28 + (month % 3) * 1.2,
      amp: 4.5,
      noise: 3.2,
      min: 14,
      max: 42,
      seed: 11 + month * 3,
    });
  }, [month]);

  const current = series[series.length - 1]?.value ?? 0;
  const recs = useMemo(
    () => sensorBuildRecommendationsTemperature(current),
    [current]
  );

  return (
    <div className="w-full h-full p-6 overflow-auto page-enter" dir="rtl">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
        <SensorTopBar
          title="درجة الحرارة"
          subtitle="عرض القراءة الحالية + رسم بياني شهري + تحكم"
          icon={<TempSunIcon />}
          onBack={onBack}
          onExport={() => alert('جاري تصدير قراءات درجة الحرارة...')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">
                القراءة الحالية
              </div>
              <div className="text-[13px] text-gray-500 mt-1">
                {sensorGetUpdateText(month)}
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div className="text-right">
                <div className="text-4xl font-bold text-[#1B5E20]">
                  {current}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  °C درجة الحرارة
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#F1F5F1] flex items-center justify-center">
                <GaugeIcon />
              </div>
            </div>
          </CardShell>

          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">التحكم</div>
              <div className="text-[13px] text-gray-500 mt-1">
                تحكم بالتبريد والتهوية
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <SensorPrimaryButton
                active={activeAction === "cooling"}
                onClick={() => setActiveAction("cooling")}
              >
                التحكم بالتبريد
              </SensorPrimaryButton>

              <SensorPrimaryButton
                active={activeAction === "vent"}
                onClick={() => setActiveAction("vent")}
              >
                التحكم بالتهوية
              </SensorPrimaryButton>
            </div>
          </CardShell>

          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">
                التوصيات
              </div>
              <div className="text-[13px] text-gray-500 mt-1">
                مقترحات بناءً على القراءة
              </div>
            </div>
            <ul className="mt-4 text-sm text-gray-700 list-disc pr-5 flex flex-col gap-2 text-right">
              {recs.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </CardShell>
        </div>

        <CardShell className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">
                الرسم البياني الشهري
              </div>
              <div className="text-[13px] text-gray-500 mt-1">
                X: الأيام — Y: درجة الحرارة
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-start">
              {months.map((m, idx) => (
                <SensorPill
                  key={m}
                  label={m}
                  active={idx === month}
                  onClick={() => setMonth(idx)}
                />
              ))}
            </div>
          </div>
          <div className="mt-4">
            {sensorIsFutureMonth(month) ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                <div className="mt-3 text-[15px] font-medium">بيانات {months[month]} غير متوفرة بعد</div>
                <div className="text-[13px] mt-1">سيتم عرضها عند بداية الشهر</div>
              </div>
            ) : (
              <SensorBarChart2D data={series} yLabel="درجة الحرارة" unit="°C" />
            )}
          </div>
        </CardShell>
      </div>
    </div>
  );
}

function AirHumidityPage({ onBack }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const months = sensorMakeMonthOptionsAr();
  const [activeAction, setActiveAction] = useState("cooling");
  const series = useMemo(() => {
    const y = new Date().getFullYear();
    const d = sensorDaysInMonth(y, month);
    return sensorGenerateLineSeries({
      days: d,
      base: 55 + (month % 4) * 2.0,
      amp: 10,
      noise: 9,
      min: 15,
      max: 95,
      seed: 21 + month * 2,
    });
  }, [month]);

  const current = series[series.length - 1]?.value ?? 0;
  const recs = useMemo(
    () => sensorBuildRecommendationsHumidity(current),
    [current]
  );

  return (
    <div className="w-full h-full p-6 overflow-auto page-enter" dir="rtl">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
        <SensorTopBar
          title="رطوبة الهواء"
          subtitle="عرض القراءة الحالية + رسم بياني شهري + تحكم"
          icon={<AirHumidityIcon />}
          onBack={onBack}
          onExport={() => alert('جاري تصدير قراءات رطوبة الهواء...')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">
                القراءة الحالية
              </div>
              <div className="text-[13px] text-gray-500 mt-1">
                {sensorGetUpdateText(month)}
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div className="text-right">
                <div className="text-4xl font-bold text-[#1B5E20]">
                  {current}
                </div>
                <div className="text-sm text-gray-600 mt-1">% نسبة الرطوبة</div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#F1F5F1] flex items-center justify-center">
                <DropBadgeIcon />
              </div>
            </div>
          </CardShell>

          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">التحكم</div>
              <div className="text-[13px] text-gray-500 mt-1">
                تحكم بالتبريد والتهوية
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <SensorPrimaryButton
                active={activeAction === "cooling"}
                onClick={() => setActiveAction("cooling")}
              >
                التحكم بالتبريد
              </SensorPrimaryButton>

              <SensorPrimaryButton
                active={activeAction === "vent"}
                onClick={() => setActiveAction("vent")}
              >
                التحكم بالتهوية
              </SensorPrimaryButton>
            </div>
          </CardShell>

          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">
                التوصيات
              </div>
              <div className="text-[13px] text-gray-500 mt-1">
                مقترحات بحسب القراءة
              </div>
            </div>
            <ul className="mt-4 text-sm text-gray-700 list-disc pr-5 flex flex-col gap-2">
              {recs.map((r, i) => (
                <li key={i} className="text-right">
                  {r}
                </li>
              ))}
            </ul>
          </CardShell>
        </div>

        <CardShell className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">
                الرسم البياني الشهري
              </div>
              <div className="text-[13px] text-gray-500 mt-1">
                يوضح الرسم مستوى الرطوبة خلال أيام الشهر.
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-start">
              {months.map((m, idx) => (
                <SensorPill
                  key={m}
                  label={m}
                  active={idx === month}
                  onClick={() => setMonth(idx)}
                />
              ))}
            </div>
          </div>
          <div className="mt-4">
            {sensorIsFutureMonth(month) ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                <div className="mt-3 text-[15px] font-medium">بيانات {months[month]} غير متوفرة بعد</div>
                <div className="text-[13px] mt-1">سيتم عرضها عند بداية الشهر</div>
              </div>
            ) : (
              <SensorBarChart2D data={series} yLabel="نسبة الرطوبة" unit="%" />
            )}
          </div>
        </CardShell>
      </div>
    </div>
  );
}

function SoilMoisturePage({ onBack }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const months = sensorMakeMonthOptionsAr();

  const [activeAction, setActiveAction] = useState("تشغيل الري الآن");

  const soilTempSeries = useMemo(() => {
    const y = new Date().getFullYear();
    const d = sensorDaysInMonth(y, month);
    return sensorGenerateLineSeries({
      days: d,
      base: 26,
      amp: 3.5,
      noise: 1.8,
      min: 18,
      max: 35,
      seed: 31 + month,
    });
  }, [month]);

  const soilMoistSeries = useMemo(() => {
    const y = new Date().getFullYear();
    const d = sensorDaysInMonth(y, month);
    return sensorGenerateLineSeries({
      days: d,
      base: 42,
      amp: 10,
      noise: 4,
      min: 20,
      max: 60,
      seed: 41 + month * 4,
    });
  }, [month]);

  const soilTemp = soilTempSeries[soilTempSeries.length - 1]?.value ?? 0;
  const soilMoist = soilMoistSeries[soilMoistSeries.length - 1]?.value ?? 0;
  const recs = useMemo(
    () => sensorBuildRecommendationsSoil(soilTemp, soilMoist),
    [soilTemp, soilMoist]
  );

  return (
    <div className="w-full h-full p-6 overflow-auto page-enter" dir="rtl">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
        <SensorTopBar
          title=" التربة"
          subtitle="حرارة التربة + رطوبة التربة (رسمين 2D)"
          icon={<SoilDropIcon />}
          onBack={onBack}
          onExport={() => alert('جاري تصدير قراءات التربة...')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">
                القراءة الحالية
              </div>
              <div className="text-[13px] text-gray-500 mt-1">
                ملخص سريع للتربة
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-center">
                <span className="text-sm text-gray-600">حرارة التربة</span>
                <span className="text-xl font-bold text-[#1B5E20]">
                  {soilTemp}°C
                </span>
              </div>
              <div className="flex items-center justify-between text-center">
                <span className="text-sm text-gray-600">رطوبة التربة</span>
                <span className="text-xl font-bold text-[#1B5E20]">
                  {soilMoist}%
                </span>
              </div>
            </div>
          </CardShell>

          {/* Control card like irrigation page */}
          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">التحكم</div>
              <div className="text-[13px] text-gray-500 mt-1">
                إجراءات مرتبطة بالتربة والري
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <IrrigationActionButton
                label="تشغيل الري الآن"
                active={activeAction === "تشغيل الري الآن"}
                onClick={() => setActiveAction("تشغيل الري الآن")}
              />
              <IrrigationActionButton
                label="جدولة الري"
                active={activeAction === "جدولة الري"}
                onClick={() => setActiveAction("جدولة الري")}
              />
              <IrrigationActionButton
                label="إيقاف الري"
                active={activeAction === "إيقاف الري"}
                onClick={() => setActiveAction("إيقاف الري")}
              />
            </div>
          </CardShell>

          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">
                التوصيات
              </div>
              <div className="text-[13px] text-gray-500 mt-1">
                اقتراحات بحسب المؤشرات الحالية
              </div>
            </div>
            <ul className="mt-4 text-sm text-gray-700 list-disc pr-5 flex flex-col gap-2">
              {recs.map((r, i) => (
                <li key={i} className="text-right">
                  {r}
                </li>
              ))}
            </ul>
          </CardShell>
        </div>

        <CardShell className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">
                تحليل شهري
              </div>
              <div className="text-[13px] text-gray-500 mt-1">
                اختر الشهر لعرض الرسوم
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-start">
              {months.map((m, idx) => (
                <SensorPill
                  key={m}
                  label={m}
                  active={idx === month}
                  onClick={() => setMonth(idx)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CardShell className="p-4">
              <div className="text-right">
                <div className="text-[16px] font-semibold text-gray-800">
                  حرارة التربة
                </div>
                <div className="text-[13px] text-gray-500 mt-1">
                  يوضح الرسم حرارة التربة خلال أيام الشهر.
                </div>
              </div>
              <div className="mt-3">
                {sensorIsFutureMonth(month) ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    <div className="mt-2 text-[14px]">غير متوفرة بعد</div>
                  </div>
                ) : (
                  <SensorBarChart2D
                    data={soilTempSeries}
                    yLabel="حرارة التربة"
                    unit="°C"
                  />
                )}
              </div>
            </CardShell>

            <CardShell className="p-4">
              <div className="text-right">
                <div className="text-[16px] font-semibold text-gray-800">
                  رطوبة التربة
                </div>
                <div className="text-[13px] text-gray-500 mt-1">
                  يوضح الرسم رطوبة التربة خلال أيام الشهر.
                </div>
              </div>
              <div className="mt-3">
                {sensorIsFutureMonth(month) ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    <div className="mt-2 text-[14px]">غير متوفرة بعد</div>
                  </div>
                ) : (
                  <SensorBarChart2D
                    data={soilMoistSeries}
                    yLabel="رطوبة التربة"
                    unit="%"
                  />
                )}
              </div>
            </CardShell>
          </div>
        </CardShell>
      </div>
    </div>
  );
}

/* =========================================================
   Account + Settings
========================================================= */

function AccountAndSettingsPages({ initialPage = "profile", onBack, onLogout, onNameUpdate, language, onLanguageChange, sensors: propSensors, onSensorsChange }) {

  const [page, setPage] = useState(initialPage);

  const savedUser = JSON.parse(localStorage.getItem('warif_user') || '{}');
  const [profile, setProfile] = useState({
    fullName: savedUser.fullName || "منصور الزهراني",
    username: savedUser.username || "admin",
    email: savedUser.email || "example@gmail.com",
    password: "********",
  });

  const [editingField, setEditingField] = useState(null);
  const [draftValue, setDraftValue] = useState("");

  const sensors = propSensors || [];

  const [sensorModal, setSensorModal] = useState({
    open: false,
    mode: "add", // "add" | "edit"
    id: null,
    name: "",
    type: "",
  });


  function openEdit(fieldKey) {
    setEditingField(fieldKey);
    setDraftValue(profile[fieldKey] || "");
  }

  function closeEdit() {
    setEditingField(null);
    setDraftValue("");
  }

  function saveEdit() {
    if (!editingField) return;
    const newValue = draftValue.trim() || profile[editingField];
    setProfile((p) => ({ ...p, [editingField]: newValue }));

    // حفظ في localStorage
    const saved = JSON.parse(localStorage.getItem('warif_user') || '{}');
    localStorage.setItem('warif_user', JSON.stringify({ ...saved, [editingField]: newValue }));

    // إبلاغ Dashboard بتحديث الاسم
    if (editingField === 'fullName' && onNameUpdate) onNameUpdate(newValue);

    closeEdit();
  }

  function openAddSensor() {
    setSensorModal({
      open: true,
      mode: "add",
      id: null,
      name: "",
      type: "",
    });
  }

  function openEditSensor(item) {
    setSensorModal({
      open: true,
      mode: "edit",
      id: item.id,
      name: item.name,
      type: item.type,
    });
  }

  function closeSensorModal() {
    setSensorModal({
      open: false,
      mode: "add",
      id: null,
      name: "",
      type: "",
    });
  }

  function saveSensorModal() {
    const name = sensorModal.name.trim();
    const type = sensorModal.type.trim();
    if (!name || !type) return;

    let updated;
    if (sensorModal.mode === "add") {
      const newId = `S${Math.floor(Math.random() * 9000 + 1000)}`;
      updated = [{ id: newId, name, type }, ...sensors];
    } else {
      updated = sensors.map((s) => (s.id === sensorModal.id ? { ...s, name, type } : s));
    }

    onSensorsChange?.(updated);
    closeSensorModal();
  }

  function deleteSensor(id) {
    const ok = confirm(language === 'ar' ? "هل تريد حذف هذا الحساس؟" : "Delete this sensor?");
    if (!ok) return;
    onSensorsChange?.(sensors.filter((s) => s.id !== id));
  }

  const isRtl = language === 'ar';
  const T = {
    profile: isRtl ? "الحساب الشخصي" : "Profile",
    settings: isRtl ? "الإعدادات" : "Settings",
    profileSub: isRtl ? "بياناتك الشخصية وتفاصيل حسابك" : "Your personal details and account info",
    settingsSub: isRtl ? "إدارة الحساسات وخيارات التطبيق" : "Manage sensors and app preferences",
    back: isRtl ? "رجوع" : "Back",
    accountData: isRtl ? "بيانات الحساب" : "Account Data",
    fullName: isRtl ? "الاسم الكامل" : "Full Name",
    username: isRtl ? "اسم المستخدم" : "Username",
    email: isRtl ? "البريد الإلكتروني" : "Email",
    password: isRtl ? "كلمة المرور" : "Password",
    edit: isRtl ? "تعديل" : "Edit",
    save: isRtl ? "حفظ" : "Save",
    cancel: isRtl ? "إلغاء" : "Cancel",
    sensors: isRtl ? "الحساسات" : "Sensors",
    sensorsSub: isRtl ? "إدارة الحساسات المرتبطة بالمحمية" : "Manage greenhouse sensors",
    addSensor: isRtl ? "إضافة حساس" : "Add Sensor",
    sensorName: isRtl ? "اسم الحساس" : "Sensor Name",
    sensorType: isRtl ? "نوع الحساس" : "Sensor Type",
    noSensors: isRtl ? "لا توجد حساسات مضافة" : "No sensors added",
    language: isRtl ? "اللغة" : "Language",
    account: isRtl ? "الحساب" : "Account",
    userGuide: isRtl ? "دليل المستخدم" : "User Guide",
    userGuideSub: isRtl ? "شرح استخدام لوحة التحكم، التنبيهات، والاختصارات." : "How to use the dashboard, alerts, and shortcuts.",
    openGuide: isRtl ? "فتح الدليل" : "Open Guide",
    logout: isRtl ? "تسجيل الخروج" : "Log Out",
    logoutSub: isRtl ? "إنهاء الجلسة الحالية بأمان." : "Safely end your current session.",
    logoutBtn: isRtl ? "خروج" : "Log Out",
    editField: isRtl ? "تعديل" : "Edit",
    addSensorTitle: isRtl ? "إضافة حساس" : "Add Sensor",
    editSensorTitle: isRtl ? "تعديل الحساس" : "Edit Sensor",
  };

  return (
    <div
      className="relative w-full h-full bg-[#F7F7F4] font-['IBM_Plex_Sans_Arabic'] overflow-auto"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-3xl mx-auto p-6 flex flex-col gap-5">

        {/* Page Header */}
        <div className="flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
              {page === "profile"
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-4 3-6 6-6s6 2 6 6" /></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              }
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">
                {page === "profile" ? T.profile : T.settings}
              </div>
              <div className="text-sm text-gray-500">
                {page === "profile" ? T.profileSub : T.settingsSub}
              </div>
            </div>
          </div>
          <button type="button" onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-[15px] text-gray-600 hover:text-[#2E7D32] hover:border-[#2E7D32]/30 hover:bg-[#f0fdf4] transition-all duration-300 flex items-center gap-2 font-medium">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
            {T.back}
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/80 border border-gray-100 rounded-2xl p-1 gap-1" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <button type="button" onClick={() => setPage("profile")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${page === "profile" ? "bg-[#E8F5E9] text-[#1B5E20] shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-4 3-6 6-6s6 2 6 6" /></svg>
            {T.profile}
          </button>
          <button type="button" onClick={() => setPage("settings")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${page === "settings" ? "bg-[#E8F5E9] text-[#1B5E20] shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            {T.settings}
          </button>
        </div>

        {/* Content */}
        <div className="page-enter">
          {page === "profile" ? (
            <Account_ProfilePage profile={profile} onEdit={openEdit} T={T} />
          ) : (
            <Account_SettingsPage
              T={T}
              language={language}
              setLanguage={onLanguageChange}
              sensors={sensors}
              onAddSensor={openAddSensor}
              onEditSensor={openEditSensor}
              onDeleteSensor={deleteSensor}
              onLogout={onLogout}
            />
          )}
        </div>

      </div>

      {editingField && (
        <Account_ModalShell onClose={closeEdit}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[420px] max-w-[92vw] p-5 text-right animate-modal-in">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[16px] font-semibold text-gray-800">
                {T.edit}:{" "}
                {editingField === "fullName" ? T.fullName
                  : editingField === "username" ? T.username
                    : editingField === "email" ? T.email
                      : T.password}
              </div>
              <button type="button" onClick={closeEdit}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <label className="block text-xs text-gray-600 mb-2">
              {editingField === "fullName" ? T.fullName
                : editingField === "username" ? T.username
                  : editingField === "email" ? T.email
                    : T.password}
            </label>
            <input
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); }}
              type={editingField === "password" ? "password" : "text"}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              placeholder=""
              autoFocus
            />

            <div className="flex items-center justify-end gap-2 mt-5">
              <button type="button" onClick={closeEdit}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
                {T.cancel}
              </button>
              <button type="button" onClick={saveEdit}
                className="px-4 py-2 rounded-xl bg-[#2E7D32] text-white text-sm hover:bg-[#1B5E20]">
                {T.save}
              </button>
            </div>
          </div>
        </Account_ModalShell>
      )}

      {sensorModal.open && (
        <Account_ModalShell onClose={closeSensorModal}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[460px] max-w-[92vw] p-5 text-right animate-modal-in">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[16px] font-semibold text-gray-800">
                {sensorModal.mode === "add" ? T.addSensorTitle : T.editSensorTitle}
              </div>
              <button type="button" onClick={closeSensorModal}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-2">{T.sensorName}</label>
                <input
                  value={sensorModal.name}
                  onChange={(e) => setSensorModal((m) => ({ ...m, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  placeholder={T.sensorName}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-2">{T.sensorType}</label>
                <input
                  value={sensorModal.type}
                  onChange={(e) => setSensorModal((m) => ({ ...m, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  placeholder={T.sensorType}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button type="button" onClick={closeSensorModal}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
                {T.cancel}
              </button>
              <button type="button" onClick={saveSensorModal}
                className="px-4 py-2 rounded-xl bg-[#2E7D32] text-white text-sm hover:bg-[#1B5E20]">
                {T.save}
              </button>
            </div>
          </div>
        </Account_ModalShell>
      )}
    </div>
  );
}

function Account_ProfilePage({ profile, onEdit, T }) {
  const initials = (profile.fullName || "م")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="flex flex-col gap-4">
      {/* Avatar card */}
      <Account_Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#4ade80] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 select-none">
            {initials}
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-800">{profile.fullName || "—"}</div>
            <div className="text-[13px] text-gray-500 mt-0.5">{profile.email}</div>
            <div className="text-[13px] text-gray-400 mt-0.5 font-mono">@{profile.username}</div>
          </div>
        </div>
      </Account_Card>

      {/* Editable fields */}
      <Account_Card>
        <div className="text-[16px] font-semibold text-gray-800 mb-4">{T.accountData}</div>
        <div className="flex flex-col gap-3">
          <Account_EditableField label={T.fullName} value={profile.fullName || "—"} onEdit={() => onEdit("fullName")} />
          <Account_EditableField label={T.username} value={profile.username} onEdit={() => onEdit("username")} />
          <Account_EditableField label={T.email} value={profile.email} onEdit={() => onEdit("email")} />
          <Account_EditableField label={T.password} value={profile.password} onEdit={() => onEdit("password")} mono />
        </div>
      </Account_Card>
    </div>
  );
}

function Account_SettingsPage({ T, language, setLanguage, sensors, onAddSensor, onEditSensor, onDeleteSensor, onLogout }) {
  return (
    <div className="flex flex-col gap-4">

      {/* Sensors */}
      <Account_Card>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="text-right">
            <div className="text-[16px] font-semibold text-gray-800">{T.sensors}</div>
            <div className="text-[13px] text-gray-500 mt-0.5">{T.sensorsSub}</div>
          </div>
          <button
            type="button"
            onClick={onAddSensor}
            className="px-3 py-2 rounded-xl bg-[#2E7D32] text-white text-sm hover:bg-[#1B5E20] transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <Account_PlusIcon />
            {T.addSensor}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {sensors.map((s) => (
            <div key={s.id} className="border border-gray-100 rounded-xl px-4 py-3 bg-[#fafafa] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                  <Account_SensorIcon />
                </div>
                <div className="text-right leading-tight">
                  <div className="text-sm font-semibold text-gray-800">{s.name}</div>
                  <div className="text-[13px] text-gray-500">{s.type} • <span className="font-mono">{s.id}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Account_IconButton title={T.edit} onClick={() => onEditSensor(s)}>
                  <Account_PencilIcon />
                </Account_IconButton>
                <Account_IconButton title={T.edit} danger onClick={() => onDeleteSensor(s.id)}>
                  <Account_TrashIcon />
                </Account_IconButton>
              </div>
            </div>
          ))}
          {sensors.length === 0 && (
            <div className="text-center text-[13px] text-gray-400 py-6">{T.noSensors}</div>
          )}
        </div>
      </Account_Card>

      {/* Language */}
      <Account_Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="text-[16px] font-semibold text-gray-800">{T.language}</div>
        </div>
        <div className="flex gap-2">
          {[{ key: "ar", label: "عربي" }, { key: "en", label: "English" }].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setLanguage(key)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ${language === key ? "bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20]" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </Account_Card>

      {/* Account actions */}
      <Account_Card>
        <div className="text-[16px] font-semibold text-gray-800 mb-4">{T.account}</div>
        <div className="flex flex-col gap-2">
          <Account_ListRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>}
            title={T.userGuide}
            subtitle={T.userGuideSub}
            right={
              <button className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300">
                {T.openGuide}
              </button>
            }
          />
          <Account_ListRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>}
            title={T.logout}
            subtitle={T.logoutSub}
            right={
              <button
                onClick={() => { localStorage.removeItem('warif_remember'); onLogout?.(); }}
                className="px-4 py-2 rounded-xl bg-[#c62828] text-white text-sm hover:bg-[#b71c1c] transition-all duration-300"
              >
                {T.logoutBtn}
              </button>
            }
          />
        </div>
      </Account_Card>

    </div>
  );
}

function Account_Card({ children }) {
  return (
    <section
      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 p-6"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
    >
      {children}
    </section>
  );
}

function Account_EditableField({ label, value, onEdit, mono }) {
  return (
    <div className="border border-gray-100 rounded-xl px-4 py-3 bg-[#fafafa] flex items-center justify-between gap-3">
      <div className="text-right min-w-0">
        <div className="text-[13px] text-gray-500">{label}</div>
        <div className={`text-sm font-medium text-gray-800 mt-0.5 ${mono ? "font-mono tracking-widest" : ""}`}>
          {value}
        </div>
      </div>
      <Account_IconButton title="تعديل" onClick={onEdit}>
        <Account_PencilIcon />
      </Account_IconButton>
    </div>
  );
}

function Account_ListRow({ icon, title, subtitle, right }) {
  return (
    <div className="border border-gray-100 rounded-xl px-4 py-3 bg-[#fafafa] flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {icon && <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">{icon}</div>}
        <div className="text-right min-w-0">
          <div className="text-sm font-semibold text-gray-800">{title}</div>
          <div className="text-[13px] text-gray-500 mt-0.5">{subtitle}</div>
        </div>
      </div>
      <div className="flex-shrink-0">{right}</div>
    </div>
  );
}

function Account_IconButton({ children, title, onClick, danger }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${danger
        ? "border-[#f1c2c2] hover:bg-[#fdecec]"
        : "border-gray-200 hover:bg-gray-50"
        }`}
    >
      {children}
    </button>
  );
}

function Account_ModalShell({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {children}
    </div>
  );
}

function Account_PencilIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1B5E20"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function Account_TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#c62828"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function Account_PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function Account_SensorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1B5E20"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 11a8 8 0 0 1 16 0" />
      <path d="M8 11a4 4 0 0 1 8 0" />
      <circle cx="12" cy="11" r="1.5" />
      <path d="M12 13v7" />
    </svg>
  );
}

/* =========================================================
   Icons (Dashboard)
========================================================= */

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1B5E20"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20c0-4 3-6 6-6s6 2 6 6" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#374151"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function TempSunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4.5" fill="#F59E0B" />
      <g stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2.5v2.3" />
        <path d="M12 19.2v2.3" />
        <path d="M2.5 12h2.3" />
        <path d="M19.2 12h2.3" />
        <path d="M4.5 4.5l1.6 1.6" />
        <path d="M17.9 17.9l1.6 1.6" />
        <path d="M19.5 4.5l-1.6 1.6" />
        <path d="M6.1 17.9l-1.6 1.6" />
      </g>
    </svg>
  );
}

function AirHumidityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M8.8 18.5h8.4a3.6 3.6 0 0 0 .4-7.1 5.3 5.3 0 0 0-10.2 1.6A3.4 3.4 0 0 0 8.8 18.5Z"
        stroke="#1B5E20"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.2 19.2s1.4 1.6 1.4 2.6a1.4 1.4 0 0 1-2.8 0c0-1 1.4-2.6 1.4-2.6Z"
        fill="#60A5FA"
      />
    </svg>
  );
}

function SoilDropIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M8.3 11.2S12 6.6 12 4.6c0 0 3.7 4.6 3.7 6.6a3.7 3.7 0 1 1-7.4 0Z"
        fill="#60A5FA"
        opacity="0.95"
      />
      <path
        d="M5 16.2c1.8-1 4.2-1.6 7-1.6s5.2.6 7 1.6"
        stroke="#1B5E20"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6.5 19c1.5-.8 3.4-1.2 5.5-1.2s4 .4 5.5 1.2"
        stroke="#1B5E20"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1B5E20"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13a8 8 0 1 0-16 0" />
      <path d="M12 13l3-3" />
      <path d="M8 13h.01" />
      <path d="M16 13h.01" />
    </svg>
  );
}

function DropBadgeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1B5E20"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12Z" />
      <path d="M9 14a3 3 0 0 0 6 0" />
    </svg>
  );
}

