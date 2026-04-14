import { useMemo, useState, useEffect } from 'react';
import { SensorTopBar, CardShell, IrrigationSmartIcon } from './dashboardShared';
import { IrrigationActionButton, IrrigationDonut, SustainabilityLineChart } from './dashboardCharts';
import { generateDataForRange, formatLastUpdated, getLiveFarmData } from './dashboardUtils';

export function IrrigationPage({ onBack, globalAutoMode, activeFarm }) {
  const [seconds, setSeconds] = useState(0);

  const lang = (window.localStorage.getItem('warif_user') && JSON.parse(window.localStorage.getItem('warif_user')).language) || 'ar';
  const isEn = lang === 'en';
  const isRtl = !isEn;

  const T = {
    title: isEn ? "Irrigation Management" : "إدارة الري",
    subtitle: isEn ? "Smart water and energy management via real-time analysis." : "إدارة ذكية لموارد المياه والطاقة عبر التحليل اللحظي لبيئة المحمية.",
    flowRate: isEn ? "Live Flow Rate" : "معدل التدفق اللحظي",
    latestRecs: isEn ? "Smart Recommendations" : "أحدث التوصيات الذكية",
    realTime: isEn ? "Real-time" : "تحليل فوري",
    dssSub: isEn ? "Justification for current irrigation decisions." : "تبريرات اتخاذ القرار الحالي للري",
    why: isEn ? "Why?" : "لماذا؟",
    rec1Title: isEn ? "Irrigation Within Optimal Range" : "معدل الري ضمن النطاق المثالي",
    rec1Desc: isEn ? "Continue current settings based on stable soil moisture." : "يُنصح بالاستمرار على الإعدادات الحالية بناءً على رطوبة التربة المستقرة.",
    rec2Title: isEn ? "Avoid Peak-Hour Manual Irrigation" : "تجنب الري اليدوي وقت الذروة",
    rec2Desc: isEn ? "Reduce evaporation loss under thermal restriction (12–15)." : "تقليل الفاقد بالتبخر وتحت تأثير الحظر الحراري (12–15).",
    flowManagement: isEn ? "Water Flow Control" : "إدارة تدفق المياه",
    controlSub: isEn ? "Direct manual control of pumps." : "تحكم يدوي مباشر بالمضخات",
    autoActive: isEn ? "Automation system schedules irrigation based on actual soil needs." : "نظام الأتمتة يقوم بجدولة الري بناءً على حاجة التربة الفعلية.",
    startManual: isEn ? "Start Manual Irrigation" : "بدء الري اليدوي الآن",
    stopAll: isEn ? "Stop All Valves" : "إيقاف كافة المحابس",
    flushNetwork: isEn ? "Flush Drip Network" : "غسيل شبكة التنقيط",
    totalDailyWater: isEn ? "Total Daily Water Usage" : "إجمالي الاستهلاك اليومي",
    totalDailyPower: isEn ? "Daily Power Consumption" : "الاستهلاك اليومي للكهرباء",
    dailyWaterSub: isEn ? "Cumulative water draw since start of day" : "سحب المياه التراكمي منذ بداية اليوم",
    dailyPowerSub: isEn ? "Total energy draw since start of day" : "إجمالي سحب الطاقة منذ بداية اليوم",
    fromYesterday: isEn ? "from yesterday" : "من أمس",
    liters: isEn ? "Liters" : "لتر",
    kwh: isEn ? "kWh" : "كيلوواط",
    trendTitle: isEn ? "Unified Resource Consumption Analysis" : "تحليل استهلاك الموارد الموحد",
    timeX: isEn ? "Time" : "الوقت",
    usageY: isEn ? "Resource Usage Rate (%)" : "معدل استهلاك الموارد (٪)",
    lastUpdateAr: "آخر تحديث",
    lastUpdateEn: "Last Update",
  };

  useEffect(() => {
    setSeconds(0);
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeFarm]);

  const [range, setRange] = useState("M");
  const [activeAction, setActiveAction] = useState("");
  const data = getLiveFarmData(activeFarm);

  const dualSeries = useMemo(() => {
    const raw = generateDataForRange(range, { 
      base: 55, 
      amp: 18, 
      noise: 14, 
      min: 10, 
      max: 95, 
      seed: 42 + range.length,
      farmIndex: activeFarm
    });
    return raw.map((pt, i) => ({
      ...pt,
      water: pt.value,
      power: Math.max(10, Math.min(95, pt.value * (0.8 + Math.sin(i)*0.2)))
    }));
  }, [range, activeFarm]);

  const currentFlow = data.flowRate;
  const lastUpdateLabel = formatLastUpdated(seconds, T.lastUpdateAr, T.lastUpdateEn);

  return (
    <div className="w-full h-full px-8 py-5 overflow-auto page-enter" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-[1150px] mx-auto flex flex-col gap-5">

        <SensorTopBar
          title={T.title}
          subtitle={T.subtitle}
          icon={<IrrigationSmartIcon />}
          onBack={onBack}
          onExport={() => {
            const dateStr = new Date().toLocaleDateString(isEn ? 'en-US' : 'ar-SA');
            const csvPrefix = isEn ? "Resource Consumption Report\nPower,Water,Date\n" : "\ufeffتقرير استهلاك الموارد\nطاقة,مياه,التاريخ\n";
            const csv = csvPrefix + "100,200," + dateStr;
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", isEn ? `irrigation_report_${dateStr}.csv` : `تقرير_الري_${dateStr}.csv`);
            link.click();
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardShell className="p-6">
            <div className={isEn ? 'text-left' : 'text-right'}>
              <div className="text-lg font-bold text-gray-800 tracking-tight">{T.flowRate}</div>
              <div className="text-[12px] text-gray-400 mt-0.5 font-medium">{lastUpdateLabel}</div>
            </div>
            <div className="mt-8 flex items-center justify-center">
              <IrrigationDonut value={Math.round(currentFlow)} />
            </div>
            <div className="mt-6 text-center text-[11px] font-black text-emerald-700 bg-emerald-50 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-tighter">
              {isEn ? `Flow Rate ${Math.round(currentFlow)}%` : `معدل التدفق ${Math.round(currentFlow)}٪`}
            </div>
          </CardShell>

          <CardShell className="p-6">
            <div className={isEn ? 'text-left' : 'text-right'}>
              <div className={`text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2 ${isEn ? 'flex-row-reverse' : ''}`}>
                {T.latestRecs} 
                <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full border border-emerald-100">{T.realTime}</span>
              </div>
              <div className="text-[12px] text-gray-400 mt-0.5 font-medium">{T.dssSub}</div>
            </div>
            <ul className={`mt-6 text-[14px] text-gray-700 flex flex-col gap-4 font-medium leading-relaxed ${isEn ? 'text-left' : 'text-right'}`}>
              <li className={`flex flex-col gap-1 ${isEn ? 'pl-2 border-l-2' : 'pr-2 border-r-2'} border-emerald-500`}>
                 <div className="text-gray-800 font-bold text-[14px]">{T.rec1Title}</div>
                 <div className="text-[11px] text-gray-500 bg-gray-50/80 px-2 py-1 rounded-lg border border-dashed border-gray-200 mt-1">
                   <span className="font-black text-emerald-700 mx-1">{T.why}</span> {T.rec1Desc}
                 </div>
              </li>
              <li className={`flex flex-col gap-1 ${isEn ? 'pl-2 border-l-2' : 'pr-2 border-r-2'} border-emerald-100`}>
                 <div className="text-gray-800 font-bold text-[14px]">{T.rec2Title}</div>
                 <div className="text-[11px] text-gray-500 bg-gray-50/80 px-2 py-1 rounded-lg border border-dashed border-gray-200 mt-1">
                   <span className="font-black text-emerald-700 mx-1">{T.why}</span> {T.rec2Desc}
                 </div>
              </li>
            </ul>
          </CardShell>

          <CardShell className="p-6">
            <div className={isEn ? 'text-left' : 'text-right'}>
              <div className="text-lg font-bold text-gray-800 tracking-tight">{T.flowManagement}</div>
              <div className="text-[12px] text-gray-400 mt-0.5 font-medium mb-5">{T.controlSub}</div>
            </div>

            {globalAutoMode ? (
              <div className="mt-6 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-6 text-center shadow-inner h-full flex items-center justify-center">
                <div className="text-emerald-800 font-black text-[14px] leading-relaxed">{T.autoActive}</div>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-3">
                <IrrigationActionButton 
                  active={activeAction === "irrigate"} 
                  onClick={() => setActiveAction("irrigate")}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
                >
                  {T.startManual}
                </IrrigationActionButton>
                
                <IrrigationActionButton 
                  active={activeAction === "stop"} 
                  onClick={() => setActiveAction("stop")}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>}
                >
                  {T.stopAll}
                </IrrigationActionButton>
                
                <IrrigationActionButton 
                  active={activeAction === "flush"} 
                  onClick={() => setActiveAction("flush")}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>}
                >
                  {T.flushNetwork}
                </IrrigationActionButton>
              </div>
            )}
          </CardShell>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <CardShell className="p-6 relative overflow-hidden bg-white border border-gray-100/50">
            <div className={`flex items-center justify-between mb-4 ${isEn ? 'flex-row-reverse' : ''}`}>
              <div className={isEn ? 'text-left' : 'text-right'}>
                <div className="text-lg font-bold text-gray-800 tracking-tight">{T.totalDailyWater}</div>
                <div className="text-[12px] text-gray-400 font-medium mt-0.5">{T.dailyWaterSub}</div>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              </div>
            </div>
            <div className={`flex items-center justify-between ${isEn ? 'flex-row-reverse' : ''}`}>
               <div className={`text-4xl font-black text-blue-600 tracking-tight ${isEn ? 'flex flex-row-reverse items-baseline gap-1' : ''}`}>
                 {data.waterUsage} <span className="text-sm font-bold text-gray-400 tracking-normal">{T.liters}</span>
               </div>
               <div className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 shadow-sm">{isEn ? `-12% ${T.fromYesterday}` : `-١٢٪ ${T.fromYesterday}`}</div>
            </div>
            <div className="mt-6 h-2 w-full bg-blue-50 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 rounded-full w-[45%]" />
            </div>
          </CardShell>

          <CardShell className="p-6 relative overflow-hidden bg-white border border-gray-100/50">
            <div className={`flex items-center justify-between mb-4 ${isEn ? 'flex-row-reverse' : ''}`}>
              <div className={isEn ? 'text-left' : 'text-right'}>
                <div className="text-lg font-bold text-gray-800 tracking-tight">{T.totalDailyPower}</div>
                <div className="text-[12px] text-gray-400 font-medium mt-0.5">{T.dailyPowerSub}</div>
              </div>
              <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center border border-yellow-100/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
            </div>
            <div className={`flex items-center justify-between ${isEn ? 'flex-row-reverse' : ''}`}>
               <div className={`text-4xl font-black text-yellow-600 tracking-tight ${isEn ? 'flex flex-row-reverse items-baseline gap-1' : ''}`}>
                 {data.powerUsage} <span className="text-sm font-bold text-gray-400 tracking-normal">{T.kwh}</span>
               </div>
               <div className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 shadow-sm">{isEn ? `-5% ${T.fromYesterday}` : `-٥٪ ${T.fromYesterday}`}</div>
            </div>
            <div className="mt-6 h-2 w-full bg-yellow-50 rounded-full overflow-hidden">
               <div className="h-full bg-yellow-500 rounded-full w-[60%]" />
            </div>
          </CardShell>
        </div>

        <div className="animate-fade-in-up delay-4 mb-4">
           <SustainabilityLineChart 
             range={range} 
             onRangeChange={setRange} 
             data={dualSeries} 
             metricName={T.trendTitle}
             xAxisTitle={T.timeX}
             yAxisTitle={T.usageY}
           />
        </div>
      </div>
    </div>
  );
}
