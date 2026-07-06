/* ── CONFIG & STATE ── */
/* ReFashion AI Sustainable Recommendation — NEW dedicated Supabase project */
const SUPABASE_URL = 'https://sdukxehicvdwstefopoz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bpbxdrq7vyXs6rgpann5Iw_hqOdfUgo';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: window.sessionStorage,
    persistSession: true
  },
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        cache: 'no-store'
      });
    }
  }
});


const defaultAssumedProfile = [
  { id: "employee_id", label: "Mã nhân viên", labelEN: "Employee ID", value: "TDV-2847", valueEN: "TDV-2847", type: "text" },
  { id: "role", label: "Vị trí", labelEN: "Position", value: "Trình Dược viên", valueEN: "Medical Sales Representative", type: "text" },
  { id: "dept", label: "Địa bàn", labelEN: "Territory", value: "Q.7, Q.8, Bình Chánh", valueEN: "District 7, District 8, Binh Chanh", type: "text" },
  { id: "level", label: "Cấp bậc hiện tại", labelEN: "Current Level", value: "TDV Cấp 2", valueEN: "MSR Level 2", type: "text" },
  { id: "region", label: "Quản lý trực tiếp", labelEN: "Direct Manager", value: "Trưởng nhóm TDV", valueEN: "MSR Team Leader", type: "text" },
  { id: "tenure", label: "Thâm niên", labelEN: "Tenure", value: "3 năm 2 tháng", valueEN: "3 years 2 months", type: "text" },
  { id: "evaluation_period", label: "Kỳ đánh giá", labelEN: "Evaluation Period", value: "01–06/2025 (6 tháng)", valueEN: "01–06/2025 (6 months)", type: "text" },
  { id: "eval_purpose", label: "Mục đích đánh giá", labelEN: "Evaluation Purpose", value: "Xét thăng tiến lên TDV Cấp 3", valueEN: "Promotion review to MSR Level 3", type: "text" }
];
window.defaultAssumedProfile = defaultAssumedProfile;

function normalizeAssumedProfile(profile) {
  if (Array.isArray(profile)) return profile;
  if (!profile) return defaultAssumedProfile;
  
  const mapped = [];
  if (profile.employee_id) mapped.push({ id: "employee_id", label: "Mã nhân viên", labelEN: "Employee ID", value: profile.employee_id, valueEN: profile.employee_id, type: "text" });
  if (profile.role) mapped.push({ id: "role", label: "Vai trò", labelEN: "Role", value: profile.role, valueEN: profile.roleEN || profile.role, type: "text" });
  if (profile.dept) mapped.push({ id: "dept", label: "Phòng ban", labelEN: "Department", value: profile.dept, valueEN: profile.deptEN || profile.dept, type: "text" });
  if (profile.level) mapped.push({ id: "level", label: "Cấp bậc", labelEN: "Level", value: profile.level, valueEN: profile.levelEN || profile.level, type: "text" });
  if (profile.region) mapped.push({ id: "region", label: "Khu vực", labelEN: "Region", value: profile.region, valueEN: profile.regionEN || profile.region, type: "text" });
  if (profile.age) mapped.push({ id: "age", label: "Tuổi", labelEN: "Age", value: String(profile.age), valueEN: String(profile.age), type: "number" });
  if (profile.tenure) mapped.push({ id: "tenure", label: "Thâm niên", labelEN: "Tenure", value: profile.tenure, valueEN: profile.tenureEN || profile.tenure, type: "text" });
  if (profile.evaluation_period) mapped.push({ id: "evaluation_period", label: "Kỳ đánh giá", labelEN: "Evaluation Period", value: profile.evaluation_period, valueEN: profile.evaluation_periodEN || profile.evaluation_period, type: "text" });
  
  return mapped.length > 0 ? mapped : defaultAssumedProfile;
}
window.normalizeAssumedProfile = normalizeAssumedProfile;

function getProfileFieldFallback(assumedProfile, searchKeys, defaultVal) {
  const profileList = normalizeAssumedProfile(assumedProfile);
  const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
  
  for (const key of searchKeys) {
    const field = profileList.find(f => f.id === key || f.id.toLowerCase() === key.toLowerCase());
    if (field) {
      return isEn ? (field.valueEN || field.value) : field.value;
    }
  }
  for (const key of searchKeys) {
    const field = profileList.find(f => 
      (f.label && f.label.toLowerCase().includes(key.toLowerCase())) || 
      (f.labelEN && f.labelEN.toLowerCase().includes(key.toLowerCase()))
    );
    if (field) {
      return isEn ? (field.valueEN || field.value) : field.value;
    }
  }
  return defaultVal;
}
window.getProfileFieldFallback = getProfileFieldFallback;

async function saveSettingToDb(key, value) {
  try {
    const valStr = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, valStr);
    
    // Only attempt database upsert if we are authenticated to satisfy the RLS policy
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      if (key === 'hr_custom_translations') {
        const defs = JSON.parse(localStorage.getItem('default_hr_custom_translations')) || { vi: {}, en: {} };
        const keysSet = new Set([
          ...Object.keys(value.vi || {}),
          ...Object.keys(value.en || {}),
          ...Object.keys(defs.vi || {}),
          ...Object.keys(defs.en || {})
        ]);
        
        const getCategoryForKey = (k) => {
          const cats = window.CONFIG_CATEGORIES || [];
          const matchedCat = cats.find(c => c.keys && c.keys.includes(k));
          return matchedCat ? matchedCat.name : 'Khác (Others)';
        };

        const rows = Array.from(keysSet).map(k => ({
          key: k,
          vi: (value.vi && value.vi[k] !== undefined) ? value.vi[k] : null,
          en: (value.en && value.en[k] !== undefined) ? value.en[k] : null,
          default_vi: (defs.vi && defs.vi[k] !== undefined) ? defs.vi[k] : null,
          default_en: (defs.en && defs.en[k] !== undefined) ? defs.en[k] : null,
          category: getCategoryForKey(k)
        }));

        const { error } = await sb.from('hr_custom_translations').upsert(rows);
        if (error) {
          console.error(`Error saving hr_custom_translations rows:`, error);
          throw new Error(error.message || "Lỗi lưu translations");
        } else {
          console.log(`hr_custom_translations rows successfully saved.`);
        }
      } else {
        const { error } = await sb.from('settings').upsert({ key: key, value: value });
        if (error) {
          console.error(`Error saving setting "${key}" to DB:`, error);
          throw new Error(error.message || `Lỗi lưu setting ${key}`);
        } else {
          console.log(`Setting "${key}" successfully saved to DB.`);
        }
      }
    } else {
      console.log(`Skipping DB sync for "${key}" because user is not authenticated.`);
      throw new Error("Chưa đăng nhập hệ thống cơ sở dữ liệu. Vui lòng đăng nhập lại.");
    }
  } catch (e) {
    console.error(`Exception saving setting "${key}" to DB:`, e);
    throw e;
  }
}
window.saveSettingToDb = saveSettingToDb;

async function syncSettingsFromDb() {
  try {
    const { data, error } = await sb.from('settings').select('*');
    if (error) {
      console.error('Error fetching settings from database:', error);
      throw error;
    }
    if (data) {
      data.forEach(row => {
        if (row.key === 'hr_custom_translations') return; // Skip old consolidated row
        const valStr = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);

        const draftKey = 'draft_' + row.key;
        const currentProdVal = localStorage.getItem(row.key);
        const currentDraftVal = localStorage.getItem(draftKey);
        const isDraftClean = !currentDraftVal || (currentDraftVal === currentProdVal);

        localStorage.setItem(row.key, valStr);
        if (row.default_value !== undefined && row.default_value !== null) {
          const defStr = typeof row.default_value === 'string' ? row.default_value : JSON.stringify(row.default_value);
          localStorage.setItem('default_' + row.key, defStr);
        }

        if (isDraftClean) {
          localStorage.setItem(draftKey, valStr);
        }
      });
    }

    // Fetch individual translation rows
    const { data: transData, error: transError } = await sb.from('hr_custom_translations').select('*');
    if (transError) {
      console.error('Error fetching custom translations from database:', transError);
      throw transError;
    } else if (transData) {
      const customTranslations = { vi: {}, en: {} };
      const defaultTranslations = { vi: {}, en: {} };
      transData.forEach(row => {
        if (row.vi !== null && row.vi !== undefined) customTranslations.vi[row.key] = row.vi;
        if (row.en !== null && row.en !== undefined) customTranslations.en[row.key] = row.en;
        if (row.default_vi !== null && row.default_vi !== undefined) defaultTranslations.vi[row.key] = row.default_vi;
        if (row.default_en !== null && row.default_en !== undefined) defaultTranslations.en[row.key] = row.default_en;
      });
      
      const newConfStr = JSON.stringify(customTranslations);
      const currentProdConf = localStorage.getItem('hr_custom_translations');
      const currentDraftConf = localStorage.getItem('draft_hr_custom_translations');
      const isConfClean = !currentDraftConf || (currentDraftConf === currentProdConf);

      localStorage.setItem('hr_custom_translations', newConfStr);
      localStorage.setItem('default_hr_custom_translations', JSON.stringify(defaultTranslations));
      
      if (isConfClean) {
        localStorage.setItem('draft_hr_custom_translations', newConfStr);
      }
      console.log('Custom translations successfully synced from database to localStorage.');
    }
    // Re-apply typography after settings are synced from DB
    if (typeof applyTypographySettings === 'function') applyTypographySettings();
    if (typeof window.updateAdminSaveButtonsState === 'function') window.updateAdminSaveButtonsState();
  } catch (e) {
    console.error('Exception syncing settings from database:', e);
    throw e;
  }
}
window.syncSettingsFromDb = syncSettingsFromDb;

