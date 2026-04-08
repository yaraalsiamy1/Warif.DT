import { useMemo, useState } from 'react';
import { SensorTopBar, CardShell, SensorPill, SensorPrimaryButton } from './dashboardShared';
import { SensorBarChart2D } from './dashboardCharts';
import { sensorDaysInMonth, sensorGenerateLineSeries, sensorIsFutureMonth, sensorBuildRecommendationsTemperature, sensorBuildRecommendationsHumidity, sensorBuildRecommendationsSoil } from './dashboardUtils';

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

