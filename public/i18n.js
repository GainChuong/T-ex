/* ── i18n — Internationalization ── */
let currentLang = localStorage.getItem('hr_lang') || 'vi';

function t(key) {
  try {
    const custom = JSON.parse(localStorage.getItem('hr_custom_translations')) || {};
    if (custom[currentLang] && custom[currentLang][key]) {
      return custom[currentLang][key];
    }
  } catch(e) {}
  return (LANG[currentLang] && LANG[currentLang][key]) || (LANG.vi[key]) || key;
}

function setLang(lang) {
  currentLang = lang;
  window.currentLang = lang;
  localStorage.setItem('hr_lang', lang);
  document.documentElement.lang = lang === 'vi' ? 'vi' : 'en';
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = lang === 'vi' ? 'EN' : 'VI';
  // Update admin tabs if visible
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
}
window.currentLang = currentLang;
window.t = t;
window.setLang = setLang;

const SECTION_NAMES = {
  'Câu hỏi ban đầu':      { vi: 'Câu hỏi ban đầu',      en: 'Initial Questions' },
  'Thông tin chung':      { vi: 'Thông tin chung',      en: 'General Information' },
  'MC: Minh bạch':         { vi: 'MC: Minh bạch',         en: 'MC: Transparency' },
  'Manipulation check: Minh bạch': { vi: 'MC: Minh bạch', en: 'MC: Transparency' },
  'MC: Kết quả':           { vi: 'MC: Kết quả',           en: 'MC: Outcome' },
  'Manipulation check: Kết quả':   { vi: 'MC: Kết quả',  en: 'MC: Outcome' },
  'Role Appropriateness':  { vi: 'Tính phù hợp vai trò',  en: 'Role Appropriateness' },
  'Tính phù hợp vai trò':  { vi: 'Tính phù hợp vai trò',  en: 'Role Appropriateness' },
  'Procedural Fairness':   { vi: 'Công bằng quy trình',   en: 'Procedural Fairness' },
  'Công bằng quy trình':   { vi: 'Công bằng quy trình',   en: 'Procedural Fairness' },
  'Cognitive Trust':       { vi: 'Niềm tin nhận thức',    en: 'Cognitive Trust' },
  'Niềm tin nhận thức':    { vi: 'Niềm tin nhận thức',    en: 'Cognitive Trust' },
  'Decision Acceptance':   { vi: 'Chấp nhận quyết định',  en: 'Decision Acceptance' },
  'Chấp nhận quyết định':  { vi: 'Chấp nhận quyết định',  en: 'Decision Acceptance' },
  'Biến kiểm soát':        { vi: 'Biến kiểm soát',        en: 'Control Variables' },
  'Control Variables':     { vi: 'Biến kiểm soát',        en: 'Control Variables' },
  'Face Concern':          { vi: 'Mối quan tâm thể diện', en: 'Face Concern' },
  'Mối quan tâm thể diện':{ vi: 'Mối quan tâm thể diện', en: 'Face Concern' },
  'XAI': { vi: 'Giải thích AI (XAI)', en: 'Explainable AI (XAI)' },
  'AI Personalization (AIP)': { vi: 'Gợi ý cá nhân hóa AI (AIP)', en: 'AI Personalization (AIP)' },
  'Product Traceability': { vi: 'Truy xuất nguồn gốc sản phẩm (PT)', en: 'Product Traceability (PT)' },
  'Consumer Trust': { vi: 'Lòng tin người dùng (CT)', en: 'Consumer Trust (CT)' },
  'Purchase Intention': { vi: 'Ý định mua sắm (PI)', en: 'Purchase Intention (PI)' },
  'Environment concern': { vi: 'Nhận thức bền vững (EC)', en: 'Sustainability Awareness (EC)' }
};