const FONT_OPTIONS = [
  { label: 'Inter (Mặc định)', value: 'Inter', stack: "'Inter', system-ui, -apple-system, sans-serif" },
  { label: 'Roboto', value: 'Roboto', stack: "'Roboto', system-ui, sans-serif" },
  { label: 'Montserrat', value: 'Montserrat', stack: "'Montserrat', system-ui, sans-serif" },
  { label: 'Outfit', value: 'Outfit', stack: "'Outfit', system-ui, sans-serif" },
  { label: 'Lora (Serif)', value: 'Lora', stack: "'Lora', 'Times New Roman', serif" },
  { label: 'Playfair Display (Serif)', value: 'Playfair Display', stack: "'Playfair Display', 'Times New Roman', serif" },
];
window.FONT_OPTIONS = FONT_OPTIONS;

// Lazy-load admin font options when needed
function ensureAdminFontsLoaded() {
  const link = document.getElementById('adminFontsLink');
  if (link && (!link.getAttribute('href') || link.getAttribute('href') === '')) {
    link.href = 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap';
    
    // Create preloader elements to force browser to load font files immediately
    const preloader = document.createElement('div');
    preloader.style.cssText = 'position:absolute;top:-9999px;left:-9999px;opacity:0;visibility:hidden;pointer-events:none';
    preloader.innerHTML = `
      <span style="font-family:'Roboto'">a</span>
      <span style="font-family:'Montserrat'">a</span>
      <span style="font-family:'Outfit'">a</span>
      <span style="font-family:'Lora'">a</span>
      <span style="font-family:'Playfair Display'">a</span>
    `;
    document.body.appendChild(preloader);
  }
}
window.ensureAdminFontsLoaded = ensureAdminFontsLoaded;

function applyTypographySettings() {
  try {
    const typo = JSON.parse(localStorage.getItem('hr_typography') || '{}');
    const root = document.documentElement;

    if (typo.fontSize) {
      root.style.setProperty('--font-size', typo.fontSize);

      // Compute scale ratio relative to the 11pt baseline
      // Supports both "11pt" and "11" string formats
      const rawSize = parseFloat(typo.fontSize);
      const BASE_PT = 11;
      if (!isNaN(rawSize) && rawSize > 0) {
        const scale = rawSize / BASE_PT;
        root.style.setProperty('--font-scale', scale.toFixed(4));
      }
    }

    if (typo.fontFamily) {
      // Ensure the font is loaded before applying
      if (typo.fontFamily !== 'Inter') {
        ensureAdminFontsLoaded();
      }
      const found = FONT_OPTIONS.find(f => f.value === typo.fontFamily);
      const stack = found ? found.stack : typo.fontFamily;
      root.style.setProperty('--font-family', stack);
      root.style.setProperty('--font', stack);
    }
  } catch (e) {
    console.error('Error applying typography settings:', e);
  }
}
window.applyTypographySettings = applyTypographySettings;

// Apply typography on load
applyTypographySettings();

function getSurveySectionDivisionRaw(qs, useDraft = false) {
  const uniqueSections = [];
  qs.forEach(q => {
    if (q.section && !uniqueSections.includes(q.section)) {
      uniqueSections.push(q.section);
    }
  });

  let metadata = {};
  try {
    const key = useDraft ? 'draft_hr_section_metadata' : 'hr_section_metadata';
    metadata = JSON.parse(localStorage.getItem(key)) || {};
    // Fallback to production metadata if draft is requested but empty/null
    if (useDraft && Object.keys(metadata).length === 0) {
      metadata = JSON.parse(localStorage.getItem('hr_section_metadata')) || {};
    }
  } catch(e) {}

  const preSections = [];
  const postSections = [];
  const ctrlSections = [];
  
  uniqueSections.forEach(sec => {
    const phase = metadata[sec] && metadata[sec].phase;
    if (phase === 'post') {
      postSections.push(sec);
    } else if (phase === 'pre') {
      preSections.push(sec);
    } else if (phase === 'ctrl') {
      ctrlSections.push(sec);
    } else {
      const defaultPost = ['MC: Kết quả', 'XAI', 'AI Personalization (AIP)', 'Product Traceability', 'Consumer Trust', 'Purchase Intention', 'Environment concern', 'MC: Kết quả (English)'];
      const defaultCtrl = ['MC: Minh bạch', 'MC: Minh bạch (English)', 'Biến kiểm soát'];
      if (defaultPost.includes(sec)) {
        postSections.push(sec);
      } else if (defaultCtrl.includes(sec)) {
        ctrlSections.push(sec);
      } else {
        preSections.push(sec);
      }
    }
  });

  // Sort sections by order metadata or original relative index
  const originalIndices = {};
  uniqueSections.forEach((sec, idx) => {
    originalIndices[sec] = idx;
  });

  const getSecOrder = (secName) => {
    if (metadata[secName] && typeof metadata[secName].order === 'number') {
      return metadata[secName].order;
    }
    if (secName === 'Thông tin chung') return -101;
    if (secName === 'Câu hỏi ban đầu' || secName === 'Face Concern') return -100;
    return originalIndices[secName] !== undefined ? originalIndices[secName] : 0;
  };

  preSections.sort((a, b) => getSecOrder(a) - getSecOrder(b));
  postSections.sort((a, b) => getSecOrder(a) - getSecOrder(b));
  ctrlSections.sort((a, b) => getSecOrder(a) - getSecOrder(b));

  return { preSections, postSections, ctrlSections };
}
window.getSurveySectionDivisionRaw = getSurveySectionDivisionRaw;

function getSurveySectionDivision() {
  const qs = getQuestions() || [];
  return getSurveySectionDivisionRaw(qs);
}
window.getSurveySectionDivision = getSurveySectionDivision;

function getStepIndices() {
  const { preSections } = getSurveySectionDivision();
  const numPre = preSections.length;
  return {
    consent: 0,
    preSectionsStart: numPre > 0 ? 1 : 0,
    preSectionsEnd: numPre > 0 ? numPre : 0, // inclusive
    context: numPre + 1,
    report: numPre + 2,
    survey: numPre + 3,
    controls: numPre + 4,
    end: numPre + 5
  };
}
window.getStepIndices = getStepIndices;

function getSteps() {
  const { preSections } = getSurveySectionDivision();
  const steps = [t('step_consent')];
  
  if (preSections.length > 0) {
    preSections.forEach(sec => {
      if (sec === 'Thông tin chung') {
        steps.push(t('step_respondent_info'));
      } else if (sec === 'Câu hỏi ban đầu' || sec === 'Face Concern') {
        steps.push(t('step_initial'));
      } else {
        const titleObj = getSectionTitle(sec);
        const title = currentLang === 'en' ? (titleObj.en || titleObj.vi) : titleObj.vi;
        steps.push(title);
      }
    });
  }
  
  // Add the static intermediate steps
  steps.push(t('step_context'));
  steps.push(t('step_report'));
  steps.push(t('step_survey'));
  steps.push(t('step_controls'));
  steps.push(t('step_end'));
  
  return steps;
}

