/* =========================================================
   WARIF | Translations (Arabic / English)
   ========================================================= */

export const translations = {
  ar: {
    // Common
    back: 'رجوع',
    next: 'التالي',
    continue: 'متابعة',
    skip: 'تخطي',
    loading: 'جاري التحميل...',

    // SignIn — Language toggle
    langToggle: 'EN',

    // SignIn — Login page
    systemSubtitle: 'نظام إدارة المحميات الزراعية',
    loginTitle: 'تسجيل الدخول',
    username: 'اسم المستخدم',
    usernamePlaceholder: 'مثال: mansour123',
    password: 'كلمة المرور',
    passwordPlaceholder: '••••••••',
    rememberMe: 'تذكر بيانات الدخول',
    loginBtn: 'دخول',
    loggingIn: 'جاري الدخول...',
    noAccount: 'ليس لديك حساب؟',
    registerNow: 'سجّل الآن',

    // Validation errors
    errUsernameRequired: 'اسم المستخدم مطلوب',
    errUsernameWrong: 'اسم المستخدم غير صحيح',
    errPasswordRequired: 'كلمة المرور مطلوبة',
    errPasswordWrong: 'كلمة المرور غير صحيحة',
    errFullNameRequired: 'الاسم الكامل مطلوب',
    errUsernameEnglish: 'اسم المستخدم يجب أن يكون بالإنجليزية (حروف، أرقام، . أو _)',
    errEmailRequired: 'البريد الإلكتروني مطلوب',
    errEmailInvalid: 'البريد الإلكتروني غير صحيح',
    errPasswordLength: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    errPasswordMatch: 'كلمتا المرور غير متطابقتين',
    errFarmNameRequired: 'اسم المحمية مطلوب',

    // Register user
    createAccount: 'إنشاء حساب جديد',
    enterData: 'أدخل بياناتك للبدء',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'مثال: منصور الزهراني',
    usernameEn: 'اسم المستخدم (بالإنجليزية)',
    email: 'البريد الإلكتروني',
    confirmPassword: 'تأكيد كلمة المرور',

    // Farm info
    farmInfo: 'معلومات المحمية',
    step1of3: 'الخطوة ١ من ٣',
    farmName: 'اسم المحمية',
    farmNamePlaceholder: 'مثال: محمية الخضروات',
    farmType: 'نوع المحمية',
    farmTypeClosed: 'محمية (مغلقة)',
    farmTypeOpen: 'مزرعة مفتوحة',
    cropType: 'نوع الزراعة',
    cropNatural: 'زراعة طبيعية',
    cropOrganic: 'زراعة عضوية',
    cropHydro: 'زراعة مائية',

    // Sensor selection
    selectDevices: 'اختر الأجهزة',
    step2of3: 'الخطوة ٢ من ٣ — اختر الأجهزة المتوفرة لديك',
    sensorTemp: 'حساس الحرارة',
    sensorTempDesc: 'مراقبة درجة الحرارة',
    sensorHumidity: 'حساس الرطوبة',
    sensorHumidityDesc: 'رطوبة الهواء',
    sensorSoil: 'حساس التربة',
    sensorSoilDesc: 'رطوبة التربة',
    sensorIrrigation: 'نظام الري',
    sensorIrrigationDesc: 'التحكم بالري',
    addLater: 'يمكنك إضافة الأجهزة لاحقاً من الإعدادات',

    // Device scan
    pairDevices: 'ربط الأجهزة',
    step3of3: 'الخطوة ٣ من ٣ — ابحث عن الأجهزة القريبة',
    wifi: 'Wi-Fi',
    bluetooth: 'البلوتوث',
    location: 'الموقع الجغرافي',
    scanning: 'جاري البحث...',
    scanDevices: 'بحث عن الأجهزة',
    availableDevices: 'الأجهزة المتاحة',
    deviceNameLabel: 'اسم الجهاز (اختياري)',
    deviceNamePlaceholder: 'مثال: حساس التربة – المحمية 1',
    connectAndEnter: 'ربط والدخول',
    skipAndEnter: 'تخطي والدخول',

    // Dashboard Header
    farmTemp: 'محيط المزرعة',
    lastUpdate: 'آخر تحديث',
    highTemp: 'حرارة مرتفعة',
    sensorsConnected: 'حساسات متصلة',
    auto: 'تلقائي',
    manual: 'يدوي',

    // User menu
    myAccount: 'الحساب الشخصي',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',

    // Sidebar
    dashboard: 'الرئيسية',
    temperature: 'درجة الحرارة',
    airHumidity: 'رطوبة الهواء',
    soilMoisture: 'رطوبة التربة',
    irrigation: 'نظام الري',
    recommendations: 'التوصيات',
    weather: 'الطقس',
  },

  en: {
    // Common
    back: 'Back',
    next: 'Next',
    continue: 'Continue',
    skip: 'Skip',
    loading: 'Loading...',

    // SignIn — Language toggle
    langToggle: 'ع',

    // SignIn — Login page
    systemSubtitle: 'Agricultural Reserve Management System',
    loginTitle: 'Sign In',
    username: 'Username',
    usernamePlaceholder: 'e.g. mansour123',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    rememberMe: 'Remember me',
    loginBtn: 'Sign In',
    loggingIn: 'Signing in...',
    noAccount: "Don't have an account?",
    registerNow: 'Register now',

    // Validation errors
    errUsernameRequired: 'Username is required',
    errUsernameWrong: 'Username is incorrect',
    errPasswordRequired: 'Password is required',
    errPasswordWrong: 'Password is incorrect',
    errFullNameRequired: 'Full name is required',
    errUsernameEnglish: 'Username must be in English (letters, numbers, . or _)',
    errEmailRequired: 'Email is required',
    errEmailInvalid: 'Email is invalid',
    errPasswordLength: 'Password must be at least 6 characters',
    errPasswordMatch: 'Passwords do not match',
    errFarmNameRequired: 'Farm name is required',

    // Register user
    createAccount: 'Create Account',
    enterData: 'Enter your details to get started',
    fullName: 'Full Name',
    fullNamePlaceholder: 'e.g. Mansour Al-Zahrani',
    usernameEn: 'Username (English)',
    email: 'Email',
    confirmPassword: 'Confirm Password',

    // Farm info
    farmInfo: 'Farm Information',
    step1of3: 'Step 1 of 3',
    farmName: 'Farm Name',
    farmNamePlaceholder: 'e.g. Vegetable Farm',
    farmType: 'Farm Type',
    farmTypeClosed: 'Greenhouse (Closed)',
    farmTypeOpen: 'Open Farm',
    cropType: 'Crop Type',
    cropNatural: 'Natural Farming',
    cropOrganic: 'Organic Farming',
    cropHydro: 'Hydroponics',

    // Sensor selection
    selectDevices: 'Select Devices',
    step2of3: 'Step 2 of 3 — Select your available devices',
    sensorTemp: 'Temperature Sensor',
    sensorTempDesc: 'Monitor temperature',
    sensorHumidity: 'Humidity Sensor',
    sensorHumidityDesc: 'Air humidity',
    sensorSoil: 'Soil Sensor',
    sensorSoilDesc: 'Soil moisture',
    sensorIrrigation: 'Irrigation System',
    sensorIrrigationDesc: 'Control irrigation',
    addLater: 'You can add devices later from Settings',

    // Device scan
    pairDevices: 'Pair Devices',
    step3of3: 'Step 3 of 3 — Search for nearby devices',
    wifi: 'Wi-Fi',
    bluetooth: 'Bluetooth',
    location: 'Location',
    scanning: 'Searching...',
    scanDevices: 'Search for Devices',
    availableDevices: 'Available Devices',
    deviceNameLabel: 'Device Name (optional)',
    deviceNamePlaceholder: 'e.g. Soil Sensor – Farm 1',
    connectAndEnter: 'Connect & Enter',
    skipAndEnter: 'Skip & Enter',

    // Dashboard Header
    farmTemp: 'Farm Temperature',
    lastUpdate: 'Last update',
    highTemp: 'High Temperature',
    sensorsConnected: 'sensors connected',
    auto: 'Auto',
    manual: 'Manual',

    // User menu
    myAccount: 'My Account',
    settings: 'Settings',
    logout: 'Sign Out',

    // Sidebar
    dashboard: 'Dashboard',
    temperature: 'Temperature',
    airHumidity: 'Air Humidity',
    soilMoisture: 'Soil Moisture',
    irrigation: 'Irrigation',
    recommendations: 'Recommendations',
    weather: 'Weather',
  },
};

export function t(lang, key) {
  return translations[lang]?.[key] ?? translations['ar'][key] ?? key;
}
