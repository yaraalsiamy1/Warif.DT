import { useState, useMemo } from 'react';
import { 
  SensorTopBar, 
  CardShell, 
  TempSunIcon, 
  AirHumidityIcon, 
  SoilDropIcon, 
  SensorPill, 
  SensorPrimaryButton 
} from './dashboardShared';
import { HealthStyleBarChart } from './dashboardCharts';
import { 
  generateDataForRange, 
  sensorBuildRecommendationsTemperature, 
  sensorBuildRecommendationsHumidity, 
  sensorBuildRecommendationsSoil 
} from './dashboardUtils';

/* =========================================================
   1. Microclimate Module (مناخ المحمية)
   Combines Temp and Humidity metrics
========================================================= */
export function MicroclimatePage({ onBack, globalAutoMode }) {
  const [range, setRange] = useState("W");
  const [activeAction, setActiveAction] = useState("");

  const tempSeries = useMemo(() => generateDataForRange(range, { base: 28, amp: 8, noise: 3, min: 10, max: 45, seed: 42 }), [range]);
  const humSeries = useMemo(() => generateDataForRange(range, { base: 55, amp: 12, noise: 5, min: 20, max: 95, seed: 101 }), [range]);

  const currentTemp = 28.4;
  const currentHum = 56;

  return (
    <div className="w-full h-full p-5 overflow-auto page-enter" dir="rtl">
      <div className="w-full max-w-[1150px] mx-auto flex flex-col gap-4">
        
        <SensorTopBar
          title="المناخ والتهوية"
          subtitle="مراقبة لحظية لدرجة الحرارة والرطوبة داخل المحمية مع تحكم آلي بأنظمة التبريد."
          icon={<TempSunIcon />}
          onBack={onBack}
          onExport={() => {
            const dateStr = new Date().toLocaleDateString('ar-SA');
            const titleRow = "تقرير المناخ والتهوية الشامل - نظام وارِف";
            const periodRow = `تاريخ التصدير: ${dateStr}`;
            const headers = ["التوقيت", "حرارة الهواء (°C)", "رطوبة الهواء (%)"].join(",");
            const rows = tempSeries.map((d, i) => `${d.label},${d.value},${humSeries[i]?.value || ''}`).join("\n");
            const csv = "\ufeff" + titleRow + "\n" + periodRow + "\n\n" + headers + "\n" + rows;
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `تقرير_المناخ_الشامل_${dateStr}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          <CardShell className="p-5">
            <div className="text-[16px] font-bold text-gray-800">القراءات اللحظية</div>
            <div className="text-[13px] text-gray-400 mt-1">قراءات الحساسات الموزعة</div>
            <div className="mt-6 flex flex-col gap-4">
               <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-500">الحرارة</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-800">{currentTemp}</span>
                    <span className="text-[12px] font-bold text-gray-400">°C</span>
                  </div>
               </div>
               <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-500">الرطوبة</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-800">{currentHum}</span>
                    <span className="text-[12px] font-bold text-gray-400">%</span>
                  </div>
               </div>
            </div>
          </CardShell>

          <CardShell className="p-5">
            <div className="text-[16px] font-bold text-gray-800 flex items-center gap-2">أحدث التوصيات الذكية <span className="bg-emerald-50 text-[#10b981] text-[10px] px-2 py-0.5 rounded-full border border-emerald-100">تحليل فوري</span></div>
            <div className="text-[13px] text-gray-400 mt-1">بناءً على قراءات الحساسات الحالية</div>
            <ul className="mt-6 text-[14px] text-gray-700 list-disc pr-5 flex flex-col gap-3 font-medium leading-relaxed">
              {[...sensorBuildRecommendationsTemperature(currentTemp).slice(0,2), ...sensorBuildRecommendationsHumidity(currentHum).slice(0,1)].map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </CardShell>

          <CardShell className="p-5">
            <div className="text-[16px] font-bold text-gray-800">إدارة التبريد والتهوية</div>
            <div className="text-[13px] text-gray-400 mt-1">التحكم اليدوي والآلي</div>
            {globalAutoMode ? (
              <div className="mt-6 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-5 text-center shadow-inner">
                <div className="text-[#15803d] font-black text-[15px]">الأتمتة الذكية نشطة</div>
                <div className="text-[#16a34a] text-[12px] mt-2 font-medium">يقوم النظام بضبط المراوح والتهوية تلقائياً للحفاظ على توازن المناخ داخل المحمية.</div>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-3">
                <SensorPrimaryButton active={activeAction === "fans"} onClick={() => setActiveAction("fans")}>تشغيل المراوح المركزية</SensorPrimaryButton>
                <SensorPrimaryButton active={activeAction === "ac"} onClick={() => setActiveAction("ac")}>تشغيل نظام التبريد الصحراوي</SensorPrimaryButton>
                <SensorPrimaryButton active={activeAction === "vent"} onClick={() => setActiveAction("vent")}>فتح نوافذ التهوية الجانبية</SensorPrimaryButton>
              </div>
            )}
          </CardShell>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-12">
            <HealthStyleBarChart 
              range={range}
              onRangeChange={setRange}
              data={tempSeries}
              unit="°C"
              metricName="حرارة الهواء"
              xAxisTitle="الوقت"
              yAxisTitle="الدرجة °C"
            />
            <HealthStyleBarChart 
              range={range}
              onRangeChange={setRange}
              data={humSeries}
              unit="%"
              metricName="رطوبة الهواء"
              xAxisTitle="الوقت"
              yAxisTitle="النسبة %"
            />
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   2. Soil & Root Data Module (وحدة بيانات التربة والجذور)
========================================================= */
export function SoilRootDataPage({ onBack, globalAutoMode }) {
  const [range, setRange] = useState("M");
  const [activeAction, setActiveAction] = useState("");

  const soilTempSeries = useMemo(() => generateDataForRange(range, { base: 24, amp: 5, noise: 2.5, min: 10, max: 40, seed: 90 }), [range]);
  const soilMoistSeries = useMemo(() => generateDataForRange(range, { base: 42, amp: 10, noise: 4, min: 10, max: 95, seed: 80 }), [range]);

  const soilTemp = 24.5;
  const soilMoist = 42;

  const soilStatus = soilMoist > 25 && soilMoist < 55 ? "مثالية (رطوبة متوازنة للجذور)" : "تحتاج انتباه (تذبذب في مستويات الرطوبة)";
  const soilStatusColor = soilMoist > 25 && soilMoist < 55 ? "text-[#10b981]" : "text-red-500";

  return (
    <div className="w-full h-full p-5 overflow-auto page-enter" dir="rtl">
      <div className="w-full max-w-[1150px] mx-auto flex flex-col gap-5">
        <SensorTopBar
          title="بيانات التربة والري"
          subtitle="تحليل رطوبة وحرارة التربة لضمان استقرار نمو الجذور وكفاءة الامتصاص المائي بالمحمية."
          icon={<SoilDropIcon />}
          onBack={onBack}
          onExport={() => {
            const dateStr = new Date().toLocaleDateString('ar-SA');
            const titleRow = "تقرير بيانات التربة والري الشامل - نظام وارِف";
            const periodRow = `تاريخ التصدير: ${dateStr}`;
            const headers = ["التوقيت", "رطوبة التربة (%)", "حرارة التربة (°C)"].join(",");
            const rows = soilMoistSeries.map((d, i) => `${d.label},${d.value},${soilTempSeries[i]?.value || ''}`).join("\n");
            const csv = "\ufeff" + titleRow + "\n" + periodRow + "\n\n" + headers + "\n" + rows;
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `تقرير_التربة_الشامل_${dateStr}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        />

        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
             </div>
             <div>
              <div className="text-[14px] font-bold text-gray-800">التحليل الرقمي للتربة</div>
              <div className="text-[12px] text-gray-500 mt-0.5">تحليل مستمر لمستويات الرطوبة العميقة لضمان توازن العناصر الغذائية.</div>
             </div>
           </div>
           <div className="text-left bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
             <div className="text-[11px] font-bold text-gray-500 text-right">توزان بيئة الجذور</div>
             <div className={`text-[14px] font-black mt-0.5 text-right ${soilStatusColor}`}>{soilStatus}</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CardShell className="p-5">
            <div className="text-[16px] font-bold text-gray-800">قراءات التربة</div>
            <div className="text-[13px] text-gray-400 mt-1">تحديث مباشر من العقد الحساسة</div>
            <div className="mt-5 flex flex-col gap-4">
              <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <span className="text-sm font-bold text-gray-500">حرارة التربة</span>
                <span className="text-xl font-black text-gray-800">{soilTemp}°C</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <span className="text-sm font-bold text-gray-500">رطوبة التربة</span>
                <span className="text-xl font-black text-gray-800">{soilMoist}%</span>
              </div>
            </div>
          </CardShell>

          <CardShell className="p-5">
            <div className="text-[16px] font-bold text-gray-800 flex items-center gap-2">أحدث التوصيات الذكية <span className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-full border border-green-100">ذكاء اصطناعي</span></div>
            <div className="text-[13px] text-gray-400 mt-1">تنبيهات استباقية بناءً على حالة التربة</div>
            <ul className="mt-5 text-[14px] text-gray-700 list-disc pr-5 flex flex-col gap-3 font-medium leading-relaxed">
              {sensorBuildRecommendationsSoil(soilTemp, soilMoist).slice(0, 3).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </CardShell>

          <CardShell className="p-5 text-right">
             <div className="text-[16px] font-bold text-gray-800">إدارة الري</div>
             <div className="text-[13px] text-gray-400 mt-1 mb-4">يعتمد على حالة الأتمتة المركزية</div>
             {globalAutoMode ? (
               <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center shadow-inner h-full flex items-center justify-center">
                 <div className="text-green-700 text-[13px] font-black">خوارزمية حماية الجذور نشطة. سيتم الري فقط عند الحاجة القصوى.</div>
               </div>
             ) : (
               <div className="mt-4 flex flex-col gap-3">
                <SensorPrimaryButton active={activeAction === "irrigate_now"} onClick={() => setActiveAction("irrigate_now")}>بدء ري طوارئ</SensorPrimaryButton>
                <SensorPrimaryButton active={activeAction === "schedule"} onClick={() => setActiveAction("schedule")}>تعديل الجدولة اليدوية</SensorPrimaryButton>
               </div>
             )}
          </CardShell>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-12">
           <HealthStyleBarChart 
              range={range}
              onRangeChange={setRange}
              data={soilMoistSeries}
              unit="%"
              metricName="رطوبة التربة"
              xAxisTitle="الوقت"
              yAxisTitle="النسبة %"
           />
           <HealthStyleBarChart 
              range={range}
              onRangeChange={setRange}
              data={soilTempSeries}
              unit="°C"
              metricName="حرارة التربة"
              xAxisTitle="الوقت"
              yAxisTitle="الدرجة °C"
           />
        </div>
      </div>
    </div>
  );
}