if (!sessionStorage.getItem('hr_session')) {
  localStorage.removeItem('hr_state');
  sessionStorage.setItem('hr_session', '1');
}
const SURVEY_VER = 'refashion_v4';
if (localStorage.getItem('survey_version') !== SURVEY_VER) {
  localStorage.removeItem('hr_questions');
  localStorage.removeItem('hr_state');
  localStorage.removeItem('draft_hr_questions');
  localStorage.removeItem('draft_hr_custom_translations');
  localStorage.removeItem('hr_custom_translations');
  localStorage.setItem('survey_version', SURVEY_VER);
}
let state=JSON.parse(localStorage.getItem('hr_state'))||{step:0,surveySub:0,condition:'case_3',profile:{},responses:{},startedAt:new Date().toISOString()};
if (!state.participant_id) {
  state.participant_id = 'P_' + Math.random().toString(36).slice(2, 8);
  localStorage.setItem('hr_state', JSON.stringify(state));
}
let step=state.step,surveySub=state.surveySub,DATASET=null,currentProfile=null;

function getQuestions(){
  let qs = JSON.parse(localStorage.getItem('hr_questions')||'null');
  if(!qs) {
    qs = defaultQuestions();
    saveQuestions(qs);
  }

  // Auto-migrate/inject English translations for existing questions if missing
  let needsSave = false;
  const standardEnOptions = {
    'resp_ft': { optionsEN: ['Yes', 'No'] },
    'resp_eval': { optionsEN: ['Yes', 'No'] },
    'resp_ai_dev': { optionsEN: ['Yes', 'No'] },
    'resp_gender': { optionsEN: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    'resp_age': { optionsEN: ['18-24', '25-34', '35-44', '45-54', '55 and above'] },
    'resp_region': { optionsEN: ['HCMC', 'Hanoi', 'Other North', 'Central - Highlands', 'Other South'] },
    'resp_dept': { optionsEN: ['Sales', 'Marketing - Customer Care', 'Operations - Production', 'Finance - Accounting', 'HR - Admin', 'IT - Technical', 'Other'] },
    'resp_experience': { optionsEN: ['Under 1 year', '1-3 years', '4-6 years', '7-10 years', 'Over 10 years'] },
    'CTRL_AI_FAM': { optionsEN: ['Very low', 'Low', 'Medium', 'High', 'Very high'] },
    'CTRL_AI_EXP': { optionsEN: ['Never', 'Occasionally', 'Regularly'] },
    'DETAIL_LEVEL': { labelStartEN: 'Very sketchy', labelEndEN: 'Very detailed' }
  };

  qs.forEach(q => {
    if (!q.textEN) {
      const staticEN = typeof getItemText === 'function' ? getItemText(q.id, true) : null;
      if (staticEN) {
        q.textEN = staticEN;
        needsSave = true;
      }
    }
    const std = standardEnOptions[q.id];
    if (std) {
      if (std.optionsEN && (!q.optionsEN || q.optionsEN.length === 0)) {
        q.optionsEN = std.optionsEN;
        needsSave = true;
      }
      if (std.labelStartEN && !q.labelStartEN) {
        q.labelStartEN = std.labelStartEN;
        needsSave = true;
      }
      if (std.labelEndEN && !q.labelEndEN) {
        q.labelEndEN = std.labelEndEN;
        needsSave = true;
      }
    }
  });
  if (needsSave) {
    saveQuestions(qs);
  }

  // Force sorting order for "Thông tin chung"
  const generalOrder = [
    'resp_ft',
    'resp_eval',
    'resp_ai_dev',
    'resp_gender',
    'resp_age',
    'resp_region',
    'resp_dept',
    'resp_experience'
  ];

  // Sort questions to maintain correct logical flow order
  const { preSections, postSections, ctrlSections } = getSurveySectionDivisionRaw(qs);
  const orderedSections = [...preSections, ...postSections, ...ctrlSections];
  qs.sort((a, b) => {
    const idxA = orderedSections.indexOf(a.section);
    const idxB = orderedSections.indexOf(b.section);
    if (idxA !== idxB) return idxA - idxB;

    if (a.section === 'Thông tin chung' && b.section === 'Thông tin chung') {
      const ordA = generalOrder.indexOf(a.id);
      const ordB = generalOrder.indexOf(b.id);
      if (ordA !== -1 && ordB !== -1) {
        return ordA - ordB;
      }
    }
    return (a.order || 0) - (b.order || 0);
  });

  return qs;
}
function saveQuestions(qs){
  // Assign order to match their sorted array index
  qs.forEach((q, idx) => {
    q.order = idx + 1;
  });
  localStorage.setItem('hr_questions', JSON.stringify(qs));
}
function defaultQuestions(){
  const qs=[];let order=1;
  const generalInfoItems = [
    { id: 'resp_ft', text: 'Anh/chị có thường xuyên mua sắm quần áo trực tuyến không?', textEN: 'Do you frequently shop for clothes online?', type: 'radio', options: ['Có', 'Không'], optionsEN: ['Yes', 'No'], required: true, section: 'Thông tin chung', order: order++ },
    { id: 'resp_eval', text: 'Anh/chị đã từng sử dụng công cụ hoặc hệ thống gợi ý cá nhân hóa thời trang bằng AI nào chưa?', textEN: 'Have you ever used an AI-powered personalized fashion recommendation tool?', type: 'radio', options: ['Có', 'Không'], optionsEN: ['Yes', 'No'], required: true, section: 'Thông tin chung', order: order++ },
    { id: 'resp_ai_dev', text: 'Anh/chị có quan tâm đến thời trang bền vững, quần áo tái chế (upcycling) không?', textEN: 'Are you interested in sustainable fashion or upcycled clothing?', type: 'radio', options: ['Có', 'Không'], optionsEN: ['Yes', 'No'], required: true, section: 'Thông tin chung', order: order++ },
    { id: 'resp_gender', text: 'Giới tính', textEN: 'Gender', type: 'radio', options: ['Nam', 'Nữ', 'Khác', 'Không muốn trả lời'], optionsEN: ['Male', 'Female', 'Other', 'Prefer not to say'], required: true, section: 'Thông tin chung', order: order++ },
    { id: 'resp_age', text: 'Độ tuổi', textEN: 'Age', type: 'radio', options: ['18-24', '25-34', '35-44', '45-54', 'Từ 55 trở lên'], optionsEN: ['18-24', '25-34', '35-44', '45-54', '55 and above'], required: true, section: 'Thông tin chung', order: order++ },
    { id: 'resp_region', text: 'Khu vực sinh sống', textEN: 'Living region', type: 'radio', options: ['TP.HCM', 'Hà Nội', 'Miền Bắc khác', 'Miền Trung - Tây Nguyên', 'Miền Nam khác'], optionsEN: ['HCMC', 'Hanoi', 'Other North', 'Central - Highlands', 'Other South'], required: true, section: 'Thông tin chung', order: order++ },
    { id: 'resp_dept', text: 'Phong cách thời trang yêu thích của Anh/chị là gì?', textEN: 'What is your preferred fashion style?', type: 'radio', options: ['Thường ngày (Casual)', 'Công sở (Formal)', 'Cổ điển (Vintage)', 'Thể thao (Sporty)', 'Đường phố (Streetwear)', 'Khác'], optionsEN: ['Casual', 'Formal', 'Vintage', 'Sporty', 'Streetwear', 'Other'], required: true, section: 'Thông tin chung', order: order++ },
    { id: 'resp_experience', text: 'Tần suất mua sắm quần áo của Anh/chị?', textEN: 'How often do you shop for clothes?', type: 'radio', options: ['Hàng tuần', 'Hàng tháng', 'Vài tháng một lần', 'Chỉ khi cần thiết', 'Khác'], optionsEN: ['Weekly', 'Monthly', 'Every few months', 'Only when needed', 'Other'], required: true, section: 'Thông tin chung', order: order++ }
  ];
  generalInfoItems.forEach(q=>qs.push(q));

  const addGroup=(section,items)=>items.forEach(([code,text])=>{
    const textEN = typeof getItemText === 'function' ? (getItemText(code, true) || '') : '';
    qs.push({id:code,text,textEN,type:'likert',section,order:order++});
  });
  addGroup('Câu hỏi ban đầu',ITEMS.face);
  addGroup('MC: Minh bạch',ITEMS.mcT);addGroup('MC: Kết quả',ITEMS.mcO);
  addGroup('XAI',ITEMS.xai);
  addGroup('AI Personalization (AIP)',ITEMS.aip);
  addGroup('Product Traceability',ITEMS.pt);
  addGroup('Consumer Trust',ITEMS.ct);
  addGroup('Purchase Intention',ITEMS.pi);
  addGroup('Environment concern',ITEMS.ec);
  // Biến kiểm soát — câu hỏi cuối sau survey chính
  const ctrlItems = [
    { id: 'CTRL_AI_FAM', text: 'Mức độ am hiểu của Anh/chị về các hệ thống trí tuệ nhân tạo (AI)?', textEN: 'How familiar are you with artificial intelligence (AI) systems?', type: 'select', options: ['Rất thấp', 'Thấp', 'Trung bình', 'Cao', 'Rất cao'], optionsEN: ['Very low', 'Low', 'Medium', 'High', 'Very high'], required: true, section: 'Biến kiểm soát', order: order++ },
    { id: 'CTRL_AI_EXP', text: 'Anh/chị đã từng sử dụng công cụ AI trong công việc hàng ngày chưa?', textEN: 'Have you used AI tools in your daily work?', type: 'select', options: ['Chưa từng', 'Thỉnh thoảng', 'Thường xuyên'], optionsEN: ['Never', 'Occasionally', 'Regularly'], required: true, section: 'Biến kiểm soát', order: order++ },
    { id: 'ATT1', text: 'Trong gợi ý trang phục trên, tỷ lệ độ phù hợp (Match percentage) là bao nhiêu?', textEN: 'In the above styling recommendation, what is the match percentage?', type: 'text', required: true, section: 'Biến kiểm soát', order: order++ },
    { id: 'DETAIL_LEVEL', text: 'Theo Anh/chị, gợi ý trang phục trên cung cấp mức độ thông tin chi tiết như thế nào?', textEN: 'In your opinion, how detailed is the styling recommendation information provided above?', type: 'likert', scaleStart: 1, scaleEnd: 7, labelStart: 'Rất sơ sài', labelEnd: 'Rất chi tiết', labelStartEN: 'Very sketchy', labelEndEN: 'Very detailed', required: true, section: 'Biến kiểm soát', order: order++ },
    { id: 'email', text: 'Nếu Anh/chị có nhu cầu nhận kết quả của nghiên cứu này, chúng tôi sẵn sàng cung cấp sau khi hoàn thành, vui lòng nhập địa chỉ email của Anh/chị hoặc gõ "Không" nếu Anh/chị không có nhu cầu.', textEN: 'If you wish to receive the results of this study, please enter your email address or type "No" if you do not want it.', type: 'text', required: true, section: 'Biến kiểm soát', order: order++ }
  ];
  ctrlItems.forEach(q => qs.push(q));
  return qs;
}
window.defaultQuestions = defaultQuestions;

function getSGroups(){
  let qs=getQuestions();if(!qs)qs=defaultQuestions();
  const { preSections, ctrlSections } = getSurveySectionDivision();
  // Filter out questions belonging to pre-demo sections AND control sections (rendered in controls step)
  qs = qs.filter(q => !preSections.includes(q.section) && !ctrlSections.includes(q.section));
  const m=new Map();
  qs.forEach(q=>{if(!m.has(q.section))m.set(q.section,[]);m.get(q.section).push(q);});
  const res=Array.from(m.entries());
  // Section cuối là Biến kiểm soát — always append as virtual entry (rendered by renderControls)
  res.push([t('ctrl_section'),null]);
  return res;
}

const CM={
  high_fav:{t:'high',o:'fav',tL:'Minh bạch: Cao',oL:'Kết quả: Thuận lợi'},
  high_unfav:{t:'high',o:'unfav',tL:'Minh bạch: Cao',oL:'Kết quả: Bất lợi'},
  low_fav:{t:'low',o:'fav',tL:'Minh bạch: Thấp',oL:'Kết quả: Thuận lợi'},
  low_unfav:{t:'low',o:'unfav',tL:'Minh bạch: Thấp',oL:'Kết quả: Bất lợi'}
};
const ITEMS={
  face:[
    ['FC1','Tôi lo ngại bị mất hình ảnh trước người khác nếu sản phẩm do AI gợi ý không phù hợp với tôi.'],
    ['FC2','Tôi quan tâm đến việc bảo vệ phong cách thời trang cá nhân của mình khi sử dụng gợi ý từ hệ thống AI.'],
    ['FC3','Tôi lo ngại người khác sẽ đánh giá tiêu cực hoặc cho rằng tôi có gu thời trang kém nếu mặc đồ tái chế (upcycling) từ ReFashion.'],
    ['FC4','Việc duy trì hình ảnh cá nhân chỉn chu và phong cách là quan trọng đối với tôi khi chọn trang phục.']
  ],
  mcT:[
    ['MC_TBD1','Giao diện gợi ý của ReFashion dường như được thiết kế để cung cấp thông tin minh bạch ngay từ đầu.'],
    ['MC_TBD2','Thông tin giải thích hoặc Hộ chiếu sản phẩm số DPP dường như là một phần không thể thiếu của hệ thống gợi ý thời trang này.'],
    ['MC_TBD3','Hệ thống cung cấp thông tin rõ ràng về các sản phẩm và dữ liệu nguồn gốc.'],
    ['MC_TBD4','Hệ thống giải thích rõ lý do hoặc tiêu chí vì sao sản phẩm này phù hợp với tôi.'],
    ['MC_TBD5','Hệ thống cung cấp lời giải thích dễ hiểu (XAI) cho các gợi ý thời trang.'],
    ['MC_TBD6','Hệ thống truyền đạt rõ ràng nguồn gốc và vòng đời sản phẩm thông qua Hộ chiếu sản phẩm số DPP.'],
    ['MC_TBD7','Hệ thống giúp tôi dễ dàng xác thực tính chính xác của dữ liệu thời trang bền vững.']
  ],
  mcO:[
    ['MC_OF1','Các sản phẩm gợi ý mà tôi nhận được từ hệ thống AI là rất phù hợp và đẹp mắt.'],
    ['MC_OF2','Các sản phẩm thời trang tái chế được đề xuất này rất có ích cho nhu cầu của tôi.'],
    ['MC_OF3','Các gợi ý thời trang từ hệ thống AI này đúng với những gì tôi mong muốn.']
  ],
  xai:[
    ['XAI1','Tôi thấy phần giải thích của ReFashion dễ hiểu.'],
    ['XAI2','Tôi nghĩ kết quả của ReFashion có thể giải thích được.']
  ],
  aip:[
    ['AIP1','Tính năng cá nhân hóa bằng AI của hệ thống gợi ý ReFashion cung cấp các đề xuất mua sắm phù hợp với nhu cầu của tôi.'],
    ['AIP2','Tính năng cá nhân hóa bằng AI của hệ thống gợi ý ReFashion cho phép tôi chọn các sản phẩm được thiết kế riêng cho mình.'],
    ['AIP3','Tính năng cá nhân hóa bằng AI của hệ thống gợi ý ReFashion được tùy chỉnh theo nhu cầu của tôi.'],
    ['AIP4','Tính năng cá nhân hóa bằng AI của hệ thống gợi ý ReFashion thích nghi với hoàn cảnh của tôi.']
  ],
  pt:[
    ['PT1','Ngoài thông tin cơ bản về sản phẩm (thành phần, nơi sản xuất, hạn sử dụng, ..), việc truy xuất nguồn gốc sản phẩm còn giúp nhận diện hàng giả.'],
    ['PT2','Thông tin về quy trình phân phối quần áo, bao gồm từng giai đoạn vận chuyển và cách xử lý sản phẩm.']
  ],
  ct:[
    ['CT1','Hệ thống gợi ý thời trang tuần hoàn ReFashion là đáng tin cậy.'],
    ['CT2','Tôi có thể tin tưởng vào những gợi ý thời trang từ hệ thống ReFashion.']
  ],
  pi:[
    ['PI1','Tôi có ý định mua quần áo được gợi ý qua hệ thống AI trên nền tảng ReFashion.'],
    ['PI2','Tôi sẵn lòng trả giá cao hơn cho các sản phẩm thời trang bền vững được gợi ý trên ReFashion so với các sản phẩm thông thường.']
  ],
  ec:[
    ['EC1','Tôi rất quan tâm đến các vấn đề bảo vệ môi trường và thời trang bền vững.']
  ]
};

// TDV (Medical Sales Rep) performance metrics aligned with Final Demo reference
const METRIC_INFO=[
  {key:'revenue_million_vnd',       labelKey:'m_revenue',    unit:'tr.đ', target:280, max:400, labelVI:'Doanh thu',          labelEN:'Revenue'},
  {key:'customer_visits_per_month', labelKey:'m_visits',     unit:'lần/tháng', target:45, max:70, labelVI:'Viếng thăm KH',  labelEN:'Customer Visits'},
  {key:'market_share_pct',          labelKey:'m_mkt_share',  unit:'%',  target:18,  max:30,  labelVI:'Thị phần địa bàn',   labelEN:'Market Share'},
  {key:'customer_rating',           labelKey:'m_cust_rating',unit:'/10', target:7.5, max:10, labelVI:'Đánh giá KH',        labelEN:'Customer Rating'},
  {key:'training_sessions',         labelKey:'m_training_s', unit:'lần', target:3,   max:6,   labelVI:'Khóa đào tạo',       labelEN:'Training Sessions'},
  {key:'professional_activities',   labelKey:'m_prof_act',   unit:'lần', target:5,   max:10,  labelVI:'Hoạt động chuyên môn',labelEN:'Professional Activities'}
];

const ALL_VARIABLES=[
  {key:'education_level',           labelKey:'av_education_level',           unit:'',    cat:'Kiểm soát'},
  {key:'employment_type',           labelKey:'av_employment_type',           unit:'',    cat:'Kiểm soát'},
  {key:'years_at_company',          labelKey:'av_years_at_company',          unitKey:'u_years',    cat:'Kiểm soát'},
  {key:'years_in_current_role',     labelKey:'av_years_in_current_role',     unitKey:'u_years',    cat:'Kiểm soát'},
  {key:'years_since_last_promotion',labelKey:'av_years_since_last_promotion',unitKey:'u_years',    cat:'Kiểm soát'},
  {key:'team_size',                 labelKey:'av_team_size',                 unitKey:'u_people',   cat:'Kiểm soát'},
  {key:'performance_score',         labelKey:'av_performance_score',         unit:'/100',cat:'Hiệu suất'},
  {key:'performance_last_year',     labelKey:'av_performance_last_year',     unit:'/100',cat:'Hiệu suất'},
  {key:'performance_two_years_ago', labelKey:'av_performance_two_years_ago', unit:'/100',cat:'Hiệu suất'},
  {key:'manager_rating',            labelKey:'av_manager_rating',            unit:'/5',  cat:'Hiệu suất'},
  {key:'peer_feedback_score',       labelKey:'av_peer_feedback_score',       unit:'/5',  cat:'Hiệu suất'},
  {key:'projects_completed',        labelKey:'av_projects_completed',        unitKey:'u_projects', cat:'Hiệu suất'},
  {key:'kpi_achievement_percent',   labelKey:'av_kpi_achievement_percent',   unit:'%',   cat:'Hiệu suất'},
  {key:'innovation_score',          labelKey:'av_innovation_score',          unit:'/100',cat:'Hiệu suất'},
  {key:'leadership_score',          labelKey:'av_leadership_score',          unit:'/100',cat:'Hiệu suất'},
  {key:'problem_solving_score',     labelKey:'av_problem_solving_score',     unit:'/100',cat:'Hiệu suất'},
  {key:'avg_monthly_hours',         labelKey:'av_avg_monthly_hours',         unitKey:'u_hours',    cat:'Hiệu suất'},
  {key:'overtime_hours',            labelKey:'av_overtime_hours',            unitKey:'u_hours',    cat:'Hiệu suất'},
  {key:'tasks_completed',           labelKey:'av_tasks_completed',           unitKey:'u_tasks',    cat:'Hiệu suất'},
  {key:'deadline_adherence_rate',   labelKey:'av_deadline_adherence_rate',   unit:'%',   cat:'Hiệu suất'},
  {key:'meeting_hours_per_month',   labelKey:'av_meeting_hours_per_month',   unitKey:'u_hours',    cat:'Hiệu suất'},
  {key:'remote_work_ratio',         labelKey:'av_remote_work_ratio',         unit:'%',   cat:'Hiệu suất'},
  {key:'training_hours_last_year',  labelKey:'av_training_hours_last_year',  unitKey:'u_hours',    cat:'Hiệu suất'},
  {key:'certifications_count',      labelKey:'av_certifications_count',      unitKey:'u_items',    cat:'Hiệu suất'},
  {key:'skill_assessment_score',    labelKey:'av_skill_assessment_score',    unit:'/100',cat:'Hiệu suất'},
  {key:'cross_department_projects', labelKey:'av_cross_department_projects', unitKey:'u_projects', cat:'Hiệu suất'},
  {key:'mentoring_sessions',        labelKey:'av_mentoring_sessions',        unitKey:'u_sessions', cat:'Hiệu suất'},
  {key:'salary',                    labelKey:'av_salary',                    unit:'VNĐ', cat:'Kiểm soát'},
  {key:'salary_increase_percent',   labelKey:'av_salary_increase_percent',   unit:'%',   cat:'Kiểm soát'},
  {key:'bonus_last_year',           labelKey:'av_bonus_last_year',           unit:'VNĐ', cat:'Kiểm soát'},
  {key:'stock_options',             labelKey:'av_stock_options',             unitKey:'u_shares',   cat:'Kiểm soát'},
  {key:'attendance_rate',           labelKey:'av_attendance_rate',           unit:'%',   cat:'Kiểm soát'},
  {key:'late_days',                 labelKey:'av_late_days',                 unitKey:'u_days',     cat:'Kiểm soát'},
  {key:'employee_engagement_score', labelKey:'av_employee_engagement_score', unit:'/100',  cat:'Hiệu suất'},
  {key:'job_satisfaction_score',    labelKey:'av_job_satisfaction_score',    unit:'/5',  cat:'Hiệu suất'},
  {key:'internal_mobility_score',   labelKey:'av_internal_mobility_score',   unit:'/100',cat:'Hiệu suất'}
];

// Contribution weights for TDV evaluation (aligned with reference report)
const CONTRIB=[
  {key:'revenue_million_vnd',       labelKey:'c_revenue',   weight:35, max:400, target:280},
  {key:'customer_visits_per_month', labelKey:'c_visits',    weight:25, max:70,  target:45},
  {key:'market_share_pct',          labelKey:'c_mkt_share', weight:20, max:30,  target:18},
  {key:'customer_rating',           labelKey:'c_cust_rat',  weight:15, max:10,  target:7.5},
  {key:'training_sessions',         labelKey:'c_training',  weight:3,  max:6,   target:3},
  {key:'professional_activities',   labelKey:'c_prof_act',  weight:2,  max:10,  target:5}
];

/* ── HELPERS ── */
function $(s){return document.getElementById(s)}

// Client-side translation helper using Google Translate's free endpoint
async function translateText(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data[0] && data[0][0]) {
      return data[0].map(x => x[0]).join('');
    }
  } catch (e) {
    console.error('Translation failed', e);
  }
  return text;
}
window.translateText = translateText;

