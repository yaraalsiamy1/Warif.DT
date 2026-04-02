import { useMemo, useState, useEffect } from "react";

/* =========================================================
   WARIF | Dashboard (Scope: Sensors + Irrigation + Recs + Account/Settings)
   - RTL Arabic UI
   - Pages:
     dashboard | temp | airHumidity | soilMoisture | irrigation | recs | weather
     profile | settings
========================================================= */

export default function Dashboard() {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", text: "مرحباً منصور! أنا مساعدك الذكي. كيف أساعدك اليوم؟" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const [mode, setMode] = useState("auto");

  // Navigation scaffold
  const [page, setPage] = useState("dashboard");
  // dashboard | temp | airHumidity | soilMoisture | irrigation | recs | weather | profile | settings
  const [showUserMenu, setShowUserMenu] = useState(false);

  const go = (to) => setPage(to);

  const sendToAI = async (userMessage) => {
    setChatMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setChatMessages(prev => [...prev, { role: "bot", text: "⏳ جاري التفكير..." }]);

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
          المستخدم اسمه منصور الزهراني.
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
    <div
      className="relative w-full h-full bg-[#F7F7F4] font-['IBM_Plex_Sans_Arabic']"
      dir="rtl"
    >
      <div className="w-full h-full flex flex-col">
        {/* ================= Header ================= */}
        <header className="w-full h-16 bg-white border-b border-gray-100 flex items-center justify-between px-5 flex-shrink-0 z-10">
          {/* Right: Logo + Temp + Time */}
          <div className="flex items-center gap-4">
            <div className="w-px h-4 bg-gray-100" />
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>درجة الحرارة</span>
              <span className="font-semibold text-[#ea580c]">31°C</span>
              <span>☀️</span>
            </div>
            <div className="w-px h-4 bg-gray-100" />
            <div className="text-sm text-gray-400">
              آخر تحديث: <span className="font-medium text-gray-600">{new Date().toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>

          {/* Left: Irrigation mode + alerts + user */}
        
          <div className="flex items-center gap-3">
          {/* Alert */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" />
            حرارة مرتفعة
          </div>

          {/* Connected sensors */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]">
           <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
           3 حساسات متصلة
          </div>


            {/* Irrigation toggle */}
          <div className="flex items-center border border-gray-200 rounded-2xl overflow-hidden bg-gray-50" style={{width: '110px'}}>
           <button
             onClick={() => setMode("auto")}
             className={`flex-1 py-1 text-center text-xs font-medium transition-all ${
               mode === "auto"
               ? "bg-[#16a34a] text-white rounded-2xl mx-0.5 my-0.5"
               : "text-gray-400"
             }`}
           >
             تلقائي
           </button>
           <button
             onClick={() => setMode("manual")}
             className={`flex-1 py-1 text-center text-xs font-medium transition-all ${
               mode === "manual"
               ? "bg-[#ef4444] text-white rounded-2xl mx-0.5 my-0.5"
               : "text-gray-400"
             }`}
           >
             يدوي
           </button>
          </div>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-s text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M6 20c0-4 3-6 6-6s6 2 6 6"/>
                  </svg>
                </div>
                منصور الزهراني
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {showUserMenu && (
               <div className="absolute left-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                 <button onClick={() => { go("profile"); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 text-right">
                   👤 الحساب الشخصي
                 </button>
                 <button onClick={() => { go("settings"); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 text-right border-t border-gray-50">
                   ⚙️ الإعدادات
                 </button>
                 <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 text-right border-t border-gray-50">
                   🚪 تسجيل الخروج
                 </button>
               </div>
            )}
          </div>
        </div>
      </header>

        {/* ================= Body ================= */}
        <main className="flex-1 min-h-0">
          {page === "dashboard" ? (
            <DashboardHome onGo={go} onSendAI={sendToAI} />
          ) : page === "recs" ? (
            <RecommendationsPage onBack={() => go("dashboard")} />
          ) : page === "irrigation" ? (
            <IrrigationPage onBack={() => go("dashboard")} />
          ) : page === "temp" ? (
            <TemperaturePage onBack={() => go("dashboard")} />
          ) : page === "airHumidity" ? (
            <AirHumidityPage onBack={() => go("dashboard")} />
          ) : page === "soilMoisture" ? (
            <SoilMoisturePage onBack={() => go("dashboard")} />
          ) : page === "profile" ? (
            <AccountAndSettingsPages initialPage="profile" />
          ) : page === "settings" ? (
            <AccountAndSettingsPages initialPage="settings" />
          ) : (
            <PlaceholderPage page={page} onBack={() => go("dashboard")} />
          )}
        </main>

    {/* Chatbot FAB */}
    <button
      onClick={() => setShowChat(!showChat)}
      className="fixed bottom-6 left-6 w-20 h-20 bg-[#16a34a] rounded-full flex items-center justify-center shadow-lg hover:bg-[#15803d] transition-all z-50"
    >
      {showChat ? (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      ) : (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      )}
    </button>

    {showChat && (
      <div className="fixed bottom-20 left-6 w-72 h-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50">
        <div className="bg-[#16a34a] px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-lg">🤖</div>
          <div>
            <div className="text-white font-semibold text-sm">مساعد وارِف</div>
            <div className="text-white/70 text-xs">يساعد في الاستفسارات والخدمات الزراعية
</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-gray-50">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#16a34a] text-white rounded-bl-sm"
                  : "bg-white text-gray-700 border border-gray-100 rounded-br-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="px-3 py-2 flex gap-1.5 flex-wrap border-t border-gray-100 bg-white">
          {["كيف حال المحمية؟", "متى الري القادم؟", "ما التوصيات؟"].map(q => (
            <button key={q} onClick={() => sendToAI(q)}
              className="text-[10px] px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-[#f0fdf4] hover:text-[#16a34a] transition-all">
              {q}
            </button>
          ))}
        </div>
        <div className="px-3 py-2 flex gap-2 border-t border-gray-100 bg-white">
          <input value={chatInput} onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && chatInput.trim()) { sendToAI(chatInput); setChatInput(""); }}}
            placeholder="اسألني عن محميتك..."
            className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#16a34a] bg-gray-50"
          />
          <button onClick={() => { if (chatInput.trim()) { sendToAI(chatInput); setChatInput(""); }}}
            className="w-8 h-8 bg-[#16a34a] rounded-lg flex items-center justify-center hover:bg-[#15803d]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    )}
    </div>
  </div>
  
  );
}

/* =========================================================
   Dashboard Layout (matches screenshot)
========================================================= */
function DashboardHome({ onGo , onSendAI }) {
  return (
    <div className="w-full h-full flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-l border-gray-100 flex flex-col flex-shrink-0 h-full">
      
      {/* Logo */}
      <div className="py-0 flex flex-col items-center justify-center gap-2">
       <img src="/logo.png" alt="وارِف" className="w-40 h-40 object-contain" />
      </div>


        {/* المحميات */}
        <div className="p-3 border-b border-gray-50">
          <div className="text-s text-gray-400 font-semibold mb-2 px-1">المحميات</div>

          {["محمية الخضروات", "محمية الفواكه", "محمية الورقيات"].map((farm, i) => (
            <div key={farm} className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-sm mb-0.5 transition-all ${
              i === 0 ? "bg-[#f0fdf4] text-[#16a34a] font-medium" : "text-gray-500 hover:bg-gray-50"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i === 0 ? "bg-[#16a34a]" : "bg-gray-300"}`} />
              {farm}
            </div>
          ))}
        </div>

        {/* القائمة */}
        <div className="p-3 flex-1">
          <div className="text-s text-gray-400 font-semibold mb-2 px-1">القائمة</div>
          {[
            { label: "لوحة التحكم", icon: "🏠", active: true },
            { label: "التوصيات", icon: "📋", badge: "2" },
            { label: "الري", icon: "💧" },
          ].map((item) => (
            <div key={item.label} className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-sm mb-0.5 transition-all ${
              item.active ? "bg-[#f0fdf4] text-[#16a34a] font-medium" : "text-gray-500 hover:bg-gray-50"
            }`}>
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-[#fff7ed] text-[#ea580c] text-[9px] px-1.5 py-0.5 rounded-full font-medium">{item.badge}</span>
              )}
            </div>
          ))}
        </div>

        {/* الطقس */}
        <div className="p-3 border-t border-gray-50">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 mb-1">☀️ مكة المكرمة</div>
            <div className="text-base font-semibold text-gray-800">33°م</div>
            <div className="text-xs text-gray-400 mt-0.5">مشمس — رطوبة 45%</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 h-full overflow-auto p-5 flex flex-col gap-4 min-h-0">
        <div className="grid grid-cols-3 gap-4">
          <TemperatureCard onGo={onGo} />
          <AirHumidityCard onGo={onGo} />
          <SoilMoistureCard onGo={onGo} />
        </div>
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <RecommendationsCard onGo={onGo} />
          <IrrigationCard onGo={onGo} />
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
      className={`bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all ${className}`}
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
        <div className="text-[20px] font-semibold text-gray-800">{title}</div>
        {subtitle && <div className="text-sl text-gray-400 mt-1">{subtitle}</div>}
      </div>
      <button
        type="button"
        onClick={onDetails}
        className="text-xs text-[#16a34a] bg-[#f0fdf4] px-2.5 py-1 rounded-lg hover:bg-[#dcfce7] transition-all shrink-0 font-medium"
      >
        {detailsLabel} ←
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
            <span className="text-3xl font-semibold">{value}</span>
            <span className="text-s">%</span>
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
            <span className="text-3xl font-semibold">{value}</span>
            <span className="text-s">%</span>
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
            <span className="text-3xl font-semibold">{value}</span>
            <span className="text-xl">°C</span>
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
    <CardShell className="p-4">
      <CardTopRow
        title="حالة الري اليوم"
        subtitle="آخر تحديث: قبل 10 دقائق"
        onDetails={() => onGo("irrigation")}
      />

      <div className="mt-5 flex items-center justify-center">
        <Donut value={percent} />
      </div>

      <div className="mt-2 text-center text-[12px] text-gray-700">
        معدل الري
      </div>

      <div className="mt-3">
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full bg-[#EF6C00]" style={{ width: barWidth }} />
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
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
    <CardShell className="p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-800">التوصيات</div>
          <div className="text-[11px] text-gray-500 mt-1">
            أحدث التوصيات المقترحة
          </div>
        </div>

        <button
          type="button"
          onClick={() => onGo("recs")}
          className="text-[11px] text-[#2E7D32] underline hover:text-[#1B5E20]"
        >
          عرض الكل
        </button>
      </div>

      {/* Recommendations list (2 فقط) */}
      <div className="mt-4 flex flex-col gap-3">
        {latest.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 border border-gray-100 rounded-2xl px-3 py-3"
          >
            <div className="text-[12px] text-gray-700">{item.text}</div>

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
            <div className="text-lg font-semibold text-gray-800">{title}</div>
            <div className="text-[11px] text-gray-500 mt-1">
              Placeholder — سيتم تصميم الصفحة وربطها لاحقًا.
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowLeftIcon />
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
  const size = 74;
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
    `px-3 py-2 rounded-xl text-xs border transition ${
      filter === key
        ? "bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20] font-semibold"
        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <div className="w-full h-full p-6 overflow-auto" dir="rtl">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-800">التوصيات</div>
            <div className="text-[11px] text-gray-500 mt-1">
              جميع التوصيات المقترحة
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowLeftIcon />
            رجوع
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-700">عرض حسب:</div>
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
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-sm text-gray-700 text-right">
              لا توجد توصيات ضمن هذا التصنيف حاليًا.
            </div>
          ) : (
            filteredItems.map((it, idx) => (
              <div
                key={it.id}
                className={`p-4 flex items-center justify-between gap-3 ${
                  idx !== filteredItems.length - 1
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
                      <div className="text-sm font-semibold text-gray-800">
                        {it.title}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] border ${badgeClass(
                          it.tone
                        )}`}
                      >
                        {it.meta}
                      </span>
                    </div>

                    {/* بدل truncate */}
                    <div className="text-[12px] text-gray-600 mt-1">
                      {it.desc}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-700 hover:bg-gray-50 shrink-0"
                  onClick={() => {
                    // لاحقًا: افتحي صفحة/نافذة تفاصيل للتوصية
                  }}
                >
                  تفاصيل
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-[#2E7D32] text-white text-sm hover:bg-[#1B5E20]"
            onClick={() => {}}
          >
            تصدير / مشاركة
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Irrigation Page (Safe Version - no name collisions)
========================================================= */

function IrrigationPage({ onBack }) {
  const months = useMemo(
    () => [
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
    ],
    []
  );

  const [month, setMonth] = useState(new Date().getMonth());
  const [activeAction, setActiveAction] = useState("تشغيل الري الآن");

  const series = useMemo(() => {
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
  }, [month]);

  const current = series[series.length - 1]?.value ?? 0;

  return (
    <div className="w-full h-full p-6 overflow-auto" dir="rtl">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-800">
              تفاصيل حالة الري
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              متابعة الاستخدام اليومي + إجراءات سريعة
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <IrrigationArrowLeftIcon />
            رجوع
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <IrrigationCardShell className="p-5">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                معدل الري اليوم
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                آخر تحديث: قبل 10 دقائق
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <IrrigationDonut value={Math.round(current)} />
            </div>
            <div className="mt-2 text-center text-[12px] text-gray-700">
              معدل الري % {Math.round(current)}
            </div>{" "}
          </IrrigationCardShell>

          <IrrigationCardShell className="p-5">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">التحكم </div>
              <div className="text-[11px] text-gray-500 mt-1"></div>
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
          </IrrigationCardShell>

          <IrrigationCardShell className="p-5">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                التوصيات
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                مقترحات حسب القراءة
              </div>
            </div>

            <div className="mt-4 w-full text-right" dir="rtl">
              <ul className="list-disc list-inside text-sm text-gray-700 leading-6">
                <li>
                  معدل الري اليوم ضمن النطاق المتوسط، يُنصح بالاستمرار على
                  إعدادات الري الحالية.
                </li>
              </ul>
            </div>
          </IrrigationCardShell>
        </div>

        <IrrigationCardShell className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                الرسم البياني الشهري
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                يوضح الرسم نسبة استخدام الري خلال أيام الشهر.
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-start">
              {months.map((m, idx) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonth(idx)}
                  className={`px-3 py-2 rounded-xl text-xs border transition ${
                    idx === month
                      ? "bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20] font-semibold"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <IrrigationBarChart2D
              data={series}
              yLabel="نسبة الاستخدام"
              unit="%"
            />
          </div>
        </IrrigationCardShell>
      </div>
    </div>
  );
}

function IrrigationCardShell({ children, className = "" }) {
  return (
    <section
      className={`bg-white rounded-2xl shadow border border-gray-200 ${className}`}
    >
      {children}
    </section>
  );
}

function IrrigationActionButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-2xl border text-sm text-right transition ${
        active
          ? "bg-[#2E7D32] text-white border-[#2E7D32]"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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

function IrrigationArrowLeftIcon() {
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
      <path d="M15 18l-6-6 6-6" />
    </svg>
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

function SensorTopBar({ title, subtitle, icon, onBack }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] flex items-center justify-center">
          {icon}
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-800">{title}</div>
          <div className="text-[11px] text-gray-500">{subtitle}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="px-3 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <ArrowLeftIcon />
        رجوع
      </button>
    </div>
  );
}

function SensorPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs border transition ${
        active
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
      className={`w-full px-4 py-2 rounded-xl border text-sm text-right transition ${
        active
          ? "bg-[#2E7D32] text-white border-[#2E7D32]"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function SensorSecondaryButton({ children, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-4 py-2 rounded-xl border text-sm text-right transition ${
        active
          ? "bg-[#2E7D32] text-white border-[#2E7D32]"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function SensorBarChart2D({ data, yLabel, unit }) {
  const pad = 36;
  const h = 260;

  const n = data.length;

  // عرض الرسم يعتمد على عدد الأعمدة (بدون حد أدنى) لتفادي السكرول
  const barW = 10;
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
      {/* ✅ توسيط الرسم بدون سكرول */}
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
      </div>

      {/* ✅ Legend تحت الرسم بالمنتصف */}
      <div className="mt-3 text-center text-[11px] text-gray-500">
        الألوان تعبّر عن مستوى الرطوبة.
      </div>

      <div className="mt-2 w-full flex justify-center" dir="rtl">
        <div className="flex items-center gap-4 text-[11px] text-gray-600">
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="w-3 h-3 rounded-sm bg-[#2E7D32]" />
            <span>منخفض</span>
          </div>

          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="w-3 h-3 rounded-sm bg-[#FBC02D]" />
            <span>متوسط</span>
          </div>

          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="w-3 h-3 rounded-sm bg-[#EF6C00]" />
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
    <div className="w-full h-full p-6 overflow-auto" dir="rtl">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
        <SensorTopBar
          title="درجة الحرارة"
          subtitle="عرض القراءة الحالية + رسم بياني شهري + تحكم"
          icon={<TempSunIcon />}
          onBack={onBack}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                القراءة الحالية
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                آخر تحديث: قبل 5 دقائق
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
              <div className="text-sm font-semibold text-gray-800">التحكم</div>
              <div className="text-[11px] text-gray-500 mt-1">
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

              <SensorSecondaryButton
                active={activeAction === "vent"}
                onClick={() => setActiveAction("vent")}
              >
                التحكم بالتهوية
              </SensorSecondaryButton>
            </div>
          </CardShell>

          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                التوصيات
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
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
              <div className="text-sm font-semibold text-gray-800">
                الرسم البياني الشهري
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
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
            <SensorBarChart2D data={series} yLabel="درجة الحرارة" unit="°C" />
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
    <div className="w-full h-full p-6 overflow-auto" dir="rtl">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
        <SensorTopBar
          title="رطوبة الهواء"
          subtitle="عرض القراءة الحالية + رسم بياني شهري + تحكم"
          icon={<AirHumidityIcon />}
          onBack={onBack}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                القراءة الحالية
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                آخر تحديث: قبل 5 دقائق
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
              <div className="text-sm font-semibold text-gray-800">التحكم</div>
              <div className="text-[11px] text-gray-500 mt-1">
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

              <SensorSecondaryButton
                active={activeAction === "vent"}
                onClick={() => setActiveAction("vent")}
              >
                التحكم بالتهوية
              </SensorSecondaryButton>
            </div>
          </CardShell>

          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                التوصيات
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
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
              <div className="text-sm font-semibold text-gray-800">
                الرسم البياني الشهري
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
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
            <SensorBarChart2D data={series} yLabel="نسبة الرطوبة" unit="%" />
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
    <div className="w-full h-full p-6 overflow-auto" dir="rtl">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
        <SensorTopBar
          title=" التربة"
          subtitle="حرارة التربة + رطوبة التربة (رسمين 2D)"
          icon={<SoilDropIcon />}
          onBack={onBack}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                القراءة الحالية
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
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
              <div className="text-sm font-semibold text-gray-800">التحكم</div>
              <div className="text-[11px] text-gray-500 mt-1">
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
              <div className="text-sm font-semibold text-gray-800">
                التوصيات
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
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
              <div className="text-sm font-semibold text-gray-800">
                تحليل شهري
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
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
                <div className="text-sm font-semibold text-gray-800">
                  حرارة التربة
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  يوضح الرسم حرارة التربة خلال أيام الشهر.
                </div>
              </div>
              <div className="mt-3">
                <SensorBarChart2D
                  data={soilTempSeries}
                  yLabel="حرارة التربة"
                  unit="°C"
                />
              </div>
            </CardShell>

            <CardShell className="p-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  رطوبة التربة
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  يوضح الرسم رطوبة التربة خلال أيام الشهر.
                </div>
              </div>
              <div className="mt-3">
                <SensorBarChart2D
                  data={soilMoistSeries}
                  yLabel="رطوبة التربة"
                  unit="%"
                />
              </div>
            </CardShell>
          </div>
        </CardShell>
      </div>
    </div>
  );
}

/* =========================================================
   Account + Settings (Integrated as-is; only added initialPage prop)
========================================================= */

function AccountAndSettingsPages({ initialPage = "profile" }) {
  const [page, setPage] = useState("dashboard");
  const go = (to) => setPage(to);

  const [profile, setProfile] = useState({
    username: "منصور",
    email: "alssayed@example.com",
    password: "********",
  });

  const [editingField, setEditingField] = useState(null); // "username" | "email" | "password" | null
  const [draftValue, setDraftValue] = useState("");

  const [language, setLanguage] = useState("ar"); // "ar" | "en"

  const [sensors, setSensors] = useState([
    { id: "S1", name: "حساس التربة", type: "رطوبة التربة" },
    { id: "S2", name: "حساس الحرارة", type: "درجة الحرارة" },
    { id: "S3", name: "حساس الرطوبة", type: "رطوبة الهواء" },
  ]);

  const [sensorModal, setSensorModal] = useState({
    open: false,
    mode: "add", // "add" | "edit"
    id: null,
    name: "",
    type: "",
  });

  const dir = language === "ar" ? "rtl" : "ltr";

  const t = useMemo(() => {
    const ar = {
      app: "وارِف",
      profile: "الحساب الشخصي",
      settings: "الإعدادات",
      back: "رجوع",
      save: "حفظ",
      cancel: "إلغاء",
      edit: "تعديل",
      updated: "تم التحديث",
      username: "اسم المستخدم",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      language: "اللغة",
      arabic: "عربي",
      english: "English",
      sensors: "الحساسات",
      addSensor: "إضافة حساس",
      sensorName: "اسم الحساس",
      sensorType: "نوع الحساس",
      delete: "حذف",
      userGuide: "دليل المستخدم",
      logout: "تسجيل الخروج",
      confirmDelete: "هل تريد حذف هذا الحساس؟",
      openGuide: "فتح الدليل",
      actionDone: "تم",
    };

    const en = {
      app: "WARIF",
      profile: "Profile",
      settings: "Settings",
      back: "Back",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      updated: "Updated",
      username: "Username",
      email: "Email",
      password: "Password",
      language: "Language",
      arabic: "Arabic",
      english: "English",
      sensors: "Sensors",
      addSensor: "Add Sensor",
      sensorName: "Sensor Name",
      sensorType: "Sensor Type",
      delete: "Delete",
      userGuide: "User Guide",
      logout: "Log out",
      confirmDelete: "Delete this sensor?",
      openGuide: "Open Guide",
      actionDone: "Done",
    };

    return language === "ar" ? ar : en;
  }, [language]);

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
    setProfile((p) => ({
      ...p,
      [editingField]: draftValue || p[editingField],
    }));
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

    if (sensorModal.mode === "add") {
      const newId = `S${Math.floor(Math.random() * 9000 + 1000)}`;
      setSensors((arr) => [{ id: newId, name, type }, ...arr]);
    } else {
      setSensors((arr) =>
        arr.map((s) => (s.id === sensorModal.id ? { ...s, name, type } : s))
      );
    }

    closeSensorModal();
  }

  function deleteSensor(id) {
    const ok = confirm(t.confirmDelete);
    if (!ok) return;
    setSensors((arr) => arr.filter((s) => s.id !== id));
  }

  return (
    <div
      className="relative w-full h-full bg-[#F7F7F4] font-['IBM_Plex_Sans_Arabic']"
      dir={dir}
    >
      <header className="w-full h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex flex-col leading-tight"></div>
        </div>

        <div className="flex items-center gap-2 bg-[#F1F5F1] rounded-xl p-1">
          <button
            type="button"
            onClick={() => setPage("profile")}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              page === "profile"
                ? "bg-white shadow text-[#1B5E20] font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {t.profile}
          </button>
          <button
            type="button"
            onClick={() => setPage("settings")}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              page === "settings"
                ? "bg-white shadow text-[#1B5E20] font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {t.settings}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-gray-600">{t.language}:</span>
          <button
            type="button"
            onClick={() => setLanguage("ar")}
            className={`px-3 py-1 rounded-lg text-xs border transition ${
              language === "ar"
                ? "bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20]"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.arabic}
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 rounded-lg text-xs border transition ${
              language === "en"
                ? "bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20]"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.english}
          </button>
        </div>
      </header>

      <main className="w-full h-[calc(100%-80px)] p-6 overflow-auto">
        {page === "profile" ? (
          <Account_ProfilePage t={t} profile={profile} onEdit={openEdit} />
        ) : (
          <Account_SettingsPage
            t={t}
            language={language}
            setLanguage={setLanguage}
            sensors={sensors}
            onAddSensor={openAddSensor}
            onEditSensor={openEditSensor}
            onDeleteSensor={deleteSensor}
          />
        )}
      </main>

      {editingField && (
        <Account_ModalShell onClose={closeEdit}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[420px] max-w-[92vw] p-5 text-right">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-gray-800">
                {t.edit}:{" "}
                {editingField === "username"
                  ? t.username
                  : editingField === "email"
                  ? t.email
                  : t.password}
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✕
              </button>
            </div>

            <label className="block text-xs text-gray-600 mb-2">
              {editingField === "username"
                ? t.username
                : editingField === "email"
                ? t.email
                : t.password}
            </label>
            <input
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              type={editingField === "password" ? "password" : "text"}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#43A047]"
              placeholder=""
            />

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={closeEdit}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="px-4 py-2 rounded-xl bg-[#2E7D32] text-white text-sm hover:bg-[#1B5E20]"
              >
                {t.save}
              </button>
            </div>
          </div>
        </Account_ModalShell>
      )}

      {sensorModal.open && (
        <Account_ModalShell onClose={closeSensorModal}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[460px] max-w-[92vw] p-5 text-right">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-gray-800">
                {sensorModal.mode === "add"
                  ? t.addSensor
                  : `${t.edit}: ${t.sensors}`}
              </div>
              <button
                type="button"
                onClick={closeSensorModal}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  {t.sensorName}
                </label>
                <input
                  value={sensorModal.name}
                  onChange={(e) =>
                    setSensorModal((m) => ({
                      ...m,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                  placeholder={t.sensorName}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  {t.sensorType}
                </label>
                <input
                  value={sensorModal.type}
                  onChange={(e) =>
                    setSensorModal((m) => ({
                      ...m,
                      type: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                  placeholder={t.sensorType}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={closeSensorModal}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={saveSensorModal}
                className="px-4 py-2 rounded-xl bg-[#2E7D32] text-white text-sm hover:bg-[#1B5E20]"
              >
                {t.save}
              </button>
            </div>
          </div>
        </Account_ModalShell>
      )}
    </div>
  );
}

function Account_ProfilePage({ t, profile, onEdit }) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 gap-4">
        <Account_Card>
          <Account_CardHeader title={t.profile} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Account_EditableField
              label={t.username}
              value={profile.username}
              onEdit={() => onEdit("username")}
            />
            <Account_EditableField
              label={t.email}
              value={profile.email}
              onEdit={() => onEdit("email")}
            />
            <Account_EditableField
              label={t.password}
              value={profile.password}
              onEdit={() => onEdit("password")}
              mono
            />
          </div>
        </Account_Card>
      </div>
    </div>
  );
}

function Account_SettingsPage({
  t,
  sensors,
  onAddSensor,
  onEditSensor,
  onDeleteSensor,
}) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 gap-4">
        <Account_Card>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-gray-800 text-right">
                {t.sensors}
              </div>
              <div className="text-[11px] text-gray-500">
                إدارة الحساسات المرتبطة بالمحمية (تعديل، حذف، إضافة).
              </div>
            </div>

            <button
              type="button"
              onClick={onAddSensor}
              className="px-3 py-2 rounded-xl bg-[#2E7D32] text-white text-sm hover:bg-[#1B5E20] flex items-center gap-2"
            >
              <Account_PlusIcon />
              {t.addSensor}
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {sensors.map((s) => (
              <div
                key={s.id}
                className="border border-gray-200 rounded-xl px-3 py-3 bg-white flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                    <Account_SensorIcon />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium text-gray-800">
                      {s.name}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {s.type} • {s.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Account_IconButton
                    title={t.edit}
                    onClick={() => onEditSensor(s)}
                  >
                    <Account_PencilIcon />
                  </Account_IconButton>
                  <Account_IconButton
                    title={t.delete}
                    danger
                    onClick={() => onDeleteSensor(s.id)}
                  >
                    <Account_TrashIcon />
                  </Account_IconButton>
                </div>
              </div>
            ))}
          </div>
        </Account_Card>

        <Account_Card>
          <Account_CardHeader title={t.settings} subtitle="" />
          <div className="flex flex-col gap-2">
            <Account_ListRow
              title={t.userGuide}
              subtitle="شرح استخدام لوحة التحكم، التنبيهات، والاختصارات."
              right={
                <button className="px-3 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
                  {t.openGuide}
                </button>
              }
            />
            <Account_ListRow
              title={t.logout}
              subtitle="إنهاء الجلسة الحالية بأمان."
              right={
                <button className="px-3 py-2 rounded-xl bg-[#c62828] text-white text-sm hover:opacity-95">
                  {t.logout}
                </button>
              }
            />
          </div>
        </Account_Card>
      </div>
    </div>
  );
}

function Account_Card({ children }) {
  return (
    <section className="bg-white rounded-2xl shadow border border-gray-200 p-5">
      {children}
    </section>
  );
}

function Account_CardHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <div className="text-sm font-semibold text-gray-800 text-right">
        {title}
      </div>
      {subtitle ? (
        <div className="text-[11px] text-gray-500 mt-1">{subtitle}</div>
      ) : null}
    </div>
  );
}

function Account_EditableField({ label, value, onEdit, mono }) {
  return (
    <div className="border border-gray-200 rounded-2xl p-4 bg-white flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 text-right">{label}</span>
        <span
          className={`text-sm text-gray-800 mt-1 ${mono ? "font-mono" : ""}`}
        >
          {value}
        </span>
      </div>

      <Account_IconButton title="تعديل" onClick={onEdit}>
        <Account_PencilIcon />
      </Account_IconButton>
    </div>
  );
}

function Account_ListRow({ title, subtitle, right }) {
  return (
    <div className="border border-gray-200 rounded-2xl p-4 bg-white flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-800 text-right">
          {title}
        </span>
        <span className="text-[11px] text-gray-500 mt-1">{subtitle}</span>
      </div>
      {right}
    </div>
  );
}

function Account_IconButton({ children, title, onClick, danger }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${
        danger
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
      <path d="M15 18l-6-6 6-6" />
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

