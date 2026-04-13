import { useMemo, useState } from 'react';
import { SensorTopBar, CardShell } from './dashboardShared';
import { IrrigationActionButton, IrrigationDonut } from './dashboardCharts';
import { 
  irrigationDaysInMonth, 
  generateIrrigationUsageSeries,
  generateDataForRange
} from './dashboardUtils';
import { HealthStyleBarChart } from './dashboardCharts';

export function IrrigationPage({ onBack, globalAutoMode }) {
  const [range, setRange] = useState("M");
  const [activeAction, setActiveAction] = useState("");

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

  const series = useMemo(() => {
    return generateDataForRange(range, { 
      base: 55, 
      amp: 18, 
      noise: 14, 
      min: 10, 
      max: 95, 
      seed: 42 + range.length 
    });
  }, [range]);

  const current = 62.4;
  const lastUpdateLabel = "آخر تحديث: قبل 10 دقائق";

  return (
    <div className="w-full h-full p-5 overflow-auto page-enter" dir="rtl">
      <div className="w-full max-w-[1150px] mx-auto flex flex-col gap-4">

        <OpenSensorTopBarSection />

        <SensorTopBar
          title="إدارة الموارد المائية"
          subtitle="إدارة ذكية لموارد المياه والطاقة لضمان استدامة الري بالمحمية عبر تقنيات التوأم الرقمي."
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>}
          onBack={onBack}
          onExport={() => {
            const dateStr = new Date().toLocaleDateString('ar-SA');
            const titleRow = "تقرير الموارد المائية الشامل - نظام وارِف";
            const periodRow = `تاريخ التصدير: ${dateStr}`;
            const headers = ["التوقيت", "معدل الاستهلاك (%)"].join(",");
            const rows = series.map((d) => `${d.label},${d.value}`).join("\n");
            const csv = "\ufeff" + titleRow + "\n" + periodRow + "\n\n" + headers + "\n" + rows;
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `تقرير_الموارد_المائية_${dateStr}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        />

        {/* Stats row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-bold text-gray-800">معدل الري اليومي</div>
              <div className="text-[13px] text-gray-400 mt-1">{lastUpdateLabel}</div>
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
              <div className="text-[16px] font-bold text-gray-800">إدارة تدفق المياه</div>
              <div className="text-[13px] text-gray-400 mt-1 mb-4">يعتمد على حالة الأتمتة المركزية</div>
            </div>

            {globalAutoMode ? (
              <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 text-center text-[13px] text-green-700 font-medium h-full flex flex-col items-center justify-center shadow-sm">
                النظام يتحكم بالري تلقائياً الآن لضمان كفاءة الاستهلاك. تم إيقاف التحكم اليدوي مؤقتاً.
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <IrrigationActionButton label="تشغيل مضخة المياه" active={activeAction === "start"} onClick={() => setActiveAction("start")} />
                <IrrigationActionButton label="إيقاف كامل للمضخات" active={activeAction === "stop"} onClick={() => setActiveAction("stop")} />
              </div>
            )}
          </CardShell>

          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-bold text-gray-800">أحدث التوصيات الذكية</div>
              <div className="text-[13px] text-gray-400 mt-1">تبريرات اتخاذ القرار الحالي للري</div>
            </div>
            <ul className="mt-4 list-disc list-inside text-[13px] text-gray-700 font-medium leading-7 text-right">
              <li>معدل الري ضمن النطاق المثالي، يُنصح بالاستمرار على الإعدادات الحالية.</li>
              <li>يرجى تجنب الري اليدوي خلال فترة الحظر الحراري (12–15).</li>
            </ul>
          </CardShell>
        </div>

        {/* Detailed Resource Economics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CardShell className="p-5 relative overflow-hidden bg-white border border-gray-100/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[16px] font-bold text-gray-800">استهلاك المياه (لتر)</div>
                <div className="text-[12px] text-gray-500 mt-0.5">مقارنة كفاءة التوأم الرقمي بالري التقليدي</div>
              </div>
              <div className="w-10 h-10 bg-emerald-50 text-[#10b981] rounded-xl flex items-center justify-center border border-emerald-100/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              </div>
            </div>
            <div className="flex items-end gap-5 mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-[13px] mb-1.5">
                  <span className="font-bold text-gray-700">النظام الذكي (الحالي)</span>
                  <span className="font-black text-[#10b981]">4,500 لتر</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-l from-[#10b981] to-[#6EE7B7] rounded-full w-[45%] shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                </div>
              </div>
            </div>
            <div className="flex items-end gap-5">
              <div className="flex-1">
                <div className="flex items-center justify-between text-[13px] mb-1.5">
                  <span className="font-bold text-gray-400">الزراعة التقليدية</span>
                  <span className="font-black text-gray-400">10,000 لتر</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-300 rounded-full w-[100%]" />
                </div>
              </div>
            </div>
          </CardShell>

          <CardShell className="p-5 relative overflow-hidden bg-white border border-gray-100/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[16px] font-bold text-gray-800">استهلاك الكهرباء (كيلوواط)</div>
                <div className="text-[12px] text-gray-500 mt-0.5">تتبع سحب الطاقة والتحكم في كفاءة المحركات</div>
              </div>
              <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center border border-yellow-100/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
            </div>
            <div className="flex items-end gap-5 mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-[13px] mb-1.5">
                  <span className="font-bold text-gray-700">النظام الذكي (الحالي)</span>
                  <span className="font-black text-yellow-600">320 كيلوواط</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-l from-yellow-500 to-yellow-400 rounded-full w-[60%] shadow-[0_0_8px_rgba(234,179,8,0.3)]" />
                </div>
              </div>
            </div>
            <div className="flex items-end gap-5">
              <div className="flex-1">
                <div className="flex items-center justify-between text-[13px] mb-1.5">
                  <span className="font-bold text-gray-400">مستوى الاستهلاك المعتاد</span>
                  <span className="font-black text-gray-400">550 كيلوواط</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-300 rounded-full w-[100%]" />
                </div>
              </div>
            </div>
          </CardShell>
        </div>

        {/* Unified Manual Settings (Visible only in Manual Mode) */}
        {!globalAutoMode && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CardShell className="p-5">
              <div className="text-right mb-5">
                <div className="text-[16px] font-semibold text-gray-800">جدولة الري اليدوي</div>
                <div className="text-[13px] text-gray-500 mt-0.5">تحديد أوقات الري الثابتة عند إيقاف الأتمتة</div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="border border-gray-100 rounded-xl p-4 bg-[#fafafa]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-800">ري الصباح</div>
                    <button type="button" onClick={() => setMorningEnabled(v => !v)} className={`w-11 h-6 rounded-full relative transition-all duration-300 ${morningEnabled ? 'bg-[#2E7D32]' : 'bg-gray-300'}`}><span className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow transition-all duration-300 ${morningEnabled ? 'right-1' : 'left-1'}`} /></button>
                  </div>
                  {morningEnabled && <input type="time" value={morningTime} onChange={e => setMorningTime(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white" />}
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-[#fafafa]">
                  <div className="text-sm font-semibold text-gray-800 mb-2">مدة الري</div>
                  <div className="flex gap-2 flex-wrap">
                    {[15,30,60].map(min => (
                      <button key={min} type="button" onClick={() => setDuration(min)} className={`px-2.5 py-1 rounded-lg border text-xs ${duration === min ? 'bg-[#E8F5E9] border-[#2E7D32]' : 'bg-white border-gray-100'}`}>{min} دقيقة</button>
                    ))}
                  </div>
                </div>
              </div>
            </CardShell>

            <CardShell className="p-5">
              <div className="text-right mb-5">
                <div className="text-[16px] font-bold text-gray-800">القيود التشغيلية اليدوية</div>
                <div className="text-[13px] text-gray-400 mt-0.5">حدود الرطوبة والوقت التي يلتزم بها النظام كحماية إضافية</div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="border border-gray-100 rounded-xl p-4 bg-[#fafafa]">
                   <div className="text-sm font-semibold text-gray-800 mb-1">نطاق الرطوبة (الحد الأدنى)</div>
                   <div className="flex gap-2 mt-2">
                     {[25, 30, 35].map(v => (
                       <button key={v} onClick={() => setMoistureMin(v)} className={`px-3 py-1 rounded-lg border shadow-sm transition-all duration-300 ${moistureMin === v ? 'bg-[#E8F5E9] border-[#2E7D32] scale-105' : 'bg-white'}`}>{v}%</button>
                     ))}
                   </div>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-[#fafafa]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-gray-800">فترة الحظر الحراري</div>
                    <button type="button" onClick={() => setRestrictedEnabled(v => !v)} className={`w-11 h-6 rounded-full relative transition-all duration-300 ${restrictedEnabled ? 'bg-[#2E7D32]' : 'bg-gray-300'}`}><span className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow transition-all duration-300 ${restrictedEnabled ? 'right-1' : 'left-1'}`} /></button>
                  </div>
                </div>
              </div>
            </CardShell>
          </div>
        )}

        <div className="pb-12">
            <HealthStyleBarChart 
              range={range}
              onRangeChange={setRange}
              data={series}
              unit="%"
              metricName="معدل استخدام الري"
              xAxisTitle="الوقت"
              yAxisTitle="الاستهلاك %"
            />
        </div>
      </div>
    </div>
  );
}

function OpenSensorTopBarSection() {
    return null; // Helper to maintain structure
}