window.triggerInlineTranslation = async function(btn, targetLang, text) {
  btn.disabled = true;
  btn.textContent = targetLang === 'en' ? 'Translating...' : 'Đang dịch...';
  const translated = await translateText(text, targetLang);
  const translatableWrapper = btn.parentElement.querySelector('.translatable-text');
  if (translatableWrapper) {
    translatableWrapper.innerHTML = translated;
  }
  btn.style.display = 'none';
};

function renderQuestionField(q, indexPrefix){
  if (!q) return '';
  const sv=state.responses[q.id]||'';
  const enText = getItemText(q.id);
  
  // Check if we need to show translation button
  let showTranslateBtn = false;
  let displayText = q.text;
  
  if (currentLang === 'en') {
    if (q.textEN) {
      displayText = q.textEN;
    } else if (enText) {
      displayText = enText;
    } else {
      displayText = q.text;
      showTranslateBtn = true;
    }
  } else {
    // VI language
    displayText = q.text || q.textEN || '';
    if (!q.text && q.textEN) {
      showTranslateBtn = true;
    }
  }
  
  const reqAst = (q.required !== false) ? '<span style="color:var(--red);">*</span>' : '';
  
  let translateBtnHtml = '';
  if (showTranslateBtn && displayText) {
    const targetLang = currentLang;
    const btnLabel = currentLang === 'en' ? '🌐 Translate to EN' : '🌐 Dịch sang VI';
    // Escape single quotes in displayText for safety in onclick attribute
    const escapedText = displayText.replace(/'/g, "\\'");
    translateBtnHtml = ` <button type="button" class="translate-btn" onclick="triggerInlineTranslation(this, '${targetLang}', '${escapedText}')" style="margin-left:8px;font-size: calc(8.5pt * var(--font-scale));padding:2px 6px;border-radius:4px;border:1px solid var(--navy);background:none;color:var(--navy);cursor:pointer;">${btnLabel}</button>`;
  }

  const prefixStr = indexPrefix ? `${indexPrefix}. ` : '';

  let html = `<div class="survey-question-block" style="margin-bottom: 24px;">
    <p style="font-weight: 600; margin-bottom: 10px; font-size: calc(11.5pt * var(--font-scale)); color:var(--navy);">
      ${prefixStr}<span class="translatable-text">${displayText}${reqAst ? '&nbsp;' + reqAst : ''}</span>${translateBtnHtml}
    </p>`;
    
    const getOptionLabel = (qObj, optText, idx) => {
    if (currentLang === 'en') {
      if (qObj.optionsEN && qObj.optionsEN[idx]) return qObj.optionsEN[idx];
      if (qObj.id === 'CTRL_AI_FAM') {
        const tr = t(`survey_ai_fam_${idx + 1}`);
        if (tr) return tr;
      }
      if (qObj.id === 'CTRL_AI_EXP') {
        const tr = t(`survey_ai_exp_${idx + 1}`);
        if (tr) return tr;
      }
    }
    return optText;
  };

  if (q.type === 'likert' || !q.type) {
    const startVal = q.scaleStart !== undefined ? Number(q.scaleStart) : 1;
    const endVal = q.scaleEnd !== undefined ? Number(q.scaleEnd) : 5;
    const count = endVal - startVal + 1;
    const range = [];
    for (let n = startVal; n <= endVal; n++) range.push(n);
    
    html += `<div class="scale" style="grid-template-columns: repeat(${count}, 1fr);">${range.map(n=>{
      let labelText = '';
      if (n === startVal) {
        if (currentLang === 'en') {
          labelText = q.labelStartEN !== undefined ? q.labelStartEN : (q.labelStart || (startVal === 1 && endVal === 5 ? t('likert_1') : ''));
        } else {
          labelText = q.labelStart !== undefined ? q.labelStart : (startVal === 1 && endVal === 5 ? t('likert_1') : '');
        }
      } else if (n === endVal) {
        if (currentLang === 'en') {
          labelText = q.labelEndEN !== undefined ? q.labelEndEN : (q.labelEnd || (startVal === 1 && endVal === 5 ? t('likert_5') : ''));
        } else {
          labelText = q.labelEnd !== undefined ? q.labelEnd : (startVal === 1 && endVal === 5 ? t('likert_5') : '');
        }
      }
      return `<label><input type="radio" name="${q.id}" value="${n}" ${String(sv)===String(n)?'checked':''}><strong>${n}</strong><span>${labelText}</span></label>`;
    }).join('')}</div>`;
  } else if (q.type === 'radio') {
    const opts = q.options || ['Lựa chọn 1'];
    html += `<div class="survey-radio-list" style="display:flex;flex-direction:column;gap:12px;margin-top:8px;">
      ${opts.map((opt, oIdx)=>{
        const labelText = getOptionLabel(q, opt, oIdx);
        return `<label style="display:flex;align-items:center;gap:10px;font-weight:normal;cursor:pointer;font-size: calc(10.5pt * var(--font-scale));color:var(--black)">
          <input type="radio" name="${q.id}" value="${opt.replace(/"/g, '&quot;')}" ${String(sv)===String(opt)?'checked':''}>
          <span>${labelText}</span>
        </label>`;
      }).join('')}
    </div>`;
  } else if (q.type === 'checkbox') {
    const selectedOpts = sv ? sv.split(',') : [];
    const opts = q.options || ['Lựa chọn 1'];
    html += `<div class="survey-checkbox-list" style="display:flex;flex-direction:column;gap:12px;margin-top:8px;">
      ${opts.map((opt, oIdx)=>{
        const labelText = getOptionLabel(q, opt, oIdx);
        return `<label style="display:flex;align-items:center;gap:10px;font-weight:normal;cursor:pointer;font-size: calc(10.5pt * var(--font-scale));color:var(--black)">
          <input type="checkbox" name="${q.id}" value="${opt.replace(/"/g, '&quot;')}" ${selectedOpts.includes(opt)?'checked':''} onchange="updateCheckboxValue('${q.id}')">
          <span>${labelText}</span>
        </label>`;
      }).join('')}
    </div>`;
  } else if (q.type === 'text') {
    const ph = q.placeholder || (currentLang === 'en' ? 'Your answer' : 'Câu trả lời của Anh/chị');
    html += `<input type="text" class="survey-select" style="width:100%;max-width:500px;border:1px solid var(--gray-light);border-radius:6px;padding:8px 12px;font-family:var(--font);font-size: calc(10.5pt * var(--font-scale));" name="${q.id}" value="${sv.replace(/"/g, '&quot;')}" placeholder="${ph.replace(/"/g, '&quot;')}">`;
  } else if (q.type === 'select' || q.type === 'combobox') {
    const ph = q.placeholder || (currentLang === 'en' ? 'Select an option...' : 'Vui lòng chọn...');
    const opts = q.options || ['Lựa chọn 1'];

    html += `<select class="survey-select" name="${q.id}" style="width:100%;max-width:500px;border:1px solid var(--gray-light);border-radius:6px;padding:8px 12px;font-family:var(--font);font-size: calc(10.5pt * var(--font-scale));background:var(--white);">
      <option value="">${ph.replace(/"/g, '&quot;')}</option>
      ${opts.map((opt, oIdx) => {
        const label = getOptionLabel(q, opt, oIdx);
        return `<option value="${opt.replace(/"/g, '&quot;')}" ${String(sv)===String(opt)?'selected':''}>${label}</option>`;
      }).join('')}
    </select>`;
  }
  
  html += `</div>`;
  return html;
}

function likert(code,text){
  const sv=state.responses[code]||'';
  const qs = getQuestions();
  const q = qs.find(x => x.id === code) || { type: 'likert', id: code, text: text };
  const enText = q.textEN || getItemText(code);
  const displayText = (currentLang === 'en' ? enText : q.text) || text;
  
  const startVal = q.scaleStart !== undefined ? Number(q.scaleStart) : 1;
  const endVal = q.scaleEnd !== undefined ? Number(q.scaleEnd) : 5;
  const count = endVal - startVal + 1;
  const range = [];
  for (let n = startVal; n <= endVal; n++) range.push(n);
  
  return `<div class="likert">
    <p>${displayText}</p>
    <div class="scale" style="grid-template-columns: repeat(${count}, 1fr);">${range.map(n=>{
      let labelText = '';
      if (n === startVal) {
        if (currentLang === 'en') {
          labelText = q.labelStartEN !== undefined ? q.labelStartEN : (q.labelStart || (startVal === 1 && endVal === 5 ? t('likert_1') : ''));
        } else {
          labelText = q.labelStart !== undefined ? q.labelStart : (startVal === 1 && endVal === 5 ? t('likert_1') : '');
        }
      } else if (n === endVal) {
        if (currentLang === 'en') {
          labelText = q.labelEndEN !== undefined ? q.labelEndEN : (q.labelEnd || (startVal === 1 && endVal === 5 ? t('likert_5') : ''));
        } else {
          labelText = q.labelEnd !== undefined ? q.labelEnd : (startVal === 1 && endVal === 5 ? t('likert_5') : '');
        }
      }
      return `<label><input type="radio" name="${code}" value="${n}" ${String(sv)===String(n)?'checked':''}><strong>${n}</strong><span>${labelText}</span></label>`;
    }).join('')}</div>
  </div>`;
}
function likertBlock(title,arr,intro=''){
  return `<section class="card"><h3>${title}</h3>${intro?`<p style="color:var(--gray-dark);margin-bottom:12px">${intro}</p>`:''}${arr.map(([c,t])=>likert(c,t)).join('')}</section>`;
}
function showTooltip(html){
  $('tooltipContent').innerHTML=html;
  $('tooltipPopup').classList.add('show');
  $('tooltipOverlay').classList.add('show');
}
function hideTooltip(){
  $('tooltipPopup').classList.remove('show');
  $('tooltipOverlay').classList.remove('show');
}
$('tooltipClose').onclick=hideTooltip;
$('tooltipOverlay').onclick=hideTooltip;

/* ── TDV METRIC ENRICHMENT ── */
function enrichProfileWithTdvMetrics(profile) {
  if (!profile) return profile;
  const isFav = profile.promoted === 1;
  // Set hardcoded TDV metric values matching the Final Demo template
  var metrics = {
    revenue_million_vnd:       isFav ? 298         : 248,
    customer_visits_per_month: isFav ? 48          : 41,
    market_share_pct:          isFav ? 20.2        : 15.7,
    customer_rating:           isFav ? 8.1         : 7.2,
    training_sessions:         isFav ? 3           : 3,
    professional_activities:   isFav ? 5           : 5
  };
  // Trend per metric
  var trends = isFav
    ? ['Tăng','Ổn định','Tăng','Ổn định','Hoàn thành','Ổn định']
    : ['Giảm','Giảm nhẹ','Giảm','Ổn định','Hoàn thành','Ổn định'];
  var trendsEN = isFav
    ? ['Increasing','Stable','Increasing','Stable','Completed','Stable']
    : ['Decreasing','Slightly decreasing','Decreasing','Stable','Completed','Stable'];
  // Peer comparison per metric
  var peerComp = isFav
    ? ['Cao hơn 76% nhóm','Cao hơn 72% nhóm','Cao hơn 79% nhóm','Cao hơn 70% nhóm','Cao hơn 55% nhóm','Cao hơn 57% nhóm']
    : ['Cao hơn 34% nhóm','Cao hơn 39% nhóm','Cao hơn 31% nhóm','Cao hơn 41% nhóm','Cao hơn 55% nhóm','Cao hơn 57% nhóm'];
  var peerCompEN = isFav
    ? ['Higher than 76% of peers','Higher than 72% of peers','Higher than 79% of peers','Higher than 70% of peers','Higher than 55% of peers','Higher than 57% of peers']
    : ['Higher than 34% of peers','Higher than 39% of peers','Higher than 31% of peers','Higher than 41% of peers','Higher than 55% of peers','Higher than 57% of peers'];
  // APAS rating per metric
  var ratings = isFav
    ? ['Đạt tốt','Đạt tốt','Đạt tốt','Đạt','Đạt','Đạt']
    : ['Chưa đạt','Chưa đạt','Chưa đạt','Chưa đạt','Đạt','Đạt'];
  var ratingsEN = isFav
    ? ['Exceeds','Exceeds','Exceeds','Meets','Meets','Meets']
    : ['Below','Below','Below','Below','Meets','Meets'];

  for (var key in metrics) {
    if (profile[key] === undefined || profile[key] === null) {
      profile[key] = metrics[key];
    }
  }
  profile._trends = trends;
  profile._trendsEN = trendsEN;
  profile._peerComp = peerComp;
  profile._peerCompEN = peerCompEN;
  profile._ratings = ratings;
  profile._ratingsEN = ratingsEN;

  return profile;
}
window.enrichProfileWithTdvMetrics = enrichProfileWithTdvMetrics;

/* ── DATASET LOAD ── */
async function loadDataset(){
  try{
    await syncSettingsFromDb();
    const r=await fetch('dataset_sample.json');
    if(!r.ok) throw new Error('fetch fail');
    DATASET=await r.json();
    console.log('DATASET loaded',Object.keys(DATASET).map(k=>k+':'+DATASET[k].length));
    await assignCondition();
    render();
  }catch(e){
    $('app').innerHTML=`<div class="card"><h2>${t('load_error_title')}</h2><p>${t('load_error_desc')}</p><pre style="background:var(--gray-xlight);padding:12px;border-radius:8px;margin-top:8px">cd d:\\HR_XAI\npython -m http.server 8080</pre><p style="margin-top:8px">Then open: <strong>http://localhost:8080/index.html</strong></p></div>`;
  }
}

