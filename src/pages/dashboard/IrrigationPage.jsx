import { useMemo, useState } from 'react';
import { SensorTopBar, CardShell } from './dashboardShared';
import { IrrigationActionButton, IrrigationDonut, IrrigationBarChart2D } from './dashboardCharts';
import { irrigationDaysInMonth, generateIrrigationUsageSeries } from './dashboardUtils';

export function IrrigationPage({ onBack, globalAutoMode }) {
  const MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const currentMonthIdx = new Date().getMonth();

  const [month, setMonth] = useState(currentMonthIdx);
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
          title="إدارة الري والموارد (Irrigation Module)"
          subtitle="تحكم ذكي موجه بالذكاء الاصطناعي لحساب التكلفة وتوفير المياه"
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
            <div className="text-[16px] font-semibold text-gray-800">إدارة تدفق المياه</div>
            <div className="text-[13px] text-gray-500 mt-1 mb-4">يعتمد على حالة الأتمتة المركزية</div>

            {globalAutoMode ? (
              <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 text-center text-[13px] text-green-700 font-medium h-full flex flex-col items-center justify-center shadow-sm">
                النظام يتحكم بالري تلقائياً بناءً على توقعات الطقس ورطوبة التربة الحالية. يتم إلغاء الجدولة اليدوية مؤقتاً لتوفير المياه والموارد والأسمدة.
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <IrrigationActionButton label="التضحية بالجدول والري الفوري" active={activeAction === "start"} onClick={() => setActiveAction("start")} />
                <IrrigationActionButton label="إيقاف المضخات فوراً" active={activeAction === "stop"} onClick={() => setActiveAction("stop")} />
              </div>
            )}
          </CardShell>

          <CardShell className="p-5">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">قرارات الذكاء الاصطناعي (AI Decisions)</div>
              <div className="text-[13px] text-gray-500 mt-1">تبريرات اتخاذ القرار الحالي للري</div>
            </div>
            <ul className="mt-4 list-disc list-inside text-sm text-gray-700 leading-7 text-right">
              <li>معدل الري ضمن النطاق المتوسط، يُنصح بالاستمرار على الإعدادات الحالية.</li>
              <li>تجنب الري خلال ساعات الذروة الحرارية (12–15).</li>
            </ul>
          </CardShell>
        </div>

        {/* Detailed Resource Economics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CardShell className="p-5 relative overflow-hidden bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[16px] font-bold text-gray-800">استهلاك المياه (لتر) - شهرياً</div>
                <div className="text-[12px] text-gray-500 mt-0.5">مقارنة التوأم الرقمي بالري التقليدي</div>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              </div>
            </div>
            <div className="flex items-end gap-6 mb-2">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700">النظام الذكي (الحالي)</span>
                  <span className="font-bold text-blue-600">4,500 L</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[45%]" />
                </div>
              </div>
            </div>
            <div className="flex items-end gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-500">الزراعة التقليدية (المتوقع)</span>
                  <span className="font-bold text-gray-500">10,000 L</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-400 rounded-full w-[100%]" />
                </div>
              </div>
            </div>
          </CardShell>

          <CardShell className="p-5 relative overflow-hidden bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[16px] font-bold text-gray-800">استهلاك الكهرباء بمضخات الري (kWh)</div>
                <div className="text-[12px] text-gray-500 mt-0.5">تتبع سحب الطاقة والوفر المحقق</div>
              </div>
              <div className="w-10 h-10 bg-yellow-50 text-yellow-500 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
            </div>
            <div className="flex items-end gap-6 mb-2">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700">النظام الذكي (الحالي)</span>
                  <span className="font-bold text-yellow-600">320 kWh</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full w-[60%]" />
                </div>
              </div>
            </div>
            <div className="flex items-end gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-500">منحنى الأساس (Baseline)</span>
                  <span className="font-bold text-gray-500">550 kWh</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-400 rounded-full w-[100%]" />
                </div>
              </div>
            </div>
          </CardShell>
        </div>

        {/* Auto mode: AI boundary settings */}
        {globalAutoMode === true && <CardShell className="p-5" key="ai-settings">
          <div className="text-right mb-5">
            <div className="text-[16px] font-semibold text-gray-800">حدود الري الذكي</div>
            <div className="text-[13px] text-gray-500 mt-0.5">القيود التي يلتزم بها النظام عند اتخاذ قرارات الري تلقائياً بناءً على قراءات الحساسات</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            <div className="border border-gray-100 rounded-xl p-4 bg-[#fafafa]">
              <div className="text-sm font-semibold text-gray-800 mb-1">النطاق المثالي لرطوبة التربة</div>
              <div className="text-[12px] text-gray-400 mb-3">لن يقوم النظام بالري إذا كانت الرطوبة ضمن هذا النطاق</div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[13px] text-gray-500">
                  <span className="w-8">مِن</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {[20, 25, 30, 35].map(v => (
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
        {globalAutoMode === false && <CardShell className="p-5" key="manual-settings">
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
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32]" />
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
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32]" />
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

        {/* Charts */}
        <CardShell className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="text-right">
              <div className="text-[16px] font-semibold text-gray-800">معدل الاستهلاك الشهري</div>
              <div className="text-[13px] text-gray-500 mt-1">المعدل اليومي لاستهلاك المياه بالنسبة المئوية</div>
            </div>
          </div>
          <div className="mt-4">
            {isFutureMonth ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <div className="mt-3 text-[15px] font-medium">بيانات {MONTHS[month]} غير متوفرة بعد</div>
              </div>
            ) : (
              <IrrigationBarChart2D data={series} yLabel="الاستهلاك" unit="%" />
            )}
          </div>
        </CardShell>

      </div>
    </div>
  );
}
