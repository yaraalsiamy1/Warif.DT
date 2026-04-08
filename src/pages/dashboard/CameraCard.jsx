import { useState, useRef, useEffect } from 'react';
import { CardShell } from './dashboardShared';

export function CameraCard() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [devices, setDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  
  // وضع الكاميرا: 'local' (جهازك) أو 'remote' (آيباد/مزرعة)
  const [cameraMode, setCameraMode] = useState(() => localStorage.getItem('warif_cam_mode') || 'local');
  const [remoteUrl, setRemoteUrl] = useState(() => localStorage.getItem('warif_remote_url') || '');
  const [remoteUser, setRemoteUser] = useState(() => localStorage.getItem('warif_remote_user') || '');
  const [remotePass, setRemotePass] = useState(() => localStorage.getItem('warif_remote_pass') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [retryKey, setRetryKey] = useState(0); 
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [autoStartOnce, setAutoStartOnce] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // 'success' | 'fail'

  // جلب قائمة الكاميرات المتاحة
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devs.filter(d => d.kind === 'videoinput');
        setDevices(videoDevs);
      } catch (err) {
        console.error("Error listing devices:", err);
      }
    };
    getDevices();
  }, []);

  // حفظ الإعدادات والتشغيل التلقائي عند التحميل
  useEffect(() => {
    localStorage.setItem('warif_cam_mode', cameraMode);
    localStorage.setItem('warif_remote_url', remoteUrl);
    localStorage.setItem('warif_remote_user', remoteUser);
    localStorage.setItem('warif_remote_pass', remotePass);
    
    // محاولة التشغيل التلقائي مرة واحدة عند وجود إعدادات
    if (!autoStartOnce && (cameraMode === 'local' || (cameraMode === 'remote' && remoteUrl))) {
      setAutoStartOnce(true);
      startCamera();
    }
  }, [cameraMode, remoteUrl]);

  const startCamera = async (deviceIndex = currentDeviceIndex) => {
    if (cameraMode === 'remote') {
      if (!remoteUrl) {
        setShowSettings(true);
        return;
      }
      setIsActive(true);
      setIsLoaded(false);
      setHasError(false);
      return;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: devices.length > 0 
          ? { deviceId: { exact: devices[deviceIndex].deviceId } }
          : { facingMode: 'environment' }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("تعذر الوصول للكاميرا. يرجى التحقق من أذونات المتصفح.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setIsLoaded(false);
  };

  const toggleCamera = () => {
    if (isActive) stopCamera();
    else startCamera();
  };

  const switchCamera = () => {
    if (devices.length > 1) {
      const nextIndex = (currentDeviceIndex + 1) % devices.length;
      setCurrentDeviceIndex(nextIndex);
      if (isActive) {
        startCamera(nextIndex);
      }
    }
  };

  const refreshRemote = () => {
    setRetryKey(prev => prev + 1);
    setIsLoaded(false);
    setHasError(false);
    setTestResult(null);
  };

  const testConnection = async () => {
    if (!remoteUrl) return;
    setIsTesting(true);
    setTestResult(null);
    
    // محاكاة محاولة تحميل صورة صغيرة من الرابط للتحقق من وجوده
    const img = new Image();
    const timeout = setTimeout(() => {
      img.src = "";
      setTestResult('fail');
      setIsTesting(false);
    }, 5000);

    img.onload = () => {
      clearTimeout(timeout);
      setTestResult('success');
      setIsTesting(false);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      setTestResult('fail');
      setIsTesting(false);
    };
    
    // إضافة علامة زمنية لتجنب الكاش مع دعم اليوزر والباسورد
    let finalUrl = remoteUrl;
    if (remoteUser && remotePass && !finalUrl.includes('@')) {
      finalUrl = finalUrl.replace('://', `://${remoteUser}:${remotePass}@`);
    }
    img.src = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  };

  const takeSnapshot = () => {
    const source = videoRef.current || document.getElementById('remoteStreamImg');
    if (!source) return;

    const canvas = document.createElement('canvas');
    canvas.width = source.videoWidth || source.naturalWidth || 640;
    canvas.height = source.videoHeight || source.naturalHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    setSnapshot(canvas.toDataURL('image/png'));
    setTimeout(() => setSnapshot(null), 3000);
  };

  return (
    <CardShell className="overflow-hidden border-none shadow-xl h-full flex flex-col relative">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-gray-50 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 relative transition-transform hover:scale-105 duration-300">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
             {isActive && (
               <span className="absolute -top-1 -right-1 flex h-4 w-4">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
               </span>
             )}
          </div>
          <div className="text-right">
             <div className="text-lg font-bold text-gray-800 tracking-tight">بث كاميرا المزرعة</div>
             <div className="text-[12px] flex items-center justify-end gap-1.5 font-semibold">
               {isActive ? (
                <span className="flex items-center gap-1.5 text-red-500 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> مباشر
                </span>
               ) : (
                <span className="text-gray-400">نظام المراقبة مغلق</span>
               )}
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button onClick={() => setShowSettings(!showSettings)} className={`w-11 h-11 rounded-2xl transition-all flex items-center justify-center shadow-sm ${showSettings ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
           </button>
           {isActive && (
             <button onClick={takeSnapshot} title="التقاط صورة" className="w-11 h-11 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center justify-center shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
             </button>
           )}
           <button onClick={toggleCamera} className={`px-6 py-2.5 rounded-2xl text-[15px] font-bold transition-all duration-300 flex items-center gap-2 ${isActive ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-[#16a34a] text-white shadow-lg shadow-green-200'}`}>
             {isActive ? 'إيقاف البث' : 'بدء البث'}
           </button>
        </div>
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute inset-x-5 top-[85px] z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white/50 p-5 overflow-hidden">
             <div className="flex items-center justify-between mb-4">
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">إغلاق</button>
                <div className="text-sm font-black text-gray-800 font-sans">إعدادات المصدر</div>
             </div>
             
             <div className="flex gap-2 p-1.5 bg-gray-100/50 rounded-2xl mb-5">
                <button 
                  onClick={() => { setCameraMode('local'); stopCamera(); }}
                  className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${cameraMode === 'local' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                >كاميرا الجهاز</button>
                <button 
                  onClick={() => { setCameraMode('remote'); stopCamera(); }}
                  className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${cameraMode === 'remote' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                >كاميرا عن بُعد</button>
             </div>
             
             {cameraMode === 'remote' ? (
               <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       {testResult && (
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${testResult === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {testResult === 'success' ? 'متصل بنجاح ✓' : 'تعذر الاتصال ×'}
                         </span>
                       )}
                       <label className="block text-[11px] font-bold text-gray-400 text-right uppercase tracking-wider">عنوان IP من تطبيق الآيباد</label>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={remoteUrl}
                        onChange={(e) => {
                          setRemoteUrl(e.target.value);
                          setHasError(false);
                          setTestResult(null);
                        }}
                        placeholder="http://192.168.1.15:8081"
                        className="w-full pl-24 pr-12 py-3.5 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-green-500/20 focus:bg-white text-sm font-mono dir-ltr transition-all shadow-inner outline-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      </div>
                      <button 
                        onClick={testConnection}
                        disabled={isTesting || !remoteUrl}
                        className="absolute left-2 top-1.5 bottom-1.5 px-4 rounded-xl bg-white border border-gray-100 text-[10px] font-bold text-green-600 shadow-sm hover:bg-green-50 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isTesting ? 'جاري الفحص...' : 'فحص الاتصال'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 text-right">كلمة المرور</label>
                      <input 
                        type="password" 
                        value={remotePass}
                        onChange={(e) => setRemotePass(e.target.value)}
                        placeholder="123"
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border-none text-sm focus:bg-white transition-all shadow-inner outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 text-right">اسم المستخدم</label>
                      <input 
                        type="text" 
                        value={remoteUser}
                        onChange={(e) => setRemoteUser(e.target.value)}
                        placeholder="admin"
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border-none text-sm focus:bg-white transition-all shadow-inner outline-none text-right"
                      />
                    </div>
                  </div>

                  {/* iPad Help Guide */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-3 justify-end">
                      <span className="text-xs font-bold text-slate-700">دليل ربط IP Camera Lite</span>
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold">؟</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white p-2 rounded-xl text-center border border-slate-100">
                        <div className="text-[10px] font-bold text-gray-400 mb-1">الخطوة 2</div>
                        <div className="text-[10px] text-gray-700 leading-tight">انسخي الرقم (LAN) الذي يبدأ بـ 192</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl text-center border border-slate-100">
                        <div className="text-[10px] font-bold text-gray-400 mb-1">الخطوة 1</div>
                        <div className="text-[10px] text-gray-700 leading-tight">اضغطي أول زر من اليسار (المفتاح 🔛)</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg text-center font-bold">
                       تأكدي أن الآيباد واللابتوب متصلان بنفس الواي فاي
                    </div>
                  </div>
               </div>
             ) : (
                <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-2xl animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <button onClick={switchCamera} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-[11px] font-bold shadow-sm active:scale-95 transition-all">تبديل الكاميرا 🔄</button>
                    <span className="text-xs font-bold text-gray-500">تم اكتشاف {devices.length} كاميرا</span>
                  </div>
                </div>
             )}
          </div>
        </div>
      )}
      
      {/* Viewport */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[380px]">
        {/* Connection Overlay */}
        {isActive && cameraMode === 'remote' && !isLoaded && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950/90 backdrop-blur-md">
             <div className="relative">
               <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-6" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-8 h-8 bg-green-500/10 rounded-full animate-pulse" />
               </div>
             </div>
             <div className="text-white font-bold text-sm tracking-widest mb-2">جاري مزامنة الآيباد</div>
             <div className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em]">{remoteUrl}</div>
          </div>
        )}

        {/* Error Overlay */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-950 p-8 text-center">
             <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
             </div>
             <div className="text-red-500 font-bold mb-2">تعذر الاتصال بالآيباد</div>
             <div className="text-white/40 text-xs mb-6 max-w-[240px] leading-relaxed">تأكدي من تفعيل البث في التطبيق ومن اتصال الآيباد بنفس شبكة WiFi</div>
             <button onClick={refreshRemote} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 transition-all">إعادة محاولة</button>
          </div>
        )}

        {!isActive && !hasError && (
          <div className="text-center p-8 animate-in fade-in duration-700">
             <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.5" className="opacity-40"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
             </div>
             <div className="text-white/30 text-xs font-bold uppercase tracking-[0.3em]">Smart Monitoring System</div>
          </div>
        )}

        {isActive && cameraMode === 'local' && (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover animate-fade-in" />
        )}

        {isActive && cameraMode === 'remote' && remoteUrl && (
          <img 
            key={retryKey}
            id="remoteStreamImg"
            src={(() => {
              let finalUrl = remoteUrl;
              if (remoteUser && remotePass && !finalUrl.includes('@')) {
                finalUrl = finalUrl.replace('://', `://${remoteUser}:${remotePass}@`);
              }
              return finalUrl;
            })()} 
            alt="Remote Stream" 
            onLoad={() => {
              setIsLoaded(true);
              setHasError(false);
            }}
            className={`w-full h-full object-contain transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={() => {
              setIsLoaded(true); // نعتبره محملاً حتى لو عطى 401 ليظهر الخطأ في حال لم ينجح
              setHasError(true);
            }}
          />
        )}
        
        {snapshot && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center animate-fade-in z-20 p-6 backdrop-blur-sm">
             <div className="w-16 h-16 rounded-full bg-green-100 text-[#16a34a] flex items-center justify-center mb-4 scale-up">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
             </div>
             <div className="text-[#16a34a] text-xl font-bold mb-4">تم حفظ اللقطة!</div>
             <img src={snapshot} className="max-h-56 rounded-2xl shadow-2xl border-4 border-white" alt="Snapshot" />
          </div>
        )}

        {isActive && isLoaded && (
          <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-between pointer-events-none animate-fade-in-up shadow-2xl">
             <div className="text-white">
               <div className="text-xs font-bold flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> مزرعة الهدا - مكة المكرمة
               </div>
             </div>
             <div className="text-white text-sm font-mono font-bold leading-none">LIVE</div>
          </div>
        )}
      </div>
    </CardShell>
  );
}
