import { useState, useEffect, useRef } from 'react';
import { CardShell, Account_ModalShell } from './dashboardShared';

export function CameraCard() {
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [autoStartOnce, setAutoStartOnce] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startPanX: 0, startPanY: 0 });

  const [remoteUrl, setRemoteUrl] = useState(() => localStorage.getItem('warif_remote_url') || '');
  const [remoteUser, setRemoteUser] = useState(() => localStorage.getItem('warif_remote_user') || '');
  const [remotePass, setRemotePass] = useState(() => localStorage.getItem('warif_remote_pass') || '');

  // حفظ الإعدادات والتشغيل التلقائي عند التحميل
  useEffect(() => {
    localStorage.setItem('warif_remote_url', remoteUrl);
    localStorage.setItem('warif_remote_user', remoteUser);
    localStorage.setItem('warif_remote_pass', remotePass);

    // محاولة التشغيل التلقائي مرة واحدة عند وجود إعدادات
    if (!autoStartOnce && remoteUrl) {
      setAutoStartOnce(true);
      startCamera();
    }
  }, [remoteUrl, remoteUser, remotePass, autoStartOnce]);

  const startCamera = async () => {
    if (!remoteUrl) {
      setShowSettings(true);
      return;
    }
    setIsActive(true);
    setIsLoaded(false);
    setHasError(false);
  };

  const stopCamera = () => {
    setIsActive(false);
    setIsLoaded(false);
    setRetryCount(0);
    setZoomScale(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleCamera = () => {
    if (isActive) stopCamera();
    else startCamera();
  };

  const refreshRemote = () => {
    setRetryKey(prev => prev + 1);
    setIsLoaded(false);
    setHasError(false);
    setTestResult(null);
    setRetryCount(0);
  };

  // Removed testConnection function because MJPEG streams don't fire onload and cause false negatives

  const handleZoomIn = () => setZoomScale(p => Math.min(p + 0.5, 4));
  const handleZoomOut = () => {
    setZoomScale(p => {
      const newZoom = Math.max(p - 0.5, 1);
      if (newZoom === 1) setPan({ x: 0, y: 0 }); // Reset pan if zoomed all the way out
      return newZoom;
    });
  };
  const resetZoom = () => {
    setZoomScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (e) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging || zoomScale <= 1) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan({
      x: dragRef.current.startPanX + dx,
      y: dragRef.current.startPanY + dy
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  const applyDroidCamPreset = () => {
    // Extract IP if it exists in the current URL, otherwise default to a placeholder
    let ip = "192.168.1.X";
    const ipMatch = remoteUrl.match(/http:\/\/([0-9\.]+)/);
    if (ipMatch && ipMatch[1]) {
      ip = ipMatch[1];
    }
    setRemoteUrl(`http://${ip}:4747/video`);
    setRemoteUser('');
    setRemotePass('');
  };



  return (
    <div id="camera-card-container" className="h-full bg-white rounded-3xl relative">
      <CardShell className="overflow-hidden border-none shadow-xl h-full flex flex-col relative w-full bg-white">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-gray-50 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 relative transition-transform hover:scale-105 duration-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
            {isActive && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-800 tracking-tight"> مراقبة المزرعة</div>
            <div className="text-[12px] flex items-center justify-start gap-1.5 font-semibold">
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
          <button 
            type="button"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.getElementById('camera-card-container')?.requestFullscreen?.();
              } else {
                document.exitFullscreen?.();
              }
            }} 
            className="w-11 h-11 rounded-2xl transition-all flex items-center justify-center shadow-sm bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700 hover:-translate-y-0.5" title="ملء الشاشة">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className={`w-11 h-11 rounded-2xl transition-all flex items-center justify-center shadow-sm hover:-translate-y-0.5 ${showSettings ? 'bg-green-100 text-[#2E7D32] ring-2 ring-green-500/30' : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-[#2E7D32]'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          </button>
          <button onClick={toggleCamera} className={`px-6 py-2.5 rounded-2xl text-[15px] font-bold transition-all duration-300 flex items-center gap-2 ring-1 ring-transparent hover:ring-opacity-50 hover:-translate-y-0.5 ${isActive ? 'bg-[#ef4444] text-white shadow-lg shadow-red-200/50 hover:bg-[#dc2626]' : 'bg-[#2E7D32] text-white shadow-lg shadow-green-500/30'}`}>
            {isActive ? 'إيقاف البث' : 'بدء البث المباشر'}
          </button>
        </div>
      </div>

      {/* Unified Camera Settings Modal */}
      {showSettings && (
        <Account_ModalShell onClose={() => setShowSettings(false)}>
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl animate-modal-in flex flex-col w-[400px] max-w-[92vw]" dir="rtl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-emerald-600 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                </div>
                <div>
                   <h2 className="text-lg font-bold">إعدادات مصدر الكاميرا</h2>
                   <p className="text-emerald-100 text-[11px] opacity-90 font-bold">ضبط رابط البث وبيانات الأمان</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="p-4 overflow-auto custom-scrollbar flex flex-col gap-4">
              {/* Camera URL Input */}
              <div className="animate-fade-in-up">
                <label className="block text-[12px] font-black text-gray-500 text-right uppercase tracking-[0.1em] mb-2.5">رابط البث (Stream URL / IP)</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={remoteUrl}
                    onChange={(e) => {
                      setRemoteUrl(e.target.value);
                      setHasError(false);
                    }}
                    placeholder="http://192.168.1.XX:4747/video"
                    className="w-full pl-4 pr-12 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white text-sm font-mono dir-ltr transition-all shadow-inner outline-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                  </div>
                </div>

                {/* DroidCam Shortcut */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={applyDroidCamPreset}
                    className="flex items-center gap-2 text-[12px] font-black text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-100/50 shadow-sm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                    ضبط تلقائي لـ DroidCam (آيباد)
                  </button>
                </div>
              </div>

              {/* Advanced Security Section */}
              <div className="border-t border-gray-50 pt-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-[13px] font-black text-gray-400 hover:text-emerald-600 transition-colors group"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${showAdvanced ? 'rotate-90 text-emerald-600' : ''}`}><polyline points="9 18 15 12 9 6" /></svg>
                  إعدادات الوصول والأمان (اختياري)
                </button>

                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-4 mt-5 animate-scale-in">
                    <div>
                      <label className="block text-[12px] font-black text-gray-400 mb-2 text-right uppercase">كلمة المرور</label>
                      <input
                        type="password"
                        value={remotePass}
                        onChange={(e) => setRemotePass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-5 py-2.5 rounded-2xl bg-gray-50 border-none text-sm focus:bg-white transition-all shadow-inner outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-black text-gray-400 mb-2 text-right uppercase">اسم المستخدم</label>
                      <input
                        type="text"
                        value={remoteUser}
                        onChange={(e) => setRemoteUser(e.target.value)}
                        placeholder="admin"
                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none text-sm focus:bg-white transition-all shadow-inner outline-none text-right"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Help Guide */}
              <div className="bg-emerald-50/50 rounded-3xl p-4 border border-emerald-100/50 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-2 mb-4 justify-end">
                  <span className="text-[12px] font-black text-emerald-800 uppercase tracking-tight">الدليل السريع للإعداد</span>
                  <div className="w-6 h-6 rounded-lg bg-emerald-200/50 flex items-center justify-center text-emerald-700 text-xs font-black">؟</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/80 p-3.5 rounded-2xl border border-emerald-100/30 shadow-sm">
                    <div className="text-[11px] font-black text-emerald-600/50 mb-1.5 uppercase tracking-widest">المرحلة الثانية</div>
                    <div className="text-[12px] font-bold text-emerald-900 leading-snug">اضغطي ضبط تلقائي، ثم اضغطي "بدء البث" في الصفحة الرئيسية.</div>
                  </div>
                  <div className="bg-white/80 p-3.5 rounded-2xl border border-emerald-100/30 shadow-sm">
                    <div className="text-[11px] font-black text-emerald-600/50 mb-1.5 uppercase tracking-widest">المرحلة الأولى</div>
                    <div className="text-[12px] font-bold text-emerald-900 leading-snug">تأكدي من تشغيل تطبيق DroidCam وحصلي على عنوان الـ IP.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 bg-gray-50 border-t border-gray-50 flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-10 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-[14px] shadow-lg shadow-emerald-200 active:scale-95 transition-all hover:bg-emerald-700"
              >
                حفظ الإعدادات وإغلاق
              </button>
            </div>
          </div>
        </Account_ModalShell>
      )}

      {/* Viewport */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[380px]">
        {/* Connection Overlay */}
        {isActive && !isLoaded && !hasError && (
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
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-950 p-8 text-center animate-fade-in">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <div className="text-red-500 font-bold mb-2 text-lg">انقطع الاتصال بالكاميرا</div>
            <div className="text-white/40 text-sm mb-6 max-w-[280px] leading-relaxed">
              يرجى التأكد من تشغيل تطبيق DroidCam واتصال الأجهزة بنفس الشبكة.
            </div>
            <button onClick={refreshRemote} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold border border-white/20 transition-all flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
              إعادة الاتصال
            </button>
          </div>
        )}

        {!isActive && !hasError && (
          <div className="text-center p-8 animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.5" className="opacity-40"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
            </div>
            <div className="text-white/30 text-xs font-bold uppercase tracking-[0.3em]">Smart Monitoring System</div>
          </div>
        )}

        {isActive && remoteUrl && (
          <img
            key={retryKey}
            id="remoteStreamImg"
            src={(() => {
              let finalUrl = remoteUrl;
              if (remoteUser && remotePass && !finalUrl.includes('@')) {
                finalUrl = finalUrl.replace('://', `://${remoteUser}:${remotePass}@`);
              }
              // Add a timestamp to bust cache, especially on retries
              return `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}retry=${retryKey}`;
            })()}
            alt="Remote Stream"
            onLoad={() => {
              setIsLoaded(true);
              setHasError(false);
              setRetryCount(0); // Reset retries on success
            }}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomScale})`,
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            draggable={false}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={`w-full h-full object-contain ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={() => {
              if (retryCount < 5) {
                // Auto-retry a few times before showing permanent error
                setTimeout(() => {
                  setRetryCount(prev => prev + 1);
                  setRetryKey(prev => prev + 1);
                }, 3000);
              } else {
                setIsLoaded(true);
                setHasError(true);
              }
            }}
          />
        )}



        {/* Zoom Controls Overlay */}
        {isActive && isLoaded && !hasError && (
          <div className="absolute right-6 top-5 flex flex-col gap-2 z-20 animate-fade-in-down delay-500">
            <button onClick={handleZoomIn} disabled={zoomScale >= 4} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg transition-all active:scale-95 disabled:opacity-30" title="تـكبير">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
            </button>
            <button onClick={handleZoomOut} disabled={zoomScale <= 1} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg transition-all active:scale-95 disabled:opacity-30" title="تصغير">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
            </button>
            {zoomScale > 1 && (
              <button onClick={resetZoom} className="w-10 h-10 rounded-xl bg-red-500/80 hover:bg-red-500 backdrop-blur-md flex items-center justify-center text-white border border-red-400/50 shadow-lg transition-all active:scale-95 mt-1" title="إعادة الضبط">
                <span className="text-[11px] font-black font-mono tracking-tighter">1X</span>
              </button>
            )}
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
    </div>
  );
}