/* ── CONDITION ASSIGN ── */
function getTargets(){return JSON.parse(localStorage.getItem('hr_targets')||'{"C1":100,"C2":100,"C3":100,"C4":100}')}
async function getCounts(){
  const { data, error } = await sb.from('responses').select('case_id');
  if(error) { console.error('getCounts error', error); return {C1:0,C2:0,C3:0,C4:0}; }
  const c={C1:0,C2:0,C3:0,C4:0};
  data.forEach(r=>{if(r.case_id && c[r.case_id]!==undefined) c[r.case_id]++});
  return c;
}
async function assignCondition(){
  const caseMap={C1:'case_1',C2:'case_2',C3:'case_3',C4:'case_4'};
  const reverseCaseMap={case_1:'C1',case_2:'C2',case_3:'C3',case_4:'C4'};
  
  // Restore existing condition and profile index if they exist
  const validConditions = ['case_1', 'case_2', 'case_3', 'case_4'];
  if (state.condition && validConditions.includes(state.condition) && typeof state.profileIndex === 'number') {
    const caseId = reverseCaseMap[state.condition];
    if (DATASET && DATASET[caseId]) {
      const pool = DATASET[caseId];
      const idx = Math.min(state.profileIndex, pool.length - 1);
      currentProfile = enrichProfileWithTdvMetrics(pool[idx]);
      console.log(`Restored existing condition: ${state.condition}, profile index: ${idx}`);
      return;
    }
  }

  const targets=getTargets(),counts=await getCounts();
  const available=Object.keys(targets).filter(k=>counts[k]<targets[k]);
  if(!available.length){
    state.condition='case_3';
    state.profileIndex=0;
    currentProfile=enrichProfileWithTdvMetrics(DATASET.C1[0]);
    localStorage.setItem('hr_state', JSON.stringify(state));
    return;
  }
  const picked=available[Math.floor(Math.random()*available.length)];
  state.condition=caseMap[picked];
  const pool=DATASET[picked];
  const idx=Math.floor(Math.random()*pool.length);
  state.profileIndex=idx;
  currentProfile=enrichProfileWithTdvMetrics(pool[idx]);
  localStorage.setItem('hr_state', JSON.stringify(state));
}