const LANG = {
  vi: {
    // ── STEPS ──
    step_consent: "Đồng ý tham gia",
    step_respondent_info: "Thông tin chung",
    step_initial: "Câu hỏi ban đầu",
    step_pre_demo_combined: "Câu hỏi khởi đầu",
    step_context: "Bối cảnh trải nghiệm",
    step_profile: "Thông tin cá nhân",
    step_context_profile_combined: "Bối cảnh & Thông tin cá nhân",
    step_report: "Tư vấn & Gợi ý AI",
    step_survey: "Khảo sát trải nghiệm",
    step_controls: "Thông tin chung",
    step_end: "Kết thúc",

    // ── TOPBAR ──
    topbar_title: "Khảo sát hệ thống kinh tế tuần hoàn ở lĩnh vực thời trang",
    topbar_subtitle: "Nghiên cứu khoa học về XAI & DPP · Khảo sát ẩn danh",
    restart: "Làm lại",
    restart_confirm: "Anh/chị có chắc chắn muốn làm lại từ đầu? Mọi thông tin đã nhập sẽ bị xóa.",

    // ── PROGRESS ──
    step_of: "Bước",
    part_of: "Phần",

    // ── BUTTONS ──
    btn_next: "Tiếp tục →",
    btn_prev: "← Quay lại",
    btn_submit: "Gửi khảo sát ✓",
    profile_other: "Khác",
    btn_please_agree: "Vui lòng đồng ý trước",
    btn_please_answer: "Vui lòng trả lời hết",
    btn_please_fill: "Vui lòng nhập đủ thông tin",
    btn_ok: "Tôi đã hiểu",

    // ── LIKERT LABELS ──
    likert_1: "Hoàn toàn<br>không đồng ý",
    likert_5: "Hoàn toàn<br>đồng ý",

    // ── CONSENT ──
    consent_title: "Thông tin nghiên cứu & đồng ý tham gia",
    consent_p1: "Nghiên cứu này đo lường tác động của ba nhân tố: Gợi ý cá nhân hóa bằng AI (AI Personalization), Giải thích AI (XAI) và Hộ chiếu sản phẩm số (DPP) thông qua Nhận thức bền vững đến Lòng tin, từ đó thúc đẩy Ý định mua sắm của người dùng trên nền tảng thời trang tuần hoàn <strong>ReFashion</strong>.",
    consent_p2: 'Khảo sát <strong>hoàn toàn ẩn danh</strong> và không thu thập thông tin định danh cá nhân. Thời gian ước tính: 5-7 phút.',
    consent_agree: 'Tôi đã đọc thông tin trên và <strong>đồng ý tham gia</strong> khảo sát này.',

    // ── INITIAL QUESTIONS ──
    initial_title: "Một số câu hỏi về cảm nhận cá nhân",
    initial_desc: "Vui lòng trả lời theo cảm nhận chung trước khi xem hệ thống gợi ý cá nhân hóa thời trang.",

    // ── CONTEXT ──
    context_title: "Bối cảnh trải nghiệm",
    context_p1: 'Hãy tưởng tượng Anh/chị đang trải nghiệm tính năng gợi ý cá nhân hóa thời trang từ hệ thống AI của nền tảng thời trang tuần hoàn <strong>ReFashion</strong>.',
    context_p2: 'Hệ thống AI sẽ phân tích sở thích cá nhân của Anh/chị để đề xuất các sản phẩm gợi ý cá nhân hóa phù hợp nhất. Đồng thời, hệ thống cung cấp các thông tin giải thích lý do gợi ý (XAI) hoặc Hộ chiếu sản phẩm số (DPP) để nâng cao nhận thức bền vững và kiểm chứng nguồn gốc.',
    context_p3: "Anh/chị chuẩn bị xem giao diện gợi ý cá nhân hóa thời trang của <strong>ReFashion</strong>. Hãy xem xét kỹ các sản phẩm được đề xuất cùng thông tin đi kèm (XAI hoặc DPP), sau đó trả lời các câu hỏi khảo sát.",
    context_note: "Tình huống mang tính thử nghiệm trải nghiệm người dùng thực tế. Vui lòng phản hồi dựa trên cảm nhận chân thực nhất của Anh/chị.",

    // ── PROFILE ──
    profile_title: "Hồ sơ cá nhân",
    profile_desc: "Vui lòng cung cấp một số thông tin cơ bản.",
    profile_last_name: "Họ",
    profile_first_name: "Tên",
    profile_dept: "Phòng ban",
    profile_region: "Khu vực",
    profile_age: "Tuổi",
    profile_years: "Số năm làm việc",
    profile_select: "-- Chọn --",
    profile_other: "Khác",
    profile_dept_other_ph: "Nhập phòng ban khác",
    profile_region_other_ph: "Nhập khu vực khác",
    dept_sales: "Kinh doanh", dept_marketing: "Marketing", dept_hr: "Nhân sự",
    dept_finance: "Tài chính", dept_tech: "Công nghệ", dept_prod: "Sản xuất",
    dept_ops: "Vận hành", dept_other: "Khác",
    region_north: "Miền Bắc", region_central: "Miền Trung", region_south: "Miền Nam", region_other: "Khác",

    // ── DASHBOARD (AI Report) ──
    metrics_title: "Các chỉ số hiệu suất",
    report_employee: "Nhân viên",
    report_dept: "Phòng ban",
    report_seniority: "Thâm niên",
    report_years_unit: "năm",
    report_pred_score: "Điểm dự báo",
    report_threshold: "Ngưỡng thăng tiến",
    report_fav: "Có tiềm năng thăng tiến",
    report_unfav: "Chưa đủ điều kiện thăng tiến",
    report_raw_val: "Giá trị thực tế",
    ai_disclaimer: "Hệ thống đánh giá AI có thể mắc lỗi. Vui lòng kiểm tra các thông tin quan trọng.",
    help_question: "Anh/chị có thắc mắc?",
    tutorial_tooltip_text: "Sau khi theo dõi giá trị các chỉ số, Anh/chị có thể bấm vô đây để biết cách AI dự đoán",

    // ── HELP TOOLTIPS ──
    help_data_title: "Dữ liệu không được sử dụng",
    help_data_desc: "Mô hình sử dụng các dữ liệu liên quan đến hiệu suất công việc và một số thông tin công việc nền tảng. Mô hình không sử dụng các thông tin định danh cá nhân hoặc các đặc điểm nhạy cảm như họ tên, giới tính, tình trạng hôn nhân và khu vực cư trú.",
    help_control_vars: "1. Biến kiểm soát (Control Variables)",
    help_perf_vars: "2. Biến hiệu suất (Performance Variables)",
    help_collection: "Dữ liệu được thu thập tự động định kỳ mỗi tháng từ hệ thống quản lý nhân sự tập trung.",
    help_collection_label: "Cách thu thập:",
    help_ai_title: "Cách mô hình tạo ra kết quả",
    help_ai_desc: "Mô hình học máy được huấn luyện trên dữ liệu hiệu suất lịch sử, học cách nhận diện mẫu hành vi và kết quả công việc đặc trưng cho từng nhóm xếp loại. Điểm đầu ra phản ánh mức độ tương đồng của hồ sơ cá nhân với các mẫu đó.",
    help_limit_title: "Giới hạn của mô hình",
    help_limit_desc: "Mô hình có thể không nắm bắt được các yếu tố không có trong dữ liệu: thay đổi khối lượng công việc đột xuất, đóng góp không chính thức, hoặc hoàn cảnh cá nhân tạm thời.",
    help_resp_title: "Trách nhiệm giải thích",
    help_resp_desc: "Bộ phận nhân sự và quản lý trực tiếp chịu trách nhiệm diễn giải báo cáo và đưa ra quyết định cuối cùng.",

    // ── SURVEY ──
    survey_part: "Phần",
    survey_desc: "Vui lòng đánh dấu mức độ phù hợp nhất.",
    survey_ai_fam: "Mức độ quen thuộc với AI",
    survey_ai_exp: "Đã dùng AI trong công việc?",
    survey_ai_fam_1: "Rất thấp", survey_ai_fam_2: "Thấp", survey_ai_fam_3: "Trung bình", survey_ai_fam_4: "Cao", survey_ai_fam_5: "Rất cao",
    survey_ai_exp_1: "Chưa từng", survey_ai_exp_2: "Thỉnh thoảng", survey_ai_exp_3: "Thường xuyên",
    survey_score_q: 'Trong giao diện gợi ý cá nhân hóa của ReFashion, tỷ lệ phù hợp (%) của sản phẩm đầu tiên được gợi ý là bao nhiêu?',
    survey_detail_q: 'Theo Anh/chị, các thông tin giải thích (XAI) hoặc Hộ chiếu sản phẩm số (DPP) đi kèm cung cấp mức độ chi tiết như thế nào?',
    survey_detail_label_start: 'Rất sơ sài',
    survey_detail_label_end: 'Rất chi tiết',
    survey_email_q: 'Nếu Anh/chị có nhu cầu nhận kết quả của nghiên cứu này, chúng tôi sẵn sàng cung cấp sau khi hoàn thành, vui lòng nhập địa chỉ email của Anh/chị hoặc gõ "Không" nếu Anh/chị không có nhu cầu.',
    survey_att_note: 'Câu hỏi kiểm tra sự chú ý:',
    survey_att_instruction: 'Vui lòng chọn mức <strong>4</strong> cho câu hỏi bên dưới.',

    // ── DEBRIEF ──
    debrief_title: "Cảm ơn Anh/chị đã tham gia khảo sát!",
    debrief_desc: "Giao diện và hệ thống gợi ý trong khảo sát là giả lập nghiên cứu. Mọi phản hồi của Anh/chị được lưu trữ hoàn toàn ẩn danh và chỉ sử dụng cho mục đích nghiên cứu khoa học.",
    debrief_dl_json: "Tải phản hồi (JSON)",
    debrief_dl_csv: "Tải phản hồi (CSV)",

    // ── METRIC LABELS (TDV pharma metrics) ──
    m_revenue:     "Doanh thu",
    m_visits:      "Viếng thăm khách hàng",
    m_mkt_share:   "Thị phần địa bàn",
    m_cust_rating: "Đánh giá khách hàng",
    m_training_s:  "Khóa đào tạo",
    m_prof_act:    "Hoạt động chuyên môn",

    // ── CONTRIB LABELS ──
    c_revenue:    "Doanh thu",
    c_visits:     "Viếng thăm khách hàng",
    c_mkt_share:  "Thị phần địa bàn",
    c_cust_rat:   "Đánh giá khách hàng",
    c_training:   "Khóa đào tạo",
    c_prof_act:   "Hoạt động chuyên môn",

    // ── CONTROL SECTION ──
    ctrl_section: "Biến kiểm soát",

    // ── DATA LOAD ERROR ──
    load_error_title: "⚠️ Không thể tải dữ liệu",
    load_error_desc: "Vui lòng mở file qua HTTP server:",
    // ── ADMIN ──
    admin_questions: 'Câu hỏi',
    admin_responses: 'Dữ liệu',
    admin_samples:   'Mẫu',
    admin_stats:     'Thống kê',
    admin_configure: 'Tùy chỉnh',
    admin_q_mgmt:    'Quản lý câu hỏi',
    admin_translate: 'Dịch sang EN ↗',
    admin_translating: 'Đang dịch...',
    
    // ── ALL_VARIABLES labels ──
    av_education_level: 'Trình độ học vấn',
    av_employment_type: 'Loại hình công việc',
    av_years_at_company: 'Số năm tại công ty',
    av_years_in_current_role: 'Số năm ở vị trí hiện tại',
    av_years_since_last_promotion: 'Số năm từ lần thăng tiến cuối',
    av_team_size: 'Quy mô nhóm',
    av_performance_score: 'Điểm hiệu suất hiện tại',
    av_performance_last_year: 'Hiệu suất năm ngoái',
    av_performance_two_years_ago: 'Hiệu suất 2 năm trước',
    av_manager_rating: 'Đánh giá từ quản lý',
    av_peer_feedback_score: 'Đánh giá từ đồng nghiệp',
    av_projects_completed: 'Số dự án đã hoàn thành',
    av_kpi_achievement_percent: 'Tỷ lệ đạt KPI',
    av_innovation_score: 'Điểm sáng tạo',
    av_leadership_score: 'Điểm lãnh đạo',
    av_problem_solving_score: 'Điểm giải quyết vấn đề',
    av_avg_monthly_hours: 'Số giờ làm việc TB tháng',
    av_overtime_hours: 'Số giờ làm thêm',
    av_tasks_completed: 'Số tác vụ hoàn thành',
    av_deadline_adherence_rate: 'Tỷ lệ tuân thủ deadline',
    av_meeting_hours_per_month: 'Số giờ họp hàng tháng',
    av_remote_work_ratio: 'Tỷ lệ làm việc từ xa',
    av_training_hours_last_year: 'Số giờ đào tạo năm qua',
    av_certifications_count: 'Số lượng chứng chỉ',
    av_skill_assessment_score: 'Điểm đánh giá kỹ năng',
    av_cross_department_projects: 'Dự án liên phòng ban',
    av_mentoring_sessions: 'Số buổi hướng dẫn (mentoring)',
    av_salary: 'Mức lương',
    av_salary_increase_percent: 'Tỷ lệ tăng lương',
    av_bonus_last_year: 'Tiền thưởng năm ngoái',
    av_stock_options: 'Quyền chọn cổ phiếu',
    av_attendance_rate: 'Tỷ lệ chuyên cần',
    av_late_days: 'Số ngày đi muộn',
    av_employee_engagement_score: 'Điểm gắn kết nhân viên',
    av_job_satisfaction_score: 'Điểm hài lòng công việc',
    av_internal_mobility_score: 'Điểm luân chuyển nội bộ',
    u_years: 'năm', u_people: 'người', u_projects: 'dự án',
    u_shares: 'cổ phần', u_days: 'ngày', u_tasks: 'tác vụ', u_sessions: 'buổi',
    admin_sec_badge: 'Phần', admin_sec_of: 'trên',
    admin_sec_desc_ph: 'Mô tả phần (tùy chọn)',
    admin_merge_prev: 'Gộp với phần trước', admin_del_sec: 'Xóa phần',
    admin_q_text_label: 'Câu hỏi (Tiếng Việt)', admin_q_en_label: 'Câu hỏi (Tiếng Anh)', admin_q_type_label: 'Dạng câu hỏi',
    admin_move_up: 'Di chuyển lên', admin_move_down: 'Di chuyển xuống',
    admin_duplicate: 'Nhân bản', admin_delete_q: 'Xóa',
    admin_required: 'Bắt buộc', admin_click_edit: 'Bấm để sửa',
    admin_type_label: 'Loại', admin_add_option: 'Thêm tùy chọn',
    admin_scale_from: 'Thang đo từ', admin_scale_to: 'đến',
    admin_logout: 'Đăng xuất',
    admin_q_count: 'câu',
    admin_trans_err: 'Dịch thất bại',
    admin_undo: 'Hoàn tác', admin_redo: 'Làm lại',
    admin_sec_key_label: 'Mã định danh nhóm / Section Key',
    admin_sec_key_ph: 'Mã nhóm...',
    admin_sec_phase_label: 'Vị trí tương quan với AI Demo (Survey Phase)',
    admin_sec_phase_fixed: 'Trước Demo (Bắt buộc)',
    admin_sec_phase_pre: 'Trước Demo (Pre-Demo) - Xuất hiện trước trang bối cảnh',
    admin_sec_phase_post: 'Sau Demo (Post-Demo) - Xuất hiện sau trang AI báo cáo',
    admin_phase_pre_label: 'Trước Demo (Pre-Demo)',
    admin_phase_post_label: 'Sau Demo (Post-Demo)',
    admin_move_up_sec: 'Lên', admin_move_down_sec: 'Xuống',
    admin_move_up_sec_title: 'Di chuyển nhóm lên',
    admin_move_down_sec_title: 'Di chuyển nhóm xuống',
    admin_sec_title_vi_label: 'Tiêu đề hiển thị (Tiếng Việt)',
    admin_sec_title_en_label: 'Hiển thị tiêu đề (Tiếng Anh)',
    admin_sec_title_vi_ph: 'Tiêu đề hiển thị tiếng Việt...',
    admin_sec_desc_vi_label: 'Mô tả hiển thị (Tiếng Việt)',
    admin_sec_desc_en_label: 'Mô tả hiển thị (Tiếng Anh)',
    admin_sec_desc_vi_ph: 'Mô tả tiếng Việt...',
    admin_sec_desc_en_ph: 'Mô tả tiếng Anh...',
    admin_translate_btn: 'Dịch',
    admin_type_likert: 'Thang đo tuyến tính (Linear scale)',
    admin_type_radio: 'Trắc nghiệm (Radio)',
    admin_type_checkbox: 'Hộp kiểm (Checkbox)',
    admin_type_text: 'Văn bản ngắn (Text)',
    admin_likert_label_start: 'Nhãn cho',
    admin_likert_label_optional: '(tùy chọn)',
    admin_likert_ph_start: 'Ví dụ: Không đồng ý',
    admin_likert_ph_end: 'Ví dụ: Hoàn toàn đồng ý',
    admin_text_ph: 'Văn bản câu trả lời ngắn',
    admin_remove_opt: 'Xóa',
    admin_add_q_title: 'Thêm câu hỏi mới',
    admin_add_sec_title: 'Thêm phần mới',
    admin_q_vi_label: 'Câu hỏi (Tiếng Việt)',
    admin_q_en_label: 'Câu hỏi (Tiếng Anh)',
    admin_q_vi_ph: 'Nhập câu hỏi tiếng Việt...',
    admin_q_en_ph: 'Nhập câu hỏi tiếng Anh...',
    admin_configure_title: 'Cài đặt & Tùy chỉnh ngôn ngữ hệ thống',
    admin_configure_reset_btn: 'Khôi phục mặc định hệ thống',
    admin_configure_reset_field: 'Xóa chỉnh sửa',
    admin_configure_reset_confirm: 'Anh/chị có chắc chắn muốn xóa toàn bộ chữ tùy chỉnh và quay về mặc định ban đầu của hệ thống?',
    admin_samples_title: 'Quản lý mẫu',
    admin_samples_note: 'Khi case đã đủ mẫu (thanh xanh lá), hệ thống sẽ không gán thêm người khảo sát vào case đó.',
    admin_test_mode_off: 'Thử nghiệm: Tắt',
    admin_test_mode_on: 'Thử nghiệm: Bật',

    // ── DEMO REPORT CUSTOM TEXTS ──
    report_acc_how_decided: "Cách APAS đưa ra xếp loại",
    report_acc_territory: "Điều chỉnh theo đặc điểm địa bàn",
    report_acc_peer: "So sánh với nhóm TDV tương đồng",
    report_acc_factors: "Yếu tố ảnh hưởng chính",
    report_acc_data_not_used: "Thông tin không dùng để xếp loại",
    report_acc_limitations: "Giới hạn và trách nhiệm",

    report_narrative_fav: "APAS đối chiếu kết quả với dữ liệu lịch sử và xếp loại <strong>Vượt kỳ vọng</strong>. Các chỉ tiêu chính đạt hoặc vượt mục tiêu; thị phần tăng trong ba tháng cuối kỳ.",
    report_narrative_unfav: "APAS đối chiếu kết quả với dữ liệu lịch sử và xếp loại <strong>Cần cải thiện</strong>. Một số chỉ tiêu chính chưa đạt mục tiêu; doanh thu và thị phần có xu hướng giảm.",
    report_territory_desc: "APAS không áp dụng cùng một ngưỡng cho mọi khu vực. Hệ thống so sánh kết quả với các TDV làm việc tại địa bàn có mức cạnh tranh tương tự. Sau điều chỉnh, kết quả vẫn được xếp loại {status}.",
    report_peer_desc: "Nhóm so sánh gồm 156 TDV Cấp 2 có thâm niên, loại địa bàn và danh mục sản phẩm tương tự.",
    report_factors_note: "APAS phân tích các mẫu trong dữ liệu lịch sử; hệ thống không chỉ cộng điểm theo một công thức cố định.",
    report_limitations_desc: "APAS có thể chưa phản ánh đầy đủ biến động thị trường, lỗi nhập dữ liệu hoặc các đóng góp khó định lượng. Bộ phận dữ liệu kiểm tra thông tin đầu vào. Quản lý khu vực và Phòng Nhân sự xem xét kết quả và quyết định thăng tiến. Nhân viên có thể yêu cầu kiểm tra lại dữ liệu trong vòng 10 ngày làm việc.",

    report_kicker_text: "Xếp loại do APAS đưa ra",
    report_eval_period_label: "Kỳ đánh giá",
    report_eval_period_val: "01–06/2025 (6 tháng)",
    report_decision_label: "Quyết định thăng tiến cuối cùng",
    report_decision_val: "Quản lý khu vực và Phòng Nhân sự",
    report_policy_fav: "Đủ điều kiện được xem xét thăng tiến",
    report_policy_unfav: "Chưa đủ điều kiện được xem xét thăng tiến trong kỳ này",
    report_metrics_detail_title: "Chi tiết từng chỉ tiêu",
    report_target_label: "Mục tiêu: ",
    report_metric_met: "Đạt mục tiêu",
    report_metric_below: "Chưa đạt",
    report_trend_label: "Xu hướng: ",
    report_peer_label: "So với nhóm: ",

    report_territory_comp_label: "Mức cạnh tranh của địa bàn",
    report_territory_comp_val: "Cao hơn mức trung bình",
    report_territory_competitors_label: "Nhóm đối thủ",
    report_territory_competitors_val: "9 TDV thuộc 6 công ty",
    report_territory_method_label: "Cách điều chỉnh",
    report_territory_method_val: "So sánh với địa bàn tương tự",

    report_rank_fav: "Hạng 39/156 · Nhóm 25% cao nhất",
    report_rank_unfav: "Hạng 100/156",
    report_trend_fav: "3/6 chỉ tiêu cải thiện trong 04–06/2025; các chỉ tiêu còn lại ổn định",
    report_trend_unfav: "3/6 chỉ tiêu giảm trong 04–06/2025",
    report_peer_desc_lower: "TDV trong nhóm có kết quả thấp hơn",

    report_factor_fav_1: "Thị phần tăng và duy trì trên ngưỡng mục tiêu",
    report_factor_fav_2: "Doanh thu và lượt viếng thăm cùng vượt kế hoạch",
    report_factor_fav_3: "Đánh giá khách hàng duy trì trên mức yêu cầu",
    report_factor_fav_4: "Đào tạo và hoạt động chuyên môn hoàn thành đúng kế hoạch",
    report_factor_unfav_1: "Doanh thu giảm trong ba tháng cuối và chưa đạt mục tiêu",
    report_factor_unfav_2: "Thị phần thấp hơn ngưỡng và trung vị nhóm tương đồng",
    report_factor_unfav_3: "Số lượt viếng thăm và đánh giá khách hàng chưa đạt yêu cầu",
    report_factor_unfav_4: "Đào tạo và hoạt động chuyên môn đã hoàn thành kế hoạch",
    report_impact_high: "Ảnh hưởng cao",
    report_impact_medium: "Ảnh hưởng trung bình",
    report_impact_supporting: "Ảnh hưởng hỗ trợ",
    report_impact_offsetting: "Ảnh hưởng bù trừ",

    report_tag_fullname: "Họ tên",
    report_tag_gender: "Giới tính",
    report_tag_age: "Tuổi hoặc ngày sinh",
    report_tag_marital: "Tình trạng hôn nhân",
    report_tag_residence: "Nơi cư trú",
    report_tag_health: "Sức khỏe",
    report_tag_social: "Mạng xã hội",
    report_tag_messages: "Tin nhắn riêng",
    report_tag_salary: "Lịch sử lương thưởng",

    report_low_details_title: "Thông tin chi tiết trong báo cáo",
    report_low_not_displayed: "Không được hiển thị",
    report_low_disclaimer: "Báo cáo chỉ hiển thị xếp loại và ý nghĩa của kết quả theo chính sách nhân sự. Muốn biết thêm về dữ liệu hoặc cách đánh giá, vui lòng liên hệ Phòng Nhân sự.",
    report_low_contact_btn: "Liên hệ Phòng Nhân sự",
    report_low_item1_title: "Cách APAS đưa ra xếp loại",
    report_low_item1_sub: "Dữ liệu và căn cứ của kết quả",
    report_low_item2_title: "Chi tiết từng chỉ tiêu",
    report_low_item2_sub: "Kết quả, xu hướng và mức đạt của từng chỉ tiêu",
    report_low_item3_title: "Điều chỉnh theo địa bàn",
    report_low_item3_sub: "Cách APAS tính đến mức độ cạnh tranh của khu vực",
    report_low_item4_title: "So sánh với nhóm TDV tương đồng",
    report_low_item4_sub: "Nhóm so sánh và vị trí tương đối",
    report_low_item5_title: "Yếu tố ảnh hưởng chính",
    report_low_item5_sub: "Những yếu tố tác động nhiều nhất đến kết quả",
    report_low_item6_title: "Dữ liệu, giới hạn và trách nhiệm",
    report_low_item6_sub: "Thông tin bị loại trừ và quy trình kiểm tra",
  },
  en: {
    // ── STEPS ──
    step_consent: "Consent",
    step_respondent_info: "General Info",
    step_initial: "Initial Questions",
    step_pre_demo_combined: "Initial Questions",
    step_context: "Experience Scenario",
    step_profile: "Personal Information",
    step_context_profile_combined: "Scenario & Profile",
    step_report: "ReFashion AI Recommendations",
    step_survey: "Evaluation",
    step_controls: "General Information",
    step_end: "Debrief",

    // ── TOPBAR ──
    topbar_title: "Circular Economy System Survey in the Fashion Industry",
    topbar_subtitle: "Scientific Study on XAI & DPP · Anonymous Survey",
    restart: "Restart",
    restart_confirm: "Are you sure you want to restart from the beginning? All entered information will be cleared.",

    // ── PROGRESS ──
    step_of: "Step",
    part_of: "Part",

    btn_please_answer: "Please answer all questions",
    btn_please_fill: "Please fill in all fields",
    btn_next: "Continue →",
    btn_prev: "← Back",
    btn_submit: "Submit Survey ✓",
    btn_please_agree: "Please agree first",
    btn_ok: "Got it",

    // ── LIKERT LABELS ──
    likert_1: "Strongly<br>Disagree",
    likert_5: "Strongly<br>Agree",

    // ── CONSENT ──
    consent_title: "Research Information & Consent",
    consent_p1: "This research measures the impact of three factors: AI Personalization, Explainable AI (XAI), and Digital Product Passport (DPP) through sustainability perception on consumer trust, thereby promoting purchase intention on the <strong>ReFashion</strong> circular fashion platform.",
    consent_p2: 'The survey is <strong>completely anonymous</strong> and does not collect personally identifiable information. Estimated time: 5-7 minutes.',
    consent_agree: 'I have read the above information and <strong>agree to participate</strong> in this survey.',

    // ── INITIAL QUESTIONS ──
    initial_title: "Some questions about personal feelings",
    initial_desc: "Please answer based on your general feelings before viewing the AI-powered personalized fashion recommendations.",

    // ── CONTEXT ──
    context_title: "Experience Scenario",
    context_p1: 'Imagine you are experiencing the personalized fashion recommendation feature from the AI system of the sustainable circular fashion platform <strong>ReFashion</strong>.',
    context_p2: 'The AI system analyzes your style preferences to suggest the most suitable personalized products. Meanwhile, the system provides Explainable AI (XAI) explanations or a Digital Product Passport (DPP) to enhance sustainability perception and verify product origin.',
    context_p3: "You are about to view <strong>ReFashion</strong>'s personalized recommendations. Please review the recommended items and the accompanying info (XAI or DPP) carefully, then answer the survey questions.",
    context_note: "This scenario is designed to test real user experience. Please respond based on your genuine impressions.",

    // ── PROFILE ──
    profile_title: "Personal Profile",
    profile_desc: "Please provide some basic information.",
    profile_last_name: "Last Name",
    profile_first_name: "First Name",
    profile_dept: "Department",
    profile_region: "Region",
    profile_age: "Age",
    profile_years: "Years of Experience",
    profile_select: "-- Select --",
    profile_other: "Other",
    profile_dept_other_ph: "Enter other department",
    profile_region_other_ph: "Enter other region",
    dept_sales: "Sales", dept_marketing: "Marketing", dept_hr: "Human Resources",
    dept_finance: "Finance", dept_tech: "Technology", dept_prod: "Production",
    dept_ops: "Operations", dept_other: "Other",
    region_north: "Northern", region_central: "Central", region_south: "Southern", region_other: "Other",

    // ── DASHBOARD (AI Report) ──
    metrics_title: "Performance Metrics",
    report_employee: "Employee",
    report_dept: "Department",
    report_seniority: "Seniority",
    report_years_unit: "years",
    report_pred_score: "Predicted Score",
    report_threshold: "Promotion Threshold",
    report_fav: "Has promotion potential",
    report_unfav: "Does not meet promotion criteria",
    report_raw_val: "Actual value",
    ai_disclaimer: "AI-generated reports can be incorrect. Please verify important information.",
    help_question: "Have a question?",
    tutorial_tooltip_text: "After tracking the metrics' values, you can click here to know how the AI makes predictions",

    // ── HELP TOOLTIPS ──
    help_data_title: "Data Not Used",
    help_data_desc: "The model uses data related to job performance and some basic job information. The model does not use personally identifiable information or sensitive characteristics such as full name, gender, marital status, and region of residence.",
    help_control_vars: "1. Control Variables",
    help_perf_vars: "2. Performance Variables",
    help_collection: "Data is automatically collected monthly from the centralized HR management system.",
    help_collection_label: "Collection method:",
    help_ai_title: "How the model generates results",
    help_ai_desc: "The machine learning model is trained on historical performance data, learning to recognize behavioral patterns and work outcomes characteristic of each classification group. The output score reflects the degree of similarity of the personal profile to those patterns.",
    help_limit_title: "Model Limitations",
    help_limit_desc: "The model may not capture factors absent from the data: sudden workload changes, informal contributions, or temporary personal circumstances.",
    help_resp_title: "Interpretation Responsibility",
    help_resp_desc: "The HR department and direct managers are responsible for interpreting the report and making final decisions.",

    // ── SURVEY ──
    survey_part: "Part",
    survey_desc: "Please select the most appropriate level.",
    survey_ai_fam: "Familiarity with AI",
    survey_ai_exp: "Have you used AI at work?",
    survey_ai_fam_1: "Very Low", survey_ai_fam_2: "Low", survey_ai_fam_3: "Medium", survey_ai_fam_4: "High", survey_ai_fam_5: "Very High",
    survey_ai_exp_1: "Never", survey_ai_exp_2: "Occasionally", survey_ai_exp_3: "Frequently",
    survey_score_q: 'In the ReFashion recommendation interface, what is the match percentage (%) of the first recommended product?',
    survey_detail_q: 'According to you, how detailed is the explanation (XAI) or Digital Product Passport (DPP) information provided?',
    survey_detail_label_start: 'Very brief',
    survey_detail_label_end: 'Very detailed',
    survey_email_q: 'If you would like to receive the results of this study, we are ready to provide them after completion. Please enter your email address or type "No" if you do not wish to receive them.',
    survey_att_note: 'Attention check question:',
    survey_att_instruction: 'Please select level <strong>4</strong> for the question below.',

    // ── DEBRIEF ──
    debrief_title: "Thank you for participating in the survey!",
    debrief_desc: "The fashion recommendations and interface shown in this survey are simulated for research. Your responses are stored completely anonymously and used only for academic research.",
    debrief_dl_json: "Download Response (JSON)",
    debrief_dl_csv: "Download Response (CSV)",

    // ── METRIC LABELS (TDV pharma metrics) ──
    m_revenue:     "Revenue",
    m_visits:      "Customer Visits",
    m_mkt_share:   "Market Share",
    m_cust_rating: "Customer Rating",
    m_training_s:  "Training Sessions",
    m_prof_act:    "Professional Activities",

    // ── CONTRIB LABELS ──
    c_revenue:    "Revenue",
    c_visits:     "Customer Visits",
    c_mkt_share:  "Market Share",
    c_cust_rat:   "Customer Rating",
    c_training:   "Training Sessions",
    c_prof_act:   "Professional Activities",

    // ── CONTROL SECTION ──
    ctrl_section: "Control Variables",

    // ── DATA LOAD ERROR ──
    load_error_title: "⚠️ Cannot load data",
    load_error_desc: "Please open the file via HTTP server:",
    // ── ADMIN ──
    admin_questions: 'Questions',
    admin_responses: 'Data',
    admin_samples:   'Samples',
    admin_stats:     'Statistics',
    admin_configure: 'Configuration',
    admin_q_mgmt:    'Questions Management',
    admin_translate: 'Translate to EN ↗',
    admin_translating: 'Translating...',
    
    // ── ALL_VARIABLES labels ──
    av_education_level: 'Education Level',
    av_employment_type: 'Employment Type',
    av_years_at_company: 'Years at Company',
    av_years_in_current_role: 'Years in Current Role',
    av_years_since_last_promotion: 'Years Since Last Promotion',
    av_team_size: 'Team Size',
    av_performance_score: 'Current Performance Score',
    av_performance_last_year: 'Performance Last Year',
    av_performance_two_years_ago: 'Performance Two Years Ago',
    av_manager_rating: 'Manager Rating',
    av_peer_feedback_score: 'Peer Feedback Score',
    av_projects_completed: 'Projects Completed',
    av_kpi_achievement_percent: 'KPI Achievement Rate',
    av_innovation_score: 'Innovation Score',
    av_leadership_score: 'Leadership Score',
    av_problem_solving_score: 'Problem Solving Score',
    av_avg_monthly_hours: 'Average Monthly Hours',
    av_overtime_hours: 'Overtime Hours',
    av_tasks_completed: 'Tasks Completed',
    av_deadline_adherence_rate: 'Deadline Adherence Rate',
    av_meeting_hours_per_month: 'Meeting Hours per Month',
    av_remote_work_ratio: 'Remote Work Ratio',
    av_training_hours_last_year: 'Training Hours Last Year',
    av_certifications_count: 'Certifications Count',
    av_skill_assessment_score: 'Skill Assessment Score',
    av_cross_department_projects: 'Cross-Department Projects',
    av_mentoring_sessions: 'Mentoring Sessions',
    av_salary: 'Salary',
    av_salary_increase_percent: 'Salary Increase Rate',
    av_bonus_last_year: 'Bonus Last Year',
    av_stock_options: 'Stock Options',
    av_attendance_rate: 'Attendance Rate',
    av_late_days: 'Late Days',
    av_employee_engagement_score: 'Employee Engagement Score',
    av_job_satisfaction_score: 'Job Satisfaction Score',
    av_internal_mobility_score: 'Internal Mobility Score',
    u_years: 'yrs', u_people: 'people', u_projects: 'projects',
    u_shares: 'shares', u_days: 'days', u_tasks: 'tasks', u_sessions: 'sessions',
    admin_sec_badge: 'Section', admin_sec_of: 'of',
    admin_sec_desc_ph: 'Section description (optional)',
    admin_merge_prev: 'Merge with previous', admin_del_sec: 'Delete section',
    admin_q_text_label: 'Question text (VI)', admin_q_en_label: 'Question text (EN)', admin_q_type_label: 'Question type',
    admin_move_up: 'Move up', admin_move_down: 'Move down',
    admin_duplicate: 'Duplicate', admin_delete_q: 'Delete',
    admin_required: 'Required', admin_click_edit: 'Click to edit',
    admin_type_label: 'Type', admin_add_option: 'Add option',
    admin_scale_from: 'Scale from', admin_scale_to: 'to',
    admin_q_count: 'questions', admin_logout: 'Log out',
    admin_undo: 'Undo', admin_redo: 'Redo',
    // Section card labels
    admin_sec_key_label: 'Section Key',
    admin_sec_key_ph: 'Section key...',
    admin_sec_phase_label: 'Position relative to AI Demo (Survey Phase)',
    admin_sec_phase_fixed: 'Pre-Demo (Required)',
    admin_sec_phase_pre: 'Pre-Demo - Appears before the context page',
    admin_sec_phase_post: 'Post-Demo - Appears after the AI report page',
    admin_phase_pre_label: 'Pre-Demo',
    admin_phase_post_label: 'Post-Demo',
    admin_move_up_sec: 'Up', admin_move_down_sec: 'Down',
    admin_sec_title_vi_label: 'Display Title (Vietnamese)',
    admin_sec_title_en_label: 'Display Title (English)',
    admin_sec_title_vi_ph: 'Display title in Vietnamese...',
    admin_sec_desc_vi_label: 'Description (Vietnamese)',
    admin_sec_desc_en_label: 'Description (English)',
    admin_sec_desc_vi_ph: 'Description in Vietnamese...',
    admin_sec_desc_en_ph: 'Description in English...',
    admin_translate_btn: 'Translate',
    // Question type options
    admin_type_likert: 'Linear scale',
    admin_type_radio: 'Radio',
    admin_type_checkbox: 'Checkbox',
    admin_type_text: 'Short text',
    // Likert labels
    admin_likert_label_start: 'Label for',
    admin_likert_label_optional: '(optional)',
    admin_likert_ph_start: 'E.g. Strongly Disagree',
    admin_likert_ph_end: 'E.g. Strongly Agree',
    admin_text_ph: 'Short answer text',
    // Misc
    admin_remove_opt: 'Remove',
    admin_add_q_title: 'Add new question',
    admin_add_sec_title: 'Add new section',
    admin_q_vi_label: 'Question (Vietnamese)',
    admin_q_en_label: 'Question (English)',
    admin_q_vi_ph: 'Enter Vietnamese question...',
    admin_q_en_ph: 'Enter English version...',
    // Configure tab
    admin_configure_title: 'System Language Settings & Customization',
    admin_configure_reset_btn: 'Restore System Defaults',
    admin_configure_reset_field: 'Clear edits',
    admin_configure_reset_confirm: 'Are you sure you want to clear all custom text and restore the system defaults?',
    // Samples tab
    admin_samples_title: 'Sample Management',
    admin_samples_note: 'When a case reaches its target (green bar), the system will not assign more respondents to that case.',
    // Header
    admin_test_mode_off: 'Test Mode: Off',
    admin_test_mode_on: 'Test Mode: On',
    admin_move_up_sec_title: 'Move section up',
    admin_move_down_sec_title: 'Move section down',

    // ── DEMO REPORT CUSTOM TEXTS ──
    report_acc_how_decided: "How APAS Reached This Rating",
    report_acc_territory: "Territory Adjustment",
    report_acc_peer: "Peer Group Comparison",
    report_acc_factors: "Key Influencing Factors",
    report_acc_data_not_used: "Data Not Used for Rating",
    report_acc_limitations: "Limitations & Responsibility",

    report_narrative_fav: "APAS cross-references results with historical data and rates as <strong>Exceeds Expectations</strong>. Key indicators met or exceeded targets; market share increased in the final three months of the period.",
    report_narrative_unfav: "APAS cross-references results with historical data and rates as <strong>Needs Improvement</strong>. Some key indicators did not meet targets; revenue and market share showed a downward trend.",
    report_territory_desc: "APAS does not apply the same threshold to all territories. The system compares results with MSRs working in territories with similar competition levels. After adjustment, the result is still rated {status}.",
    report_peer_desc: "The comparison group consists of 156 senior Level 2 MSRs with similar tenure, territory type, and product portfolio.",
    report_factors_note: "APAS analyzes patterns in historical data; the system does not simply add up scores based on a fixed formula.",
    report_limitations_desc: "APAS may not fully reflect market fluctuations, data entry errors, or hard-to-quantify contributions. The data department verifies input data. The Area Manager and HR Department review results and make promotion decisions. Employees can request a data re-check within 10 working days.",

    report_kicker_text: "Rating provided by APAS",
    report_eval_period_label: "Evaluation Period",
    report_eval_period_val: "01–06/2025 (6 months)",
    report_decision_label: "Final Decision By",
    report_decision_val: "Area Manager & HR Department",
    report_policy_fav: "Eligible for promotion consideration",
    report_policy_unfav: "Not eligible for promotion consideration in this period",
    report_metrics_detail_title: "Performance Detail by KPI",
    report_target_label: "Target: ",
    report_metric_met: "Met target",
    report_metric_below: "Below target",
    report_trend_label: "Trend: ",
    report_peer_label: "vs Peers: ",

    report_territory_comp_label: "Territory competition level",
    report_territory_comp_val: "Above average",
    report_territory_competitors_label: "Direct competitors",
    report_territory_competitors_val: "9 MSRs from 6 companies",
    report_territory_method_label: "Adjustment method",
    report_territory_method_val: "Compare with similar territories",

    report_rank_fav: "Rank 39/156 · Top 25%",
    report_rank_unfav: "Rank 100/156",
    report_trend_fav: "3/6 metrics improved in 04–06/2025; others stable",
    report_trend_unfav: "3/6 metrics declined in 04–06/2025",
    report_peer_desc_lower: "of peers scored lower",

    report_factor_fav_1: "Market share increased above target threshold",
    report_factor_fav_2: "Revenue and customer visits both exceeded plan",
    report_factor_fav_3: "Customer rating maintained above requirement",
    report_factor_fav_4: "Training and professional activities completed on plan",
    report_factor_unfav_1: "Revenue declined in final quarter, below target",
    report_factor_unfav_2: "Market share below threshold and peer median",
    report_factor_unfav_3: "Customer visits and rating below requirements",
    report_factor_unfav_4: "Training and professional activities completed as planned",
    report_impact_high: "High Impact",
    report_impact_medium: "Medium Impact",
    report_impact_supporting: "Supporting",
    report_impact_offsetting: "Offsetting",

    report_tag_fullname: "Full name",
    report_tag_gender: "Gender",
    report_tag_age: "Age / Date of birth",
    report_tag_marital: "Marital status",
    report_tag_residence: "Place of residence",
    report_tag_health: "Health",
    report_tag_social: "Social media",
    report_tag_messages: "Private messages",
    report_tag_salary: "Salary history",

    report_low_details_title: "Detailed Information in Report",
    report_low_not_displayed: "Not displayed",
    report_low_disclaimer: "The report only displays the rating and its meaning per HR policy. For more information about the data or evaluation method, please contact the HR Department.",
    report_low_contact_btn: "Contact HR Department",
    report_low_item1_title: "How APAS Reached This Rating",
    report_low_item1_sub: "Data and basis of the rating",
    report_low_item2_title: "Performance Detail by KPI",
    report_low_item2_sub: "Results, trends and achievement by metric",
    report_low_item3_title: "Territory Adjustment",
    report_low_item3_sub: "How APAS accounts for regional competition",
    report_low_item4_title: "Peer Group Comparison",
    report_low_item4_sub: "Reference group and relative standing",
    report_low_item5_title: "Key Influencing Factors",
    report_low_item5_sub: "Factors with the highest impact",
    report_low_item6_title: "Data, Limitations & Responsibility",
    report_low_item6_sub: "Excluded data and verification process",
  }
};

