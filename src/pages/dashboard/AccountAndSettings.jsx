import { useState } from 'react';
import { Account_Card, Account_EditableField, Account_ListRow, Account_IconButton, Account_ModalShell, Account_PencilIcon, Account_TrashIcon, Account_PlusIcon, Account_SensorIcon } from './dashboardShared';

export function AccountAndSettingsPages({ initialPage = "profile", onBack, onLogout, onNameUpdate, language, onLanguageChange, sensors: propSensors, onSensorsChange }) {

  const [page, setPage] = useState(initialPage);

  const savedUser = JSON.parse(localStorage.getItem('warif_user') || '{}');
  const [profile, setProfile] = useState({
    fullName: savedUser.fullName || "منصور الزهراني",
    username: savedUser.username || "admin",
    email: savedUser.email || "example@gmail.com",
    password: "********",
  });

  const [editingField, setEditingField] = useState(null);
  const [draftValue, setDraftValue] = useState("");

  const sensors = propSensors || [];

  const [sensorModal, setSensorModal] = useState({
    open: false,
    mode: "add", // "add" | "edit"
    id: null,
    name: "",
    type: "",
  });


  function openEdit(fieldKey) {
    setEditingField(fieldKey);
    setDraftValue(profile[fieldKey] || "");
  }

  function closeEdit() {
    setEditingField(null);
    setDraftValue("");
  }

  function saveEdit() {
    if (!editingField) return;
    const newValue = draftValue.trim() || profile[editingField];
    setProfile((p) => ({ ...p, [editingField]: newValue }));

    // حفظ في localStorage
    const saved = JSON.parse(localStorage.getItem('warif_user') || '{}');
    localStorage.setItem('warif_user', JSON.stringify({ ...saved, [editingField]: newValue }));

    // إبلاغ Dashboard بتحديث الاسم
    if (editingField === 'fullName' && onNameUpdate) onNameUpdate(newValue);

    closeEdit();
  }

  function openAddSensor() {
    setSensorModal({
      open: true,
      mode: "add",
      id: null,
      name: "",
      type: "",
    });
  }

  function openEditSensor(item) {
    setSensorModal({
      open: true,
      mode: "edit",
      id: item.id,
      name: item.name,
      type: item.type,
    });
  }

  function closeSensorModal() {
    setSensorModal({
      open: false,
      mode: "add",
      id: null,
      name: "",
      type: "",
    });
  }

  function saveSensorModal() {
    const name = sensorModal.name.trim();
    const type = sensorModal.type.trim();
    if (!name || !type) return;

    let updated;
    if (sensorModal.mode === "add") {
      const newId = `S${Math.floor(Math.random() * 9000 + 1000)}`;
      updated = [{ id: newId, name, type }, ...sensors];
    } else {
      updated = sensors.map((s) => (s.id === sensorModal.id ? { ...s, name, type } : s));
    }

    onSensorsChange?.(updated);
    closeSensorModal();
  }

  function deleteSensor(id) {
    const ok = confirm(language === 'ar' ? "هل تريد حذف هذا الحساس؟" : "Delete this sensor?");
    if (!ok) return;
    onSensorsChange?.(sensors.filter((s) => s.id !== id));
  }

  const isRtl = language === 'ar';
  const T = {
    profile: isRtl ? "الحساب الشخصي" : "Profile",
    settings: isRtl ? "الإعدادات" : "Settings",
    profileSub: isRtl ? "بياناتك الشخصية وتفاصيل حسابك" : "Your personal details and account info",
    settingsSub: isRtl ? "إدارة الحساسات وخيارات التطبيق" : "Manage sensors and app preferences",
    back: isRtl ? "رجوع" : "Back",
    accountData: isRtl ? "بيانات الحساب" : "Account Data",
    fullName: isRtl ? "الاسم الكامل" : "Full Name",
    username: isRtl ? "اسم المستخدم" : "Username",
    email: isRtl ? "البريد الإلكتروني" : "Email",
    password: isRtl ? "كلمة المرور" : "Password",
    edit: isRtl ? "تعديل" : "Edit",
    save: isRtl ? "حفظ" : "Save",
    cancel: isRtl ? "إلغاء" : "Cancel",
    sensors: isRtl ? "الحساسات" : "Sensors",
    sensorsSub: isRtl ? "إدارة الحساسات المرتبطة بالمحمية" : "Manage greenhouse sensors",
    addSensor: isRtl ? "إضافة حساس" : "Add Sensor",
    sensorName: isRtl ? "اسم الحساس" : "Sensor Name",
    sensorType: isRtl ? "نوع الحساس" : "Sensor Type",
    noSensors: isRtl ? "لا توجد حساسات مضافة" : "No sensors added",
    language: isRtl ? "اللغة" : "Language",
    account: isRtl ? "الحساب" : "Account",
    userGuide: isRtl ? "دليل المستخدم" : "User Guide",
    userGuideSub: isRtl ? "شرح استخدام لوحة التحكم، التنبيهات، والاختصارات." : "How to use the dashboard, alerts, and shortcuts.",
    openGuide: isRtl ? "فتح الدليل" : "Open Guide",
    logout: isRtl ? "تسجيل الخروج" : "Log Out",
    logoutSub: isRtl ? "إنهاء الجلسة الحالية بأمان." : "Safely end your current session.",
    logoutBtn: isRtl ? "خروج" : "Log Out",
    editField: isRtl ? "تعديل" : "Edit",
    addSensorTitle: isRtl ? "إضافة حساس" : "Add Sensor",
    editSensorTitle: isRtl ? "تعديل الحساس" : "Edit Sensor",
  };

  return (
    <div
      className="relative w-full h-full bg-[#F7F7F4] font-['IBM_Plex_Sans_Arabic'] overflow-auto"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-3xl mx-auto p-5 flex flex-col gap-5">

        {/* Page Header */}
        <div className="flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
              {page === "profile"
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-4 3-6 6-6s6 2 6 6" /></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              }
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">
                {page === "profile" ? T.profile : T.settings}
              </div>
              <div className="text-sm text-gray-500">
                {page === "profile" ? T.profileSub : T.settingsSub}
              </div>
            </div>
          </div>
          <button type="button" onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-[15px] text-gray-600 hover:text-[#2E7D32] hover:border-[#2E7D32]/30 hover:bg-[#f0fdf4] transition-all duration-300 flex items-center gap-2 font-medium">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
            {T.back}
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/80 border border-gray-100 rounded-2xl p-1 gap-1" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <button type="button" onClick={() => setPage("profile")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${page === "profile" ? "bg-[#E8F5E9] text-[#1B5E20] shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-4 3-6 6-6s6 2 6 6" /></svg>
            {T.profile}
          </button>
          <button type="button" onClick={() => setPage("settings")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${page === "settings" ? "bg-[#E8F5E9] text-[#1B5E20] shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            {T.settings}
          </button>
        </div>

        {/* Content */}
        <div className="page-enter">
          {page === "profile" ? (
            <Account_ProfilePage profile={profile} onEdit={openEdit} T={T} />
          ) : (
            <Account_SettingsPage
              T={T}
              language={language}
              setLanguage={onLanguageChange}
              sensors={sensors}
              onAddSensor={openAddSensor}
              onEditSensor={openEditSensor}
              onDeleteSensor={deleteSensor}
              onLogout={onLogout}
            />
          )}
        </div>

      </div>

      {editingField && (
        <Account_ModalShell onClose={closeEdit}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[420px] max-w-[92vw] p-5 text-right animate-modal-in">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[16px] font-semibold text-gray-800">
                {T.edit}:{" "}
                {editingField === "fullName" ? T.fullName
                  : editingField === "username" ? T.username
                    : editingField === "email" ? T.email
                      : T.password}
              </div>
              <button type="button" onClick={closeEdit}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <label className="block text-xs text-gray-600 mb-2">
              {editingField === "fullName" ? T.fullName
                : editingField === "username" ? T.username
                  : editingField === "email" ? T.email
                    : T.password}
            </label>
            <input
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); }}
              type={editingField === "password" ? "password" : "text"}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              placeholder=""
              autoFocus
            />

            <div className="flex items-center justify-end gap-2 mt-5">
              <button type="button" onClick={closeEdit}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
                {T.cancel}
              </button>
              <button type="button" onClick={saveEdit}
                className="px-6 py-2.5 rounded-xl bg-[#2E7D32] text-white text-[14px] font-black hover:bg-[#1B5E20] shadow-md hover:shadow-lg transition-all duration-300">
                {T.save}
              </button>
            </div>
          </div>
        </Account_ModalShell>
      )}

      {sensorModal.open && (
        <Account_ModalShell onClose={closeSensorModal}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[460px] max-w-[92vw] p-5 text-right animate-modal-in">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[16px] font-semibold text-gray-800">
                {sensorModal.mode === "add" ? T.addSensorTitle : T.editSensorTitle}
              </div>
              <button type="button" onClick={closeSensorModal}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-2">{T.sensorName}</label>
                <input
                  value={sensorModal.name}
                  onChange={(e) => setSensorModal((m) => ({ ...m, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  placeholder={T.sensorName}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-2">{T.sensorType}</label>
                <input
                  value={sensorModal.type}
                  onChange={(e) => setSensorModal((m) => ({ ...m, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  placeholder={T.sensorType}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button type="button" onClick={closeSensorModal}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
                {T.cancel}
              </button>
              <button type="button" onClick={saveSensorModal}
                className="px-6 py-2.5 rounded-xl bg-[#2E7D32] text-white text-[14px] font-black hover:bg-[#1B5E20] shadow-md hover:shadow-lg transition-all duration-300">
                {T.save}
              </button>
            </div>
          </div>
        </Account_ModalShell>
      )}
    </div>
  );
}


function Account_ProfilePage({ profile, onEdit, T }) {
  const initials = (profile.fullName || "م")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="flex flex-col gap-4">
      {/* Avatar card */}
      <Account_Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#4ade80] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 select-none">
            {initials}
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-800">{profile.fullName || "—"}</div>
            <div className="text-[13px] text-gray-500 mt-0.5">{profile.email}</div>
            <div className="text-[13px] text-gray-400 mt-0.5 font-mono">@{profile.username}</div>
          </div>
        </div>
      </Account_Card>

      {/* Editable fields */}
      <Account_Card>
        <div className="text-[16px] font-semibold text-gray-800 mb-4">{T.accountData}</div>
        <div className="flex flex-col gap-3">
          <Account_EditableField label={T.fullName} value={profile.fullName || "—"} onEdit={() => onEdit("fullName")} />
          <Account_EditableField label={T.username} value={profile.username} onEdit={() => onEdit("username")} />
          <Account_EditableField label={T.email} value={profile.email} onEdit={() => onEdit("email")} />
          <Account_EditableField label={T.password} value={profile.password} onEdit={() => onEdit("password")} mono />
        </div>
      </Account_Card>
    </div>
  );
}


function Account_SettingsPage({ T, language, setLanguage, sensors, onAddSensor, onEditSensor, onDeleteSensor, onLogout }) {
  return (
    <div className="flex flex-col gap-4">

      {/* Sensors */}
      <Account_Card>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="text-right">
            <div className="text-[16px] font-semibold text-gray-800">{T.sensors}</div>
            <div className="text-[13px] text-gray-500 mt-0.5">{T.sensorsSub}</div>
          </div>
          <button
            type="button"
            onClick={onAddSensor}
            className="px-3 py-2 rounded-xl bg-[#2E7D32] text-white text-sm hover:bg-[#1B5E20] transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <Account_PlusIcon />
            {T.addSensor}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {sensors.map((s) => (
            <div key={s.id} className="border border-gray-100 rounded-xl px-4 py-3 bg-[#fafafa] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                  <Account_SensorIcon />
                </div>
                <div className="text-right leading-tight">
                  <div className="text-sm font-semibold text-gray-800">{s.name}</div>
                  <div className="text-[13px] text-gray-500">{s.type} • <span className="font-mono">{s.id}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Account_IconButton title={T.edit} onClick={() => onEditSensor(s)}>
                  <Account_PencilIcon />
                </Account_IconButton>
                <Account_IconButton title={T.edit} danger onClick={() => onDeleteSensor(s.id)}>
                  <Account_TrashIcon />
                </Account_IconButton>
              </div>
            </div>
          ))}
          {sensors.length === 0 && (
            <div className="text-center text-[13px] text-gray-400 py-6">{T.noSensors}</div>
          )}
        </div>
      </Account_Card>

      {/* Language */}
      <Account_Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="text-[16px] font-semibold text-gray-800">{T.language}</div>
        </div>
        <div className="flex gap-2">
          {[{ key: "ar", label: "عربي" }, { key: "en", label: "English" }].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setLanguage(key)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ${language === key ? "bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20]" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </Account_Card>

      {/* Account actions */}
      <Account_Card>
        <div className="text-[16px] font-semibold text-gray-800 mb-4">{T.account}</div>
        <div className="flex flex-col gap-2">
          <Account_ListRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>}
            title={T.userGuide}
            subtitle={T.userGuideSub}
            right={
              <button className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300">
                {T.openGuide}
              </button>
            }
          />
          <Account_ListRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>}
            title={T.logout}
            subtitle={T.logoutSub}
            right={
              <button
                onClick={() => { localStorage.removeItem('warif_remember'); onLogout?.(); }}
                className="px-7 py-2.5 rounded-xl bg-[#c62828] text-white text-[14px] font-black hover:bg-[#b71c1c] shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
              >
                {T.logoutBtn}
              </button>
            }
          />
        </div>
      </Account_Card>

    </div>
  );
}

