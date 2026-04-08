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