// ── Question translations (survey items) ──
const ITEMS_EN = {
  face: [
    ['FC1','I would be concerned about losing my fashion image if the clothes recommended by the AI did not suit me.'],
    ['FC2','I care about protecting my personal style when receiving recommendations from the AI system.'],
    ['FC3','I worry that others would judge me negatively or think I have poor style if I wore upcycled clothes from ReFashion.'],
    ['FC4','Maintaining a neat and stylish personal image is important to me when selecting outfits.']
  ],
  mcT: [
    ['MC_TBD1','The ReFashion recommendation interface appears to be designed with transparency from the outset.'],
    ['MC_TBD2','The styling explanation or DPP Passport seems to be integrated as an essential part of this recommendation system.'],
    ['MC_TBD3','The system provides clear information about the products and their sustainability provenance.'],
    ['MC_TBD4','The system clearly explains the reasons or criteria why this product suits me.'],
    ['MC_TBD5','The system provides understandable explanations (XAI) for fashion recommendations.'],
    ['MC_TBD6','The system clearly communicates product origin and lifecycle via the Digital Product Passport (DPP).'],
    ['MC_TBD7','The system helps me easily verify the reliability of sustainable fashion claims.']
  ],
  mcO: [
    ['MC_OF1','The personalized recommendations I received from the AI system are favorable and appealing.'],
    ['MC_OF2','These recommended upcycled fashion items are beneficial for my needs.'],
    ['MC_OF3','The fashion suggestions from the AI system match what I desired.']
  ],
  xai: [
    ['XAI1','I found the explanation of ReFashion to be easily understandable.'],
    ['XAI2','I think the results of ReFashion are interpretable.']
  ],
  aip: [
    ['AIP1','The AI-powered personalization feature of the ReFashion recommendation system provides purchase suggestions tailored to my needs.'],
    ['AIP2','The AI-powered personalization feature of the ReFashion recommendation system allows me to order products designed specifically for me.'],
    ['AIP3','The AI-powered personalization feature of the ReFashion recommendation system is customized to my needs.'],
    ['AIP4','The AI-powered personalization feature of the ReFashion recommendation system is adapted to my circumstances.']
  ],
  pt: [
    ['PT1','In addition to the basic information about the product (composition, place of manufacture, expiry date, ..), product traceability also helps identify counterfeit goods.'],
    ['PT2','Information about the clothing distribution process, including each stage of transportation and how the goods are handled.']
  ],
  ct: [
    ['CT1','The ReFashion circular fashion recommendation system is trustworthy.'],
    ['CT2','I can trust the fashion recommendations from the ReFashion system.']
  ],
  pi: [
    ['PI1','I intend to buy clothing suggested through the AI system on the ReFashion platform.'],
    ['PI2','I am willing to pay a higher price for sustainable fashion products suggested on ReFashion than for conventional products.']
  ],
  ec: [
    ['EC1','I am highly concerned about environmental protection and sustainable fashion.']
  ],
  att: [
    ['ATT1','I am carefully reading the instructions in this survey.']
  ]
};