window.restartApp = async function(){
  if(await showConfirm(t('restart_confirm'))){
    try {
      await syncSettingsFromDb();
    } catch (e) {
      console.error("Failed to sync settings from database on restart:", e);
    }
    step=0;
    surveySub=0;
    state.responses={};
    state.profile={};
    state.tutorial_shown = false;
    state.startedAt = new Date().toISOString();
    state.participant_id = 'P_' + Math.random().toString(36).slice(2, 8);
    delete state.responseDbId;
    delete state.condition;
    delete state.profileIndex;
    await assignCondition();
    render();
  }
};
const restartBtn = $('restartBtn');
if(restartBtn) restartBtn.onclick = window.restartApp;

/* ── RENDER STEPS ── */
function isProfileValid(){
  let assumedProfile = defaultAssumedProfile;
  try {
    const stored = localStorage.getItem('hr_assumed_profile');
    if (stored) {
      assumedProfile = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error parsing assumed profile:', e);
  }

  const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
  
  // Resolve standard fields with getProfileFieldFallback to support backward compatibility
  const empId = getProfileFieldFallback(assumedProfile, ['employee_id', 'id', 'mã nhân viên', 'employee id'], 'NV-A');
  const role = getProfileFieldFallback(assumedProfile, ['role', 'vị trí', 'chức vụ', 'vai trò'], 'N/A');
  const dept = getProfileFieldFallback(assumedProfile, ['dept', 'department', 'phòng ban'], 'N/A');
  const level = getProfileFieldFallback(assumedProfile, ['level', 'cấp bậc', 'rank'], 'N/A');
  const region = getProfileFieldFallback(assumedProfile, ['region', 'khu vực', 'địa bàn'], 'N/A');
  const age = parseInt(getProfileFieldFallback(assumedProfile, ['age', 'tuổi'], 30)) || 30;
  const tenure = getProfileFieldFallback(assumedProfile, ['tenure', 'years_at_company', 'years', 'thâm niên', 'số năm làm việc'], '5 năm');
  const years = parseFloat(tenure) || 5;

  state.profile = {
    ho: '',
    ten: '',
    employee_id: empId,
    role: role,
    dept: dept,
    level: level,
    region: region,
    age: age,
    years: years,
    tenure: tenure
  };

  // Also hydrate all other dynamic fields that might not be in the core ones
  const profileList = normalizeAssumedProfile(assumedProfile);
  profileList.forEach(field => {
    if (!(field.id in state.profile)) {
      state.profile[field.id] = isEn ? (field.valueEN || field.value) : field.value;
    }
  });

  return !!state.profile.employee_id;
}

function isStepValid(){
  const idx = getStepIndices();
  if (step === idx.consent) return !!state.responses.consent;
  
  if (step >= idx.preSectionsStart && step <= idx.preSectionsEnd) {
    const { preSections } = getSurveySectionDivision();
    const currentPreSec = preSections[step - idx.preSectionsStart];
    if (!currentPreSec) return true;
    let qs = getQuestions(); if (!qs) qs = defaultQuestions();
    const secQs = qs.filter(q => q.section === currentPreSec);
    return secQs.every(q => q.required === false || !!state.responses[q.id]);
  }
  
  if (step === idx.context) return isProfileValid();
  if (step === idx.report) return !!state.recommendationGenerated;
  
  if (step === idx.survey) {
    const sgs = getSGroups();
    if (!sgs) return true;
    return sgs.every(([title, qs]) => {
      if (!qs) return true; // skip controls in survey step validation
      return qs.every(q => q.required === false || !!state.responses[q.id]);
    });
  }
  
  if (step === idx.controls) {
    const { ctrlSections } = getSurveySectionDivision();
    let qs = getQuestions(); if (!qs) qs = defaultQuestions();
    const ctrlQs = qs.filter(q => ctrlSections.includes(q.section));
    
    // Check if every question in control variables sections meets its requirement
    const requiredOk = ctrlQs.every(q => {
      if (q.required === false) return true;
      const val = state.responses[q.id];
      if (val === undefined || val === null) return false;
      return String(val).trim().length > 0;
    });

    // Email validation (if email field exists)
    let emailOk = true;
    const emailQ = ctrlQs.find(q => q.id === 'email');
    if (emailQ) {
      const emailVal = (state.responses.email || '').trim().toLowerCase();
      // If it is required, it must not be empty
      if (emailQ.required !== false && emailVal.length === 0) {
        emailOk = false;
      } else if (emailVal.length > 0) {
        emailOk = (
          emailVal === 'không' || 
          emailVal === 'khong' || 
          emailVal === 'no' || 
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)
        );
      }
    }
    
    return requiredOk && emailOk;
  }
  
  return true;
}

