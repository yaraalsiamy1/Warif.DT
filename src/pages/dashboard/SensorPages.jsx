import { useMemo, useState } from 'react';
import { SensorTopBar, CardShell, SensorPill, SensorPrimaryButton, TempSunIcon, AirHumidityIcon, SoilDropIcon, GaugeIcon, DropBadgeIcon, AutomationToggleCard } from './dashboardShared';
import { SensorBarChart2D, IrrigationActionButton } from './dashboardCharts';
import { sensorDaysInMonth, sensorGenerateLineSeries, sensorIsFutureMonth, sensorMakeMonthOptionsAr, sensorGetUpdateText, sensorBuildRecommendationsTemperature, sensorBuildRecommendationsHumidity, sensorBuildRecommendationsSoil } from './dashboardUtils';

/* =========================================================
   1. Microclimate Module (المناخ الدقيق)
   Combines Temperature and Humidity, adds AI Heat Stress Prediction
========================================================= */
export function MicroclimatePage({ onBack, globalAutoMode }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const months = sensorMakeMonthOptionsAr();
  const [activeAction, setActiveAction] = useState("");

  // Temperature Data
  const tempSeries = useMemo(() => {
    const y = new Date().getFullYear();
    const d = sensorDaysInMonth(y, month);
    return sensorGenerateLineSeries({ days: d, base: 28 + (month % 3) * 1.2, amp: 4.5, noise: 3.2, min: 14, max: 42, seed: 11 + month * 3 });
  }, [month]);
  
  // Humidity Data
  const humSeries = useMemo(() => {
    const y = new Date().getFullYear();
    const d = sensorDaysInMonth(y, month);
    return sensorGenerateLineSeries({ days: d, base: 55 + (month % 4) * 2.0, amp: 10, noise: 9, min: 15, max: 95, seed: 21 + month * 2 });
  }, [month]);

  const currentTemp = tempSeries[tempSeries.length - 1]?.value ?? 0;
  const currentHum = humSeries[humSeries.length - 1]?.value ?? 0;

  // AI Generated Insights (Mocked based on current values)
  const heatStressRisk = currentTemp > 35 ? "مرتفع (خطر الإجهاد الحراري)" : currentTemp > 30 ? "متوسط (يحتاج مراقبة)" : "منخفض (النطاق المثالي)";
  const heatStressColor = currentTemp > 35 ? "text-red-500" : currentTemp > 30 ? "text-orange-500" : "text-green-600";

  return (
    <div className="w-full h-full p-6 overflow-auto page-enter" dir="rtl">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6">
        <SensorTopBar
          title="وحدة المناخ الدقيق (Microclimate Module)"
          subtitle="تحليل ذكي لدرجات الحرارة ورطوبة الهواء المحيط بالمحاصيل مع التنبؤ بالإجهاد الحراري"
          icon={<TempSunIcon />}
          onBack={onBack}
          onExport={() => alert('جاري تصدير تقرير المناخ الدقيق...')}
        />

        {/* AI Insight Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             </div>
             <div>
               <div className="text-[14px] font-bold text-gray-800">التشخيص الذكي للحالة المناخية (AI Diagnosis)</div>
               <div className="text-[12px] text-gray-500 mt-0.5">لم يتم اكتشاف شذوذ في تيارات الهواء. معدل التبخر ضمن الحد الطبيعي.</div>
             </div>
           </div>
           <div className="text-left bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
             <div className="text-[11px] font-bold text-gray-500">تقييم الإجهاد الحراري للمحصول</div>
             <div className={`text-[14px] font-black mt-0.5 ${heatStressColor}`}>{heatStressRisk}</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Current Readings */}
          <CardShell className="p-5 flex flex-col justify-between">
            <div>
              <div className="text-[16px] font-bold text-gray-800">العقد الحساسة (IoT Nodes)</div>
              <div className="text-[13px] text-gray-500 mt-1">{sensorGetUpdateText(month)}</div>
            </div>
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"><GaugeIcon /></div>
                  <div><div className="text-[12px] text-gray-500 font-bold">حرارة الهواء</div><div className="text-xl font-black text-gray-800">{currentTemp}<span className="text-sm">°C</span></div></div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><DropBadgeIcon /></div>
                  <div><div className="text-[12px] text-gray-500 font-bold">رطوبة الهواء</div><div className="text-xl font-black text-gray-800">{currentHum}<span className="text-sm">%</span></div></div>
                </div>
              </div>
            </div>
          </CardShell>

          {/* AI Decision Recommendations */}
          <CardShell className="p-5">
            <div className="text-[16px] font-bold text-gray-800 flex items-center gap-2">التوصيات المناخية <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full">AI</span></div>
            <div className="text-[13px] text-gray-500 mt-1">إجراءات مقترحة للحفاظ على المناخ الدقيق للمحصول</div>
            <ul className="mt-5 text-[14px] text-gray-700 list-disc pr-5 flex flex-col gap-3 font-medium">
              {[...sensorBuildRecommendationsTemperature(currentTemp).slice(0,2), ...sensorBuildRecommendationsHumidity(currentHum).slice(0,1)].map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </CardShell>

          {/* Control center */}
          <CardShell className="p-5">
            <div className="text-[16px] font-bold text-gray-800">التحكم في مناخ المزرعة</div>
            <div className="text-[13px] text-gray-500 mt-1 mb-4">يعتمد على حالة الأتمتة المركزية</div>

            {globalAutoMode ? (
              <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 text-center text-[13px] text-green-700 font-medium h-full flex items-center justify-center">
                النظام يدار تلقائياً الآن بأعلى كفاءة بناءً على الذكاء الاصطناعي، جميع أزرار التحكم اليدوي مقفلة لحفظ استقرار المحمية.
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <SensorPrimaryButton active={activeAction === "cooling"} onClick={() => setActiveAction("cooling")}>
                  تشغيل مراوح التبريد قسرياً
                </SensorPrimaryButton>
                <SensorPrimaryButton active={activeAction === "vent"} onClick={() => setActiveAction("vent")}>
                  فتح نوافذ التهوية
                </SensorPrimaryButton>
              </div>
            )}
          </CardShell>

        </div>

        {/* Charts */}
        <CardShell className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
               <div className="text-[16px] font-bold text-gray-800">تحليل الميول المناخية (Trends Analysis)</div>
               <div className="text-[13px] text-gray-500 mt-1">تتبع التغيرات في الحرارة والرطوبة خلال الشهر</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-start">
              {months.map((m, idx) => (
                <SensorPill key={m} label={m} active={idx === month} onClick={() => setMonth(idx)} />
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
               <div className="text-[14px] font-bold text-gray-700 mb-4">مسار درجة الحرارة</div>
               {sensorIsFutureMonth(month) ? (
                 <div className="flex items-center justify-center h-48 text-gray-400 text-sm">بيانات غير متوفرة بعد</div>
               ) : (
                 <SensorBarChart2D data={tempSeries} yLabel="درجة الحرارة" unit="°C" />
               )}
            </div>
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
               <div className="text-[14px] font-bold text-gray-700 mb-4">مسار رطوبة الهواء</div>
               {sensorIsFutureMonth(month) ? (
                 <div className="flex items-center justify-center h-48 text-gray-400 text-sm">بيانات غير متوفرة بعد</div>
               ) : (
                 <SensorBarChart2D data={humSeries} yLabel="نسبة الرطوبة" unit="%" />
               )}
            </div>
          </div>
        </CardShell>

      </div>
    </div>
  );
}


/* =========================================================
   2. Soil & Crop Health Module (صحة التربة والمحصول)
   Combines Soil metrics and AI disease/anomaly detection
========================================================= */
export function SoilCropHealthPage({ onBack, globalAutoMode }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const months = sensorMakeMonthOptionsAr();
  const [activeAction, setActiveAction] = useState("");

  const soilTempSeries = useMemo(() => sensorGenerateLineSeries({ days: sensorDaysInMonth(new Date().getFullYear(), month), base: 26, amp: 3.5, noise: 1.8, min: 18, max: 35, seed: 31 + month }), [month]);
  const soilMoistSeries = useMemo(() => sensorGenerateLineSeries({ days: sensorDaysInMonth(new Date().getFullYear(), month), base: 42, amp: 10, noise: 4, min: 20, max: 60, seed: 41 + month * 4 }), [month]);

  const soilTemp = soilTempSeries[soilTempSeries.length - 1]?.value ?? 0;
  const soilMoist = soilMoistSeries[soilMoistSeries.length - 1]?.value ?? 0;

  // AI Generated Insights (Mocked)
  const cropHealthStatus = soilMoist > 25 && soilMoist < 55 ? "ممتازة (لا يوجد أمراض جذرية محتملة)" : "منخفضة (تم رصد إجهاد مائي قد يسبب تعفن الجذور)";
  const cropHealthColor = soilMoist > 25 && soilMoist < 55 ? "text-[#2E7D32]" : "text-red-500";

  return (
    <div className="w-full h-full p-6 overflow-auto page-enter" dir="rtl">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6">
        <SensorTopBar
          title="وحدة الجذور والمحصول (Soil & Crop Health Module)"
          subtitle="مراقبة حيوية التربة وتقييم صحة المحصول باستخدام تقنيات التعرف المبكر على الأمراض"
          icon={<SoilDropIcon />}
          onBack={onBack}
          onExport={() => alert('جاري تصدير تقرير صحة التربة والمحصول...')}
        />

        {/* AI Insight Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
             </div>
             <div>
               <div className="text-[14px] font-bold text-gray-800">مراقب صحة المحصول (Crop Vitality AI)</div>
               <div className="text-[12px] text-gray-500 mt-0.5">يعتمد على تحليل الرطوبة العميقة وحرارة التربة للتنبؤ بصحة الجذور وتفادي الآفات.</div>
             </div>
           </div>
           <div className="text-left bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
             <div className="text-[11px] font-bold text-gray-500">الحالة الطبية للمحصول الآن</div>
             <div className={`text-[14px] font-black mt-0.5 ${cropHealthColor}`}>{cropHealthStatus}</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          <CardShell className="p-5">
            <div className="text-[16px] font-bold text-gray-800">قياسات التربة العميقة</div>
            <div className="text-[13px] text-gray-500 mt-1">تحديث مباشر من العقد الحساسة</div>
            <div className="mt-5 flex flex-col gap-4">
              <div className="flex items-center justify-between bg-[#fafafa] p-3 rounded-xl border border-gray-100 text-center">
                <span className="text-sm font-semibold text-gray-600">حرارة التربة</span>
                <span className="text-xl font-bold text-[#1B5E20]">{soilTemp}°C</span>
              </div>
              <div className="flex items-center justify-between bg-[#fafafa] p-3 rounded-xl border border-gray-100 text-center">
                <span className="text-sm font-semibold text-gray-600">رطوبة التربة</span>
                <span className="text-xl font-bold text-[#1B5E20]">{soilMoist}%</span>
              </div>
            </div>
          </CardShell>

          <CardShell className="p-5">
            <div className="text-[16px] font-bold text-gray-800 flex items-center gap-2">توصيات توأم التربة <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full">AI DETECTED</span></div>
            <div className="text-[13px] text-gray-500 mt-1">انحرافات وشذوذ في بنية التربة (Anomalies)</div>
            <ul className="mt-5 text-[14px] text-gray-700 list-disc pr-5 flex flex-col gap-3 font-medium">
              {sensorBuildRecommendationsSoil(soilTemp, soilMoist).slice(0, 3).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </CardShell>

          <CardShell className="p-5 text-right">
             <div className="text-[16px] font-bold text-gray-800">حماية التربة وإدارة الري</div>
             <div className="text-[13px] text-gray-500 mt-1 mb-4">يعتمد على حالة الأتمتة المركزية</div>

             {globalAutoMode ? (
               <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 text-center text-[13px] text-green-700 font-medium h-full flex items-center justify-center">
                 خوارزمية حماية الجذور نشطة. سيتم الري فقط عند نزول الرطوبة عن الحد الحرج.
               </div>
             ) : (
               <div className="mt-4 flex flex-col gap-3">
                <SensorPrimaryButton active={activeAction === "irrigate_now"} onClick={() => setActiveAction("irrigate_now")}>
                  ضخ مياه طارئ لتلطيف التربة
                </SensorPrimaryButton>
                <SensorPrimaryButton active={activeAction === "schedule"} onClick={() => setActiveAction("schedule")}>
                  تعديل الجدولة اليدوية
                </SensorPrimaryButton>
               </div>
             )}
          </CardShell>

        </div>

        <CardShell className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
               <div className="text-[16px] font-bold text-gray-800">السجل الحيوي للتربة (Vitality Log)</div>
               <div className="text-[13px] text-gray-500 mt-1">رصد تغيرات المعايير المؤثرة بالإنتاجية.</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-start">
              {months.map((m, idx) => (
                <SensorPill key={m} label={m} active={idx === month} onClick={() => setMonth(idx)} />
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
               <div className="text-[14px] font-bold text-gray-700 mb-4">أنماط حرارة التربة</div>
               {sensorIsFutureMonth(month) ? (
                 <div className="flex items-center justify-center h-48 text-gray-400 text-sm">بيانات غير متوفرة بعد</div>
               ) : (
                 <SensorBarChart2D data={soilTempSeries} yLabel="حرارة التربة" unit="°C" />
               )}
            </div>
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
               <div className="text-[14px] font-bold text-gray-700 mb-4">أنماط رطوبة التربة المكتشفة</div>
               {sensorIsFutureMonth(month) ? (
                 <div className="flex items-center justify-center h-48 text-gray-400 text-sm">بيانات غير متوفرة بعد</div>
               ) : (
                 <SensorBarChart2D data={soilMoistSeries} yLabel="رطوبة التربة" unit="%" />
               )}
            </div>
          </div>
        </CardShell>

      </div>
    </div>
  );
}
