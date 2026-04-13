import { useMemo, useState } from 'react';
import { SensorTopBar, CardShell, TempSunIcon, AirHumidityIcon, SoilDropIcon } from './dashboardShared';

export function DecisionSupportPage({ onBack }) {
  const items = useMemo(
    () => [
      {
        id: "r0",
        type: "anomaly",
        title: "حالة الاستقرار البيئي مثالية",
        desc: "نظام الذكاء الاصطناعي يؤكد استقرار قراءات التربة والمناخ (معدل الثبات 98%).",
        meta: "الآن",
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
        tone: "ok",
      },
      {
        id: "r1",
        type: "heat",
        title: "التوصية: تبريد قسري استباقي",
        desc: "تتوقع النماذج المناخية ارتفاع الحرارة فوق النطاق المثالي خلال الساعتين القادمتين. يرجى تفعيل التبريد.",
        meta: "قبل 5 دقائق",
        icon: <TempSunIcon />,
        tone: "warning",
      },
      {
        id: "r2",
        type: "irrigation",
        title: "إجراء مؤتمت: تأجيل الري",
        desc: "بناءً على قراءة توأم التربة، الرطوبة كافية ليوم إضافي. تم إيقاف جدولة الري مؤقتاً لتوفير المياه.",
        meta: "قبل 12 دقيقة",
        icon: <SoilDropIcon />,
        tone: "info",
      },
      {
        id: "r3",
        type: "humidity",
        title: "التوصية: تهوية خفيفة للهواء",
        desc: "الرطوبة مرتفعة؛ يرجى فتح النوافذ العلوية لتهوية المحمية فوراً وضمان تجدد الهواء.",
        meta: "قبل 20 دقيقة",
        icon: <AirHumidityIcon />,
        tone: "warning",
      },
      {
        id: "r4",
        type: "heat",
        title: "إجراء مؤتمت: تفعيل التظليل",
        desc: "لحماية النباتات من الإشعاع الشمسي المرتفع، تم تفعيل التظليل الآلي جزئياً.",
        meta: "قبل 35 دقيقة",
        icon: <TempSunIcon />,
        tone: "info",
      },
    ],
    []
  );

  const [filter, setFilter] = useState("all"); 

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((it) => it.type === filter);
  }, [items, filter]);

  const badgeClass = (tone) => {
    if (tone === "warning")
      return "bg-emerald-50 text-[#2E7D32] border-emerald-100 shadow-sm opacity-90";
    if (tone === "ok") return "bg-[#E8F5E9] text-[#1B5E20] border-[#A5D6A7]";
    return "bg-emerald-50 text-[#10b981] border-emerald-100";
  };

  const filterBtn = (key) =>
    `px-4 py-2 rounded-xl text-[14px] font-semibold transition-all duration-300 ${filter === key
      ? "bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#1B5E20] shadow-sm transform scale-105"
      : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
    }`;

  return (
    <div className="w-full h-full p-5 overflow-auto page-enter" dir="rtl">
      <div className="w-full max-w-[1150px] mx-auto flex flex-col gap-5">
        <SensorTopBar
          title="مركز التوصيات الذكية"
          subtitle="توليد التوصيات الذكية الاستباقية وتقارير التتبع المبني على التوأم الرقمي للمحمية."
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>}
          onBack={onBack}
          onExport={() => {
            const dateStr = new Date().toLocaleDateString('ar-SA');
            const titleRow = "سجل التوصيات والقرارات الذكية - نظام وارِف";
            const periodRow = `تاريخ التصدير: ${dateStr}`;
            const headers = ["التوقيت", "الحالة", "التوصية"].join(",");
            const rows = items.map((it) => `${it.meta},${it.tone},${it.title}`).join("\n");
            const csv = "\ufeff" + titleRow + "\n" + periodRow + "\n\n" + headers + "\n" + rows;
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `سجل_التوصيات_${dateStr}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        />

        {/* AI Insight Bar */}
        <div className="bg-gradient-to-r from-emerald-50/50 to-green-50/50 rounded-2xl border border-emerald-100/50 p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
             </div>
             <div>
               <div className="text-[16px] font-bold text-gray-800">حالة خوارزميات التحليل الرقمي</div>
               <div className="text-[13px] text-gray-600 mt-1">يتم دراسة أكثر من 15 ألف نقطة بيانات في الثانية لتحسين قرارات الري والمناخ.</div>
             </div>
           </div>
           <div className="flex gap-2">
             <span className="bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-[12px] font-bold text-gray-700 shadow-sm">دقة التنبؤ: 94.2%</span>
             <span className="bg-[#E8F5E9] px-3 py-1.5 rounded-xl border border-green-200 text-[12px] font-bold text-[#1B5E20] shadow-sm">وضع طبيعي</span>
           </div>
        </div>

        {/* Filters */}
        <CardShell className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[15px] font-bold text-gray-800">تصفية التوصيات والقرارات المؤتمتة:</div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={filterBtn("all")} onClick={() => setFilter("all")}>الكل</button>
            <button type="button" className={filterBtn("anomaly")} onClick={() => setFilter("anomaly")}>تنبيهات الشذوذ</button>
            <button type="button" className={filterBtn("irrigation")} onClick={() => setFilter("irrigation")}>إدارة الري</button>
            <button type="button" className={filterBtn("heat")} onClick={() => setFilter("heat")}>إدارة المناخ</button>
          </div>
        </CardShell>

        {/* List */}
        <CardShell className="overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-[15px] font-medium text-gray-500 text-center flex flex-col items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              لا توجد توصيات أو قرارات ضمن هذا التصنيف حاليًا.
            </div>
          ) : (
            filteredItems.map((it, idx) => (
              <div
                key={it.id}
                className={`p-5 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors ${idx !== filteredItems.length - 1
                  ? "border-b border-gray-100"
                  : ""
                  }`}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm bg-white ${it.tone === 'warning' ? 'border-emerald-200' : it.tone === 'ok' ? 'border-[#A5D6A7]' : 'border-emerald-100'}`}>
                    {it.icon}
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <div className="text-[16px] font-bold text-gray-800">
                        {it.title}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-sm ${badgeClass(
                          it.tone
                        )}`}
                      >
                        {it.meta}
                      </span>
                    </div>

                    <div className="text-[14px] text-gray-500 leading-relaxed max-w-2xl font-medium">
                      {it.desc}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 shrink-0">
                  <button
                    type="button"
                    className="h-9 px-4 rounded-xl border border-gray-200 bg-white font-semibold flex items-center justify-center text-[12px] text-gray-500 hover:text-[#2E7D32] hover:bg-[#E8F5E9] hover:border-[#2E7D32]/30 hover:shadow-sm transition-all duration-300"
                    title="اعتمـاد"
                  >
                    اعتماد القرار
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