function renderProgress(){
  const STEPS = getSteps();
  const idx = getStepIndices();
  $('progressGrid').innerHTML=STEPS.map((_,i)=>`<div class="prog ${i<step?'done':i===step?'active':''}"></div>`).join('');
  
  let label = STEPS[step];
  if(step === idx.survey){
    label = t('step_survey');
  } else if(step === idx.controls){
    label = t('step_controls');
  }
  
  $('progressText').innerHTML=`${t('step_of')} ${step+1}/${STEPS.length} — ${label}`;
  $('controlLabel').innerHTML=label;

  // Toggle pre-demo and report mode classes on body
  if (step === idx.context) {
    document.body.classList.add('pre-demo-mode');
    document.body.classList.remove('report-mode');
  } else if (step === idx.report) {
    document.body.classList.add('pre-demo-mode');
    document.body.classList.add('report-mode');
  } else {
    document.body.classList.remove('pre-demo-mode');
    document.body.classList.remove('report-mode');
  }

  // Toggle test case selector and disclaimer label
  const dl = $('disclaimerLabel');
  if (dl) dl.textContent = '';
  if (step === idx.report) {
    $('testCaseSelect').style.display = (window._isTestMode === true) ? 'flex' : 'none';
  } else {
    $('testCaseSelect').style.display = 'none';
  }
  
  // Update topbar texts
  $('topbarTitle').innerHTML=t('topbar_title');
  $('topbarSubtitle').innerHTML=t('topbar_subtitle');
  $('restartLabel').textContent=t('restart');
  $('prevBtn').textContent=t('btn_prev');
  
  const nb=$('nextBtn');
  const pb=$('prevBtn');
  
  pb.disabled = (step===0);
  
  const valid = isStepValid();
  nb.disabled = !valid;
  
  const isLastSurvey = (step === idx.controls);
  
  if(isLastSurvey) nb.textContent = valid ? t('btn_submit') : t('btn_please_answer');
  else if(step===0) nb.textContent = valid ? t('btn_next') : t('btn_please_agree');
  else if(step >= idx.preSectionsStart && step <= idx.preSectionsEnd) nb.textContent = valid ? t('btn_next') : t('btn_please_answer');
  else if(step === idx.context) nb.textContent = valid ? t('btn_next') : t('btn_please_fill');
  else if(step === idx.survey) nb.textContent = valid ? t('btn_next') : t('btn_please_answer');
  else nb.textContent = t('btn_next');
  
  nb.style.display = step === STEPS.length - 1 ? 'none' : 'flex';
}