// Helper to get translated question text
function getItemText(code, forceEN = false) {
  if (currentLang === 'vi' && !forceEN) return null; // Use original Vietnamese text
  for (const group of Object.values(ITEMS_EN)) {
    const found = group.find(([id]) => id === code);
    if (found) return found[1];
  }
  return null;
}

function getSectionMetadata(name) {
  try {
    const meta = JSON.parse(localStorage.getItem('hr_section_metadata')) || {};
    return meta[name] || null;
  } catch(e) {
    return null;
  }
}
window.getSectionMetadata = getSectionMetadata;

function getSectionTitle(name) {
  if (!name) return { vi: '', en: '' };
  const meta = getSectionMetadata(name);
  const clean = name.replace('Manipulation check: ', 'MC: ');
  const entry = SECTION_NAMES[name] || SECTION_NAMES[clean];
  
  const viTitle = (meta && meta.titleVI && meta.titleVI.trim()) || (entry && entry.vi) || clean;
  const enTitle = (meta && meta.titleEN && meta.titleEN.trim()) || (entry && entry.en) || '';
  
  return { vi: viTitle, en: enTitle };
}
window.getSectionTitle = getSectionTitle;

function getSectionDescription(name) {
  if (!name) return { vi: '', en: '' };
  const meta = getSectionMetadata(name);
  
  let defaultVI = '';
  let defaultEN = '';
  if (name === 'Câu hỏi ban đầu' || name === 'Face Concern') {
    defaultVI = LANG.vi.initial_desc;
    defaultEN = LANG.en.initial_desc || 'Please answer the following personal concern questions.';
  } else if (name === 'Biến kiểm soát' || name === 'Control Variables') {
    defaultVI = 'Vui lòng điền thông tin sau.';
    defaultEN = 'Please fill out the following control variables.';
  } else {
    let oldDesc = '';
    try {
      const oldDescs = JSON.parse(localStorage.getItem('hr_section_descriptions')) || {};
      oldDesc = oldDescs[name] || '';
    } catch(e) {}
    defaultVI = oldDesc || LANG.vi.survey_desc || 'Vui lòng đánh dấu mức độ phù hợp nhất.';
    defaultEN = LANG.en.survey_desc || 'Please indicate your level of agreement.';
  }
  
  const viDesc = (meta && meta.descVI && meta.descVI.trim()) || defaultVI;
  const enDesc = (meta && meta.descEN && meta.descEN.trim()) || defaultEN;
  
  return { vi: viDesc, en: enDesc };
}
window.getSectionDescription = getSectionDescription;

