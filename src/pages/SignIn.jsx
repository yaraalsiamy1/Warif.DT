import { useState, useEffect, useRef } from "react";
import { translations } from "../i18n";

/* =========================================================
   WARIF | Sign-In & Registration Flow
   Premium UI with animations, glassmorphism, and micro-interactions
   ========================================================= */

export default function SignIn({ onLogin, lang: propLang, onLangChange }) {
  const [page, setPage] = useState('login');
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({});
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState('forward');
  const lang = propLang || 'ar';
  const T = translations[lang];
  const isRtl = lang === 'ar';

  const goTo = (target, dir = 'forward') => {
    setDirection(dir);
    setTransitioning(true);
    setTimeout(() => {
      if (target === 'registerFarm') {
        setPage('registerFarm');
        setStep(1);
      } else {
        setPage(target);
      }
      setTransitioning(false);
    }, 250);
  };

  const goBack = () => {
    if (page === 'registerUser') goTo('login', 'back');
    else if (page === 'registerFarm') {
      if (step === 1) goTo('registerUser', 'back');
      else {
        setDirection('back');
        setTransitioning(true);
        setTimeout(() => {
          setStep(s => s - 1);
          setTransitioning(false);
        }, 250);
      }
    }
  };

  const nextStep = () => {
    setDirection('forward');
    setTransitioning(true);
    setTimeout(() => {
      setStep(s => s + 1);
      setTransitioning(false);
    }, 250);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden relative" dir={isRtl ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #F7F7F4 40%, #ecfdf5 70%, #f0fdf4 100%)' }}>

      {/* Floating background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #166534 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

      {/* Main Card */}
      <div className={`glass-strong w-[480px] max-w-[94vw] p-8 rounded-3xl flex flex-col gap-5 relative z-10
                       animate-scale-in ${transitioning ? 'pointer-events-none' : ''}`}
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 0 40px rgba(46,125,50,0.06)' }}>

        {/* Language toggle */}
        <button
          onClick={() => onLangChange && onLangChange(lang === 'ar' ? 'en' : 'ar')}
          className="absolute top-6 left-6 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-[#2E7D32] hover:border-[#2E7D32]/30 hover:bg-[#f0fdf4] transition-all duration-300 z-20"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          {T.langToggle}
        </button>

        {/* Back button */}
        {page !== 'login' && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goBack(); }}
            className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-[15px] text-gray-500 hover:text-[#2E7D32] hover:border-[#2E7D32]/30 hover:bg-[#f0fdf4] transition-all duration-300 font-medium cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
            {T.back}
          </button>
        )}

        {/* Step indicator */}
        {page === 'registerFarm' && (
          <div className="flex items-center justify-center gap-3 mt-2 animate-fade-in">
            {[1, 2, 3].map(s => (
              <div key={s} className="relative">
                <div className={`h-2 rounded-full transition-all duration-500 ease-out ${s === step ? 'w-10 bg-gradient-to-l from-[#2E7D32] to-[#4ade80]' :
                    s < step ? 'w-5 bg-[#81C784]' : 'w-5 bg-gray-200'
                  }`} />
                {s === step && (
                  <div className="absolute inset-0 h-2 rounded-full bg-gradient-to-l from-[#2E7D32] to-[#4ade80] opacity-40 blur-sm" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Page content with transitions */}
        <div className={`transition-all duration-250 ${transitioning
            ? direction === 'forward'
              ? 'opacity-0 translate-x-[-20px]'
              : 'opacity-0 translate-x-[20px]'
            : 'opacity-100 translate-x-0'
          }`}>
          {page === 'login' && (
            <LoginPage
              onLogin={onLogin}
              onNewUser={() => goTo('registerUser')}
              lang={lang}
              T={T}
            />
          )}
          {page === 'registerUser' && (
            <RegisterUserPage
              onNext={(data) => { setUserData(data); goTo('registerFarm'); }}
              lang={lang}
              T={T}
            />
          )}
          {page === 'registerFarm' && (
            <>
              {step === 1 && <FarmInfoStep onNext={(data) => { setUserData(d => ({ ...d, ...data })); nextStep(); }} lang={lang} T={T} />}
              {step === 2 && <SensorSelectionStep onNext={(data) => { setUserData(d => ({ ...d, ...data })); nextStep(); }} lang={lang} T={T} />}
              {step === 3 && <DeviceScanPage onFinish={onLogin} lang={lang} T={T} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- INPUT FIELD ----------------------------- */
function InputField({ label, placeholder, type = "text", value, onChange, error, onKeyDown, icon }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1.5 text-right animate-fade-in-up">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className={`input-enhanced w-full border rounded-xl py-3 text-sm focus:outline-none transition-all duration-300 ${icon ? 'pr-10 pl-4' : 'px-4'
            } ${error ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50/50 focus:bg-white'
            }`}
          placeholder={placeholder}
        />
        {isPassword && value && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <span className="text-xs text-red-500">{error}</span>
      </div>
    </div>
  );
}

/* ----------------------------- LOGIN PAGE ----------------------------- */
function LoginPage({ onLogin, onNewUser, T }) {
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
    if (!username.trim()) errs.username = T.errUsernameRequired;
    else if (username !== 'admin' && username !== savedUser.username)
      errs.username = T.errUsernameWrong;
    if (!password) errs.password = T.errPasswordRequired;
    else if (username === 'admin' && password !== '123456')
      errs.password = T.errPasswordWrong;
    else if (username === savedUser.username && password !== savedUser.password)
      errs.password = T.errPasswordWrong;
    return errs;
  };

  const handleLogin = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (remember) {
      localStorage.setItem('warif_remember', JSON.stringify({ username, password }));
    } else {
      localStorage.removeItem('warif_remember');
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Logo */}
      <div className="text-center animate-fade-in-up">
        <div className="animate-float inline-block">
          <img src="/logo.png" alt="وارِف" className="w-40 h-40 object-contain mx-auto drop-shadow-lg mt-10" />
        </div>
        <p className="text-sm text-gray-400 mt-2 tracking-wide">{T.systemSubtitle}</p>
      </div>

      <h1 className="text-lg font-bold text-center text-gray-800 animate-fade-in-up delay-1">{T.loginTitle}</h1>

      <div className="flex flex-col gap-3">
        <div className="delay-2" style={{ animationFillMode: 'both' }}>
          <InputField
            label={T.username}
            placeholder={T.usernamePlaceholder}
            type="text"
            value={username}
            onChange={v => { setUsername(v); setErrors(e => ({ ...e, username: '' })); }}
            onKeyDown={handleKeyDown}
            error={errors.username}
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-4 3-6 6-6s6 2 6 6" /></svg>}
          />
        </div>
        <div className="delay-3" style={{ animationFillMode: 'both' }}>
          <InputField
            label={T.password}
            placeholder={T.passwordPlaceholder}
            type="password"
            value={password}
            onChange={v => { setPassword(v); setErrors(e => ({ ...e, password: '' })); }}
            onKeyDown={handleKeyDown}
            error={errors.password}
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
          />
        </div>
      </div>

      {/* Remember me */}
      <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setRemember(!remember)}>
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${remember ? 'bg-[#2E7D32] border-[#2E7D32] scale-105' : 'border-gray-300 group-hover:border-[#81C784]'
          }`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
            className={`transition-all duration-300 ${remember ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">{T.rememberMe}</span>
      </div>

      {/* Login button */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="btn-primary w-full py-3.5 bg-gradient-to-l from-[#2E7D32] to-[#388E3C] text-white rounded-xl font-semibold text-base hover:shadow-lg hover:shadow-green-900/20 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <span className="animate-pulse">{T.loggingIn}</span>
          </>
        ) : (
          <>
            {T.loginBtn}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className="transition-transform duration-300 group-hover:-translate-x-1">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </>
        )}
      </button>

      {/* Register link */}
      <button onClick={onNewUser} className="text-sm text-gray-400 hover:text-[#2E7D32] text-center transition-all duration-300 group">
        {T.noAccount} <span className="text-[#2E7D32] font-semibold group-hover:underline underline-offset-4">{T.registerNow}</span>
      </button>
    </div>
  );
}

/* ----------------------------- REGISTER USER PAGE ----------------------------- */
function RegisterUserPage({ onNext, T }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = T.errFullNameRequired;
    if (!username.trim()) errs.username = T.errUsernameRequired;
    else if (!/^[a-zA-Z0-9._]+$/.test(username)) errs.username = T.errUsernameEnglish;
    if (!email.trim()) errs.email = T.errEmailRequired;
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = T.errEmailInvalid;
    if (!password) errs.password = T.errPasswordRequired;
    else if (password.length < 6) errs.password = T.errPasswordLength;
    if (password !== confirm) errs.confirm = T.errPasswordMatch;
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    localStorage.setItem('warif_user', JSON.stringify({ fullName, username, email, password }));
    onNext({ fullName, username, email, password });
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="text-center animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#4ade80] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-900/15">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800">{T.createAccount}</h1>
        <p className="text-sm text-gray-400 mt-1">{T.enterData}</p>
      </div>

      <InputField label={T.fullName} placeholder={T.fullNamePlaceholder} value={fullName} onChange={setFullName} error={errors.fullName}
        onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-4 3-6 6-6s6 2 6 6" /></svg>}
      />
      <InputField label={T.usernameEn} placeholder={T.usernamePlaceholder} value={username} onChange={(v) => setUsername(v.replace(/[^a-zA-Z0-9._]/g, ''))} error={errors.username}
        onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
      />
      <InputField label={T.email} placeholder="example@gmail.com" type="email" value={email} onChange={setEmail} error={errors.email}
        onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>}
      />
      <InputField label={T.password} placeholder={T.passwordPlaceholder} type="password" value={password} onChange={setPassword} error={errors.password}
        onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
      />
      <InputField label={T.confirmPassword} placeholder={T.passwordPlaceholder} type="password" value={confirm} onChange={setConfirm} error={errors.confirm}
        onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
      />

      <button
        onClick={handleNext}
        className="btn-primary w-full py-3.5 bg-gradient-to-l from-[#2E7D32] to-[#388E3C] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-900/20 transition-all duration-300 mt-1"
      >
        {T.next}
      </button>
    </div>
  );
}

/* ----------------------------- FARM INFO ----------------------------- */
function FarmInfoStep({ onNext, T }) {
  const [farmType, setFarmType] = useState('محمية (مغلقة)');
  const [cropType, setCropType] = useState('زراعة طبيعية');
  const [farmName, setFarmName] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!farmName.trim()) { setError(T.errFarmNameRequired); return; }
    onNext({ farmType, cropType, farmName });
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="text-center animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#4ade80] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-900/15">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800">{T.farmInfo}</h1>
        <p className="text-sm text-gray-400 mt-1">{T.step1of3}</p>
      </div>

      <div className="flex flex-col gap-1.5 text-right">
        <label className="text-sm font-medium text-gray-600">{T.farmName}</label>
        <input
          value={farmName}
          onChange={e => { setFarmName(e.target.value); setError(''); }}
          className={`input-enhanced border rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50/50 transition-all duration-300 ${error ? 'border-red-300' : 'border-gray-200'}`}
          placeholder={T.farmNamePlaceholder}
        />
        <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'}`}>
          <span className="text-xs text-red-500">{error}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-right">
        <label className="text-sm font-medium text-gray-600">{T.farmType}</label>
        <div className="relative">
          <select value={farmType} onChange={e => setFarmType(e.target.value)} className="input-enhanced w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm bg-gray-50/50 focus:outline-none transition-all duration-300 cursor-pointer">
            <option>{T.farmTypeClosed}</option>
            <option>{T.farmTypeOpen}</option>
          </select>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-right">
        <label className="text-sm font-medium text-gray-600">{T.cropType}</label>
        <div className="relative">
          <select value={cropType} onChange={e => setCropType(e.target.value)} className="input-enhanced w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm bg-gray-50/50 focus:outline-none transition-all duration-300 cursor-pointer">
            <option>{T.cropNatural}</option>
            <option>{T.cropOrganic}</option>
            <option>{T.cropHydro}</option>
          </select>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>

      <button onClick={handleNext} className="btn-primary w-full py-3.5 bg-gradient-to-l from-[#2E7D32] to-[#388E3C] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-900/20 transition-all duration-300 mt-1">
        {T.continue}
      </button>
    </div>
  );
}

/* ----------------------------- SENSOR SELECTION ----------------------------- */
function SensorSelectionStep({ onNext, T }) {
  const devices = [
    { name: T.sensorTemp, icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>, key: "temp", desc: T.sensorTempDesc },
    { name: T.sensorHumidity, icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>, key: "humidity", desc: T.sensorHumidityDesc },
    { name: T.sensorSoil, icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>, key: "soil", desc: T.sensorSoilDesc },
    { name: T.sensorIrrigation, icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="#ccfbf1" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>, key: "irrigation", desc: T.sensorIrrigationDesc }
  ];
  const [selected, setSelected] = useState([]);

  const toggle = (key) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="text-center animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#4ade80] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-900/15">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M4 11a8 8 0 0 1 16 0" />
            <path d="M8 11a4 4 0 0 1 8 0" />
            <circle cx="12" cy="11" r="1.5" />
            <path d="M12 13v7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800">{T.selectDevices}</h1>
        <p className="text-sm text-gray-400 mt-1">{T.step2of3}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {devices.map((d, i) => (
          <button
            key={d.key}
            onClick={() => toggle(d.key)}
            className={`card-interactive border rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-300 animate-scale-bounce`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="mb-1" style={{
              opacity: selected.includes(d.key) ? 1 : 0.5,
              transition: 'opacity 300ms ease'
            }}>{d.icon}</div>
            <span className={`text-sm font-semibold transition-colors duration-300 ${selected.includes(d.key) ? 'text-[#2E7D32]' : 'text-gray-600'
              }`}>{d.name}</span>
            <span className="text-[11px] text-gray-400">{d.desc}</span>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${selected.includes(d.key)
                ? 'bg-[#2E7D32] scale-100'
                : 'bg-gray-200 scale-90'
              }`} style={{
                borderColor: selected.includes(d.key) ? '#2E7D32' : '#e5e7eb',
                borderWidth: '2px'
              }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
                className={`transition-all duration-300 ${selected.includes(d.key) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {selected.length === 0 && (
        <p className="text-xs text-gray-400 text-center animate-fade-in">{T.addLater}</p>
      )}

      <button onClick={() => onNext({ sensors: selected })} className="btn-primary w-full py-3.5 bg-gradient-to-l from-[#2E7D32] to-[#388E3C] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-green-900/20 transition-all duration-300">
        {T.continue}
      </button>
    </div>
  );
}

/* ----------------------------- DEVICE SCAN ----------------------------- */
function DeviceScanPage({ onFinish, T }) {
  const [permissions, setPermissions] = useState({ wifi: true, bluetooth: false, location: false });
  const [selectedDevice, setSelectedDevice] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);

  const devices = ['Sensor_A1', 'Sensor_B7', 'Irrigation_X2'];

  const handleScan = () => {
    setScanning(true);
    setScanDone(false);
    setTimeout(() => {
      setScanning(false);
      setScanDone(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="text-center animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#4ade80] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-900/15 relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <circle cx="12" cy="20" r="1" />
          </svg>
          {scanning && (
            <>
              <div className="absolute inset-0 rounded-2xl border-2 border-[#4ade80] animate-ping opacity-30" />
            </>
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-800">{T.pairDevices}</h1>
        <p className="text-sm text-gray-400 mt-1">{T.step3of3}</p>
      </div>

      {/* Permissions */}
      <div className="flex flex-col gap-2">
        {Object.entries({ wifi: T.wifi, bluetooth: T.bluetooth, location: T.location }).map(([key, label], i) => (
          <div key={key} className="flex justify-between items-center border border-gray-100 rounded-xl px-4 py-3 bg-gray-50/50 animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}>
            <span className="text-sm text-gray-700">{label}</span>
            <button
              onClick={() => setPermissions(p => ({ ...p, [key]: !p[key] }))}
              className={`toggle-track w-11 h-6 rounded-full transition-all duration-300 relative ${permissions[key] ? 'bg-[#2E7D32]' : 'bg-gray-200'}`}
            >
              <div className={`toggle-thumb w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-300 ${permissions[key] ? 'left-5.5 translate-x-0' : 'left-0.5'}`}
                style={{ left: permissions[key] ? '22px' : '2px' }} />
            </button>
          </div>
        ))}
      </div>

      {/* Scan button */}
      <button onClick={handleScan} disabled={scanning}
        className="flex items-center justify-center gap-2 py-3 border-2 border-[#2E7D32] text-[#2E7D32] rounded-xl text-sm font-semibold hover:bg-[#f0fdf4] transition-all duration-300 relative overflow-hidden disabled:opacity-60">
        {scanning ? (
          <>
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <span className="animate-pulse">{T.scanning}</span>
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            {T.scanDevices}
          </>
        )}
      </button>

      {/* Device list */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <p className="text-xs text-gray-400 px-4 py-2.5 border-b border-gray-100 bg-gray-50/80 font-medium">{T.availableDevices}</p>
        {devices.map((d, i) => (
          <button
            key={d}
            onClick={() => setSelectedDevice(d)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-right border-b border-gray-50 last:border-0 transition-all duration-300 animate-fade-in-up ${selectedDevice === d ? 'bg-[#f0fdf4] text-[#2E7D32]' : 'hover:bg-gray-50 text-gray-700'
              }`}
            style={{ animationDelay: scanDone ? `${i * 100}ms` : '0ms' }}
          >
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${selectedDevice === d ? 'bg-[#2E7D32] shadow-sm shadow-green-400/50' : 'bg-gray-300'
              }`} />
            <span className="font-medium">{d}</span>
            {selectedDevice === d && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" className="mr-auto animate-scale-in">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Device name */}
      <div className="flex flex-col gap-1.5 text-right">
        <label className="text-sm font-medium text-gray-600">{T.deviceNameLabel}</label>
        <input
          value={deviceName}
          onChange={e => setDeviceName(e.target.value)}
          className="input-enhanced border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 focus:outline-none transition-all duration-300"
          placeholder={T.deviceNamePlaceholder}
        />
      </div>

      <button onClick={onFinish}
        className="btn-primary w-full py-3.5 bg-gradient-to-l from-[#2E7D32] to-[#388E3C] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-green-900/20 transition-all duration-300">
        {selectedDevice ? T.connectAndEnter : T.skipAndEnter}
      </button>
    </div>
  );
}