function renderConsent(){
  return `<section class="card"><h2>${t('consent_title')}</h2>
<p>${t('consent_p1')}</p>
<p>${t('consent_p2')}</p>
<div class="note" style="margin-top:16px"><label class="consent-label"><input type="checkbox" id="consent" name="consent"><span>${t('consent_agree')}</span></label></div></section>`;
}

function renderContext(){
  return `<section class="card"><h2>${t('context_title')}</h2>
<p>${t('context_p1')}</p>
<p>${t('context_p2')}</p>
<p>${t('context_p3')}</p>
<div class="note">${t('context_note')}</div></section>`;
}

function renderInitial(){
  let qs = getQuestions();
  if(!qs) qs = defaultQuestions();
  const initQs = qs.filter(q => q.section === 'Câu hỏi ban đầu').sort((a,b)=>a.order-b.order);
  return `<section class="card"><h2>${t('initial_title')}</h2><p>${t('initial_desc')}</p></section>
${initQs.map(q=>renderQuestionField(q)).join('')}`;
}

function renderProfile(){
  let assumedProfile = defaultAssumedProfile;
  try {
    const stored = localStorage.getItem('hr_assumed_profile');
    if (stored) {
      assumedProfile = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error parsing assumed profile:', e);
  }

  const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';

  // Resolve standard fields with getProfileFieldFallback to support backward compatibility
  const empId = getProfileFieldFallback(assumedProfile, ['employee_id', 'id', 'mã nhân viên', 'employee id'], 'NV-A');
  const role = getProfileFieldFallback(assumedProfile, ['role', 'vị trí', 'chức vụ', 'vai trò'], 'N/A');
  const dept = getProfileFieldFallback(assumedProfile, ['dept', 'department', 'phòng ban'], 'N/A');
  const level = getProfileFieldFallback(assumedProfile, ['level', 'cấp bậc', 'rank'], 'N/A');
  const region = getProfileFieldFallback(assumedProfile, ['region', 'khu vực', 'địa bàn'], 'N/A');
  const age = parseInt(getProfileFieldFallback(assumedProfile, ['age', 'tuổi'], 30)) || 30;
  const tenure = getProfileFieldFallback(assumedProfile, ['tenure', 'years_at_company', 'years', 'thâm niên', 'số năm làm việc'], '5 năm');
  const years = parseFloat(tenure) || 5;

  // Hydrate state.profile to match assumedProfile so that existing logic automatically uses these values
  state.profile = {
    ho: '',
    ten: '',
    employee_id: empId,
    role: role,
    dept: dept,
    level: level,
    region: region,
    age: age,
    years: years,
    tenure: tenure
  };

  // Also hydrate all other dynamic fields that might not be in the core ones
  const profileList = normalizeAssumedProfile(assumedProfile);
  profileList.forEach(field => {
    if (!(field.id in state.profile)) {
      state.profile[field.id] = isEn ? (field.valueEN || field.value) : field.value;
    }
  });

  localStorage.setItem('hr_state', JSON.stringify(state));

  // Dynamically render all fields from profileList
  const fieldsHtml = profileList.map(field => {
    const label = isEn ? (field.labelEN || field.label) : field.label;
    const value = isEn ? (field.valueEN || field.value) : field.value;
    return `<div><strong style="color: var(--gray-dark);">${label}:</strong> <span style="font-weight: 700; color: var(--navy);">${value}</span></div>`;
  }).join('');

  return `<section class="card profile-card" style="padding: 18px 20px; border-radius: var(--radius); background: #fbfdff; border: 1px solid var(--gray-light); box-shadow: var(--shadow); margin-bottom: 16px; width: 100%;">
    <h3 style="font-size: calc(11.5pt * var(--font-scale)); font-weight: 700; color: var(--navy); margin-bottom: 10px; border-bottom: 1px solid var(--gray-light); padding-bottom: 6px; margin-top: 0; text-transform: uppercase;">
      ${isEn ? 'ASSUMED PROFILE' : 'HỒ SƠ GIẢ ĐỊNH'}
    </h3>
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 24px; font-size: calc(10pt * var(--font-scale)); line-height: 1.4;">
      ${fieldsHtml}
    </div>
  </section>`;
}

function renderContextAndProfile() {
  return `<div class="pre-demo-container">
    <div class="pre-demo-col">${renderContext()}</div>
    <div class="pre-demo-col">${renderProfile()}</div>
  </div>`;
}
window.renderContextAndProfile = renderContextAndProfile;