function tSection(name) {
  if (!name) return name;
  const titleObj = getSectionTitle(name);
  const title = currentLang === 'en' ? (titleObj.en || titleObj.vi) : titleObj.vi;
  return title || name;
}
window.tSection = tSection;

function tSectionDesc(name) {
  if (!name) return '';
  const descObj = getSectionDescription(name);
  const desc = currentLang === 'en' ? (descObj.en || descObj.vi) : descObj.vi;
  return desc || '';
}
window.tSectionDesc = tSectionDesc;

const CONFIG_CATEGORIES = [
  {
    name: 'Tiêu đề chung & Tên các bước (General Titles & Step Names)',
    keys: ['topbar_title', 'topbar_subtitle', 'step_consent', 'step_initial', 'step_context', 'step_report', 'step_survey', 'step_controls', 'step_end']
  },
  {
    name: 'Trang Đồng ý tham gia (Consent Page)',
    keys: ['consent_title', 'consent_p1', 'consent_p2', 'consent_agree', 'restart_confirm']
  },
  {
    name: 'Trang Bối cảnh giả định (Assumption Context)',
    keys: ['context_title', 'context_p1', 'context_p2', 'context_p3', 'context_note']
  },
  {
    name: 'Trang Câu hỏi ban đầu (Initial Questions)',
    keys: ['initial_title', 'initial_desc']
  },
  {
    name: 'Báo cáo & Giải thích AI (AI Report & Explanations)',
    keys: ['metrics_title', 'ai_disclaimer', 'tutorial_tooltip_text', 'help_data_title', 'help_data_desc', 'help_ai_title', 'help_ai_desc', 'help_limit_title', 'help_limit_desc', 'help_resp_title', 'help_resp_desc']
  },
  {
    name: 'Mô tả khảo sát (Survey Description)',
    keys: ['survey_desc']
  },
  {
    name: 'Trang kết thúc (Debrief Page)',
    keys: ['debrief_title', 'debrief_desc']
  },
  {
    name: 'Báo cáo Demo & Căn cứ Đánh giá (Demo Report & Bases)',
    keys: [
      'report_fav', 'report_unfav',
      'report_acc_how_decided', 'report_acc_territory', 'report_acc_peer', 'report_acc_factors', 'report_acc_data_not_used', 'report_acc_limitations',
      'report_narrative_fav', 'report_narrative_unfav', 'report_territory_desc', 'report_peer_desc', 'report_factors_note', 'report_limitations_desc',
      'report_kicker_text', 'report_eval_period_label', 'report_eval_period_val', 'report_decision_label', 'report_decision_val', 'report_policy_fav', 'report_policy_unfav',
      'report_metrics_detail_title', 'report_target_label', 'report_metric_met', 'report_metric_below', 'report_trend_label', 'report_peer_label',
      'report_territory_comp_label', 'report_territory_comp_val', 'report_territory_competitors_label', 'report_territory_competitors_val', 'report_territory_method_label', 'report_territory_method_val',
      'report_rank_fav', 'report_rank_unfav', 'report_trend_fav', 'report_trend_unfav', 'report_peer_desc_lower',
      'report_factor_fav_1', 'report_factor_fav_2', 'report_factor_fav_3', 'report_factor_fav_4',
      'report_factor_unfav_1', 'report_factor_unfav_2', 'report_factor_unfav_3', 'report_factor_unfav_4',
      'report_impact_high', 'report_impact_medium', 'report_impact_supporting', 'report_impact_offsetting',
      'report_tag_fullname', 'report_tag_gender', 'report_tag_age', 'report_tag_marital', 'report_tag_residence', 'report_tag_health', 'report_tag_social', 'report_tag_messages', 'report_tag_salary',
      'report_low_details_title', 'report_low_not_displayed', 'report_low_disclaimer', 'report_low_contact_btn',
      'report_low_item1_title', 'report_low_item1_sub', 'report_low_item2_title', 'report_low_item2_sub', 'report_low_item3_title', 'report_low_item3_sub', 'report_low_item4_title', 'report_low_item4_sub', 'report_low_item5_title', 'report_low_item5_sub', 'report_low_item6_title', 'report_low_item6_sub'
    ]
  }
];
window.CONFIG_CATEGORIES = CONFIG_CATEGORIES;
