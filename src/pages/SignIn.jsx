import { useState, useEffect } from "react";

export default function SignIn({ onLogin }) {
  const [page, setPage] = useState('login');
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({});

  const goBack = () => {
    if (page === 'registerUser') setPage('login');
    else if (page === 'registerFarm') {
      if (step === 1) setPage('registerUser');
      else setStep(s => s - 1);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#F7F7F4]" dir="rtl">
      <div className="bg-white w-[460px] max-w-[95vw] p-8 rounded-2xl shadow-lg flex flex-col gap-6 relative">

        {/* زر رجوع */}
        {page !== 'login' && (
          <button
            onClick={goBack}
            className="absolute top-6 right-6 flex items-center gap-1 text-sm text-gray-400 hover:text-[#2E7D32] transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
            رجوع
          </button>
        )}

        {/* مؤشر الخطوات */}
        {page === 'registerFarm' && (
          <div className="flex items-center justify-center gap-2 mt-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${
                s === step ? 'w-8 bg-[#2E7D32]' : s < step ? 'w-4 bg-[#81C784]' : 'w-4 bg-gray-200'
              }`} />
            ))}
          </div>
        )}

        {/* الصفحات */}
        {page === 'login' && (
          <LoginPage
            onLogin={onLogin}
            onNewUser={() => setPage('registerUser')}
          />
        )}
        {page === 'registerUser' && (
          <RegisterUserPage
            onNext={(data) => { setUserData(data); setPage('registerFarm'); setStep(1); }}
          />
        )}
        {page === 'registerFarm' && (
          <>
            {step === 1 && <FarmInfoStep onNext={(data) => { setUserData(d => ({...d, ...data})); setStep(2); }} />}
            {step === 2 && <SensorSelectionStep onNext={(data) => { setUserData(d => ({...d, ...data})); setStep(3); }} onBack={() => setStep(1)} />}
            {step === 3 && <DeviceScanPage onBack={() => setStep(2)} onFinish={onLogin} />}
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- INPUT FIELD ----------------------------- */
function InputField({ label, placeholder, type = "text", value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1 text-right">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#81C784] transition-all ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
        }`}
        placeholder={placeholder}
      />
      {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

/* ----------------------------- LOGIN PAGE ----------------------------- */
function LoginPage({ onLogin, onNewUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('warif_remember');
    if (saved) {
      const { username: u, password: p } = JSON.parse(saved);
      setUsername(u);
      setPassword(p);
      setRemember(true);
    }
  }, []);

  const validate = () => {
    const errs = {};
    const savedUser = JSON.parse(localStorage.getItem('warif_user') || '{}');
  
    if (!username.trim()) errs.username = 'اسم المستخدم مطلوب';
    else if (username !== 'admin' && username !== savedUser.username) 
       errs.username = 'اسم المستخدم غير صحيح';
  
    if (!password) errs.password = 'كلمة المرور مطلوبة';
    else if (username === 'admin' && password !== '1234') 
       errs.password = 'كلمة المرور غير صحيحة';
    else if (username === savedUser.username && password !== savedUser.password) 
       errs.password = 'كلمة المرور غير صحيحة';
  
    return errs;
  };

  const handleLogin = () => {
    console.log('username:', username, 'password:', password); // للتشخيص
    const errs = validate();
    console.log('errors:', errs); // للتشخيص

    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    if (remember) {
      localStorage.setItem('warif_remember', JSON.stringify({ username, password }));
    } else {
      localStorage.removeItem('warif_remember');
    }

    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 800);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <img src="/logo.png" alt="وارِف" className="w-28 h-28 object-contain mx-auto" />
        <p className="text-sm text-gray-400 mt-1">نظام إدارة المحميات الزراعية</p>
      </div>

      <h1 className="text-lg font-semibold text-center text-gray-700">تسجيل الدخول</h1>

      <div className="flex flex-col gap-3">
        <InputField
          label="اسم المستخدم"
          placeholder="مثال: mansour123"
          type="text"
          value={username}
          onChange={setUsername}
          error={errors.username}
        />
        <InputField
          label="كلمة المرور"
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />
      </div>

      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRemember(!remember)}>
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
          remember ? 'bg-[#2E7D32] border-[#2E7D32]' : 'border-gray-300'
        }`}>
          {remember && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
        </div>
        <span className="text-sm text-gray-600">تذكر بيانات الدخول</span>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-3 bg-[#2E7D32] text-white rounded-xl font-medium text-base hover:bg-[#256a29] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {loading && <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>}
        {loading ? 'جاري الدخول...' : 'دخول'}
      </button>

      <button onClick={onNewUser} className="text-sm text-gray-400 hover:text-[#2E7D32] text-center transition-all">
        ليس لديك حساب؟ <span className="text-[#2E7D32] font-medium">سجّل الآن</span>
      </button>
    </div>
  );
}

/* ----------------------------- REGISTER USER PAGE ----------------------------- */
function RegisterUserPage({ onNext }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    const savedUser = JSON.parse(localStorage.getItem('warif_user') || '{}');

    if (!username.trim()) {
      errs.username = 'اسم المستخدم مطلوب';
    } else if (username !== 'admin' && username !== savedUser.username) {
      errs.username = 'اسم المستخدم غير صحيح';
    }

    if (!password) {
      errs.password = 'كلمة المرور مطلوبة';
    } else if (username === 'admin' && password !== '123456') {
      errs.password = 'كلمة المرور غير صحيحة';
    } else if (username === savedUser.username && password !== savedUser.password) {
      errs.password = 'كلمة المرور غير صحيحة';
    } else if (username !== 'admin' && username !== savedUser.username) {
      errs.username = 'اسم المستخدم غير صحيح';
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }     
  // حفظ بيانات المستخدم
    localStorage.setItem('warif_user', JSON.stringify({ fullName, username, email, password }));
    onNext({ fullName, username, email, password });
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-800">إنشاء حساب جديد</h1>
        <p className="text-sm text-gray-400 mt-1">أدخل بياناتك للبدء</p>
      </div>

      <InputField
        label="الاسم الكامل"
        placeholder="مثال: منصور الزهراني"
        value={fullName}
        onChange={setFullName}
        error={errors.fullName}
      />
      <InputField
        label="اسم المستخدم"
        placeholder="مثال: mansour123"
        value={username}
        onChange={setUsername}
        error={errors.username}
      />
      <InputField
        label="البريد الإلكتروني"
        placeholder="example@gmail.com"
        type="email"
        value={email}
        onChange={setEmail}
        error={errors.email}
      />
      <InputField
        label="كلمة المرور"
        placeholder="••••••••"
        type="password"
        value={password}
        onChange={setPassword}
        error={errors.password}
      />
      <InputField
        label="تأكيد كلمة المرور"
        placeholder="••••••••"
        type="password"
        value={confirm}
        onChange={setConfirm}
        error={errors.confirm}
      />

      <button
        onClick={handleNext}
        className="w-full py-3 bg-[#2E7D32] text-white rounded-xl font-medium hover:bg-[#256a29] transition-all mt-2"
      >
        التالي
      </button>
    </div>
  );
}
/* ----------------------------- FARM INFO ----------------------------- */
function FarmInfoStep({ onNext }) {
  const [farmType, setFarmType] = useState('محمية (مغلقة)');
  const [cropType, setCropType] = useState('زراعة طبيعية');
  const [farmName, setFarmName] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!farmName.trim()) { setError('اسم المحمية مطلوب'); return; }
    onNext({ farmType, cropType, farmName });
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-800">معلومات المحمية</h1>
        <p className="text-sm text-gray-400 mt-1">الخطوة ١ من ٣</p>
      </div>

      <div className="flex flex-col gap-1 text-right">
        <label className="text-sm font-medium text-gray-700">اسم المحمية</label>
        <input
          value={farmName}
          onChange={e => { setFarmName(e.target.value); setError(''); }}
          className={`border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#81C784] bg-gray-50 ${error ? 'border-red-300' : 'border-gray-200'}`}
          placeholder="مثال: محمية الخضروات"
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      <div className="flex flex-col gap-1 text-right">
        <label className="text-sm font-medium text-gray-700">نوع المحمية</label>
        <select value={farmType} onChange={e => setFarmType(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#81C784]">
          <option>محمية (مغلقة)</option>
          <option>مزرعة مفتوحة</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 text-right">
        <label className="text-sm font-medium text-gray-700">نوع الزراعة</label>
        <select value={cropType} onChange={e => setCropType(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#81C784]">
          <option>زراعة طبيعية</option>
          <option>زراعة عضوية</option>
          <option>زراعة مائية</option>
        </select>
      </div>

      <button onClick={handleNext} className="w-full py-3 bg-[#2E7D32] text-white rounded-xl font-medium hover:bg-[#256a29] transition-all mt-2">
        متابعة
      </button>
    </div>
  );
}

/* ----------------------------- SENSOR SELECTION ----------------------------- */
function SensorSelectionStep({ onNext, onBack }) {
  const devices = [
    { name: "حساس الحرارة", icon: "🌡️", key: "temp" },
    { name: "حساس الرطوبة", icon: "💧", key: "humidity" },
    { name: "حساس التربة", icon: "🪴", key: "soil" },
    { name: "نظام الري", icon: "🚿", key: "irrigation" }
  ];
  const [selected, setSelected] = useState([]);

  const toggle = (key) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-800">اختر الأجهزة</h1>
        <p className="text-sm text-gray-400 mt-1">الخطوة ٢ من ٣ — اختر الأجهزة المتوفرة لديك</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {devices.map(d => (
          <button
            key={d.key}
            onClick={() => toggle(d.key)}
            className={`border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
              selected.includes(d.key)
                ? 'border-[#2E7D32] bg-[#f0fdf4] text-[#2E7D32]'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <span className="text-2xl">{d.icon}</span>
            <span className="text-sm font-medium">{d.name}</span>
            {selected.includes(d.key) && (
              <div className="w-4 h-4 rounded-full bg-[#2E7D32] flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {selected.length === 0 && (
        <p className="text-xs text-gray-400 text-center">يمكنك إضافة الأجهزة لاحقاً من الإعدادات</p>
      )}

      <div className="flex gap-3">
        <button onClick={() => onNext({ sensors: selected })} className="flex-1 py-3 bg-[#2E7D32] text-white rounded-xl text-sm font-medium hover:bg-[#256a29] transition-all">متابعة</button>
      </div>
    </div>
  );
}

/* ----------------------------- DEVICE SCAN ----------------------------- */
function DeviceScanPage({ onBack, onFinish }) {
  const [permissions, setPermissions] = useState({ wifi: true, bluetooth: false, location: false });
  const [selectedDevice, setSelectedDevice] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [scanning, setScanning] = useState(false);

  const devices = ['Sensor_A1', 'Sensor_B7', 'Irrigation_X2'];

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 1500);
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-800">ربط الأجهزة</h1>
        <p className="text-sm text-gray-400 mt-1">الخطوة ٣ من ٣ — ابحث عن الأجهزة القريبة</p>
      </div>

      {/* الأذونات */}
      <div className="flex flex-col gap-2">
        {Object.entries({ wifi: 'Wi-Fi', bluetooth: 'البلوتوث', location: 'الموقع الجغرافي' }).map(([key, label]) => (
          <div key={key} className="flex justify-between items-center border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50">
            <span className="text-sm text-gray-700">{label}</span>
            <button
              onClick={() => setPermissions(p => ({ ...p, [key]: !p[key] }))}
              className={`w-10 h-6 rounded-full transition-all relative ${permissions[key] ? 'bg-[#2E7D32]' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${permissions[key] ? 'left-5' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* البحث */}
      <button onClick={handleScan} className="flex items-center justify-center gap-2 py-2.5 border border-[#2E7D32] text-[#2E7D32] rounded-xl text-sm hover:bg-[#f0fdf4] transition-all">
        {scanning ? (
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        )}
        {scanning ? 'جاري البحث...' : 'بحث عن الأجهزة'}
      </button>

      {/* الأجهزة المتاحة */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <p className="text-xs text-gray-400 px-3 py-2 border-b border-gray-100 bg-gray-50">الأجهزة المتاحة</p>
        {devices.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDevice(d)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-right border-b border-gray-50 last:border-0 transition-all ${
              selectedDevice === d ? 'bg-[#f0fdf4] text-[#2E7D32]' : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${selectedDevice === d ? 'bg-[#2E7D32]' : 'bg-gray-300'}`} />
            {d}
          </button>
        ))}
      </div>

      {/* اسم الجهاز */}
      <div className="flex flex-col gap-1 text-right">
        <label className="text-sm font-medium text-gray-700">اسم الجهاز (اختياري)</label>
        <input
          value={deviceName}
          onChange={e => setDeviceName(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#81C784]"
          placeholder="مثال: حساس التربة - المحمية 1"
        />
      </div>

      <div className="flex gap-3">
        <button onClick={onFinish} className="flex-1 py-3 bg-[#2E7D32] text-white rounded-xl text-sm font-medium hover:bg-[#256a29] transition-all">
          {selectedDevice ? 'ربط والدخول' : 'تخطي والدخول'}
        </button>
      </div>
    </div>
  );
}
