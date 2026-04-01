import { useState } from "react";

export default function SignIn({ onLogin }) {
  const [page, setPage] = useState('login'); // login, registerUser, registerFarm
  const [step, setStep] = useState(1);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#F7F7F4] font-['IBM Plex Sans']" dir="rtl">
      <div className="bg-white w-[430px] p-8 rounded-2xl shadow-lg flex flex-col gap-8">

        {/* Login Page */}
        {page === 'login' && <LoginPage onNewUser={() => setPage('registerUser')} onLogin={onLogin} />}

        {/* Register User Page */}
        {page === 'registerUser' && <RegisterUserPage onNext={() => setPage('registerFarm')} />}

        {/* Register Farm Flow */}
        {page === 'registerFarm' && (
          <>
            {step === 1 && <FarmInfoStep onNext={() => setStep(2)} />}
            {step === 2 && <SensorSelectionStep onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <DeviceScanPage onBack={() => setStep(2)} />}
          </>
        )}

      </div>
    </div>
  );
}

/* ----------------------------- INPUT FIELD ----------------------------- */
function InputField({ label, placeholder, type = "text" }) {
  return (
    <div className="flex flex-col gap-1 text-right">
      <label className="text-sm text-gray-700">{label}</label>
      <input
        type={type}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-[#81C784]"
        placeholder={placeholder}
      />
    </div>
  );
}

/* ----------------------------- LOGIN PAGE ----------------------------- */
function LoginPage({ onNewUser, onLogin }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-center text-[#2E7D32]">تسجيل الدخول</h1>
      <InputField label="البريد الإلكتروني" placeholder="مثال: alsa....@gmail.com" />
      <InputField label="كلمة المرور" placeholder="مثال: Man12" type="password" />
      <button onClick={onLogin} className="w-full py-3 bg-[#2E7D32] text-white rounded-xl text-md font-medium hover:bg-[#256a29] text-center text-[20px]">دخول</button>
      <button onClick={onNewUser} className="text-[#2E7D32] text-md text-[14px] font-medium hover:underline text-center">مستخدم جديد</button>
    </div>
  );
}

/* ----------------------------- REGISTER USER PAGE ----------------------------- */
function RegisterUserPage({ onNext }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-center text-[#2E7D32]">تسجيل مستخدم جديد</h1>
      <InputField label="اسم المستخدم" placeholder=" مثال: منصور" />
      <InputField label="البريد الإلكتروني" placeholder="  مثال: alsa...@gmail.com" />
      <InputField label="كلمة المرور" placeholder="  مثال: Man12" type="password" />
      <button onClick={onNext} className="w-full py-3 bg-[#2E7D32] text-white rounded-xl text-md font-medium hover:bg-[#256a29] text-center">التالي</button>
    </div>
  );
}

/* ----------------------------- REGISTER FARM FLOW ----------------------------- */
function FarmInfoStep({ onNext }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-center text-[#2E7D32]">تسجيل المزرعة</h1>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 text-right">نوع المزرعة</label>
        <select className="border border-gray-300 rounded-xl px-3 py-2 text-sm">
          <option>مزرعة مفتوحة</option>
          <option>محمية (مغلقة)</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 text-right">نوع الزراعة</label>
        <select className="border border-gray-300 rounded-xl px-3 py-2 text-sm">
          <option>زراعة طبيعية</option>
          <option>زراعة عضوية</option>
          <option>زراعة مائية</option>
        </select>
      </div>
      <button onClick={onNext} className="w-full py-3 bg-[#2E7D32] text-white rounded-xl text-md font-medium hover:bg-[#256a29] text-[18px] text-center">متابعة</button>
    </div>
  );
}

function SensorSelectionStep({ onNext, onBack }) {
  const devices = [
    { name: "حساس الحرارة", icon: "🌡️" },
    { name: "حساس الرطوبة", icon: "💧" },
    { name: "حساس التربة", icon: "🪴" },
    { name: "نظام الري ", icon: "🚿" }
  ];
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-[#2E7D32] text-center">إضافة الأجهزة</h1>
      <div className="grid grid-cols-2 gap-4">
        {devices.map(d => (
          <button key={d.name} className="border border-gray-300 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-gray-100">
            <span className="text-3xl">{d.icon}</span>
            <span className="text-sm">{d.name}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-between gap-4">
        <button onClick={onBack} className="w-full py-3 border border-gray-300 rounded-xl text-center">رجوع</button>
        <button onClick={onNext} className="w-full py-3 bg-[#2E7D32] text-white rounded-xl hover:bg-[#256a29] text-center">متابعة</button>
      </div>
    </div>
  );
}

function DeviceScanPage({ onBack }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-center text-[#2E7D32]">البحث عن الأجهزة القريبة</h1>
      <p className="text-right text-gray-600 text-sm">يجب منح الأذونات للعثور على الأجهزة القريبة عبر Wi-Fi و Bluetooth.</p>
      <div className="flex flex-col gap-3">
        <TogglePermission title="الوصول إلى Wi-Fi" />
        <TogglePermission title="البلوتوث" />
        <TogglePermission title="الموقع الجغرافي" />
      </div>
      <div className="border border-gray-300 rounded-xl p-4 mt-2">
        <p className="text-right text-gray-700 mb-2 text-sm">الأجهزة المتاحة:</p>
        <div className="flex flex-col gap-2">
          <button className="border border-gray-200 rounded-lg py-2 px-3 text-right hover:bg-gray-100">  Sensor_A1</button>
          <button className="border border-gray-200 rounded-lg py-2 px-3 text-right hover:bg-gray-100">  Sensor_B7</button>
          <button className="border border-gray-200 rounded-lg py-2 px-3 text-right hover:bg-gray-100">  Irrigation_X2</button>
        </div>
      </div>
      <InputField label=":اسم الجهاز" placeholder="مثال: حساس التربة - المحمية 1" />
      <div className="flex justify-between gap-4 mt-2">
        <button onClick={onBack} className="w-full py-3 border border-gray-300 rounded-xl text-center">رجوع</button>
        <button className="w-full py-3 bg-[#2E7D32] text-white rounded-xl hover:bg-[#256a29] text-center">ربط الجهاز</button>
      </div>
    </div>
  );
}

function TogglePermission({ title }) {
  return (
    <div className="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-2">
      <span className="text-sm text-gray-700">{title}</span>
      <input type="checkbox" className="w-5 h-5" />
    </div>
  );
}
