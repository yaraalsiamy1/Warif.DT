import { CardShell, CardTopRow, TempSunIcon, AirHumidityIcon, SoilDropIcon } from './dashboardShared';
import { Donut } from './dashboardCharts';
import { CameraCard } from './CameraCard';

export function DashboardHome({ onGo, onSendAI, globalAutoMode }) {
  return (
    <div className="w-full h-full overflow-auto p-6 min-h-0 page-enter" dir="rtl">
      <div className="w-full max-w-[1240px] mx-auto flex flex-col gap-6">

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
            <div className="text-xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
               مرحباً بك في نظام وارِف (Warif System)
            </div>
            <div className="text-[14px] font-semibold text-[#2E7D32] mt-0.5">مركز القيادة المستند على التوأم الرقمي (AI-driven Command Center)</div>
          </div>
        </div>

        {/* Top Section: Digital Twin Command Center */}
        <div className="animate-fade-in-up delay-1">
          <DigitalTwinCommandCenterCard />
        </div>

        {/* Middle Section Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
          
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
  );
}

/* =========================================================
   Glance Cards representing AI Modules
========================================================= */

function MicroclimateGlanceCard({ onGo }) {
  const temp = 31;
  const hum = 58;
  const isOptimal = temp <= 28;

  return (
    <CardShell className="p-6 cursor-pointer hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1 transition-all duration-300 group">
      <CardTopRow title="وحدة المناخ الدقيق" subtitle="الحرارة، الرطوبة، الإجهاد" onDetails={() => onGo("microclimate")} detailsLabel="الدخول للوحدة" />
      
      <div className="mt-8 flex items-center justify-between">
         <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                 <TempSunIcon />
              </div>
              <div><div className="text-[12px] text-gray-500 font-bold">حرارة الهواء</div><div className="text-2xl font-black text-gray-800">{temp}<span className="text-sm">°C</span></div></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                 <AirHumidityIcon />
              </div>
              <div><div className="text-[12px] text-gray-500 font-bold">رطوبة الهواء</div><div className="text-2xl font-black text-gray-800">{hum}<span className="text-sm">%</span></div></div>
            </div>
         </div>

         <div className="flex flex-col items-center gap-2">
            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-sm ${isOptimal ? 'border-green-400 bg-green-50 text-green-700' : 'border-orange-400 bg-orange-50 text-orange-700'}`}>
                <div className="text-center mt-1">
                   <div className="text-[11px] font-bold opacity-80 leading-tight">الإجهاد<br/>الحراري</div>
                   <div className="text-[13px] font-black">{isOptimal ? 'آمن' : 'متوسط'}</div>
                </div>
            </div>
         </div>
      </div>
    </CardShell>
  );
}

function SoilCropHealthGlanceCard({ onGo }) {
  const soilMoist = 42;
  const cropHealth = "ممتازة";

  return (
    <CardShell className="p-6 cursor-pointer hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1 transition-all duration-300 group">
      <CardTopRow title="صحة التربة والمحصول" subtitle="رطوبة الجذور والتعرف على الأمراض" onDetails={() => onGo("soil")} detailsLabel="الدخول للوحدة" />
      
      <div className="mt-8 flex items-center justify-between">
         <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                 <SoilDropIcon />
              </div>
              <div>
                <div className="text-[12px] text-gray-500 font-bold">رطوبة التربة العميقة</div>
                <div className="text-2xl font-black text-gray-800">{soilMoist}<span className="text-sm">%</span></div>
              </div>
            </div>
            
            <div className="bg-purple-50 px-3 py-2 rounded-xl border border-purple-100 flex items-center gap-2 w-max">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
               <span className="text-[12px] font-bold text-purple-800">حيوية الجذور: {cropHealth}</span>
            </div>
         </div>

         <div className="w-16 h-40 bg-gray-100 rounded-full border border-gray-200 overflow-hidden relative rotate-180 flex items-start">
             <div className="w-full bg-gradient-to-t from-blue-400 to-blue-500 transition-all duration-1000" style={{ height: `${soilMoist}%` }}></div>
         </div>
      </div>
    </CardShell>
  );
}

function IrrigationGlanceCard({ onGo, globalAutoMode }) {
  return (
    <CardShell className="p-6 cursor-pointer hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-100 opacity-50 rounded-full blur-3xl pointer-events-none" />
      
      <CardTopRow title="إدارة الري والموارد" subtitle="تدفق المياه والتوفير" onDetails={() => onGo("irrigation")} detailsLabel="الدخول للوحدة" />
      
      <div className="mt-8 flex flex-col justify-between h-full">
         <div className="flex items-center justify-between">
           <div className="text-left">
              <div className="text-[13px] font-bold text-gray-500 mb-1">الوضع اللحظي للري</div>
              <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm w-max font-bold text-[#1d4ed8] flex items-center gap-2 text-sm">
                <span className="relative flex h-2.5 w-2.5 "><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span></span>
                مغلق (التربة رطبة)
              </div>
           </div>
           
           <div className="w-20">
             <Donut value={60} />
           </div>
         </div>

         {globalAutoMode ? (
           <div className="bg-[#f0fdf4]/80 border border-[#bbf7d0]/60 rounded-xl p-3 text-center mt-6 shadow-sm">
              <div className="text-[12px] font-bold text-[#15803d] flex items-center justify-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                يعمل بنظام الأتمتة الذكية
              </div>
           </div>
         ) : (
           <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 text-center mt-6 shadow-sm group-hover:bg-gray-200 transition-colors">
              <div className="text-[12px] font-bold text-gray-700 flex items-center justify-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                التحكم اليدوي مفعل للري
              </div>
           </div>
         )}
      </div>
    </CardShell>
  );
}

function DSSGlanceCard({ onGo }) {
  const decisions = [
    { text: "تأجيل الري: الرطوبة كافية ليوم إضافي", tone: "info" },
    { text: "تبريد استباقي: توقعات بارتفاع الحرارة", tone: "alert" },
  ];
  return (
    <CardShell className="p-6 cursor-pointer hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1 transition-all duration-300 group">
      <CardTopRow title="نظام دعم القرار (DSS)" subtitle="القرارات المؤتمتة الأخيرة" onDetails={() => onGo("dss")} detailsLabel="عرض السجل" />
      
      <div className="mt-6 flex-1 flex flex-col gap-3">
        {decisions.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:bg-gray-50 transition-colors">
            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${item.tone === 'alert' ? 'bg-orange-500' : 'bg-blue-500'}`} />
            <div className="text-[13px] font-bold text-gray-700 leading-relaxed">{item.text}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
        <div className="text-[12px] font-bold text-gray-400">فحص مستمر لـ 15k نقطة بيانات/ث</div>
        <div className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[11px] font-bold">12 إجراء اليوم</div>
      </div>
    </CardShell>
  );
}

/* =========================================================
   Digital Twin Command Center Card
========================================================= */
function DigitalTwinCommandCenterCard() {
  return (
    <CardShell className="p-6 lg:p-8 relative overflow-hidden bg-white border border-gray-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      {/* Decorative background blurs for light theme - very subtle */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-green-50 opacity-60 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-50 opacity-60 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row gap-8 relative z-10 w-full">
        
        {/* Farm Spatial / Status Section */}
        <div className="w-full lg:w-[32%] flex flex-col justify-center border-l border-gray-100 pl-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50/80 rounded-full border border-green-100 text-[11px] font-bold text-[#2E7D32] mb-4 w-max shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" /> محرك التوأم الرقمي (Digital Twin Engine)
          </div>
          <h3 className="text-[26px] font-black tracking-tight mb-2 text-gray-800">النموذج الافتراضي للمزرعة</h3>
          <p className="text-[14px] text-gray-500 font-medium leading-relaxed mb-8 pr-1">
            تمثيل رقمي دقيق متصل في الوقت الفعلي مع الحساسات المادية. يُستخدم للتنبؤ المستقبلي للمحاصيل، رصد صحة الأصول، وإدارة الاستدامة والاقتصاد الزراعي.
          </p>
          
          <div className="flex items-center gap-6 mt-auto bg-gray-50/50 p-4 rounded-2xl border border-gray-100 shadow-[inset_0_1px_4px_rgba(0,0,0,0.01)]">
            <div className="flex flex-col items-center justify-center flex-1">
              <span className="text-3xl font-black text-gray-800">98%</span>
              <span className="text-[11px] text-gray-500 mt-1 font-bold">صحة النظام إجمالاً</span>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="flex flex-col items-center justify-center flex-1">
              <span className="text-3xl font-black text-[#2E7D32]">100%</span>
              <span className="text-[11px] text-gray-500 mt-1 font-bold">تزامن الحساسات</span>
            </div>
          </div>
        </div>

        {/* Holistic Multi-metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full lg:w-[68%]">
          
          {/* Predictive Crop Yield */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:border-gray-200 transition-colors duration-300">
            <div className="text-[#2E7D32] mb-4 flex items-center justify-between">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span className="text-[10px] bg-[#E8F5E9] text-[#1B5E20] px-2 py-0.5 rounded-full font-bold border border-green-200">AI PREDICTION</span>
            </div>
            <div className="text-right">
              <div className="text-[28px] font-black text-gray-800" dir="ltr">+ 12.4<span className="text-lg font-bold text-[#2E7D32] ml-0.5">%</span></div>
              <div className="text-[13px] font-bold text-gray-600 mt-1">جودة ونمو المحصول المتوقع</div>
            </div>
            <div className="mt-4 text-[11px] text-gray-400 text-right leading-loose border-t border-gray-100 pt-3 font-semibold">
               مبني على محاكاة التربة والطقس للـ 30 يوماً القادمة.
            </div>
          </div>

          {/* Asset Management */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:border-gray-200 transition-colors duration-300 flex flex-col justify-between">
            <div className="text-purple-600 mb-4 flex items-center justify-between">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold border border-purple-100">PHYSICAL ASSETS</span>
            </div>
            <div className="text-right mt-1 flex justify-between px-2">
               <div className="text-center"><div className="text-[28px] font-black text-gray-800">4</div><div className="text-[12px] text-gray-500 mt-0.5 font-bold">حساسات</div></div>
               <div className="text-center"><div className="text-[28px] font-black text-gray-800">2</div><div className="text-[12px] text-gray-500 mt-0.5 font-bold">مضخات</div></div>
               <div className="text-center"><div className="text-[28px] font-black text-gray-800">1</div><div className="text-[12px] text-gray-500 mt-0.5 font-bold">كاميرا</div></div>
            </div>
            <div className="mt-4 text-[11px] text-gray-400 text-right leading-loose border-t border-gray-100 pt-3 font-semibold">
               جميع الأصول الفيزيائية متصلة وتعمل بكفاءة تامة.
            </div>
          </div>

          {/* Resources Economics */}
          <div className="bg-gradient-to-r from-blue-50/40 to-green-50/40 border border-blue-100/50 rounded-2xl p-5 md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center justify-between w-full sm:w-auto flex-1">
               <div className="text-right border-l border-gray-200/60 pl-6 pr-2">
                 <div className="text-[12px] font-bold text-gray-500 mb-2">الاستدامة المائية والتوفير</div>
                 <div className="text-xl font-bold flex items-center gap-2 justify-end">
                   <div className="text-blue-600 font-black text-3xl">42%</div> <span className="text-[12px] text-gray-500 font-medium">مقارنة بالري العادي</span>
                 </div>
               </div>
               <div className="text-right pl-4 pr-6">
                  <div className="text-[12px] font-bold text-gray-500 mb-2">كفاءة استهلاك الطاقة</div>
                  <div className="text-xl font-bold flex items-center gap-2 justify-end">
                    <div className="text-yellow-600 font-black text-3xl">18.5%</div> <span className="text-[12px] text-gray-500 font-medium">معدل الانخفاض</span>
                  </div>
               </div>
            </div>
            <div className="shrink-0 flex gap-3 text-right items-center">
                <div className="text-[12px] font-bold text-gray-500 max-w-[120px]">الجدوى الاقتصادية مبنية على مؤشرات التوأم</div>
                <div className="flex items-center justify-center bg-white shadow-sm p-3.5 rounded-2xl border border-gray-100 text-[#2E7D32]">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                </div>
            </div>
          </div>

        </div>

      </div>
    </CardShell>
  );
}
