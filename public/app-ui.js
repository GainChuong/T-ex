let undoStack = [];
let redoStack = [];

window.pushHistory = function () {
  if (window.isFlushing) return;
  const currentQs = localStorage.getItem('draft_hr_questions') || localStorage.getItem('hr_questions');
  const currentMeta = localStorage.getItem('draft_hr_section_metadata') || localStorage.getItem('hr_section_metadata');
  const currentDescs = localStorage.getItem('draft_hr_section_descriptions') || localStorage.getItem('hr_section_descriptions');
  const currentTypo = localStorage.getItem('draft_hr_typography') || localStorage.getItem('hr_typography');
  const currentCT = localStorage.getItem('draft_hr_custom_translations') || localStorage.getItem('hr_custom_translations');
  const currentAP = localStorage.getItem('draft_hr_assumed_profile') || localStorage.getItem('hr_assumed_profile');

  const snapshot = {
    questions: currentQs,
    metadata: currentMeta,
    descriptions: currentDescs,
    typography: currentTypo,
    customTranslations: currentCT,
    assumedProfile: currentAP
  };

  // Prevent duplicate consecutive states
  if (undoStack.length > 0) {
    const last = undoStack[undoStack.length - 1];
    if (last.questions === snapshot.questions &&
      last.metadata === snapshot.metadata &&
      last.descriptions === snapshot.descriptions &&
      last.typography === snapshot.typography &&
      last.customTranslations === snapshot.customTranslations &&
      last.assumedProfile === snapshot.assumedProfile) {
      return;
    }
  }

  undoStack.push(snapshot);
  if (undoStack.length > 50) {
    undoStack.shift();
  }
  redoStack = [];
};

window.undo = async function () {
  if (undoStack.length === 0) {
    showToast('Không có gì để hoàn tác');
    return;
  }
  const current = {
    questions: localStorage.getItem('draft_hr_questions') || localStorage.getItem('hr_questions'),
    metadata: localStorage.getItem('draft_hr_section_metadata') || localStorage.getItem('hr_section_metadata'),
    descriptions: localStorage.getItem('draft_hr_section_descriptions') || localStorage.getItem('hr_section_descriptions'),
    typography: localStorage.getItem('draft_hr_typography') || localStorage.getItem('hr_typography'),
    customTranslations: localStorage.getItem('draft_hr_custom_translations') || localStorage.getItem('hr_custom_translations'),
    assumedProfile: localStorage.getItem('draft_hr_assumed_profile') || localStorage.getItem('hr_assumed_profile')
  };
  redoStack.push(current);

  const snapshot = undoStack.pop();
  if (snapshot.questions) localStorage.setItem('draft_hr_questions', snapshot.questions);
  else localStorage.removeItem('draft_hr_questions');

  if (snapshot.metadata) localStorage.setItem('draft_hr_section_metadata', snapshot.metadata);
  else localStorage.removeItem('draft_hr_section_metadata');

  if (snapshot.descriptions) localStorage.setItem('draft_hr_section_descriptions', snapshot.descriptions);
  else localStorage.removeItem('draft_hr_section_descriptions');

  if (snapshot.typography) localStorage.setItem('draft_hr_typography', snapshot.typography);
  else localStorage.removeItem('draft_hr_typography');

  if (snapshot.customTranslations) localStorage.setItem('draft_hr_custom_translations', snapshot.customTranslations);
  else localStorage.removeItem('draft_hr_custom_translations');

  if (snapshot.assumedProfile) localStorage.setItem('draft_hr_assumed_profile', snapshot.assumedProfile);
  else localStorage.removeItem('draft_hr_assumed_profile');

  if (typeof applyTypographySettings === 'function') applyTypographySettings();
  updateAdminSaveButtonsState();
  activeQIndex = -1;
  renderAdmin();
  if (document.activeElement && document.activeElement.isContentEditable) document.activeElement.blur();
  showToast('Hoàn tác thành công');
};

window.redo = async function () {
  if (redoStack.length === 0) {
    showToast('Không có gì để làm lại');
    return;
  }
  const current = {
    questions: localStorage.getItem('draft_hr_questions') || localStorage.getItem('hr_questions'),
    metadata: localStorage.getItem('draft_hr_section_metadata') || localStorage.getItem('hr_section_metadata'),
    descriptions: localStorage.getItem('draft_hr_section_descriptions') || localStorage.getItem('hr_section_descriptions'),
    typography: localStorage.getItem('draft_hr_typography') || localStorage.getItem('hr_typography'),
    customTranslations: localStorage.getItem('draft_hr_custom_translations') || localStorage.getItem('hr_custom_translations'),
    assumedProfile: localStorage.getItem('draft_hr_assumed_profile') || localStorage.getItem('hr_assumed_profile')
  };
  undoStack.push(current);

  const snapshot = redoStack.pop();
  if (snapshot.questions) localStorage.setItem('draft_hr_questions', snapshot.questions);
  else localStorage.removeItem('draft_hr_questions');

  if (snapshot.metadata) localStorage.setItem('draft_hr_section_metadata', snapshot.metadata);
  else localStorage.removeItem('draft_hr_section_metadata');

  if (snapshot.descriptions) localStorage.setItem('draft_hr_section_descriptions', snapshot.descriptions);
  else localStorage.removeItem('draft_hr_section_descriptions');

  if (snapshot.typography) localStorage.setItem('draft_hr_typography', snapshot.typography);
  else localStorage.removeItem('draft_hr_typography');

  if (snapshot.customTranslations) localStorage.setItem('draft_hr_custom_translations', snapshot.customTranslations);
  else localStorage.removeItem('draft_hr_custom_translations');

  if (snapshot.assumedProfile) localStorage.setItem('draft_hr_assumed_profile', snapshot.assumedProfile);
  else localStorage.removeItem('draft_hr_assumed_profile');

  if (typeof applyTypographySettings === 'function') applyTypographySettings();
  updateAdminSaveButtonsState();
  activeQIndex = -1;
  renderAdmin();
  if (document.activeElement && document.activeElement.isContentEditable) document.activeElement.blur();
  showToast('Làm lại thành công');
};

function showToast(message) {
  let container = document.getElementById('gf-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'gf-toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 24px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: var(--navy, #0B192C);
    color: var(--white, #FFFFFF);
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 10pt;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: auto;
    font-family: inherit;
    border-left: 4px solid var(--blue, #1E3A8A);
  `;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 2500);
}

// Global keyboard listener for Undo/Redo
document.addEventListener('keydown', function (event) {
  if (typeof isAuthed !== 'function' || typeof isAdmin !== 'function') return;
  if (!isAuthed() || !isAdmin()) return;

  const activeTag = document.activeElement ? document.activeElement.tagName : '';
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
    return;
  }

  const isCtrl = event.ctrlKey || event.metaKey;
  if (isCtrl) {
    if (event.key === 'z' || event.key === 'Z') {
      event.preventDefault();
      window.undo();
    } else if (event.key === 'y' || event.key === 'Y') {
      event.preventDefault();
      window.redo();
    }
  }
});

// Helper: pick correct language version of question text
function qText(q) {
  return (currentLang === 'en' && q.textEN) ? q.textEN : q.text;
}

/* ── TEST MODE ── */
window._isTestMode = localStorage.getItem('hr_test_mode') === 'on';

function syncTestModeUI() {
  const on = window._isTestMode;
  const btn = document.getElementById('testModeToggleBtn');
  const label = document.getElementById('testModeLabel');
  if (btn) {
    btn.style.background = on ? 'rgba(255,220,80,0.28)' : 'rgba(255,255,255,0.12)';
    btn.style.borderColor = on ? 'rgba(255,220,80,0.7)' : 'rgba(255,255,255,0.25)';
    btn.style.color = on ? '#ffe566' : '#fff';
  }
  if (label) label.textContent = on ? 'Thử nghiệm: Bật' : 'Thử nghiệm: Tắt';
  // Immediately reflect on the testCaseSelect in the survey topbar
  const sel = document.getElementById('testCaseSelect');
  if (sel) sel.style.display = 'none'; // render() will show it again if needed
}

window.toggleTestMode = function () {
  window._isTestMode = !window._isTestMode;
  localStorage.setItem('hr_test_mode', window._isTestMode ? 'on' : 'off');
  syncTestModeUI();
  showToast(window._isTestMode ? 'Chế độ thử nghiệm: Bật' : 'Chế độ thử nghiệm: Tắt');
  // Trigger re-render so testCaseSelect visibility updates
  if (typeof render === 'function') render();
};

// Init on load
syncTestModeUI();

window.showAlert = function (message, title = 'Thông báo') {
  return new Promise((resolve) => {
    const backdrop = document.getElementById('customModal');
    const titleEl = document.getElementById('customModalTitle');
    const bodyEl = document.getElementById('customModalBody');
    const inputContainer = document.getElementById('customModalInputContainer');
    const cancelBtn = document.getElementById('customModalCancel');
    const okBtn = document.getElementById('customModalOk');

    titleEl.textContent = title;
    bodyEl.textContent = message;
    inputContainer.style.display = 'none';
    cancelBtn.style.display = 'none';
    okBtn.style.display = 'block';

    backdrop.style.display = 'flex';
    backdrop.offsetHeight;
    backdrop.classList.add('show');

    function cleanup() {
      backdrop.classList.remove('show');
      backdrop.style.display = 'none';
      okBtn.removeEventListener('click', onOk);
    }

    function onOk() {
      cleanup();
      resolve();
    }

    okBtn.addEventListener('click', onOk);
  });
};

window.showConfirm = function (message, title = 'Xác nhận') {
  return new Promise((resolve) => {
    const backdrop = document.getElementById('customModal');
    const titleEl = document.getElementById('customModalTitle');
    const bodyEl = document.getElementById('customModalBody');
    const inputContainer = document.getElementById('customModalInputContainer');
    const cancelBtn = document.getElementById('customModalCancel');
    const okBtn = document.getElementById('customModalOk');

    // Clone buttons to remove ALL stale listeners
    const newOk = okBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    titleEl.textContent = title;
    bodyEl.textContent = message;
    inputContainer.style.display = 'none';
    newCancel.style.display = 'block';
    newOk.style.display = 'block';
    newCancel.textContent = 'Hủy';
    newOk.textContent = 'Đồng ý';

    backdrop.style.display = 'flex';
    backdrop.offsetHeight; // force reflow
    backdrop.classList.add('show');

    function cleanup() {
      backdrop.classList.remove('show');
      backdrop.style.display = 'none';
    }

    newOk.addEventListener('click', () => { cleanup(); resolve(true); }, { once: true });
    newCancel.addEventListener('click', () => { cleanup(); resolve(false); }, { once: true });
  });
};

window.showPrompt = function (message, defaultValue = '', title = 'Nhập thông tin') {
  return new Promise((resolve) => {
    const backdrop = document.getElementById('customModal');
    const titleEl = document.getElementById('customModalTitle');
    const bodyEl = document.getElementById('customModalBody');
    const inputContainer = document.getElementById('customModalInputContainer');
    const inputField = document.getElementById('customModalInputField');
    const cancelBtn = document.getElementById('customModalCancel');
    const okBtn = document.getElementById('customModalOk');

    // Clone buttons to clear all stale listeners
    const newOk = okBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    titleEl.textContent = title;
    bodyEl.textContent = message;
    inputContainer.style.display = 'block';
    inputField.value = defaultValue;
    newCancel.style.display = 'block';
    newOk.style.display = 'block';
    newCancel.textContent = 'Hủy';
    newOk.textContent = 'Đồng ý';

    backdrop.style.display = 'flex';
    backdrop.offsetHeight; // force reflow
    backdrop.classList.add('show');
    inputField.focus();

    function cleanup() {
      backdrop.classList.remove('show');
      backdrop.style.display = 'none';
      inputContainer.style.display = 'none';
      inputField.removeEventListener('keydown', onKeyDown);
    }

    function onKeyDown(e) {
      if (e.key === 'Enter') { cleanup(); resolve(inputField.value); }
      else if (e.key === 'Escape') { cleanup(); resolve(null); }
    }

    newOk.addEventListener('click', () => { const val = inputField.value; cleanup(); resolve(val); }, { once: true });
    newCancel.addEventListener('click', () => { cleanup(); resolve(null); }, { once: true });
    inputField.addEventListener('keydown', onKeyDown);
  });
};

/* ── DASHBOARD RENDERERS ── */
function helpBtnSingle(id) {
  return '';
}

function renderMetrics() {
  if (!currentProfile) return '';
  const isHigh = CM[state.condition].t === 'high';
  return `<section class="card" style="position:relative; flex: 1; display: flex; flex-direction: column; margin-bottom: 0; padding: 24px;">${isHigh ? helpBtnSingle('metrics') : ''}<h3 style="margin-bottom: 16px;">${t('metrics_title')}</h3><div class="metric-grid" style="flex: 1; grid-template-rows: 1fr 1fr; margin-bottom: 0;">${METRIC_INFO.map(m => {
    const v = currentProfile[m.key];
    const label = t(m.labelKey);
    const unit = m.unitKey ? t(m.unitKey) : m.unit;
    return `<div class="metric-card" style="display: flex; flex-direction: column; justify-content: center; height: 100%; min-height: 0; padding: 12px 16px;"><div class="label" style="margin-bottom: 4px;">${label}</div><div class="value" style="font-size: calc(20pt * var(--font-scale));">${typeof v === 'number' ? v.toFixed ? v.toFixed(v % 1 ? 1 : 0) : v : v}<span class="unit"> ${unit}</span></div></div>`;
  }).join('')}</div></section>`;
}

function renderBarChart() {
  if (!currentProfile) return '';
  const bars = CONTRIB.map(c => {
    const rawVal = currentProfile[c.key] || 0;
    const pct = Math.min(100, Math.round((rawVal / c.max) * 100));
    const valDisp = typeof rawVal === 'number' ? (rawVal % 1 ? rawVal.toFixed(1) : rawVal) : rawVal;
    return { label: t(c.labelKey), weight: c.weight, pct, valDisp, max: c.max };
  });
  return `<div class="bar-chart">${bars.map(b => `<div class="bar-row" title="${t('report_raw_val')}: ${b.valDisp} / ${b.max}"><span class="bar-label">${b.label} (${b.weight}%)</span><div class="bar-track"><div class="bar-fill ${b.pct > 70 ? 'high' : 'medium'}" style="width:${b.pct}%"></div></div></div>`).join('')}</div>`;
}



function showHelp(id) {
  dismissTutorial();
  let html = '';
  if (id === 'metrics') {
    const controlVars = ALL_VARIABLES.filter(v => v.cat === 'Kiểm soát');
    const perfVars = ALL_VARIABLES.filter(v => v.cat === 'Hiệu suất');
    const renderVar = v => {
      let val = currentProfile[v.key];
      if (v.key === 'years_at_company') val = state.profile.years;
      const valDisp = typeof val === 'number' ? (val % 1 ? val.toFixed(1) : val) : (val || 'N/A');
      const label = t(v.labelKey);
      const unit = v.unitKey ? t(v.unitKey) : (v.unit || '');
      return `<li style="margin-bottom:4px"><strong>${label}:</strong> ${valDisp} ${unit}</li>`;
    };

    html = `<h4>${t('help_data_title')}</h4>
<p>${t('help_data_desc')}</p>
<hr style="border:none; border-top:1px solid var(--gray-light); margin:12px 0">
<strong>${t('metrics_title')}:</strong>
<ul style="margin: 8px 0 0 16px; padding:0; list-style-type:disc">
  ${controlVars.map(renderVar).join('')}
  ${perfVars.map(renderVar).join('')}
</ul>`;
  } else if (id === 'ai') {
    html = `<h4>${t('help_ai_title')}</h4><p>${t('help_ai_desc')}</p>`;
  } else if (id === 'limit') {
    html = `<h4>${t('help_limit_title')}</h4><p>${t('help_limit_desc')}</p>`;
  } else if (id === 'resp') {
    html = `<h4>${t('help_resp_title')}</h4><p>${t('help_resp_desc')}</p>`;
  }
  showTooltip(html);
}

function renderResultCard() {
  if (!currentProfile) return '';
  const isFav = currentProfile.promoted === 1;
  const rating = isFav ? (t('report_fav') || 'Vượt kỳ vọng') : (t('report_unfav') || 'Cần cải thiện');
  const resultClass = isFav ? 'good' : 'bad';
  const policyText = isFav
    ? (t('report_policy_fav') || 'Đủ điều kiện được xem xét thăng tiến')
    : (t('report_policy_unfav') || 'Chưa đủ điều kiện được xem xét thăng tiến trong kỳ này');
    
  const kickerText = t('report_kicker_text') || 'Xếp loại do APAS đưa ra';
  const evalPeriodLabel = t('report_eval_period_label') || 'Kỳ đánh giá';
  const evalPeriodVal = t('report_eval_period_val') || '01–06/2025 (6 tháng)';
  const decisionLabel = t('report_decision_label') || 'Quyết định thăng tiến cuối cùng';
  const decisionVal = t('report_decision_val') || 'Quản lý khu vực và Phòng Nhân sự';

  return `
    <div class="result ${resultClass}" style="margin-bottom: 16px;">
      <div class="result-kicker">${kickerText}</div>
      <div class="result-rating">${rating}</div>
      <div class="policy-box">${policyText}</div>
      <div class="result-grid">
        <div class="result-item">
          <span>${evalPeriodLabel}</span>
          <strong>${evalPeriodVal}</strong>
        </div>
        <div class="result-item">
          <span>${decisionLabel}</span>
          <strong>${decisionVal}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderMetricsList() {
  if (!currentProfile) return '';
  const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
  const trends     = currentProfile._trends || [];
  const trendsEN   = currentProfile._trendsEN || [];
  const peerComp   = currentProfile._peerComp || [];
  const peerCompEN = currentProfile._peerCompEN || [];
  const ratings    = currentProfile._ratings || [];
  const ratingsEN  = currentProfile._ratingsEN || [];
  const barRows = METRIC_INFO.map((m, i) => {
    const actual = currentProfile[m.key];
    const target = m.target;
    const label  = isEn ? (m.labelEN || t(m.labelKey)) : (m.labelVI || t(m.labelKey));
    const unit   = m.unit || '';
    const valDisp = typeof actual === 'number' ? (actual % 1 ? actual.toFixed(1) : actual) : (actual || 0);
    const targetDisp = typeof target === 'number' ? (target % 1 ? target.toFixed(1) : target) : target;
    const pctOfTarget = (actual || 0) / target * 100;
    const reachedTarget = (actual || 0) >= target;
    const basePct = Math.min(100, pctOfTarget);
    const overshootPct = Math.max(0, pctOfTarget - 100);
    const chipText = reachedTarget
      ? (t('report_metric_met') || 'Đạt mục tiêu')
      : (t('report_metric_below') || 'Chưa đạt');
    const chipColor = reachedTarget ? '#10b981' : '#ef4444';
    const chipBg    = reachedTarget ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)';
    var trendTxt  = isEn ? (trendsEN[i] || '--') : (trends[i] || '--');
    var peerTxt   = isEn ? (peerCompEN[i] || '--') : (peerComp[i] || '--');
    var ratingTxt = isEn ? (ratingsEN[i] || '--') : (ratings[i] || '--');
    var ratingColor = '#10b981';
    if (ratingTxt === 'Chưa đạt' || ratingTxt === 'Below') ratingColor = '#ef4444';
    var overshootHtml = overshootPct > 0
      ? '<div style="position:absolute;left:100%;top:0;height:100%;width:' + overshootPct + '%;background:#10b981;border-radius:0 6px 6px 0;transition:width 0.5s ease"></div>'
      : '';
    const targetLabel = t('report_target_label') || (isEn ? 'Target: ' : 'Mục tiêu: ');
    const trendLabel = t('report_trend_label') || (isEn ? 'Trend: ' : 'Xu hướng: ');
    const peerLabel = t('report_peer_label') || (isEn ? 'vs Peers: ' : 'So với nhóm: ');

    return '<div style="margin-bottom:14px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">' +
        '<span style="font-size:calc(9.5pt*var(--font-scale));font-weight:700;color:var(--navy)">' + label + '</span>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<span style="font-size:calc(9pt*var(--font-scale));color:var(--gray-mid)">' + targetLabel + '<strong style="color:var(--navy)">' + targetDisp + unit + '</strong></span>' +
          '<span style="font-size:calc(8.5pt*var(--font-scale));font-weight:700;color:' + chipColor + ';background:' + chipBg + ';border:1px solid ' + chipColor + ';border-radius:4px;padding:1px 7px">' + chipText + '</span>' +
        '</div>' +
      '</div>' +
      '<div style="width:85%">' +
        '<div style="position:relative;height:12px;background:var(--gray-xlight,#f1f5f9);border-radius:6px">' +
          '<div style="position:absolute;left:0;top:0;height:100%;width:' + basePct + '%;background:var(--blue,#1a6bba);border-radius:6px 0 0 6px;transition:width 0.5s ease"></div>' +
          overshootHtml +
          '<div style="position:absolute;right:0;top:2px;width:2px;height:8px;background:rgba(0,0,0,0.3);border-radius:1px"></div>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:3px">' +
          '<span style="font-size:calc(8pt*var(--font-scale));color:var(--gray-mid)">0</span>' +
          '<span style="font-size:calc(9pt*var(--font-scale));font-weight:700;color:' + (reachedTarget?'#10b981':'var(--navy)') + '">' + valDisp + unit + '</span>' +
          '<span style="font-size:calc(8pt*var(--font-scale));color:var(--gray-mid)">' + targetDisp + unit + '</span>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:14px;margin-top:4px;flex-wrap:wrap">' +
        '<span style="font-size:calc(8.5pt*var(--font-scale));color:var(--gray-mid)"><strong>' + trendLabel + '</strong>' + trendTxt + '</span>' +
        '<span style="font-size:calc(8.5pt*var(--font-scale));color:var(--gray-mid)"><strong>' + peerLabel + '</strong>' + peerTxt + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
  
  const detailTitle = t('report_metrics_detail_title') || (isEn ? 'Performance Detail by KPI' : 'Chi tiết từng chỉ tiêu');
  return '<section class="card section" style="margin-bottom:16px;padding:20px 24px">' +
    '<h3 style="margin-top:0;margin-bottom:18px;color:var(--navy);font-size:calc(12pt*var(--font-scale));font-weight:700;text-transform:uppercase">' + detailTitle + '</h3>' +
    barRows +
  '</section>';
}



function dashboardHigh() {
  if (!currentProfile) return '';
  const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
  const isFav = currentProfile.promoted === 1;

  // Narrative text
  const narrative = isFav
    ? (t('report_narrative_fav') || `APAS đối chiếu kết quả với dữ liệu lịch sử và xếp loại <strong>Vượt kỳ vọng</strong>. Các chỉ tiêu chính đạt hoặc vượt mục tiêu; thị phần tăng trong ba tháng cuối kỳ.`)
    : (t('report_narrative_unfav') || `APAS đối chiếu kết quả với dữ liệu lịch sử và xếp loại <strong>Cần cải thiện</strong>. Một số chỉ tiêu chính chưa đạt mục tiêu; doanh thu và thị phần có xu hướng giảm.`);

  // Peer comparison
  const percentile = isFav ? '75%' : '36%';
  const rankText   = isFav
    ? (t('report_rank_fav') || (isEn ? 'Rank 39/156 · Top 25%' : 'Hạng 39/156 · Nhóm 25% cao nhất'))
    : (t('report_rank_unfav') || (isEn ? 'Rank 100/156' : 'Hạng 100/156'));
  const trendSummary = isFav
    ? (t('report_trend_fav') || (isEn ? '3/6 metrics improved in 04–06/2025; others stable' : '3/6 chỉ tiêu cải thiện trong 04–06/2025; các chỉ tiêu còn lại ổn định'))
    : (t('report_trend_unfav') || (isEn ? '3/6 metrics declined in 04–06/2025' : '3/6 chỉ tiêu giảm trong 04–06/2025'));

  // Influencing factors
  const impactHigh = t('report_impact_high') || (isEn ? 'High Impact' : 'Ảnh hưởng cao');
  const impactMedium = t('report_impact_medium') || (isEn ? 'Medium Impact' : 'Ảnh hưởng trung bình');
  const impactSupporting = t('report_impact_supporting') || (isEn ? 'Supporting' : 'Ảnh hưởng hỗ trợ');
  const impactOffsetting = t('report_impact_offsetting') || (isEn ? 'Offsetting' : 'Ảnh hưởng bù trừ');

  const factors = isFav ? [
    [t('report_factor_fav_1') || (isEn ? 'Market share increased above target threshold' : 'Thị phần tăng và duy trì trên ngưỡng mục tiêu'), impactHigh],
    [t('report_factor_fav_2') || (isEn ? 'Revenue and customer visits both exceeded plan' : 'Doanh thu và lượt viếng thăm cùng vượt kế hoạch'), impactHigh],
    [t('report_factor_fav_3') || (isEn ? 'Customer rating maintained above requirement' : 'Đánh giá khách hàng duy trì trên mức yêu cầu'), impactMedium],
    [t('report_factor_fav_4') || (isEn ? 'Training and professional activities completed on plan' : 'Đào tạo và hoạt động chuyên môn hoàn thành đúng kế hoạch'), impactSupporting]
  ] : [
    [t('report_factor_unfav_1') || (isEn ? 'Revenue declined in final quarter, below target' : 'Doanh thu giảm trong ba tháng cuối và chưa đạt mục tiêu'), impactHigh],
    [t('report_factor_unfav_2') || (isEn ? 'Market share below threshold and peer median' : 'Thị phần thấp hơn ngưỡng và trung vị nhóm tương đồng'), impactHigh],
    [t('report_factor_unfav_3') || (isEn ? 'Customer visits and rating below requirements' : 'Số lượt viếng thăm và đánh giá khách hàng chưa đạt yêu cầu'), impactMedium],
    [t('report_factor_unfav_4') || (isEn ? 'Training and professional activities completed as planned' : 'Đào tạo và hoạt động chuyên môn đã hoàn thành kế hoạch'), impactOffsetting]
  ];

  // Excluded info tags
  const excludedTags = [
    t('report_tag_fullname') || (isEn ? 'Full name' : 'Họ tên'),
    t('report_tag_gender') || (isEn ? 'Gender' : 'Giới tính'),
    t('report_tag_age') || (isEn ? 'Age / Date of birth' : 'Tuổi hoặc ngày sinh'),
    t('report_tag_marital') || (isEn ? 'Marital status' : 'Tình trạng hôn nhân'),
    t('report_tag_residence') || (isEn ? 'Place of residence' : 'Nơi cư trú'),
    t('report_tag_health') || (isEn ? 'Health' : 'Sức khỏe'),
    t('report_tag_social') || (isEn ? 'Social media' : 'Mạng xã hội'),
    t('report_tag_messages') || (isEn ? 'Private messages' : 'Tin nhắn riêng'),
    t('report_tag_salary') || (isEn ? 'Salary history' : 'Lịch sử lương thưởng')
  ];

  // Accordion titles
  const accHowDecidedTitle = t('report_acc_how_decided') || (isEn ? 'How APAS Reached This Rating' : 'Cách APAS đưa ra xếp loại');
  const accTerritoryTitle = t('report_acc_territory') || (isEn ? 'Territory Adjustment' : 'Điều chỉnh theo đặc điểm địa bàn');
  const accPeerTitle = t('report_acc_peer') || (isEn ? 'Peer Group Comparison' : 'So sánh với nhóm TDV tương đồng');
  const accFactorsTitle = t('report_acc_factors') || (isEn ? 'Key Influencing Factors' : 'Yếu tố ảnh hưởng chính');
  const accDataNotUsedTitle = t('report_acc_data_not_used') || (isEn ? 'Data Not Used for Rating' : 'Thông tin không dùng để xếp loại');
  const accLimitationsTitle = t('report_acc_limitations') || (isEn ? 'Limitations & Responsibility' : 'Giới hạn và trách nhiệm');

  // Territory adjustment sub-labels & values
  const territoryCompLabel = t('report_territory_comp_label') || (isEn ? 'Territory competition level' : 'Mức cạnh tranh của địa bàn');
  const territoryCompVal = t('report_territory_comp_val') || (isEn ? 'Above average' : 'Cao hơn mức trung bình');
  const territoryCompetitorsLabel = t('report_territory_competitors_label') || (isEn ? 'Direct competitors' : 'Nhóm đối thủ');
  const territoryCompetitorsVal = t('report_territory_competitors_val') || (isEn ? '9 MSRs from 6 companies' : '9 TDV thuộc 6 công ty');
  const territoryMethodLabel = t('report_territory_method_label') || (isEn ? 'Adjustment method' : 'Cách điều chỉnh');
  const territoryMethodVal = t('report_territory_method_val') || (isEn ? 'Compare with similar territories' : 'So sánh với địa bàn tương tự');

  const statusText = isFav ? (t('report_fav') || 'Vượt kỳ vọng') : (t('report_unfav') || 'Cần cải thiện');
  const territoryDesc = (t('report_territory_desc') || (isEn 
    ? "APAS does not apply the same threshold to all territories. The system compares results with MSRs working in territories with similar competition levels. After adjustment, the result is still rated {status}."
    : "APAS không áp dụng cùng một ngưỡng cho mọi khu vực. Hệ thống so sánh kết quả với các TDV làm việc tại địa bàn có mức cạnh tranh tương tự. Sau điều chỉnh, kết quả vẫn được xếp loại {status}."
  )).replace('{status}', statusText);

  // Peer comparison details
  const peerDesc = t('report_peer_desc') || (isEn 
    ? "The comparison group consists of 156 senior Level 2 MSRs with similar tenure, territory type, and product portfolio." 
    : "Nhóm so sánh gồm 156 TDV Cấp 2 có thâm niên, loại địa bàn và danh mục sản phẩm tương tự."
  );
  const peerDescLower = t('report_peer_desc_lower') || (isEn ? 'of peers scored lower' : 'TDV trong nhóm có kết quả thấp hơn');

  // Factors footnote
  const factorsNote = t('report_factors_note') || (isEn 
    ? "APAS analyzes patterns in historical data; the system does not simply add up scores based on a fixed formula." 
    : "APAS phân tích các mẫu trong dữ liệu lịch sử; hệ thống không chỉ cộng điểm theo một công thức cố định."
  );

  // Limitations description
  const limitationsDesc = t('report_limitations_desc') || (isEn 
    ? "APAS may not fully reflect market fluctuations, data entry errors, or hard-to-quantify contributions. The data department verifies input data. The Area Manager and HR Department review results and make promotion decisions. Employees can request a data re-check within 10 working days." 
    : "APAS có thể chưa phản ánh đầy đủ biến động thị trường, lỗi nhập dữ liệu hoặc các đóng góp khó định lượng. Bộ phận dữ liệu kiểm tra thông tin đầu vào. Quản lý khu vực và Phòng Nhân sự xem xét kết quả và quyết định thăng tiến. Nhân viên có thể yêu cầu kiểm tra lại dữ liệu trong vòng 10 ngày làm việc."
  );

  // Shared accordion style injected once
  const accStyle = `
    <style>
      .apas-acc{border:1px solid var(--gray-light,#dce6f1);border-radius:10px;margin-bottom:10px;overflow:hidden;background:#fff}
      .apas-acc summary{list-style:none;cursor:pointer;padding:13px 16px;display:flex;justify-content:space-between;align-items:center;font-size:calc(10.5pt * var(--font-scale));font-weight:700;color:var(--navy);user-select:none;border-left:3px solid var(--blue,#1a6bba)}
      .apas-acc summary::after{content:'\\25BE';font-size:13px;color:var(--blue);transition:transform 0.25s}
      .apas-acc[open]>summary::after{transform:rotate(-180deg)}
      .apas-acc summary::-webkit-details-marker{display:none}
      .apas-acc .acc-body{padding:14px 16px 16px;border-top:1px solid var(--gray-xlight,#f1f5f9)}
      .apas-narrative{background:#f5f9fe;border-left:3px solid var(--blue,#1a6bba);border-radius:0 8px 8px 0;padding:12px 14px;line-height:1.72;font-size:calc(9.5pt * var(--font-scale));color:var(--gray-dark)}
      .apas-factor-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #edf1f5;font-size:calc(9.5pt * var(--font-scale))}
      .apas-factor-row:last-child{border-bottom:none}
      .apas-factor-badge{font-weight:700;color:#23517f;font-size:calc(9pt * var(--font-scale));white-space:nowrap;margin-left:12px}
      .apas-tag{display:inline-block;background:#f0f3f7;border:1px solid #d2dae4;color:#526273;border-radius:5px;padding:3px 8px;font-size:calc(9pt * var(--font-scale));margin:2px 3px 2px 0}
      .apas-info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .apas-info-cell{background:#f6f8fb;border-radius:7px;padding:9px 10px}
      .apas-info-cell span{display:block;color:var(--gray-mid);font-size:calc(9pt * var(--font-scale));margin-bottom:2px}
      .apas-info-cell strong{font-size:calc(10pt * var(--font-scale));color:#234e79}
      .apas-chip{display:inline-block;background:var(--blue-soft,#eaf3fb);color:#23517f;border:1px solid #c6dced;border-radius:4px;padding:2px 7px;font-weight:700;font-size:calc(9pt * var(--font-scale));white-space:nowrap}
      @media(max-width:600px){.apas-info-grid{grid-template-columns:1fr 1fr}}
    </style>`;

  return `
    <div class="dashboard" style="display:flex;flex-direction:column;gap:16px;width:100%">
      ${renderResultCard()}
      ${renderMetricsList()}
      ${accStyle}

      <!-- Accordion: How APAS decided (OPEN by default) -->
      <details class="apas-acc" open>
        <summary>${accHowDecidedTitle}</summary>
        <div class="acc-body">
          <p class="apas-narrative">${narrative}</p>
        </div>
      </details>

      <!-- Accordion: Territory adjustment (collapsed) -->
      <details class="apas-acc">
        <summary>${accTerritoryTitle}</summary>
        <div class="acc-body">
          <div class="apas-info-grid" style="margin-bottom:10px">
            <div class="apas-info-cell"><span>${territoryCompLabel}</span><strong>${territoryCompVal}</strong></div>
            <div class="apas-info-cell"><span>${territoryCompetitorsLabel}</span><strong>${territoryCompetitorsVal}</strong></div>
            <div class="apas-info-cell"><span>${territoryMethodLabel}</span><strong>${territoryMethodVal}</strong></div>
          </div>
          <p style="font-size:calc(9pt * var(--font-scale));color:var(--gray-mid)">${territoryDesc}</p>
        </div>
      </details>

      <!-- Accordion: Peer comparison (collapsed) -->
      <details class="apas-acc">
        <summary>${accPeerTitle}</summary>
        <div class="acc-body">
          <div style="display:grid;grid-template-columns:120px 1fr;gap:16px;align-items:center">
            <div style="text-align:center;border-right:1px solid var(--border,#d9e1ea);padding-right:14px">
              <div style="font-size:32px;font-weight:800;color:var(--blue);line-height:1">${percentile}</div>
              <div style="font-size:calc(9pt * var(--font-scale));color:var(--gray-mid);margin-top:4px">${peerDescLower}</div>
              <div style="font-size:calc(8.5pt * var(--font-scale));color:var(--navy);font-weight:700;margin-top:6px">${rankText}</div>
            </div>
            <div>
              <p style="font-size:calc(9.5pt * var(--font-scale));color:var(--gray-dark);margin:0 0 6px 0">${peerDesc}</p>
              <p style="font-size:calc(9pt * var(--font-scale));color:var(--gray-mid);margin:0">${isEn ? 'Trend: ' : 'Xu hướng: '}${trendSummary}.</p>
            </div>
          </div>
        </div>
      </details>

      <!-- Accordion: Influencing factors (collapsed) -->
      <details class="apas-acc">
        <summary>${accFactorsTitle}</summary>
        <div class="acc-body">
          ${factors.map(f => `<div class="apas-factor-row"><span>${f[0]}</span><span class="apas-factor-badge">${f[1]}</span></div>`).join('')}
          <p style="font-size:calc(9pt * var(--font-scale));color:var(--gray-mid);margin-top:10px">${factorsNote}</p>
        </div>
      </details>

      <!-- Accordion: Data not used (collapsed) -->
      <details class="apas-acc">
        <summary>${accDataNotUsedTitle}</summary>
        <div class="acc-body">
          <p style="font-size:calc(9.5pt * var(--font-scale));color:var(--gray-dark);margin:0 0 10px">${isEn ? 'APAS does not use the following personal information:' : 'APAS không dùng các thông tin cá nhân sau:'}</p>
          <div>${excludedTags.map(tag => `<span class="apas-tag">${tag}</span>`).join('')}</div>
        </div>
      </details>

      <!-- Accordion: Limitations & Responsibility (collapsed) -->
      <details class="apas-acc">
        <summary>${accLimitationsTitle}</summary>
        <div class="acc-body">
          <p style="font-size:calc(9.5pt * var(--font-scale));color:var(--gray-dark);line-height:1.6">${limitationsDesc}</p>
        </div>
      </details>
    </div>
  `;
}

function dashboardLow() {
  if (!currentProfile) return '';
  const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
  
  const locked = [
    [
      t('report_low_item1_title') || (isEn ? 'How APAS Reached This Rating' : 'Cách APAS đưa ra xếp loại'), 
      t('report_low_item1_sub') || (isEn ? 'Data and basis of the rating' : 'Dữ liệu và căn cứ của kết quả')
    ],
    [
      t('report_low_item2_title') || (isEn ? 'Performance Detail by KPI' : 'Chi tiết từng chỉ tiêu'), 
      t('report_low_item2_sub') || (isEn ? 'Results, trends and achievement by metric' : 'Kết quả, xu hướng và mức đạt của từng chỉ tiêu')
    ],
    [
      t('report_low_item3_title') || (isEn ? 'Territory Adjustment' : 'Điều chỉnh theo địa bàn'), 
      t('report_low_item3_sub') || (isEn ? 'How APAS accounts for regional competition' : 'Cách APAS tính đến mức độ cạnh tranh của khu vực')
    ],
    [
      t('report_low_item4_title') || (isEn ? 'Peer Group Comparison' : 'So sánh với nhóm TDV tương đồng'), 
      t('report_low_item4_sub') || (isEn ? 'Reference group and relative standing' : 'Nhóm so sánh và vị trí tương đối')
    ],
    [
      t('report_low_item5_title') || (isEn ? 'Key Influencing Factors' : 'Yếu tố ảnh hưởng chính'), 
      t('report_low_item5_sub') || (isEn ? 'Factors with the highest impact' : 'Những yếu tố tác động nhiều nhất đến kết quả')
    ],
    [
      t('report_low_item6_title') || (isEn ? 'Data, Limitations & Responsibility' : 'Dữ liệu, giới hạn và trách nhiệm'), 
      t('report_low_item6_sub') || (isEn ? 'Excluded data and verification process' : 'Thông tin bị loại trừ và quy trình kiểm tra')
    ]
  ];
  
  const detailsTitle = t('report_low_details_title') || (isEn ? 'Detailed Information in Report' : 'Thông tin chi tiết trong báo cáo');
  const notDisplayedLabel = t('report_low_not_displayed') || (isEn ? 'Not displayed' : 'Không được hiển thị');
  const disclaimerText = t('report_low_disclaimer') || (isEn ? 'The report only displays the rating and its meaning per HR policy. For more information about the data or evaluation method, please contact the HR Department.' : 'Báo cáo chỉ hiển thị xếp loại và ý nghĩa của kết quả theo chính sách nhân sự. Muốn biết thêm về dữ liệu hoặc cách đánh giá, vui lòng liên hệ Phòng Nhân sự.');
  const contactBtnText = t('report_low_contact_btn') || (isEn ? 'Contact HR Department' : 'Liên hệ Phòng Nhân sự');

  return `
    <div class="dashboard" style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
      ${renderResultCard()}
      <div class="apas-locked-box" style="border:1px solid var(--border,#d9e1ea);border-radius:10px;padding:13px 14px;background:#fbfcfe;margin-bottom:16px">
        <h3 style="font-size:calc(12pt * var(--font-scale));font-weight:700;color:var(--navy);margin:0 0 10px 0;display:flex;align-items:center;gap:7px">
          <span style="width:3px;height:13px;border-radius:2px;background:var(--blue2,#1a6bba);flex:0 0 auto"></span>
          ${detailsTitle}
        </h3>
        ${locked.map(function(x) {
          return '<div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid #e9eef4">' +
            '<div><div style="font-weight:700;color:#294d72;font-size:calc(10pt * var(--font-scale))">' + x[0] + '</div>' +
            '<div style="font-size:calc(9pt * var(--font-scale));color:var(--gray-mid);margin-top:2px">' + x[1] + '</div></div>' +
            '<span style="font-size:calc(9pt * var(--font-scale));font-weight:700;color:#66788a;border:1px solid #d2dae4;background:#f1f4f7;border-radius:999px;padding:3px 9px;white-space:nowrap">' + notDisplayedLabel + '</span>' +
            '</div>';
        }).join('')}
      </div>
      <div style="background:var(--blue-soft,#eaf3fb);border:1px solid #c7ddec;border-radius:9px;padding:12px 14px;color:#274a70;font-size:calc(10pt * var(--font-scale));line-height:1.5">
        ${disclaimerText}
        <br><button type="button" style="margin-top:8px;border:0;border-radius:7px;background:var(--blue,#185fa5);color:#fff;padding:7px 14px;font-weight:700;cursor:default;font-family:var(--font);font-size:calc(10pt * var(--font-scale))">${contactBtnText}</button>
      </div>
    </div>
  `;
}

function getProductImage(url, width = 100, height = 100) {
  if (url && !url.includes('/placeholder') && !url.includes('placeholder')) {
    return url;
  }
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="%2324223d"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%238b5cf6" font-weight="bold">Fashion</text></svg>`;
}

async function loadPickerItems() {
  if (state.surveyItems && state.surveyItems.length > 0) {
    renderPickerGrids();
    return;
  }
  try {
    const response = await fetch('http://localhost:5000/api/survey/items');
    if (!response.ok) throw new Error('Không thể tải danh sách sản phẩm');
    const items = await response.json();
    state.surveyItems = items;
    save();
    renderPickerGrids();
  } catch (err) {
    console.error(err);
    const placeholder = document.getElementById('picker-loading-placeholder');
    if (placeholder) {
      placeholder.innerHTML = `
        <div style="color:#ef4444; padding:20px 0;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem; margin-bottom:10px;"></i>
          <h4>Không thể kết nối đến Flask backend</h4>
          <p style="font-size:0.85rem; margin-top:5px; color:var(--gray-mid);">Hãy chắc chắn rằng Flask server (app.py) đang chạy ở cổng 5000 và đã được bật CORS.</p>
        </div>
      `;
    }
  }
}

function togglePickerItem(asin, cardElement, category) {
  if (!state.selectedPickerAsins) state.selectedPickerAsins = [];
  
  const selectedSet = new Set(state.selectedPickerAsins);
  const surveyItems = state.surveyItems || [];
  
  const count = Array.from(selectedSet).filter(selectedAsin => {
    const item = surveyItems.find(i => i.parent_asin === selectedAsin);
    return item && item.store === category;
  }).length;

  if (selectedSet.has(asin)) {
    selectedSet.delete(asin);
    if (cardElement) cardElement.classList.remove('selected');
  } else {
    if (count >= 3) {
      alert(`Chỉ được chọn tối đa 3 sản phẩm thuộc danh mục "${category}"!`);
      return;
    }
    selectedSet.add(asin);
    if (cardElement) cardElement.classList.add('selected');
  }

  state.selectedPickerAsins = Array.from(selectedSet);
  save();
  updateUIState();
}

function updateUIState() {
  const categories = ["Áo Khoác", "Áo Thun", "Quần", "Giày", "Balo & Túi"];
  const surveyItems = state.surveyItems || [];
  const selectedPickerAsins = state.selectedPickerAsins || [];

  let allValid = true;

  categories.forEach(cat => {
    const count = selectedPickerAsins.filter(selectedAsin => {
      const item = surveyItems.find(i => i.parent_asin === selectedAsin);
      return item && item.store === cat;
    }).length;

    // Update counter text
    const counter = document.getElementById(`counter-${cat}`);
    if (counter) {
      counter.textContent = `Đã chọn: ${count}/3`;
      counter.style.color = count >= 1 ? '#10b981' : 'var(--gray-mid)';
    }

    // Update sidebar badge
    const badge = document.getElementById(`badge-${cat}`);
    if (badge) {
      if (count >= 1 && count <= 3) {
        badge.textContent = `Chọn: ${count}`;
        badge.className = 'status-badge complete';
      } else {
        badge.textContent = 'Chưa chọn';
        badge.className = 'status-badge missing';
        allValid = false;
      }
    }
  });

  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.disabled = !allValid;
  }
}

async function submitSelections() {
  const area = document.getElementById('main-content-area');
  if (!area) return;

  // Show loading screen
  area.innerHTML = `
    <div class="rec-view-container">
      <div style="text-align:center; padding:60px 0;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.5rem; color: var(--blue); margin-bottom: 1rem;"></i>
        <h3 style="font-family:var(--font-serif); color:var(--black); font-size:1.25rem;">AI Stylist đang thiết kế outfit cho bạn...</h3>
        <p style="color:var(--gray-mid); font-size:0.9rem; margin-top:8px;">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  `;

  // Toggle sidebar buttons
  const submitBtn = document.getElementById('submit-btn');
  const resetBtn = document.getElementById('reset-btn');
  if (submitBtn) submitBtn.style.display = 'none';
  if (resetBtn) resetBtn.style.display = 'inline-flex';

  try {
    const selectedAsins = state.selectedPickerAsins || [];
    const response = await fetch('http://localhost:5000/api/recommend/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_asins: selectedAsins })
    });

    if (!response.ok) throw new Error('Không thể tạo gợi ý từ server');
    let data = await response.json();

    // ── Apply Experimental Conditions ──
    const condition = state.condition || 'case_3';
    const hasXai = (condition === 'case_1' || condition === 'case_3');

    // Scale match percentages to high favorable levels (85% - 98%)
    data.recommendations.forEach(item => {
      item.match_percentage = Math.floor(Math.random() * 14) + 85; // 85 to 98
    });

    state.recommendations = data;
    state.recommendationGenerated = true;
    save();
    
    // Refresh the view
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = renderProfileAndDashboard();
    }
  } catch (err) {
    console.error(err);
    alert("Lỗi: " + err.message + "\nHãy chắc chắn rằng Flask server đang chạy ở port 5000!");
    resetSurvey();
  }
}

function resetSurvey() {
  state.selectedPickerAsins = [];
  state.recommendations = null;
  state.recommendationGenerated = false;
  save();
  
  if (typeof renderProgress === 'function') {
    renderProgress();
  }

  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.innerHTML = renderProfileAndDashboard();
  }
}

function renderRecommendationsView() {
  const area = document.getElementById('main-content-area');
  if (!area) return;

  const data = state.recommendations;
  if (!data) return;

  area.innerHTML = '';

  const recContainer = document.createElement('div');
  recContainer.className = 'rec-view-container';

  const condition = state.condition || 'case_3';
  const hasXai = (condition === 'case_1' || condition === 'case_3');
  const hasDpp = (condition === 'case_2' || condition === 'case_3');

  const header = document.createElement('div');
  header.className = 'rec-view-header';
  header.innerHTML = `
    <h2>👑 Bộ Outfit Phong Cách Cá Nhân</h2>
    <p>Mỗi món đồ được lựa chọn kỹ lưỡng để tạo nên tổng thể hài hòa nhất</p>
  `;
  recContainer.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'rec-grid';

  data.recommendations.forEach(item => {
    const card = document.createElement('div');
    card.className = 'rec-card';

    const displayImg = getProductImage(item.image_url, 120, 140);
    const priceText = typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : 'N/A';
    
    let tagsHtml = '';
    if (item.features && item.features.length) {
      item.features.forEach(tag => {
        tagsHtml += `<span class="rec-tag">${tag}</span>`;
      });
    } else {
      tagsHtml += `<span class="rec-tag">${item.category}</span>`;
    }

    // Toggle XAI explanation visibility
    let explanationHtml = '';
    if (hasXai) {
      let cleanExplanation = item.original_explanation || item.explanation || 'Một sự kết hợp thời trang hoàn hảo dành riêng cho gu cá nhân của bạn.';
      if (cleanExplanation.includes('🔒') || cleanExplanation.includes('bị ẩn') || cleanExplanation.includes('bị ẩn ở chế độ này')) {
        cleanExplanation = 'Sản phẩm được lựa chọn dựa trên sự tương thích cao với phong cách cá nhân của bạn, mang lại tổng thể hài hòa và hiện đại.';
      }
      explanationHtml = `
        <div class="xai-explanation-content">
          <div class="xai-title"><i class="fa-solid fa-wand-magic-sparkles"></i> Stylist AI Tư Vấn:</div>
          ${cleanExplanation}
        </div>
      `;
    }

    // Toggle DPP Button visibility
    let dppBtnHtml = '';
    if (hasDpp) {
      dppBtnHtml = `
        <button class="btn dpp-btn-outline" style="margin-top:10px; padding: 8px 12px; font-size: 0.75rem; border-radius: var(--radius); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;" onclick="showDppModal('${item.parent_asin}')">
          <i class="fa-solid fa-passport"></i> Xem Hộ Chiếu Số DPP
        </button>
      `;
    }

    card.innerHTML = `
      <div class="match-badge">${item.match_percentage}% Hợp</div>
      <div class="rec-img-wrapper">
        <img class="rec-img" src="${displayImg}" alt="${item.title}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'120\\' height=\\'140\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%232a2d4a\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\'middle\\' font-family=\\'sans-serif\\' font-size=\\'10\\' fill=\\'%23a0aec0\\'>No Image</text></svg>';">
      </div>
      <div class="rec-details">
        <div class="rec-title" title="${item.title}">${item.title}</div>
        <div class="rec-meta">Danh mục: <strong>${item.category}</strong> | ASIN: ${item.parent_asin}</div>
        <div class="rec-price-row">
          <span class="rec-price">${priceText}</span>
          <span class="rec-rating">
            <i class="fa-solid fa-star"></i>
            <span>${item.average_rating ? item.average_rating.toFixed(1) : '0.0'}</span>
            <span style="color:var(--gray-mid); font-size:10px;">(${item.rating_number || 0})</span>
          </span>
        </div>
        <div class="rec-tags">${tagsHtml}</div>
        ${explanationHtml}
        ${dppBtnHtml}
      </div>
    `;
    grid.appendChild(card);
  });

  recContainer.appendChild(grid);
  area.appendChild(recContainer);

  if (typeof renderProgress === 'function') {
    renderProgress();
  }
}

/* ── ReFashion Digital Product Passport (DPP) Core Engine ── */
function getDppData(asin, title, category) {
  let hash = 0;
  for (let i = 0; i < asin.length; i++) {
    hash = asin.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash);

  const dppId = `RF-2026-${category.substring(0, 3).toUpperCase()}-${seed % 1000}`;
  const blockHash = '0x' + Array.from({length: 40}, (_, i) => 
    '0123456789abcdef'[Math.floor(Math.sin(seed + i) * 16 + 16) % 16]
  ).join('');

  let materials = [];
  let waterSaved = 0;
  let co2Avoided = 0;
  let tier4Name = "";
  let tier4Loc = "";
  let tier4Cert = "";
  let tier4Desc = "";

  const catLower = (category || "").toLowerCase();
  if (catLower.includes("áo khoác") || catLower.includes("khoác") || catLower.includes("jacket")) {
    materials = [
      { name: "Repurposed Denim scrap", pct: 80 },
      { name: "Recycled Polyester lining", pct: 20 }
    ];
    waterSaved = 3450;
    co2Avoided = 15.2;
    tier4Name = "Texas Post-Consumer Salvage Depot";
    tier4Loc = "Lubbock, Texas, USA";
    tier4Cert = "GOTS, USDA Organic Verified";
    tier4Desc = "High-grade discarded denim clothing collected from post-consumer collection hubs in the USA.";
  } else if (catLower.includes("áo thun") || catLower.includes("thun") || catLower.includes("tshirt")) {
    materials = [
      { name: "Organic Cotton fibers", pct: 90 },
      { name: "Recycled Spandex", pct: 10 }
    ];
    waterSaved = 2100;
    co2Avoided = 8.6;
    tier4Name = "Aegean Rain-Fed Cotton Farms";
    tier4Loc = "Izmir, Turkey";
    tier4Cert = "GOTS Certified, Fair Trade";
    tier4Desc = "100% organic cotton grown using purely natural rain irrigation without synthetic agricultural chemical sprays.";
  } else if (catLower.includes("quần") || catLower.includes("pants")) {
    materials = [
      { name: "Recycled Cotton Denim yarn", pct: 85 },
      { name: "Eco-Elastane stretch", pct: 15 }
    ];
    waterSaved = 2980;
    co2Avoided = 13.4;
    tier4Name = "Binh Duong Deadstock Textile Salvage";
    tier4Loc = "Binh Duong, Vietnam";
    tier4Cert = "GRS (Global Recycled Standard)";
    tier4Desc = "Unused leftovers and cutting waste gathered from standard clothing manufacturing factories in Southern Vietnam.";
  } else if (catLower.includes("giày") || catLower.includes("shoes")) {
    materials = [
      { name: "Piñatex Pineapple fiber", pct: 70 },
      { name: "Recycled Rubber sole", pct: 30 }
    ];
    waterSaved = 1750;
    co2Avoided = 9.8;
    tier4Name = "Ananas Anam Agrarian Hub";
    tier4Loc = "Manila, Philippines";
    tier4Cert = "Certified B-Corp, Cradle to Cradle";
    tier4Desc = "Extracted from useless pineapple leaves after harvest, creating supplementary circular income for local farming families.";
  } else {
    // Balo & Túi / Default
    materials = [
      { name: "Upcycled Cotton Canvas", pct: 75 },
      { name: "Ocean-Bound PET Plastic", pct: 25 }
    ];
    waterSaved = 2650;
    co2Avoided = 11.9;
    tier4Name = "Phu Quoc Marine Plastic Cleanup Project";
    tier4Loc = "Phu Quoc, Vietnam";
    tier4Cert = "GRS, Higg Index Verified";
    tier4Desc = "Discarded nylon fishing nets and ocean-bound plastic bottles recovered directly from sea waters and beaches.";
  }

  return {
    seed,
    dppId,
    blockHash,
    title,
    category,
    materials,
    waterSaved,
    co2Avoided,
    tier4Name,
    tier4Loc,
    tier4Cert,
    tier4Desc,
    tier3Name: "Chung Shing Eco-Spinning Mill",
    tier3Loc: "Ho Chi Minh City, Vietnam",
    tier3Cert: "Oeko-Tex Standard 100, bluesign",
    tier3Desc: "Processes materials using high-efficiency closed-loop systems, filtering and recycling 98% of processing water.",
    tier2Name: "ReFashion Upcycling Creative Studio",
    tier2Loc: "Da Nang, Vietnam",
    tier2Cert: "Fair Wear Foundation, Zero-Waste Approved",
    tier2Desc: "Our artisan designers dismantle, sanitize, redesign, and refashion old garments into premium modern items.",
    tier1Name: "ReFashion Da Nang Assembly Workshop",
    tier1Loc: "Da Nang, Vietnam",
    tier1Cert: "GRS Verified, ISO 14001",
    tier1Desc: "Final stitching, assembly, quality control checks, digital RFID tagging, and validation for circular reuse."
  };
}

function showDppModal(asin) {
  const recommendations = (state.recommendations && state.recommendations.recommendations) || [];
  const item = recommendations.find(r => r.parent_asin === asin);
  if (!item) return;

  const dpp = getDppData(asin, item.title, item.category);

  // Remove existing modal if any
  closeDppModal();

  const overlay = document.createElement('div');
  overlay.className = 'dpp-modal-overlay';
  overlay.id = 'dpp-modal';
  overlay.onclick = (e) => {
    if (e.target === overlay) closeDppModal();
  };

  const qrCodeSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#ffffff"/>
      <rect x="10" y="10" width="20" height="20" fill="#2B2B2B"/>
      <rect x="13" y="13" width="14" height="14" fill="#ffffff"/>
      <rect x="16" y="16" width="8" height="8" fill="#2B2B2B"/>
      <rect x="70" y="10" width="20" height="20" fill="#2B2B2B"/>
      <rect x="73" y="13" width="14" height="14" fill="#ffffff"/>
      <rect x="76" y="16" width="8" height="8" fill="#2B2B2B"/>
      <rect x="10" y="70" width="20" height="20" fill="#2B2B2B"/>
      <rect x="13" y="73" width="14" height="14" fill="#ffffff"/>
      <rect x="16" y="76" width="8" height="8" fill="#2B2B2B"/>
      <rect x="76" y="76" width="8" height="8" fill="#2B2B2B"/>
      <rect x="35" y="12" width="4" height="4" fill="#2B2B2B"/>
      <rect x="42" y="18" width="8" height="4" fill="#2B2B2B"/>
      <rect x="35" y="28" width="4" height="8" fill="#2B2B2B"/>
      <rect x="52" y="28" width="8" height="4" fill="#2B2B2B"/>
      <rect x="12" y="38" width="8" height="4" fill="#2B2B2B"/>
      <rect x="22" y="45" width="4" height="4" fill="#2B2B2B"/>
      <rect x="15" y="55" width="4" height="8" fill="#2B2B2B"/>
      <rect x="38" y="38" width="8" height="8" fill="#2B2B2B"/>
      <rect x="52" y="45" width="4" height="12" fill="#2B2B2B"/>
      <rect x="42" y="60" width="12" height="4" fill="#2B2B2B"/>
      <rect x="35" y="70" width="4" height="4" fill="#2B2B2B"/>
      <rect x="38" y="78" width="8" height="4" fill="#2B2B2B"/>
      <rect x="68" y="38" width="4" height="4" fill="#2B2B2B"/>
      <rect x="78" y="35" width="8" height="4" fill="#2B2B2B"/>
      <rect x="65" y="50" width="12" height="4" fill="#2B2B2B"/>
      <rect x="78" y="58" width="4" height="8" fill="#2B2B2B"/>
      <rect x="58" y="72" width="8" height="4" fill="#2B2B2B"/>
    </svg>
  `;

  overlay.innerHTML = `
    <div class="dpp-phone-mockup">
      <div class="dpp-phone-notch"></div>
      <div class="dpp-phone-screen">
        <div class="dpp-phone-header">
          <span class="dpp-phone-title"><i class="fa-solid fa-passport" style="color:#2E7D7D"></i> DPP ReFashion</span>
          <button class="dpp-phone-close" onclick="closeDppModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="dpp-phone-body">
          
          <!-- Identity Header -->
          <div class="dpp-identity-card">
            <div class="dpp-prod-id">PRODUCT ID: ${dpp.dppId}</div>
            <div class="dpp-blockchain-badge">
              <span class="dpp-pulse-dot"></span>
              <i class="fa-solid fa-link"></i> Blockchain-Verified
            </div>
            <div class="dpp-qr-box" title="Scan to verify provenance on ledger">
              ${qrCodeSvg}
            </div>
            <div style="font-size:0.58rem; color:var(--gray-mid); font-family:monospace; word-break:break-all;">
              Hash: ${dpp.blockHash.substring(0, 18)}...
            </div>
          </div>

          <!-- Traceability Accordion -->
          <div class="dpp-card">
            <h3 class="dpp-card-title"><i class="fa-solid fa-map-location-dot" style="color:#2E7D7D"></i> Supply Chain Provenance</h3>
            <div class="dpp-timeline">
              
              <!-- Tier 1 -->
              <div class="dpp-timeline-node active" id="dpp-node-1">
                <div class="dpp-node-indicator"></div>
                <div class="dpp-node-summary" onclick="toggleDppNode(1)">
                  <div>
                    <span class="dpp-node-tier">Tier 1: Assembly & Quality</span>
                    <div class="dpp-node-title">${dpp.tier1Name}</div>
                  </div>
                  <i class="fa-solid fa-chevron-right dpp-node-chevron"></i>
                </div>
                <div class="dpp-node-details">
                  <p style="margin-bottom:3px;"><strong>Địa điểm:</strong> ${dpp.tier1Loc}</p>
                  <p style="margin-bottom:3px;"><strong>Chứng nhận:</strong> <span style="color:#2E7D7D">${dpp.tier1Cert}</span></p>
                  <p>${dpp.tier1Desc}</p>
                </div>
              </div>

              <!-- Tier 2 -->
              <div class="dpp-timeline-node" id="dpp-node-2">
                <div class="dpp-node-indicator"></div>
                <div class="dpp-node-summary" onclick="toggleDppNode(2)">
                  <div>
                    <span class="dpp-node-tier">Tier 2: Upcycling Phase</span>
                    <div class="dpp-node-title">${dpp.tier2Name}</div>
                  </div>
                  <i class="fa-solid fa-chevron-right dpp-node-chevron"></i>
                </div>
                <div class="dpp-node-details">
                  <p style="margin-bottom:3px;"><strong>Địa điểm:</strong> ${dpp.tier2Loc}</p>
                  <p style="margin-bottom:3px;"><strong>Chứng nhận:</strong> <span style="color:#2E7D7D">${dpp.tier2Cert}</span></p>
                  <p>${dpp.tier2Desc}</p>
                </div>
              </div>

              <!-- Tier 3 -->
              <div class="dpp-timeline-node" id="dpp-node-3">
                <div class="dpp-node-indicator"></div>
                <div class="dpp-node-summary" onclick="toggleDppNode(3)">
                  <div>
                    <span class="dpp-node-tier">Tier 3: Processing</span>
                    <div class="dpp-node-title">${dpp.tier3Name}</div>
                  </div>
                  <i class="fa-solid fa-chevron-right dpp-node-chevron"></i>
                </div>
                <div class="dpp-node-details">
                  <p style="margin-bottom:3px;"><strong>Địa điểm:</strong> ${dpp.tier3Loc}</p>
                  <p style="margin-bottom:3px;"><strong>Chứng nhận:</strong> <span style="color:#2E7D7D">${dpp.tier3Cert}</span></p>
                  <p>${dpp.tier3Desc}</p>
                </div>
              </div>

              <!-- Tier 4 -->
              <div class="dpp-timeline-node" id="dpp-node-4">
                <div class="dpp-node-indicator"></div>
                <div class="dpp-node-summary" onclick="toggleDppNode(4)">
                  <div>
                    <span class="dpp-node-tier">Tier 4: Material Source</span>
                    <div class="dpp-node-title">${dpp.tier4Name}</div>
                  </div>
                  <i class="fa-solid fa-chevron-right dpp-node-chevron"></i>
                </div>
                <div class="dpp-node-details">
                  <p style="margin-bottom:3px;"><strong>Địa điểm:</strong> ${dpp.tier4Loc}</p>
                  <p style="margin-bottom:3px;"><strong>Chứng nhận:</strong> <span style="color:#2E7D7D">${dpp.tier4Cert}</span></p>
                  <p>${dpp.tier4Desc}</p>
                </div>
              </div>

            </div>
          </div>

          <!-- Sustainability Impact Dashboard -->
          <div class="dpp-card">
            <h3 class="dpp-card-title"><i class="fa-solid fa-leaf" style="color:#2E7D7D"></i> Sustainability LCA Impact</h3>
            
            <div class="dpp-metric-row">
              <div class="dpp-metric-info">
                <span>Nước tiết kiệm (Liters)</span>
                <span class="dpp-metric-val">${dpp.waterSaved} L</span>
              </div>
              <div class="dpp-metric-bar">
                <div class="dpp-metric-bar-fill" id="water-bar" style="width: 0%"></div>
              </div>
            </div>

            <div class="dpp-metric-row">
              <div class="dpp-metric-info">
                <span>CO2 giảm thiểu (kg)</span>
                <span class="dpp-metric-val">${dpp.co2Avoided} kg</span>
              </div>
              <div class="dpp-metric-bar">
                <div class="dpp-metric-bar-fill" id="co2-bar" style="width: 0%"></div>
              </div>
            </div>

            <p style="font-size: 0.65rem; color: var(--gray-mid); margin-top: 10px; line-height: 1.3">
              * So sánh tương quan với quy trình sản xuất các sản phẩm hoàn toàn mới tương đương.
            </p>
          </div>

          <!-- Material Composition -->
          <div class="dpp-card">
            <h3 class="dpp-card-title"><i class="fa-solid fa-recycle" style="color:#8B5A2B"></i> Material Composition</h3>
            <div class="dpp-material-grid">
              <div class="dpp-material-card">
                <div class="dpp-material-pct">${dpp.materials[0].pct}%</div>
                <div class="dpp-material-lbl">${dpp.materials[0].name}</div>
              </div>
              <div class="dpp-material-card">
                <div class="dpp-material-pct">${dpp.materials[1].pct}%</div>
                <div class="dpp-material-lbl">${dpp.materials[1].name}</div>
              </div>
            </div>
          </div>

          <!-- Ownership & Circular Actions -->
          <div class="dpp-card">
            <h3 class="dpp-card-title"><i class="fa-solid fa-certificate" style="color:#A6855B"></i> Ownership & Circularity</h3>
            <div class="dpp-ownership-badge">
              <div class="dpp-own-title">Digital Ownership Certificate</div>
              <div class="dpp-own-holder">ISSUED TO: USER-${dpp.seed % 10000}</div>
            </div>
            
            <div class="dpp-action-group">
              <button class="dpp-btn dpp-btn-teal" onclick="simulateCircularAction('resell', '${dpp.dppId}')">
                <i class="fa-solid fa-tags"></i> Resell on ReFashion Market
              </button>
              <button class="dpp-btn dpp-btn-outline" onclick="simulateCircularAction('repair', '${dpp.dppId}')">
                <i class="fa-solid fa-screwdriver-wrench"></i> Request Repair Service
              </button>
              <button class="dpp-btn dpp-btn-outline" onclick="simulateCircularAction('recycle', '${dpp.dppId}')">
                <i class="fa-solid fa-arrow-rotate-left"></i> Return for Fiber Recycling
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Trigger LCA bar animations
  setTimeout(() => {
    const waterBar = document.getElementById('water-bar');
    const co2Bar = document.getElementById('co2-bar');
    if (waterBar) waterBar.style.width = '85%';
    if (co2Bar) co2Bar.style.width = '90%';
  }, 100);
}

function closeDppModal() {
  const modal = document.getElementById('dpp-modal');
  if (modal) {
    modal.remove();
  }
}

function toggleDppNode(nodeId) {
  const node = document.getElementById(`dpp-node-${nodeId}`);
  if (!node) return;

  const isExpanded = node.classList.contains('expanded');
  
  // Collapse all other nodes
  for (let i = 1; i <= 4; i++) {
    const otherNode = document.getElementById(`dpp-node-${i}`);
    if (otherNode) {
      otherNode.classList.remove('expanded');
      otherNode.classList.remove('active');
    }
  }

  // Toggle clicked node
  if (!isExpanded) {
    node.classList.add('expanded');
    node.classList.add('active');
  }
}

function simulateCircularAction(actionType, dppId) {
  let message = "";
  let icon = "success";
  if (actionType === 'resell') {
    message = `Đã gửi yêu cầu đăng bán sản phẩm ${dppId} lên ReFashion Market! Giấy chứng nhận sở hữu số sẽ được tự động chuyển cho người mua khi giao dịch hoàn tất.`;
  } else if (actionType === 'repair') {
    message = `Đã tạo yêu cầu sửa chữa cho sản phẩm ${dppId}! Mã vận đơn vận chuyển miễn phí đến trạm sửa chữa ReFashion Da Nang đã gửi qua Email.`;
  } else {
    message = `Đã kích hoạt chương trình thu hồi sợi cho sản phẩm ${dppId}! Bạn sẽ nhận được 20 GreenCoins sau khi bưu kiện được trạm phân loại xác nhận.`;
  }

  // Use a custom alert panel inside the phone container for clean styling
  const phoneBody = document.querySelector('.dpp-phone-body');
  if (phoneBody) {
    const alertOverlay = document.createElement('div');
    alertOverlay.style.position = 'absolute';
    alertOverlay.style.top = '0';
    alertOverlay.style.left = '0';
    alertOverlay.style.width = '100%';
    alertOverlay.style.height = '100%';
    alertOverlay.style.background = 'rgba(255,255,255,0.95)';
    alertOverlay.style.zIndex = '2000';
    alertOverlay.style.display = 'flex';
    alertOverlay.style.flexDirection = 'column';
    alertOverlay.style.justifyContent = 'center';
    alertOverlay.style.alignItems = 'center';
    alertOverlay.style.padding = '20px';
    alertOverlay.style.textAlign = 'center';
    alertOverlay.style.animation = 'fadeInDpp 0.25s forwards';

    alertOverlay.innerHTML = `
      <div style="font-size:3rem; color:#2E7D7D; margin-bottom: 16px;">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h4 style="color:#2B2B2B; font-family:var(--font-serif); font-size:1.1rem; margin-bottom:12px;">Thành Công!</h4>
      <p style="font-size:0.78rem; color:var(--gray-mid); line-height:1.5; margin-bottom:20px;">${message}</p>
      <button class="dpp-btn dpp-btn-teal" style="width:120px;" onclick="this.parentElement.remove()">Đóng</button>
    `;
    phoneBody.appendChild(alertOverlay);
  } else {
    alert(message);
  }
}

// Expose globally
window.showDppModal = showDppModal;
window.closeDppModal = closeDppModal;
window.toggleDppNode = toggleDppNode;
window.simulateCircularAction = simulateCircularAction;

function renderPickerGrids() {
  const area = document.getElementById('main-content-area');
  if (!area) return;
  area.innerHTML = '';

  const categories = ["Áo Khoác", "Áo Thun", "Quần", "Giày", "Balo & Túi"];
  const surveyItems = state.surveyItems || [];
  const selectedPickerAsins = new Set(state.selectedPickerAsins || []);

  categories.forEach(cat => {
    const section = document.createElement('section');
    section.className = 'picker-category-section';

    const header = document.createElement('div');
    header.className = 'category-header-row';

    const emojiMap = {
      "Áo Khoác": "🧥",
      "Áo Thun": "👕",
      "Quần": "👖",
      "Giày": "👟",
      "Balo & Túi": "🎒"
    };

    const count = Array.from(selectedPickerAsins).filter(selectedAsin => {
      const item = surveyItems.find(i => i.parent_asin === selectedAsin);
      return item && item.store === cat;
    }).length;

    header.innerHTML = `
      <h3>${emojiMap[cat] || '🛍️'} ${cat}</h3>
      <span class="category-counter" id="counter-${cat}" style="color: ${count >= 1 ? '#10b981' : 'var(--gray-mid)'}">Đã chọn: ${count}/3</span>
    `;
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'style-picker-grid';

    const catItems = surveyItems.filter(item => item.store === cat);
    catItems.forEach(item => {
      const card = document.createElement('div');
      const isSelected = selectedPickerAsins.has(item.parent_asin);
      card.className = `picker-item-card ${isSelected ? 'selected' : ''}`;
      card.onclick = () => togglePickerItem(item.parent_asin, card, cat);

      const displayImg = getProductImage(item.image_url, 100, 100);
      card.innerHTML = `
        <div class="picker-item-badge"><i class="fa-solid fa-check"></i></div>
        <div class="picker-item-img-wrapper">
          <img class="picker-item-img" src="${displayImg}" alt="${item.title}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%232a2d4a\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\'middle\\' font-family=\\'sans-serif\\' font-size=\\'8\\' fill=\\'%23a0aec0\\'>No Image</text></svg>';">
        </div>
        <div class="picker-item-title" title="${item.title}">${item.title}</div>
        <div class="picker-item-brand">${item.store || 'Unknown'}</div>
      `;
      grid.appendChild(card);
    });

    section.appendChild(grid);
    area.appendChild(section);
  });

  updateUIState();
}

function renderProfileAndDashboard() {
  if (!state.selectedPickerAsins) state.selectedPickerAsins = [];
  if (!state.surveyItems) state.surveyItems = [];

  if (state.recommendationGenerated && state.recommendations) {
    setTimeout(() => {
      renderRecommendationsView();
    }, 50);
  } else {
    setTimeout(() => {
      loadPickerItems();
    }, 50);
  }

  const categories = ["Áo Khoác", "Áo Thun", "Quần", "Giày", "Balo & Túi"];
  const statusItemsHtml = categories.map(cat => {
    const count = (state.selectedPickerAsins || []).filter(selectedAsin => {
      const item = (state.surveyItems || []).find(i => i.parent_asin === selectedAsin);
      return item && item.store === cat;
    }).length;

    const badgeClass = count >= 1 ? 'complete' : 'missing';
    const badgeText = count >= 1 ? `Chọn: ${count}` : 'Chưa chọn';

    return `
      <div class="category-status-item">
        <span>${cat === 'Áo Khoác' ? '🧥' : cat === 'Áo Thun' ? '👕' : cat === 'Quần' ? '👖' : cat === 'Giày' ? '👟' : '🎒'} ${cat}</span>
        <span id="badge-${cat}" class="status-badge ${badgeClass}">${badgeText}</span>
      </div>
    `;
  }).join('');

  const submitBtnStyle = state.recommendationGenerated ? 'display:none;' : 'display:inline-flex;';
  const resetBtnStyle = state.recommendationGenerated ? 'display:inline-flex;' : 'display:none;';

  return `
    <div class="card" style="padding: 24px; box-sizing: border-box; display: flex; flex-direction: column;">
      <div class="shop-layout">
        <!-- Sidebar Summary -->
        <aside class="shop-sidebar">
          <h3 class="sidebar-title">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Stylist Onboarding
          </h3>
          <p class="sidebar-desc">
            Chọn từ <strong>1 đến 3 sản phẩm</strong> yêu thích trong mỗi danh mục bên dưới để AI phân tích phong cách cá nhân của bạn.
          </p>

          <div class="category-status-list">
            ${statusItemsHtml}
          </div>

          <button class="btn btn-submit" id="submit-btn" onclick="submitSelections()" style="${submitBtnStyle}" disabled>
            <i class="fa-solid fa-circle-check"></i> Tạo Gợi Ý AI
          </button>
          <button class="btn btn-submit" id="reset-btn" onclick="resetSurvey()" style="background:transparent; border: 1px solid var(--gray-light); color:var(--black); ${resetBtnStyle}">
            <i class="fa-solid fa-arrow-rotate-left"></i> Chọn Lại Style
          </button>
        </aside>

        <!-- Dynamic Right Content -->
        <div style="flex: 1;" id="main-content-area">
          <div id="picker-loading-placeholder" style="text-align:center; padding:40px 0;">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--navy); margin-bottom: 1rem;"></i>
            <h4 style="color:var(--black)">Đang tải danh sách sản phẩm...</h4>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Expose globally
window.togglePickerItem = togglePickerItem;
window.submitSelections = submitSelections;
window.resetSurvey = resetSurvey;
window.loadPickerItems = loadPickerItems;
window.renderRecommendationsView = renderRecommendationsView;
window.getProductImage = getProductImage;

/* ── SURVEY ── */


/* ── SURVEY ── */
function renderSurvey() {
  const sgs = getSGroups();

  const sectionsHtml = sgs.map(([title, arr], idx) => {
    let body = '';
    let titleHtml = '';

    if (arr) {
      body = arr.map(q => renderQuestionField(q)).join('');

      // Render section title (VI/EN aware)
      const titleObj = (typeof adminGetSectionTitle === 'function')
        ? adminGetSectionTitle(title)
        : { vi: title, en: title };
      const displayTitle = currentLang === 'en' ? (titleObj.en || titleObj.vi) : titleObj.vi;
      if (displayTitle) {
        titleHtml = `<h3 style="font-size:calc(12pt * var(--font-scale));font-weight:700;color:var(--navy);margin:0 0 10px 0;padding-bottom:8px;border-bottom:2px solid #dce8f5;">${displayTitle}</h3>`;
      }

      // Description only for first section
      let descHtml = '';
      if (idx === 0) {
        const descObj = getSectionDescription(title);
        const sectionDesc = currentLang === 'en' ? (descObj.en || descObj.vi) : descObj.vi;
        if (sectionDesc) {
          descHtml = `<p style="color:var(--gray-dark);font-size:calc(9.5pt * var(--font-scale));margin-bottom:14px;padding-bottom:10px;">${sectionDesc}</p>`;
        }
      }

      // Visual separator between sections (except first)
      const sep = idx > 0 ? `<hr style="border:none;border-top:1px solid var(--gray-light);margin:24px 0 20px 0;">` : '';

      return `${sep}${titleHtml}${descHtml}${body}`;
    }
    return '';
  }).join('');

  return `<section class="card" style="margin-bottom: 20px; padding: 24px;">${sectionsHtml}</section>`;
}

function renderControls() {
  const { ctrlSections } = getSurveySectionDivision();
  const allQs = (typeof getQuestions === 'function' ? getQuestions() : []) || [];

  const sectionsHtml = ctrlSections.map((title, idx) => {
    const arr = allQs.filter(q => q.section === title);
    if (arr.length === 0) return '';
    
    let body = arr.map(q => renderQuestionField(q)).join('');
    
    // Render section title (VI/EN aware)
    const titleObj = (typeof adminGetSectionTitle === 'function')
      ? adminGetSectionTitle(title)
      : { vi: title, en: title };
    const displayTitle = currentLang === 'en' ? (titleObj.en || titleObj.vi) : titleObj.vi;
    let titleHtml = '';
    if (displayTitle) {
      titleHtml = `<h3 style="font-size:calc(12pt * var(--font-scale));font-weight:700;color:var(--navy);margin:0 0 10px 0;padding-bottom:8px;border-bottom:2px solid #dce8f5;">${displayTitle}</h3>`;
    }
    
    let descHtml = '';
    if (idx === 0) {
      const descObj = getSectionDescription(title);
      const sectionDesc = currentLang === 'en' ? (descObj.en || descObj.vi) : descObj.vi;
      
      let descTranslateBtn = '';
      if (currentLang === 'en') {
        if (!descObj.en && descObj.vi) {
          descTranslateBtn = ` <button type="button" class="translate-btn" onclick="triggerInlineTranslation(this, 'en', '${descObj.vi.replace(/'/g, "\\'")}')" style="margin-left:8px;font-size:8.5pt;padding:2px 6px;border-radius:4px;border:1px solid var(--navy);background:none;color:var(--navy);cursor:pointer;">🌐 Translate</button>`;
        }
      } else {
        if (!descObj.vi && descObj.en) {
          descTranslateBtn = ` <button type="button" class="translate-btn" onclick="triggerInlineTranslation(this, 'vi', '${descObj.en.replace(/'/g, "\\'")}')" style="margin-left:8px;font-size:8.5pt;padding:2px 6px;border-radius:4px;border:1px solid var(--navy);background:none;color:var(--navy);cursor:pointer;">🌐 Dịch</button>`;
        }
      }

      if (sectionDesc) {
        descHtml = `<p style="color:var(--gray-dark);font-size:calc(9.5pt * var(--font-scale));margin-bottom:16px;border-bottom:1px solid var(--gray-light);padding-bottom:10px;"><span class="translatable-text">${sectionDesc}</span>${descTranslateBtn}</p>`;
      }
    }
    
    const sep = idx > 0 ? `<hr style="border:none;border-top:1px solid var(--gray-light);margin:24px 0 20px 0;">` : '';
    
    return `${sep}${titleHtml}${descHtml}${body}`;
  }).join('');

  return `<section class="card" style="margin-bottom: 20px; padding: 24px;">${sectionsHtml}</section>`;
}

function renderDebrief() {
  return `<section class="card">
    <h2>${t('debrief_title')}</h2>
    <p>${t('debrief_desc')}</p>
  </section>`;
};

/* ── MAIN RENDER ── */
window.updateCheckboxValue = function (name) {
  const checked = Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
  state.responses[name] = checked.join(',');
  save();
  renderProgress();
};

function save() {
  document.querySelectorAll('input[type=radio]:checked').forEach(el => {
    if (el.closest('#customModal') || el.closest('#admin-view') || el.closest('.admin-panel') || el.closest('#loginModal') || el.closest('#adminPanel')) return;
    state.responses[el.name] = el.value;
  });
  document.querySelectorAll('input[type=checkbox]').forEach(el => {
    if (el.closest('#customModal') || el.closest('#admin-view') || el.closest('.admin-panel') || el.closest('#loginModal') || el.closest('#adminPanel')) return;
    const name = el.name || el.id;
    if (name) {
      const group = document.querySelectorAll(`input[name="${name}"]`);
      if (group.length > 1) {
        // Handled by updateCheckboxValue, skip
      } else {
        state.responses[name] = el.checked;
      }
    }
  });
  document.querySelectorAll('input[type=text],input[type=number],input[type=email],select.survey-select,select[name^=profile],input[name^=profile]').forEach(el => {
    if (el.closest('#customModal') || el.closest('#admin-view') || el.closest('.admin-panel') || el.closest('#loginModal') || el.closest('#adminPanel')) return;
    const n = el.name || el.id;
    if (n) {
      if (n.startsWith('profile_')) state.profile[n.replace('profile_', '')] = el.value;
      else state.responses[n] = el.value;
    }
  });
  // Sync global vars and persist
  state.step = step;
  state.surveySub = surveySub;
  localStorage.setItem('hr_state', JSON.stringify(state));
}
function restore() {
  Object.entries(state.responses).forEach(([k, v]) => {
    document.querySelectorAll(`[name="${CSS.escape(k)}"]`).forEach(el => {
      if (el.type === 'radio') el.checked = String(el.value) === String(v);
      else if (el.type === 'checkbox') {
        const group = document.querySelectorAll(`input[name="${k}"]`);
        if (group.length > 1) {
          const vals = String(v).split(',');
          el.checked = vals.includes(el.value);
        } else {
          el.checked = Boolean(v);
        }
      }
      else el.value = v;
    });
    const byId = document.getElementById(k);
    if (byId && byId.type === 'checkbox') byId.checked = Boolean(v);
  });
}



function render() {
  save(); renderProgress();
  let html = '';
  const idx = getStepIndices();

  const progressBlock = document.querySelector('.progress-wrap');
  const navButtons = document.querySelector('.controls');

  if (progressBlock) progressBlock.style.display = '';
  if (navButtons) navButtons.style.display = '';

  if (step === idx.consent) html = renderConsent();

  if (step >= idx.preSectionsStart && step <= idx.preSectionsEnd) {
    const { preSections } = getSurveySectionDivision();
    let qs = getQuestions(); if (!qs) qs = defaultQuestions();

    const secIdx = step - idx.preSectionsStart;
    const secName = preSections[secIdx];

    let secHtml = '';
    if (secName) {
      const secQs = qs.filter(q => q.section === secName).sort((a, b) => (a.order || 0) - (b.order || 0));
      const titleObj = (typeof adminGetSectionTitle === 'function') ? adminGetSectionTitle(secName) : { vi: secName, en: secName };
      const descObj = getSectionDescription(secName);

      let title = currentLang === 'en' ? (titleObj.en || titleObj.vi) : titleObj.vi;
      let desc = currentLang === 'en' ? (descObj.en || descObj.vi) : descObj.vi;

      let titleTranslateBtn = '';
      let descTranslateBtn = '';

      if (currentLang === 'en') {
        if (!titleObj.en) {
          titleTranslateBtn = ` <button type="button" class="translate-btn" onclick="triggerInlineTranslation(this, 'en', '${titleObj.vi.replace(/'/g, "\\'")}')" style="margin-left:8px;font-size:8.5pt;padding:2px 6px;border-radius:4px;border:1px solid var(--navy);background:none;color:var(--navy);cursor:pointer;">🌐 Translate Title</button>`;
        }
        if (!descObj.en && descObj.vi) {
          descTranslateBtn = ` <button type="button" class="translate-btn" onclick="triggerInlineTranslation(this, 'en', '${descObj.vi.replace(/'/g, "\\'")}')" style="margin-left:8px;font-size:8.5pt;padding:2px 6px;border-radius:4px;border:1px solid var(--navy);background:none;color:var(--navy);cursor:pointer;">🌐 Translate Description</button>`;
        }
      } else {
        if (!titleObj.vi && titleObj.en) {
          titleTranslateBtn = ` <button type="button" class="translate-btn" onclick="triggerInlineTranslation(this, 'vi', '${titleObj.en.replace(/'/g, "\\'")}')" style="margin-left:8px;font-size:8.5pt;padding:2px 6px;border-radius:4px;border:1px solid var(--navy);background:none;color:var(--navy);cursor:pointer;">🌐 Dịch Tiêu Đề</button>`;
        }
        if (!descObj.vi && descObj.en) {
          descTranslateBtn = ` <button type="button" class="translate-btn" onclick="triggerInlineTranslation(this, 'vi', '${descObj.en.replace(/'/g, "\\'")}')" style="margin-left:8px;font-size:8.5pt;padding:2px 6px;border-radius:4px;border:1px solid var(--navy);background:none;color:var(--navy);cursor:pointer;">🌐 Dịch Mô Tả</button>`;
        }
      }

      let descHtml = '';
      if (desc) {
        descHtml = `
          <p style="color:var(--gray-dark);font-size:calc(9.5pt * var(--font-scale));margin-bottom:16px;border-bottom:1px solid var(--gray-light);padding-bottom:10px;"><span class="translatable-text">${desc}</span>${descTranslateBtn}</p>
        `;
      }

      const fieldsHtml = secQs.map(q => renderQuestionField(q)).join('');

      const titleHtml = title
        ? `<h2 style="font-size:calc(14pt * var(--font-scale));font-weight:700;color:var(--navy);margin:0 0 14px 0;padding-bottom:10px;border-bottom:2px solid #dce8f5;">${title}${titleTranslateBtn}</h2>`
        : '';

      secHtml = `
        <div class="card" style="padding: 24px; box-sizing: border-box; display: flex; flex-direction: column; transform: none !important; box-shadow: var(--shadow) !important; border-color: rgba(211, 209, 199, 0.5) !important; transition: none !important;">
          ${titleHtml}
          ${descHtml}
          ${fieldsHtml}
        </div>
      `;
    }

    html = `<div style="max-width: 720px; margin: 0 auto; width: 100%;">${secHtml}</div>`;
  }

  if (step === idx.context) html = typeof renderContext === 'function' ? renderContext() : '';
  if (step === idx.report) html = renderProfileAndDashboard();
  if (step === idx.survey) html = renderSurvey();
  if (step === idx.controls) html = renderControls();
  if (step === idx.end) html = renderDebrief();

  $('app').innerHTML = html;

  const extraF = $('extraFooter');
  if (extraF) {
    extraF.innerHTML = '';
  }

  restore(); bindDynamic();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  initTutorial();
}

function initTutorial() {
  dismissTutorial();
  return;

  const overlay = $('tutorialOverlay');
  if (!overlay) return;

  overlay.classList.add('show');
  document.body.classList.add('tutorial-active');

  const btnMetrics = $('hb_metrics');
  const btnAi = $('hb_ai');
  if (btnMetrics) btnMetrics.classList.add('tutorial-highlight');
  if (btnAi) btnAi.classList.add('tutorial-highlight');

  state.tutorial_shown = true;
  save();
}

function dismissTutorial(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  const overlay = $('tutorialOverlay');
  if (overlay) {
    overlay.classList.remove('show');
  }
  document.body.classList.remove('tutorial-active');
  const btnMetrics = $('hb_metrics');
  const btnAi = $('hb_ai');
  if (btnMetrics) btnMetrics.classList.remove('tutorial-highlight');
  if (btnAi) btnAi.classList.remove('tutorial-highlight');
}

function bindDynamic() {
  // Tự động lưu và kiểm tra tiến trình khi có bất kỳ thay đổi nào
  document.querySelectorAll('input, select, textarea').forEach(el => {
    const ev = el.type === 'text' || el.type === 'email' || el.tagName === 'TEXTAREA' ? 'input' : 'change';
    el.addEventListener(ev, () => {
      save();
      renderProgress();
    });
  });
  
  document.querySelectorAll('select[name^=profile]').forEach(sel => {
    const other = sel.parentElement.querySelector('input[type=text]');
    if (other) other.style.display = (sel.value === 'dept_other' || sel.value === 'region_other') ? 'block' : 'none';
  });
}

/* ── PULSE ANIMATION ── */
setInterval(() => {
  document.querySelectorAll('.help-btn').forEach(btn => {
    btn.classList.add('pulsing');
    setTimeout(() => btn.classList.remove('pulsing'), 4000);
  });
}, 10000);

/* ── EXPORT ── */
function flatten() {
  save();
  const caseMap = { high_fav: 'C1', high_unfav: 'C2', low_fav: 'C3', low_unfav: 'C4' };
  const res = { participant_id: state.participant_id || ('P_' + Math.random().toString(36).slice(2, 8)), condition: state.condition, case_id: caseMap[state.condition], transparency: CM[state.condition].t, outcome: CM[state.condition].o, ...state.profile, ...state.responses };
  delete res.ho; delete res.ten;
  delete res.dept_other; delete res.region_other;
  return res;
}
async function performSupabaseInsert(insertObj, useSelect = false) {
  let obj = { ...insertObj };
  
  // Try to write to both data and responses to support both schemas
  const jsonPayload = obj.data || obj.responses || {};
  obj.data = jsonPayload;
  obj.responses = jsonPayload;

  let retries = 3;
  let lastError = null;
  while (retries > 0) {
    let query = sb.from('responses').insert(obj);
    if (useSelect) {
      query = query.select();
    }
    const { data: dbData, error } = await query;
    if (!error) {
      return { data: dbData, error: null };
    }
    
    lastError = error;
    const errMsg = (error.message || '').toLowerCase();
    const isColumnError = error.code === 'PGRST204' || error.code === '42703' || 
                          (errMsg.includes('column') && (errMsg.includes('exist') || errMsg.includes('not find') || errMsg.includes('not exist')));
                          
    if (isColumnError) {
      let colName = null;
      const matchQuotes = error.message.match(/'([^']+)'/);
      if (matchQuotes && matchQuotes[1]) {
        colName = matchQuotes[1];
      } else {
        const matchDoubleQuotes = error.message.match(/"([^"]+)"/);
        if (matchDoubleQuotes && matchDoubleQuotes[1]) {
          colName = matchDoubleQuotes[1];
        }
      }
      
      if (colName && obj[colName] !== undefined) {
        console.warn(`Removing invalid database column: '${colName}' and retrying.`);
        delete obj[colName];
        retries--;
        continue;
      }
      
      // Fallback if specific column name could not be extracted
      console.warn('Unknown column error, pruning non-core columns:', error.message);
      const coreKeys = ['participant_id', 'condition', 'case_id', 'transparency', 'outcome', 'fill_started_at', 'submitted_at'];
      if (errMsg.includes("'data'") || errMsg.includes('"data"')) {
        delete obj.data;
      } else {
        coreKeys.push('data');
      }
      if (errMsg.includes("'responses'") || errMsg.includes('"responses"')) {
        delete obj.responses;
      } else {
        coreKeys.push('responses');
      }
      
      Object.keys(obj).forEach(k => {
        if (!coreKeys.includes(k)) delete obj[k];
      });
      retries--;
      continue;
    }
    
    break; // Non-column schema error (e.g. network, auth, constraint violation)
  }
  return { data: null, error: lastError || new Error('Failed to insert') };
}

function normalizeDbRows(rows) {
  if (!rows || !Array.isArray(rows)) return rows;
  return rows.map(r => {
    if (r) {
      if (!r.data && r.responses) {
        r.data = r.responses;
      } else if (!r.responses && r.data) {
        r.responses = r.data;
      }
    }
    return r;
  });
}
window.normalizeDbRows = normalizeDbRows;

function dl(fn, txt, type = 'text/plain') {
  // Dùng URL.createObjectURL — chuẩn W3C, tương thích Chrome/Edge/Firefox
  // Thêm BOM (0xFEFF) để Excel/Notepad đọc đúng UTF-8 tiếng Việt
  const blob = new Blob(['\uFEFF' + txt], { type: type + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fn;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try { document.body.removeChild(a); } catch(err) {}
    URL.revokeObjectURL(url); // giải phóng memory
  }, 500);
}
function downloadJSON() {
  const data = flatten();
  dl('survey_response.json', JSON.stringify(data, null, 2), 'application/json');
}
function downloadCSV() {
  const activeQs = getActiveQs();
  const activeQIds = activeQs.map(q => q.alias && q.alias.trim() !== '' ? q.alias.trim() : q.id);
  const fixedColsLower = new Set(['participant_id', 'email', 'condition', 'case_id', 'transparency', 'outcome', 'fill_started_at', 'submitted_at'].map(id => id.toLowerCase()));
  
  const keys = activeQIds.filter(id => !fixedColsLower.has(id.toLowerCase()));
  const r = {
    data: {
      ...state.profile,
      ...state.responses
    }
  };
  const esc = v => '"' + String(v ?? '').replaceAll('"', '""') + '"';
  const rowValues = keys.map(k => esc(getCellValue(r, k)));
  dl('survey_response.csv', keys.join(',') + '\n' + rowValues.join(','), 'text/csv');
}
async function submitDataSilent() {
  try {
    const data = flatten();
    const qs = (typeof getQuestions === 'function' ? getQuestions() : []) || [];
    qs.forEach(q => {
      if (q.alias && q.alias.trim() !== '' && data[q.id] !== undefined) {
        data[q.alias.trim()] = data[q.id];
      }
    });
    const startTs = state.startedAt;
    const submitTs = new Date().toISOString();

    const insertObj = {
      participant_id: data.participant_id,
      condition: data.condition,
      case_id: data.case_id,
      transparency: data.transparency,
      outcome: data.outcome,
      fill_started_at: startTs,
      submitted_at: submitTs,
      data: {
        ...data,
        fill_started_at: startTs,
        submitted_at: submitTs
      }
    };

    const legacyFields = ['consent', 'FC1', 'FC2', 'FC3', 'FC4',
      'MC_TBD1', 'MC_TBD2', 'MC_TBD3', 'MC_TBD4', 'MC_TBD5', 'MC_TBD6', 'MC_TBD7',
      'MC_OF1', 'MC_OF2', 'MC_OF3', 'RA1', 'RA2', 'RA3',
      'PF1', 'PF2', 'PF3', 'PF4', 'PF5', 'PF6',
      'CT1', 'CT2', 'CT3', 'CT4',
      'DA1', 'DA2', 'DA3', 'DA4', 'DA5', 'DA6',
      'CTRL_AI_FAM', 'CTRL_AI_EXP', 'ATT1', 'DETAIL_LEVEL', 'email',
      'resp_gender', 'resp_age', 'resp_region', 'resp_dept', 'resp_experience',
      'resp_ft', 'resp_eval', 'resp_ai_dev'];

    const allFields = [...legacyFields];

    allFields.forEach(f => {
      let col = f.toLowerCase();
      if (f === 'resp_experience') col = 'resp_years';
      if (f === 'resp_ft') col = 'resp_ft_work';
      if (f === 'resp_eval') col = 'resp_perf_eval';
      if (data[f] !== undefined) insertObj[col] = data[f];
    });

    const { error } = await performSupabaseInsert(insertObj, false);
    if (error) console.error('Silent submission failed:', error);
  } catch (e) {
    console.error('Silent submission failed:', e);
  }
}
window.submitDataSilent = submitDataSilent;

async function submitData() {
  const data = flatten();
  const qs = (typeof getQuestions === 'function' ? getQuestions() : []) || [];
  qs.forEach(q => {
    if (q.alias && q.alias.trim() !== '' && data[q.id] !== undefined) {
      data[q.alias.trim()] = data[q.id];
    }
  });
  const startTs = state.startedAt;
  const submitTs = new Date().toISOString();

  const insertObj = {
    participant_id: data.participant_id,
    condition: data.condition,
    case_id: data.case_id,
    transparency: data.transparency,
    outcome: data.outcome,
    fill_started_at: startTs,
    submitted_at: submitTs,
    data: {
      ...data,
      fill_started_at: startTs,
      submitted_at: submitTs
    }
  };

  // Map additional fields from legacy fields only
  const legacyFields = ['consent', 'FC1', 'FC2', 'FC3', 'FC4',
    'MC_TBD1', 'MC_TBD2', 'MC_TBD3', 'MC_TBD4', 'MC_TBD5', 'MC_TBD6', 'MC_TBD7',
    'MC_OF1', 'MC_OF2', 'MC_OF3', 'RA1', 'RA2', 'RA3',
    'PF1', 'PF2', 'PF3', 'PF4', 'PF5', 'PF6',
    'CT1', 'CT2', 'CT3', 'CT4',
    'DA1', 'DA2', 'DA3', 'DA4', 'DA5', 'DA6',
    'CTRL_AI_FAM', 'CTRL_AI_EXP', 'ATT1', 'DETAIL_LEVEL', 'email',
    'resp_gender', 'resp_age', 'resp_region', 'resp_dept', 'resp_experience',
    'resp_ft', 'resp_eval', 'resp_ai_dev'];

  const allFields = [...legacyFields];

  allFields.forEach(f => {
    let col = f.toLowerCase();
    if (f === 'resp_experience') col = 'resp_years';
    if (f === 'resp_ft') col = 'resp_ft_work';
    if (f === 'resp_eval') col = 'resp_perf_eval';
    if (data[f] !== undefined) insertObj[col] = data[f];
  });

  const { data: dbData, error } = await performSupabaseInsert(insertObj, true);

  if (error) {
    console.error('Submit error', error);
    console.error('Submit error details:', JSON.stringify(error));
    await showAlert('Có lỗi khi gửi dữ liệu. Vui lòng thử lại.\n\nChi tiết: ' + (error.message || JSON.stringify(error)) + '\n\nMã: ' + error.code);
  } else {
    console.log('Survey submitted to Supabase with full schema mapping');
    if (dbData && dbData.length > 0) {
      state.responseDbId = dbData[0].id;
    }
    // Sync to Google Sheets (if configured)
    const gsUrl = localStorage.getItem('gs_script_url');
    if (gsUrl) {
      try {
        await fetch(gsUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(insertObj)
        });
        console.log('Synced to Google Sheets');
      } catch (e) {
        console.warn('Google Sheets sync failed:', e.message);
      }
    }
    const idx = getStepIndices();
    step = idx.end;
    save();
    render();
  }
}

/* ── NAV ── */
$('prevBtn').onclick = () => {
  save();
  step = Math.max(0, step - 1);
  render();
};
$('nextBtn').onclick = async () => {
  save();
  if (!isStepValid()) return;
  const STEPS = getSteps();
  const idx = getStepIndices();
  if (step === idx.consent && !state.responses.consent) return;


  if (step === idx.controls) {
    submitData();
    return;
  }

  step = Math.min(STEPS.length - 1, step + 1);
  render();
};

/* ── ADMIN ── */
let adminTab = 'questions';
let currentSession = null;

function isAdmin() { return new URLSearchParams(location.search).get('admin') === 'true'; }
function isAuthed() {
  return !!currentSession;
}

window.logoutAndResetLocalData = async function(showExpiredMessage = false) {
  try {
    await sb.auth.signOut();
  } catch (e) {
    console.error('Sign out error:', e);
  }
  const keysToRemove = [
    'draft_hr_questions',
    'draft_hr_section_metadata',
    'draft_hr_section_descriptions',
    'draft_hr_custom_translations',
    'draft_hr_assumed_profile',
    'draft_hr_typography',
    'last_admin_activity'
  ];
  keysToRemove.forEach(k => localStorage.removeItem(k));
  currentSession = null;
  if (showExpiredMessage) {
    alert(currentLang === 'en' ? 'Session expired due to inactivity. Please log in again.' : 'Phiên đăng nhập đã hết hạn do không hoạt động. Vui lòng đăng nhập lại.');
  }
  window.location.reload();
};

async function initAdmin() {
  if (!isAdmin()) return;
  try {
    const { data: { session } } = await sb.auth.getSession();
    currentSession = session;
  } catch (e) {
    console.error('Error fetching admin session:', e);
  }

  if (isAuthed()) {
    const lastAct = localStorage.getItem('last_admin_activity');
    if (lastAct) {
      const elapsed = Date.now() - parseInt(lastAct, 10);
      const timeoutLimit = 30 * 60 * 1000; // 30 minutes
      if (elapsed > timeoutLimit) {
        await window.logoutAndResetLocalData(true);
        return;
      }
    }
    if (typeof window.updateAdminActivity === 'function') {
      window.updateAdminActivity();
    }
    $('adminPanel').classList.add('show');
    document.body.classList.add('admin-active');
    renderAdmin();
  } else {
    const keysToRemove = [
      'draft_hr_questions',
      'draft_hr_section_metadata',
      'draft_hr_section_descriptions',
      'draft_hr_custom_translations',
      'draft_hr_assumed_profile',
      'draft_hr_typography'
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    $('loginModal').classList.add('show');
  }
}

$('loginSubmit').onclick = async () => {
  const u = $('loginUser').value, p = $('loginPass').value;
  $('loginError').style.display = 'none';
  $('loginSubmit').disabled = true;
  $('loginSubmit').textContent = 'Đang đăng nhập...';
  
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email: u, password: p });
    if (error) {
      $('loginError').textContent = 'Email hoặc mật khẩu không đúng: ' + error.message;
      $('loginError').style.display = 'block';
    } else {
      currentSession = data.session;
      if (typeof window.updateAdminActivity === 'function') {
        window.updateAdminActivity();
      }
      if (typeof syncSettingsFromDb === 'function') {
        try {
          await syncSettingsFromDb();
        } catch (syncErr) {
          console.error("Failed to sync settings on login:", syncErr);
        }
      }
      $('loginModal').classList.remove('show');
      $('adminPanel').classList.add('show');
      document.body.classList.add('admin-active');
      renderAdmin();
    }
  } catch (e) {
    $('loginError').textContent = 'Lỗi hệ thống: ' + e.message;
    $('loginError').style.display = 'block';
  } finally {
    $('loginSubmit').disabled = false;
    $('loginSubmit').textContent = 'Đăng nhập';
  }
};
$('loginPass').onkeydown = e => { if (e.key === 'Enter') $('loginSubmit').click(); };
$('adminLogout').onclick = async () => {
  if (await showConfirm(currentLang === 'en' ? 'Are you sure you want to log out? All unsaved draft changes will be discarded.' : 'Anh/chị có chắc chắn muốn đăng xuất? Tất cả các thay đổi nháp chưa lưu sẽ bị hủy.')) {
    await window.logoutAndResetLocalData(false);
  }
};

document.querySelectorAll('.admin-tab').forEach(btn => btn.onclick = () => {
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); adminTab = btn.dataset.atab; renderAdmin();
});

window.getEditorValue = function(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return '';
  const isHtmlMode = el.getAttribute('data-html-mode') === 'true';
  return isHtmlMode ? el.innerText : el.innerHTML;
};

window.flushEditors = function() {
  const editors = document.querySelectorAll('.wysiwyg-editor');
  if (editors.length === 0) return;

  let hasPendingChanges = false;
  try {
    for (let i = 0; i < editors.length; i++) {
      const el = editors[i];
      if (!el.id) continue;
      const val = window.getEditorValue(el.id);
      
      if (el.dataset.key && el.dataset.lang) {
        const custom = JSON.parse(localStorage.getItem('draft_hr_custom_translations') || '{}');
        const currentVal = custom[el.dataset.lang]?.[el.dataset.key] || '';
        if (currentVal !== val) {
          hasPendingChanges = true;
          break;
        }
      } else if (el.dataset.secName && el.dataset.metaField) {
        const meta = JSON.parse(localStorage.getItem('draft_hr_section_metadata') || '{}');
        const currentVal = meta[el.dataset.secName]?.[el.dataset.metaField] || '';
        if (currentVal !== val) {
          hasPendingChanges = true;
          break;
        }
      } else if (el.dataset.qId && el.dataset.field) {
        const qs = adminGetQuestions();
        const q = qs.find(item => item.id === el.dataset.qId);
        if (q && q[el.dataset.field] !== val) {
          hasPendingChanges = true;
          break;
        }
      }
    }
  } catch (e) {
    console.error('[flushEditors] Error checking changes', e);
  }

  if (hasPendingChanges) {
    window.isFlushing = false;
    window.pushHistory();
  }

  window.isFlushing = true;
  let qs = null;
  let qsModified = false;

  try {
    editors.forEach(el => {
      if (!el.id) return;
      const val = window.getEditorValue(el.id);

      if (el.dataset.key && el.dataset.lang) {
        window.saveCustomTranslation(el.dataset.key, el.dataset.lang, val);
      } else if (el.dataset.secName && el.dataset.metaField) {
        window.saveSectionMetadataField(el.dataset.secName, el.dataset.metaField, val);
      } else if (el.dataset.qId && el.dataset.field) {
        if (!qs) qs = adminGetQuestions();
        const idx = qs.findIndex(q => q.id === el.dataset.qId);
        if (idx !== -1) {
          if (qs[idx][el.dataset.field] !== val) {
            qs[idx][el.dataset.field] = val;
            qsModified = true;
          }
        }
      }
    });

    if (qsModified && qs) {
      adminSaveQuestions(qs);
      updateAdminSaveButtonsState();
    }
  } catch (e) {
    console.error('Error inside flushEditors', e);
  } finally {
    window.isFlushing = false;
  }
};

window.updateFieldPreview = function(inputId) {
  const el = document.getElementById(inputId);
  const container = document.getElementById(`preview_container_${inputId}`);
  const content = document.getElementById(`preview_content_${inputId}`);
  if (!el || !container || !content) return;
  
  let val = window.getEditorValue(inputId);
  if (!val || val.trim() === '' || val.trim() === '<br>') {
    val = el.getAttribute('placeholder') || '';
  }
  
  if (val && val.trim() !== '' && val.trim() !== '<br>') {
    container.style.display = 'block';
    content.innerHTML = val;
  } else {
    container.style.display = 'none';
    content.innerHTML = '';
  }
};

window.handleSingleLineKeydown = function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
};

window.toggleHtmlMode = function(inputId, btn) {
  const el = document.getElementById(inputId);
  if (!el) return;
  const isHtmlMode = el.getAttribute('data-html-mode') === 'true';
  
  if (isHtmlMode) {
    // Switch to WYSIWYG (Visual) mode
    const rawHtml = el.innerText;
    el.innerHTML = rawHtml;
    el.setAttribute('data-html-mode', 'false');
    if (btn) {
      btn.textContent = '</> Code';
      btn.style.background = 'var(--gray-xlight)';
      btn.style.color = 'var(--black)';
    }
  } else {
    // Switch to HTML (Code) mode
    const currentHtml = el.innerHTML;
    el.innerText = currentHtml;
    el.setAttribute('data-html-mode', 'true');
    if (btn) {
      btn.textContent = '👁 Visual';
      btn.style.background = 'var(--blue-xlight)';
      btn.style.color = 'var(--blue)';
    }
  }
  
  // Trigger input event to update state
  el.dispatchEvent(new Event('input', { bubbles: true }));
  // Update live preview
  window.updateFieldPreview(inputId);
};

window.applyTextFormat = function(inputId, tag, val) {
  const el = document.getElementById(inputId);
  if (!el) { console.log('[applyTextFormat] element not found:', inputId); return; }

  console.log('[applyTextFormat] called with', {inputId, tag, val, innerHTML_before: el.innerHTML.substring(0,100)});
  
  el.focus();
  
  // Khôi phục selection đã lưu (toolbar input không làm mất vùng bôi đen)
  if (window._savedWysiwygRange && window._savedWysiwygEditorId === inputId) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(window._savedWysiwygRange);
    window._savedWysiwygRange = null;
    window._savedWysiwygEditorId = null;
    console.log('[applyTextFormat] restored saved range');
  }
  
  const selection = window.getSelection();
  if (!selection.rangeCount) {
    const newRange = document.createRange();
    newRange.selectNodeContents(el);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
  
  const range = selection.getRangeAt(0);
  
  // Make sure selection is inside the editor
  let parent = range.commonAncestorContainer;
  if (parent.nodeType === 3) parent = parent.parentNode;
  if (!el.contains(parent)) {
    const newRange = document.createRange();
    newRange.selectNodeContents(el);
    newRange.collapse(false); // cursor at end
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
  
  if (tag === 'bold') {
    document.execCommand('bold', false, null);
  } else if (tag === 'italic') {
    document.execCommand('italic', false, null);
  } else if (tag === 'underline') {
    document.execCommand('underline', false, null);
  } else if (tag === 'color') {
    if (selection.isCollapsed) {
      const currentHtml = el.innerHTML.trim();
      if (currentHtml && currentHtml !== '<br>') {
        el.innerHTML = `<span style="color: ${val}">${currentHtml}</span>`;
      } else {
        el.innerHTML = `<span style="color: ${val}">&#8203;</span>`;
      }
      // Place cursor at the end
      const newRange = document.createRange();
      newRange.selectNodeContents(el);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('foreColor', false, val);
    }
  } else if (tag === 'size') {
    if (selection.isCollapsed) {
      const span = document.createElement('span');
      span.style.fontSize = val;
      span.innerHTML = '&#8203;'; // zero-width space
      const r = selection.getRangeAt(0);
      r.insertNode(span);
      
      const newRange = document.createRange();
      newRange.setStart(span.firstChild, 1);
      newRange.setEnd(span.firstChild, 1);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      const r = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = val;
      try {
        span.appendChild(r.extractContents());
        r.insertNode(span);
        
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (e) {
        console.error('Error applying font size:', e);
      }
    }
  } else if (tag === 'font') {
    if (selection.isCollapsed) {
      const currentHtml = el.innerHTML.trim();
      if (currentHtml && currentHtml !== '<br>') {
        el.innerHTML = `<span style="font-family: ${val}">${currentHtml}</span>`;
      } else {
        el.innerHTML = `<span style="font-family: ${val}">&#8203;</span>`;
      }
      const newRange = document.createRange();
      newRange.selectNodeContents(el);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      const r = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontFamily = val;
      try {
        span.appendChild(r.extractContents());
        r.insertNode(span);
        
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (e) {
        console.error('Error applying font family:', e);
      }
    }
  }
  
  console.log('[applyTextFormat] after format, innerHTML:', el.innerHTML.substring(0,150));
  
  // Direct save by element (bypasses input event)
  if (window.updateQFieldByEl) updateQFieldByEl(el);
  
  // Trigger input event to update state
  el.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('[applyTextFormat] input event dispatched');
  // Update live preview
  window.updateFieldPreview(inputId);
};

window.pasteModes = window.pasteModes || {};
window.setPasteMode = function(inputId, val) {
  window.pasteModes[inputId] = val;
};

// Global paste intercept for WYSIWYG editor class
document.addEventListener('paste', function(e) {
  const el = e.target.closest('.wysiwyg-editor');
  if (!el) return;
  
  const inputId = el.id;
  const mode = (window.pasteModes && window.pasteModes[inputId]) || 'rich';
  
  if (mode === 'plain') {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    if (document.queryCommandSupported('insertText')) {
      document.execCommand('insertText', false, text);
    } else {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(text));
    }
    
    el.dispatchEvent(new Event('input', { bubbles: true }));
    if (window.updateFieldPreview) {
      window.updateFieldPreview(inputId);
    }
  }
});

// Global input listener to update WYSIWYG live preview immediately on typing
document.addEventListener('input', function(e) {
  const el = e.target.closest('.wysiwyg-editor');
  if (!el) return;
  const inputId = el.id;
  if (inputId && window.updateFieldPreview) {
    window.updateFieldPreview(inputId);
  }
});

/* ── WYSIWYG SELECTION SAVE/RESTORE ── */
window._savedWysiwygRange = null;
window._savedWysiwygEditorId = null;
window.saveWysiwygSelection = function(inputId) {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    const el = document.getElementById(inputId);
    if (el && el.contains(sel.anchorNode)) {
      window._savedWysiwygRange = sel.getRangeAt(0);
      window._savedWysiwygEditorId = inputId;
    }
  }
};
document.addEventListener('focusout', function(e) {
  const el = e.target.closest('.wysiwyg-editor');
  if (el) window.saveWysiwygSelection(el.id);
});
/* ── DRAFT SAVE & LOAD FOR ADMIN ── */
window.initializeDrafts = function() {
  if (!localStorage.getItem('draft_hr_questions')) {
    localStorage.setItem('draft_hr_questions', localStorage.getItem('hr_questions') || '[]');
  }
  if (!localStorage.getItem('draft_hr_section_metadata')) {
    localStorage.setItem('draft_hr_section_metadata', localStorage.getItem('hr_section_metadata') || '{}');
  }
  if (!localStorage.getItem('draft_hr_section_descriptions')) {
    localStorage.setItem('draft_hr_section_descriptions', localStorage.getItem('hr_section_descriptions') || '{}');
  }
  if (!localStorage.getItem('draft_hr_custom_translations')) {
    localStorage.setItem('draft_hr_custom_translations', localStorage.getItem('hr_custom_translations') || '{"vi":{},"en":{}}');
  }
  if (!localStorage.getItem('hr_assumed_profile')) {
    localStorage.setItem('hr_assumed_profile', JSON.stringify(window.defaultAssumedProfile));
  }
  if (!localStorage.getItem('draft_hr_assumed_profile')) {
    localStorage.setItem('draft_hr_assumed_profile', localStorage.getItem('hr_assumed_profile') || JSON.stringify(window.defaultAssumedProfile));
  }
  if (!localStorage.getItem('draft_hr_typography')) {
    localStorage.setItem('draft_hr_typography', localStorage.getItem('hr_typography') || '{}');
  }
};

window.clearDrafts = function() {
  localStorage.removeItem('draft_hr_questions');
  localStorage.removeItem('draft_hr_section_metadata');
  localStorage.removeItem('draft_hr_section_descriptions');
  localStorage.removeItem('draft_hr_custom_translations');
  localStorage.removeItem('draft_hr_assumed_profile');
  localStorage.removeItem('draft_hr_typography');
};

window.hasUnsavedQuestionsChanges = function() {
  const prodQs = (localStorage.getItem('hr_questions') || '').trim();
  const draftQs = (localStorage.getItem('draft_hr_questions') || '').trim();
  const prodMeta = (localStorage.getItem('hr_section_metadata') || '').trim();
  const draftMeta = (localStorage.getItem('draft_hr_section_metadata') || '').trim();
  const prodDescs = (localStorage.getItem('hr_section_descriptions') || '').trim();
  const draftDescs = (localStorage.getItem('draft_hr_section_descriptions') || '').trim();
  
  return prodQs !== draftQs || prodMeta !== draftMeta || prodDescs !== draftDescs;
};

window.hasUnsavedConfigureChanges = function() {
  const prodConf = (localStorage.getItem('hr_custom_translations') || '').trim();
  const draftConf = (localStorage.getItem('draft_hr_custom_translations') || '').trim();
  const prodAssumed = (localStorage.getItem('hr_assumed_profile') || '').trim();
  const draftAssumed = (localStorage.getItem('draft_hr_assumed_profile') || '').trim();
  const prodTypo = (localStorage.getItem('hr_typography') || '').trim();
  const draftTypo = (localStorage.getItem('draft_hr_typography') || '').trim();
  
  return prodConf !== draftConf || prodAssumed !== draftAssumed || prodTypo !== draftTypo;
};

window.saveQuestionsToProd = async function() {
  if (typeof window.flushEditors === 'function') {
    window.flushEditors();
  }
  if (!await showConfirm(currentLang === 'en' ? 'Are you sure you want to save all changes to Questions?' : 'Anh/chị có chắc chắn muốn lưu tất cả các thay đổi ở phần Câu hỏi?')) return;
  try {
    const draftQs = localStorage.getItem('draft_hr_questions');
    const draftMeta = localStorage.getItem('draft_hr_section_metadata');
    const draftDescs = localStorage.getItem('draft_hr_section_descriptions');
    
    if (draftQs) {
      localStorage.setItem('hr_questions', draftQs);
      await saveSettingToDb('hr_questions', JSON.parse(draftQs));
    }
    if (draftMeta) {
      localStorage.setItem('hr_section_metadata', draftMeta);
      await saveSettingToDb('hr_section_metadata', JSON.parse(draftMeta));
    }
    if (draftDescs) {
      localStorage.setItem('hr_section_descriptions', draftDescs);
      await saveSettingToDb('hr_section_descriptions', JSON.parse(draftDescs));
    }
    
    await showAlert(currentLang === 'en' ? 'Questions saved successfully!' : 'Đã lưu câu hỏi thành công!');
    renderAdmin();
  } catch (e) {
    console.error(e);
    await showAlert((currentLang === 'en' ? 'Error saving data: ' : 'Có lỗi khi lưu dữ liệu: ') + (e.message || e));
  }
};

window.discardQuestionsChanges = async function() {
  if (await showConfirm(currentLang === 'en' ? 'Are you sure you want to discard all unsaved changes in Questions?' : 'Anh/chị có chắc chắn muốn hủy tất cả các thay đổi chưa lưu ở phần Câu hỏi?')) {
    localStorage.setItem('draft_hr_questions', localStorage.getItem('hr_questions') || '[]');
    localStorage.setItem('draft_hr_section_metadata', localStorage.getItem('hr_section_metadata') || '{}');
    localStorage.setItem('draft_hr_section_descriptions', localStorage.getItem('hr_section_descriptions') || '{}');
    renderAdmin();
  }
};

window.saveConfigureToProd = async function() {
  if (typeof window.flushEditors === 'function') {
    window.flushEditors();
  }
  if (!await showConfirm(currentLang === 'en' ? 'Are you sure you want to save all changes to Configuration?' : 'Anh/chị có chắc chắn muốn lưu tất cả các thay đổi ở phần Tùy chỉnh?')) return;
  try {
    const draftConf = localStorage.getItem('draft_hr_custom_translations');
    if (draftConf) {
      localStorage.setItem('hr_custom_translations', draftConf);
      await saveSettingToDb('hr_custom_translations', JSON.parse(draftConf));
    }
    
    const draftAssumed = localStorage.getItem('draft_hr_assumed_profile');
    if (draftAssumed) {
      localStorage.setItem('hr_assumed_profile', draftAssumed);
      await saveSettingToDb('hr_assumed_profile', JSON.parse(draftAssumed));
    }

    const draftTypo = localStorage.getItem('draft_hr_typography');
    if (draftTypo) {
      localStorage.setItem('hr_typography', draftTypo);
      await saveSettingToDb('hr_typography', JSON.parse(draftTypo));
      if (typeof applyTypographySettings === 'function') applyTypographySettings();
    }
    
    await showAlert(currentLang === 'en' ? 'Configuration saved successfully!' : 'Đã lưu tùy chỉnh thành công!');
    renderAdmin();
    if (typeof renderProgress === 'function') {
      renderProgress();
    }
  } catch (e) {
    console.error(e);
    await showAlert((currentLang === 'en' ? 'Error saving data: ' : 'Có lỗi khi lưu dữ liệu: ') + (e.message || e));
  }
};

window.discardConfigureChanges = async function() {
  if (await showConfirm(currentLang === 'en' ? 'Are you sure you want to discard all unsaved changes in Configuration?' : 'Anh/chị có chắc chắn muốn hủy tất cả các thay đổi chưa lưu ở phần Tùy chỉnh?')) {
    localStorage.setItem('draft_hr_custom_translations', localStorage.getItem('hr_custom_translations') || '{"vi":{},"en":{}}');
    localStorage.setItem('draft_hr_assumed_profile', localStorage.getItem('hr_assumed_profile') || JSON.stringify(window.defaultAssumedProfile));
    localStorage.setItem('draft_hr_typography', localStorage.getItem('hr_typography') || '{}');
    // Revert live preview
    if (typeof applyTypographySettings === 'function') applyTypographySettings();
    renderAdmin();
  }
};

window.adminGetQuestions = function() {
  initializeDrafts();
  let draft = localStorage.getItem('draft_hr_questions');
  let qs = [];
  try {
    qs = JSON.parse(draft);
  } catch (e) {
    console.error('Error parsing draft questions:', e);
  }

  let changed = false;

  if (!qs || qs.length === 0) {
    qs = typeof defaultQuestions === 'function' ? defaultQuestions() : [];
    changed = true;
  }

  // Auto-migrate/inject English translations for existing questions if missing
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
      }
    }
    const std = standardEnOptions[q.id];
    if (std) {
      if (std.optionsEN && (!q.optionsEN || q.optionsEN.length === 0)) {
        q.optionsEN = std.optionsEN;
        changed = true;
      }
      if (std.labelStartEN && !q.labelStartEN) {
        q.labelStartEN = std.labelStartEN;
        changed = true;
      }
      if (std.labelEndEN && !q.labelEndEN) {
        q.labelEndEN = std.labelEndEN;
        changed = true;
      }
    }
  });

  // Force sorting order for "Thông tin chung" in drafts
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

  let currentGeneralInfo = qs.filter(q => q.section === 'Thông tin chung');
  let isSortedCorrectly = true;
  for (let i = 0; i < currentGeneralInfo.length - 1; i++) {
    const idxCurrent = generalOrder.indexOf(currentGeneralInfo[i].id);
    const idxNext = generalOrder.indexOf(currentGeneralInfo[i + 1].id);
    if (idxCurrent > idxNext) {
      isSortedCorrectly = false;
      break;
    }
  }
  if (!isSortedCorrectly) {
    changed = true;
  }

  const { preSections, postSections, ctrlSections } = getSurveySectionDivisionRaw(qs);
  const orderedSections = [...preSections, ...postSections, ...ctrlSections];
  console.log('[adminGetQuestions] before sort, qs order:', qs.map(q => ({id: q.id, section: q.section})).slice(0,20));
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

  if (changed) {
    qs.forEach((q, idx) => {
      q.order = idx + 1;
    });
    localStorage.setItem('draft_hr_questions', JSON.stringify(qs));
  }
  return qs;
};

window.adminSaveQuestions = function(qs) {
  qs.forEach((q, idx) => {
    q.order = idx + 1;
  });
  localStorage.setItem('draft_hr_questions', JSON.stringify(qs));
  updateAdminSaveButtonsState();
};

window.adminGetSectionMetadata = function(secName) {
  initializeDrafts();
  try {
    const meta = JSON.parse(localStorage.getItem('draft_hr_section_metadata')) || {};
    return meta[secName] || null;
  } catch (e) {
    return null;
  }
};

window.adminGetSectionTitle = function(name) {
  if (!name) return { vi: '', en: '' };
  const meta = adminGetSectionMetadata(name);
  const clean = name.replace('Manipulation check: ', 'MC: ');
  const entry = SECTION_NAMES[name] || SECTION_NAMES[clean];
  
  const viTitle = (meta && meta.titleVI && meta.titleVI.trim()) || (entry && entry.vi) || clean;
  const enTitle = (meta && meta.titleEN && meta.titleEN.trim()) || (entry && entry.en) || '';
  
  return { vi: viTitle, en: enTitle };
};

window.adminGetSectionDescription = function(name) {
  if (!name) return { vi: '', en: '' };
  const meta = adminGetSectionMetadata(name);
  
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
      const oldDescs = JSON.parse(localStorage.getItem('draft_hr_section_descriptions')) || {};
      oldDesc = oldDescs[name] || '';
    } catch(e) {}
    defaultVI = oldDesc;
    defaultEN = '';
  }
  
  const viDesc = (meta && meta.descVI && meta.descVI.trim()) || defaultVI;
  const enDesc = (meta && meta.descEN && meta.descEN.trim()) || defaultEN;
  
  return { vi: viDesc, en: enDesc };
};

window.adminGetSurveySectionDivision = function() {
  const qs = adminGetQuestions();
  return getSurveySectionDivisionRaw(qs, true);
};

window.adminGetCustomTranslations = function() {
  initializeDrafts();
  let draft = localStorage.getItem('draft_hr_custom_translations');
  return JSON.parse(draft);
};

window.updateAdminSaveButtonsState = function() {
  const qDiscardBtn = document.getElementById('qDiscardBtn');
  const qSaveBtn = document.getElementById('qSaveBtn');
  if (qDiscardBtn && qSaveBtn) {
    const hasChanges = hasUnsavedQuestionsChanges();
    qDiscardBtn.disabled = !hasChanges;
    qSaveBtn.disabled = !hasChanges;
    qDiscardBtn.style.cursor = hasChanges ? 'pointer' : 'not-allowed';
    qSaveBtn.style.cursor = hasChanges ? 'pointer' : 'not-allowed';
    
    // Save Changes button
    qSaveBtn.style.background = hasChanges ? 'var(--blue)' : 'var(--gray-light)';
    qSaveBtn.style.borderColor = hasChanges ? 'var(--blue)' : 'var(--gray-light)';
    qSaveBtn.style.color = hasChanges ? '#fff' : 'var(--gray-mid)';
    
    // Discard Changes button
    qDiscardBtn.style.color = hasChanges ? 'var(--gray-dark)' : 'var(--gray-mid)';
    qDiscardBtn.style.borderColor = hasChanges ? 'var(--gray-light)' : 'var(--gray-light)';
  }

  const cDiscardBtn = document.getElementById('cDiscardBtn');
  const cSaveBtn = document.getElementById('cSaveBtn');
  if (cDiscardBtn && cSaveBtn) {
    const hasChanges = hasUnsavedConfigureChanges();
    cDiscardBtn.disabled = !hasChanges;
    cSaveBtn.disabled = !hasChanges;
    cDiscardBtn.style.cursor = hasChanges ? 'pointer' : 'not-allowed';
    cSaveBtn.style.cursor = hasChanges ? 'pointer' : 'not-allowed';
    
    // Save Config button
    cSaveBtn.style.background = hasChanges ? 'var(--blue)' : 'var(--gray-light)';
    cSaveBtn.style.borderColor = hasChanges ? 'var(--blue)' : 'var(--gray-light)';
    cSaveBtn.style.color = hasChanges ? '#fff' : 'var(--gray-mid)';
    
    // Discard Config button
    cDiscardBtn.style.color = hasChanges ? 'var(--gray-dark)' : 'var(--gray-mid)';
    cDiscardBtn.style.borderColor = hasChanges ? 'var(--gray-light)' : 'var(--gray-light)';
  }
};

window.addEventListener('beforeunload', function (e) {
  if (typeof window.flushEditors === 'function') {
    window.flushEditors();
  }
  if (window.hasUnsavedQuestionsChanges() || window.hasUnsavedConfigureChanges()) {
    const confirmationMessage = 'Anh/chị có các thay đổi chưa lưu. Nếu rời đi, các thay đổi này sẽ bị mất.';
    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
  }
});

window.getFormatToolbarHtml = function(inputId) {
  const currentMode = (window.pasteModes && window.pasteModes[inputId]) || 'rich';
  const presetColors = [
    { value: '#334155', title: 'Xám đậm / Slate' },
    { value: '#dc2626', title: 'Đỏ Red' },
    { value: '#1d4ed8', title: 'Xanh dương / Blue' },
    { value: '#16a34a', title: 'Xanh lá / Green' },
    { value: '#ea580c', title: 'Cam / Orange' },
    { value: '#7c3aed', title: 'Tím / Purple' }
  ];
  const colorSwatchesHtml = presetColors.map(c => `
    <button type="button" onclick="applyTextFormat('${inputId}', 'color', '${c.value}'); this.closest('.color-dropdown-menu').style.display='none'" style="width:14px; height:14px; border-radius:50%; border:1px solid rgba(0,0,0,0.15); background:${c.value}; cursor:pointer; padding:0; display:inline-block; vertical-align:middle; flex-shrink:0" title="${c.title}"></button>
  `).join('');

  return `
    <div class="format-toolbar" style="display:inline-flex; gap:4px; align-items:center; margin-bottom:2px; flex-wrap:wrap">
      <button type="button" onclick="applyTextFormat('${inputId}', 'bold')" class="btn" style="padding:1px 6px; font-size:7.5pt; font-weight:bold; min-width:auto; background:var(--gray-xlight); border:1px solid var(--gray-light); color:var(--black); border-radius:2px; cursor:pointer" title="In đậm">B</button>
      <button type="button" onclick="applyTextFormat('${inputId}', 'italic')" class="btn" style="padding:1px 6px; font-size:7.5pt; font-style:italic; min-width:auto; background:var(--gray-xlight); border:1px solid var(--gray-light); color:var(--black); border-radius:2px; cursor:pointer" title="In nghiêng">I</button>
      <button type="button" onclick="applyTextFormat('${inputId}', 'underline')" class="btn" style="padding:1px 6px; font-size:7.5pt; text-decoration:underline; min-width:auto; background:var(--gray-xlight); border:1px solid var(--gray-light); color:var(--black); border-radius:2px; cursor:pointer" title="Gạch chân">U</button>
      
      <!-- Dropdown Color Picker -->
      <div class="color-dropdown" style="position:relative; display:inline-block">
        <button type="button" onclick="window.toggleColorDropdown(event, '${inputId}')" class="btn" style="padding:1px 6px; font-size:7.5pt; min-width:auto; background:var(--gray-xlight); border:1px solid var(--gray-light); color:var(--black); border-radius:2px; cursor:pointer; display:inline-flex; align-items:center; gap:3px; height:18px" title="Màu chữ">
          <span style="font-weight:700; border-bottom:2px solid var(--black); line-height:1">A</span>
          <span style="font-size:5.5pt; color:var(--gray-mid)">▼</span>
        </button>
        <div id="color_menu_${inputId}" class="color-dropdown-menu" style="display:none; position:absolute; top:20px; left:0; z-index:1000; background:#ffffff; border:1px solid var(--gray-light); border-radius:6px; padding:6px; gap:6px; box-shadow:0 4px 10px rgba(0,0,0,0.15); flex-wrap:wrap; width:72px; box-sizing:border-box; justify-content:center; align-items:center">
          ${colorSwatchesHtml}
          <div style="position:relative; display:inline-flex; align-items:center; width:14px; height:14px; flex-shrink:0">
            <button type="button" onclick="document.getElementById('color_picker_${inputId}').click(); this.closest('.color-dropdown-menu').style.display='none';" style="width:14px; height:14px; border-radius:50%; border:1px solid rgba(0,0,0,0.15); background:linear-gradient(to right, red, orange, yellow, green, blue, violet); cursor:pointer; padding:0; display:inline-block" title="Màu khác"></button>
          </div>
        </div>
        <input type="color" id="color_picker_${inputId}" onchange="applyTextFormat('${inputId}', 'color', this.value)" style="position:absolute; width:0; height:0; opacity:0; pointer-events:none; border:none; padding:0">
      </div>

      <!-- Font Family Dropdown -->
      <select onchange="applyTextFormat('${inputId}', 'font', this.value); this.value=''" style="padding:1px 16px 1px 4px; font-size:7.5pt; height:18px; border:1px solid var(--gray-light); border-radius:2px; background:var(--gray-xlight); width:auto; min-width:80px; margin-bottom:0; line-height:1; cursor:pointer" title="Chọn phông chữ">
        <option value="">Phông chữ</option>
        ${(window.FONT_OPTIONS || []).map(f => `<option value="${f.stack}">${f.label}</option>`).join('')}
      </select>

      <input list="fz_${inputId}" onchange="if(this.value) { var v=this.value; if(!isNaN(parseFloat(v))&&!/pt$/i.test(v)) v+='pt'; applyTextFormat('${inputId}', 'size', v); this.value='' }" placeholder="Cỡ chữ..." style="padding:1px 4px; font-size:7.5pt; height:18px; width:62px; border:1px solid var(--gray-light); border-radius:2px; background:var(--gray-xlight); margin-bottom:0; box-sizing:border-box">
      <datalist id="fz_${inputId}">
        <option value="9pt">
        <option value="11pt">
        <option value="13pt">
        <option value="15pt">
        <option value="18pt">
      </datalist>

      <select onchange="window.setPasteMode('${inputId}', this.value)" style="padding:1px 16px 1px 4px; font-size:7.5pt; height:18px; border:1px solid var(--gray-light); border-radius:2px; background:var(--gray-xlight); width:auto; min-width:85px; margin-bottom:0; line-height:1; cursor:pointer" title="Chế độ dán khi nhấn Ctrl+V hoặc chuột phải">
        <option value="rich" ${currentMode === 'rich' ? 'selected' : ''}>Dán: Giữ định dạng</option>
        <option value="plain" ${currentMode === 'plain' ? 'selected' : ''}>Dán: Xóa định dạng</option>
      </select>
    </div>
  `;
};

window.toggleColorDropdown = function(event, inputId) {
  event.stopPropagation();
  const targetMenu = document.getElementById(`color_menu_${inputId}`);
  if (!targetMenu) return;

  // Close all other color menus
  document.querySelectorAll('.color-dropdown-menu').forEach(menu => {
    if (menu !== targetMenu) {
      menu.style.display = 'none';
    }
  });

  // Toggle this one
  targetMenu.style.display = targetMenu.style.display === 'flex' ? 'none' : 'flex';
};

// Global click outside listener to close menus
document.addEventListener('click', function(e) {
  if (!e.target.closest('.color-dropdown')) {
    document.querySelectorAll('.color-dropdown-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  }
});

let activeQIndex = -1;

async function renderAdmin(skipFlush = false) {
  if (!skipFlush && typeof window.flushEditors === 'function') {
    window.flushEditors();
  }
  initializeDrafts();
  const c = $('adminContent');
  if (adminTab === 'questions') renderAdminQuestions(c);
  else if (adminTab === 'responses') await renderAdminResponses(c);
  else if (adminTab === 'dashboard') await renderAdminDashboard(c);
  else if (adminTab === 'configure') renderAdminConfigure(c);
  else await renderAdminSamples(c);
}





window.updateDraftAssumedProfile = function(index, propKey, val) {
  pushHistory();
  let draft = [];
  try {
    const raw = localStorage.getItem('draft_hr_assumed_profile');
    draft = raw ? JSON.parse(raw) : [];
  } catch(e) {
    console.error(e);
  }
  
  draft = window.normalizeAssumedProfile(draft);
  
  if (draft[index]) {
    draft[index][propKey] = val;
  }
  
  localStorage.setItem('draft_hr_assumed_profile', JSON.stringify(draft));
  
  // Update disabled/enabled states of cSaveBtn and cDiscardBtn
  const hasChanges = hasUnsavedConfigureChanges();
  const saveBtn = $('cSaveBtn');
  const discardBtn = $('cDiscardBtn');
  if (saveBtn) {
    saveBtn.disabled = !hasChanges;
    saveBtn.style.background = hasChanges ? 'var(--blue)' : 'var(--gray-light)';
    saveBtn.style.borderColor = hasChanges ? 'var(--blue)' : 'var(--gray-light)';
    saveBtn.style.color = hasChanges ? '#fff' : 'var(--gray-mid)';
    saveBtn.style.cursor = hasChanges ? 'pointer' : 'not-allowed';
  }
  if (discardBtn) {
    discardBtn.disabled = !hasChanges;
    discardBtn.style.color = hasChanges ? 'var(--gray-dark)' : 'var(--gray-mid)';
    discardBtn.style.cursor = hasChanges ? 'pointer' : 'not-allowed';
  }
};

window.addDraftAssumedProfileField = function() {
  pushHistory();
  let draft = [];
  try {
    const raw = localStorage.getItem('draft_hr_assumed_profile');
    draft = raw ? JSON.parse(raw) : [];
  } catch(e) {
    console.error(e);
  }
  
  draft = window.normalizeAssumedProfile(draft);
  
  const newId = 'field_' + Math.random().toString(36).slice(2, 10);
  draft.push({
    id: newId,
    label: 'Trường mới',
    labelEN: 'New Field',
    value: 'Giá trị',
    valueEN: 'Value',
    type: 'text'
  });
  
  localStorage.setItem('draft_hr_assumed_profile', JSON.stringify(draft));
  
  // Re-render admin configure tab
  if (adminTab === 'configure') {
    const configurePanel = $('adminContent');
    if (configurePanel) {
      renderAdminConfigure(configurePanel);
    }
  }
  
  // Update buttons
  const saveBtn = $('cSaveBtn');
  const discardBtn = $('cDiscardBtn');
  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.style.background = 'var(--blue)';
    saveBtn.style.borderColor = 'var(--blue)';
    saveBtn.style.color = '#fff';
    saveBtn.style.cursor = 'pointer';
  }
  if (discardBtn) {
    discardBtn.disabled = false;
    discardBtn.style.color = 'var(--gray-dark)';
    discardBtn.style.cursor = 'pointer';
  }
};

window.deleteDraftAssumedProfileField = function(index) {
  let draft = [];
  try {
    const raw = localStorage.getItem('draft_hr_assumed_profile');
    draft = raw ? JSON.parse(raw) : [];
  } catch(e) {
    console.error(e);
  }
  
  draft = window.normalizeAssumedProfile(draft);
  
  if (draft.length <= 1) {
    alert(currentLang === 'en' ? 'Profile must contain at least 1 field.' : 'Hồ sơ phải chứa ít nhất 1 trường.');
    return;
  }
  
  pushHistory();
  draft.splice(index, 1);
  
  localStorage.setItem('draft_hr_assumed_profile', JSON.stringify(draft));
  
  // Re-render admin configure tab
  if (adminTab === 'configure') {
    const configurePanel = $('adminContent');
    if (configurePanel) {
      renderAdminConfigure(configurePanel);
    }
  }
  
  // Update buttons
  const saveBtn = $('cSaveBtn');
  const discardBtn = $('cDiscardBtn');
  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.style.background = 'var(--blue)';
    saveBtn.style.borderColor = 'var(--blue)';
    saveBtn.style.color = '#fff';
    saveBtn.style.cursor = 'pointer';
  }
  if (discardBtn) {
    discardBtn.disabled = false;
    discardBtn.style.color = 'var(--gray-dark)';
    discardBtn.style.cursor = 'pointer';
  }
};

window.translateDraftAssumedProfileRow = async function(index, btn) {
  let draft = [];
  try {
    const raw = localStorage.getItem('draft_hr_assumed_profile');
    draft = raw ? JSON.parse(raw) : [];
  } catch(e) {
    console.error(e);
  }
  
  draft = window.normalizeAssumedProfile(draft);
  const field = draft[index];
  if (!field) return;

  const originalText = btn.textContent;
  btn.textContent = '...';
  btn.disabled = true;

  try {
    const labelVal = field.label || '';
    const valueVal = field.value || '';
    
    let labelEN = field.labelEN || '';
    let valueEN = field.valueEN || '';

    if (labelVal.trim()) {
      const trans = await window.translateText(labelVal, 'en');
      if (trans) {
        labelEN = trans.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      }
    }
    if (valueVal.trim()) {
      const trans = await window.translateText(valueVal, 'en');
      if (trans) {
        valueEN = trans.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      }
    }

    pushHistory();
    draft[index].labelEN = labelEN;
    draft[index].valueEN = valueEN;
    localStorage.setItem('draft_hr_assumed_profile', JSON.stringify(draft));

    // Re-render admin configure tab
    if (adminTab === 'configure') {
      const configurePanel = $('adminContent');
      if (configurePanel) {
        renderAdminConfigure(configurePanel);
      }
    }

    // Update buttons
    const saveBtn = $('cSaveBtn');
    const discardBtn = $('cDiscardBtn');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.style.background = 'var(--blue)';
      saveBtn.style.borderColor = 'var(--blue)';
      saveBtn.style.color = '#fff';
      saveBtn.style.cursor = 'pointer';
    }
    if (discardBtn) {
      discardBtn.disabled = false;
      discardBtn.style.color = 'var(--gray-dark)';
      discardBtn.style.cursor = 'pointer';
    }
  } catch (e) {
    console.error(e);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
};

window.hasUnsavedTypographyChanges = function() {
  const prodTypo = (localStorage.getItem('hr_typography') || '').trim();
  const draftTypo = (localStorage.getItem('draft_hr_typography') || '').trim();
  return prodTypo !== draftTypo;
};

window.saveTypographyOnlyToProd = async function() {
  try {
    const draftTypo = localStorage.getItem('draft_hr_typography');
    if (draftTypo) {
      localStorage.setItem('hr_typography', draftTypo);
      await saveSettingToDb('hr_typography', JSON.parse(draftTypo));
      if (typeof applyTypographySettings === 'function') applyTypographySettings();
    }
    await showAlert(currentLang === 'en' ? 'Typography settings saved successfully!' : 'Đã lưu cài đặt kiểu chữ thành công!');
    renderAdmin();
  } catch (e) {
    console.error(e);
    await showAlert('Có lỗi khi lưu dữ liệu.');
  }
};

window.discardTypographyOnlyChanges = async function() {
  if (await showConfirm(currentLang === 'en' ? 'Are you sure you want to discard unsaved typography changes?' : 'Anh/chị có chắc chắn muốn hủy thay đổi kiểu chữ chưa lưu?')) {
    localStorage.setItem('draft_hr_typography', localStorage.getItem('hr_typography') || '{}');
    if (typeof applyTypographySettings === 'function') applyTypographySettings();
    renderAdmin();
  }
};

window.getTypographySettingsCardHtml = function(typo, isEn) {
  const currentFontSize = typo.fontSize || '11pt';
  const currentFontFamily = typo.fontFamily || 'Inter';
  const presetSizes = ['9pt', '10pt', '10.5pt', '11pt', '12pt', '13pt', '14pt'];
  const isCustomSize = !presetSizes.includes(currentFontSize);
  
  const hasTypoChanges = window.hasUnsavedTypographyChanges();

  return `
      <section class="card" style="padding:20px; border-radius:12px; background:#f8fafc; border:1px solid var(--gray-light); margin-bottom:20px">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--gray-light); padding-bottom:8px; margin-bottom:12px; flex-wrap:wrap; gap:8px">
          <h4 style="margin:0; color:var(--navy); font-size:11pt; font-weight:700">
            ${isEn ? 'Typography Settings' : 'Cài đặt Kiểu chữ'}
          </h4>
          <div style="display:flex; gap:6px; align-items:center">
            <button class="btn typoDiscardBtnClass" onclick="discardTypographyOnlyChanges()" ${hasTypoChanges ? '' : 'disabled'} style="font-size:8pt; padding:4px 10px; min-width:auto; height:26px; background:none; border:1px solid var(--gray-light); color:${hasTypoChanges ? 'var(--gray-dark)' : 'var(--gray-mid)'}; cursor:${hasTypoChanges ? 'pointer' : 'not-allowed'}">${isEn ? 'Discard' : 'Hủy'}</button>
            <button class="btn primary typoSaveBtnClass" onclick="saveTypographyOnlyToProd()" ${hasTypoChanges ? '' : 'disabled'} style="font-size:8pt; padding:4px 12px; min-width:auto; height:26px; background:${hasTypoChanges ? 'var(--blue)' : 'var(--gray-light)'}; border-color:${hasTypoChanges ? 'var(--blue)' : 'var(--gray-light)'}; color:${hasTypoChanges ? '#fff' : 'var(--gray-mid)'}; cursor:${hasTypoChanges ? 'pointer' : 'not-allowed'}">${isEn ? 'Save' : 'Lưu'}</button>
          </div>
        </div>
        <p style="color:var(--gray-dark); font-size:9pt; margin-bottom:16px; line-height:1.4">
          ${isEn 
            ? 'Customize font family and font size for the survey interface. Changes are previewed live.' 
            : 'Tùy chỉnh font chữ và cỡ chữ cho giao diện khảo sát. Thay đổi được xem trước trực tiếp.'}
        </p>
        <div style="display:flex; flex-direction:column; gap:20px">

          <!-- Font Family -->
          <div>
            <label style="display:block; font-size:8.5pt; font-weight:700; color:var(--gray-dark); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.05em">${isEn ? 'Font Family' : 'Font chữ'}</label>
            <div style="display:flex; flex-wrap:wrap; gap:8px">
              ${(window.FONT_OPTIONS || []).map(f => `
                <button
                  type="button"
                  data-typo-family="${f.value}"
                  onclick="updateDraftTypography('fontFamily', '${f.value}')"
                  style="padding:8px 14px; font-size:9pt; font-family:${f.stack}; border:1.5px solid ${currentFontFamily === f.value ? 'var(--blue)' : 'var(--gray-light)'}; border-radius:8px; background:${currentFontFamily === f.value ? 'var(--blue-xlight)' : '#fff'}; color:${currentFontFamily === f.value ? 'var(--navy)' : 'var(--gray-dark)'}; cursor:pointer; font-weight:${currentFontFamily === f.value ? '700' : '400'}; transition:all 0.15s ease">
                  ${f.label}
                </button>
              `).join('')}
            </div>
            <div style="margin-top:10px; padding:10px 14px; background:#fff; border:1px dashed var(--gray-mid); border-radius:8px; font-size:9pt; color:var(--gray-dark)">
              <span style="font-size:7.5pt; font-weight:700; color:var(--gray-mid); text-transform:uppercase; letter-spacing:0.05em">${isEn ? 'Preview' : 'Xem trước'}: </span>
              <span class="typoFontPreviewClass" style="font-family:var(--font-family)">Đánh giá hiệu suất nhân viên · AI Performance Evaluation Survey</span>
            </div>
          </div>

          <!-- Font Size -->
          <div>
            <label style="display:block; font-size:8.5pt; font-weight:700; color:var(--gray-dark); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.05em">${isEn ? 'Font Size' : 'Cỡ chữ'}</label>
            <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:10px">
              ${presetSizes.map(size => `
                <button
                  type="button"
                  data-typo-size="${size}"
                  onclick="updateDraftTypography('fontSize', '${size}'); document.querySelectorAll('.customSizeInputClass').forEach(i => i.value = '')"
                  style="padding:6px 14px; font-size:9pt; border:1.5px solid ${currentFontSize === size ? 'var(--blue)' : 'var(--gray-light)'}; border-radius:8px; background:${currentFontSize === size ? 'var(--blue)' : 'var(--blue-xlight)'}; color:${currentFontSize === size ? '#fff' : 'var(--blue)'}; cursor:pointer; font-weight:600; transition:all 0.15s ease">
                  ${size}
                </button>
              `).join('')}
              <div class="customSizeContainerClass" style="display:flex; align-items:center; gap:6px; border:1.5px solid ${isCustomSize ? 'var(--blue)' : 'var(--gray-light)'}; border-radius:8px; padding:4px 10px; background:${isCustomSize ? 'var(--blue-xlight)' : '#fff'}">
                <label style="font-size:8.5pt; color:var(--gray-dark); white-space:nowrap">${isEn ? 'Custom:' : 'Tùy chỉnh:'}</label>
                <input
                  class="customSizeInputClass"
                  type="number"
                  min="8" max="24" step="0.5"
                  placeholder="${isCustomSize ? currentFontSize.replace('pt','') : ''}"
                  value="${isCustomSize ? currentFontSize.replace('pt','') : ''}"
                  oninput="if(this.value) updateDraftTypography('fontSize', this.value + 'pt')"
                  style="width:56px; border:none; outline:none; font-size:9pt; background:transparent; color:var(--navy); font-weight:600"
                >
                <span style="font-size:8.5pt; color:var(--gray-mid)">pt</span>
              </div>
            </div>
            <div style="margin-top:4px; padding:10px 14px; background:#fff; border:1px dashed var(--gray-mid); border-radius:8px; color:var(--gray-dark)">
              <span style="font-size:7.5pt; font-weight:700; color:var(--gray-mid); text-transform:uppercase; letter-spacing:0.05em">${isEn ? 'Preview' : 'Xem trước'}: </span>
              <span class="typoSizePreviewClass" style="font-size:var(--font-size); font-family:var(--font-family)">Khảo sát đánh giá hiệu suất · The quick brown fox jumps over the lazy dog.</span>
            </div>
          </div>

        </div>
      </section>
  `;
};

window.updateDraftTypography = function(field, val) {
  pushHistory();
  let draft = {};
  try {
    draft = JSON.parse(localStorage.getItem('draft_hr_typography') || '{}');
  } catch(e) {
    console.error(e);
  }
  draft[field] = val;
  localStorage.setItem('draft_hr_typography', JSON.stringify(draft));

  // Live preview: apply immediately so admin can see the effect
  const root = document.documentElement;
  if (field === 'fontSize') {
    root.style.setProperty('--font-size', val);
    const rawSize = parseFloat(val);
    if (!isNaN(rawSize) && rawSize > 0) {
      root.style.setProperty('--font-scale', (rawSize / 11).toFixed(4));
    }
  }
  if (field === 'fontFamily') {
    if (typeof window.ensureAdminFontsLoaded === 'function') {
      window.ensureAdminFontsLoaded();
    }
    const found = (window.FONT_OPTIONS || []).find(f => f.value === val);
    const stack = found ? found.stack : val;
    root.style.setProperty('--font-family', stack);
    root.style.setProperty('--font', stack);
  }

  // Update main configuration save/discard buttons
  const hasChanges = hasUnsavedConfigureChanges();
  const saveBtn = $('cSaveBtn');
  const discardBtn = $('cDiscardBtn');
  if (saveBtn) {
    saveBtn.disabled = !hasChanges;
    saveBtn.style.background = hasChanges ? 'var(--blue)' : 'var(--gray-light)';
    saveBtn.style.borderColor = hasChanges ? 'var(--blue)' : 'var(--gray-light)';
    saveBtn.style.color = hasChanges ? '#fff' : 'var(--gray-mid)';
    saveBtn.style.cursor = hasChanges ? 'pointer' : 'not-allowed';
  }
  if (discardBtn) {
    discardBtn.disabled = !hasChanges;
    discardBtn.style.color = hasChanges ? 'var(--gray-dark)' : 'var(--gray-mid)';
    discardBtn.style.cursor = hasChanges ? 'pointer' : 'not-allowed';
  }

  // Update specific typography save/discard buttons
  const hasTypoChanges = window.hasUnsavedTypographyChanges();
  document.querySelectorAll('.typoSaveBtnClass').forEach(btn => {
    btn.disabled = !hasTypoChanges;
    btn.style.background = hasTypoChanges ? 'var(--blue)' : 'var(--gray-light)';
    btn.style.borderColor = hasTypoChanges ? 'var(--blue)' : 'var(--gray-light)';
    btn.style.color = hasTypoChanges ? '#fff' : 'var(--gray-mid)';
    btn.style.cursor = hasTypoChanges ? 'pointer' : 'not-allowed';
  });
  document.querySelectorAll('.typoDiscardBtnClass').forEach(btn => {
    btn.disabled = !hasTypoChanges;
    btn.style.color = hasTypoChanges ? 'var(--gray-dark)' : 'var(--gray-mid)';
    btn.style.cursor = hasTypoChanges ? 'pointer' : 'not-allowed';
  });

  // Refresh button active states smoothly in real-time
  if (field === 'fontSize') {
    const presetSizes = ['9pt', '10pt', '10.5pt', '11pt', '12pt', '13pt', '14pt'];
    document.querySelectorAll('[data-typo-size]').forEach(btn => {
      const isCurrent = btn.getAttribute('data-typo-size') === val;
      btn.style.borderColor = isCurrent ? 'var(--blue)' : 'var(--gray-light)';
      btn.style.background = isCurrent ? 'var(--blue)' : 'var(--blue-xlight)';
      btn.style.color = isCurrent ? '#fff' : 'var(--blue)';
    });
    const isCustom = !presetSizes.includes(val);
    document.querySelectorAll('.customSizeContainerClass').forEach(c => {
      c.style.borderColor = isCustom ? 'var(--blue)' : 'var(--gray-light)';
      c.style.background = isCustom ? 'var(--blue-xlight)' : '#fff';
    });
    document.querySelectorAll('.customSizeInputClass').forEach(input => {
      if (isCustom) {
        input.value = val.replace('pt', '');
        input.placeholder = val.replace('pt', '');
      } else {
        input.value = '';
        input.placeholder = '';
      }
    });
  }

  if (field === 'fontFamily') {
    document.querySelectorAll('[data-typo-family]').forEach(btn => {
      const isCurrent = btn.getAttribute('data-typo-family') === val;
      btn.style.borderColor = isCurrent ? 'var(--blue)' : 'var(--gray-light)';
      btn.style.background = isCurrent ? 'var(--blue-xlight)' : '#fff';
      btn.style.color = isCurrent ? 'var(--navy)' : 'var(--gray-dark)';
      btn.style.fontWeight = isCurrent ? '700' : '400';
    });
  }
};

function renderAdminConfigure(c) {
  const custom = adminGetCustomTranslations();
  if (!custom.vi) custom.vi = {};
  if (!custom.en) custom.en = {};

  let assumed = {};
  try {
    assumed = JSON.parse(localStorage.getItem('draft_hr_assumed_profile') || '{}');
  } catch(e) {}

  let typo = {};
  try {
    typo = JSON.parse(localStorage.getItem('draft_hr_typography') || '{}');
  } catch(e) {}

  // Eagerly load all font options when Admin opens the Configure tab
  if (typeof ensureAdminFontsLoaded === 'function') ensureAdminFontsLoaded();

  const currentFontSize = typo.fontSize || '11pt';
  const currentFontFamily = typo.fontFamily || 'Inter';

  const isEn = currentLang === 'en';

  const presetSizes = ['9pt', '10pt', '10.5pt', '11pt', '12pt', '13pt', '14pt'];
  const isCustomSize = !presetSizes.includes(currentFontSize);

  let html = `
    <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px">
      <h3 style="font-size:14pt; color:var(--navy); font-weight:700; margin:0">Cài đặt & Tùy chỉnh ngôn ngữ hệ thống</h3>
      <div style="display:flex; gap:8px; align-items:center">
        <button id="cDiscardBtn" class="btn" onclick="discardConfigureChanges()" ${hasUnsavedConfigureChanges() ? '' : 'disabled'} style="display: inline-block; font-size:9pt; padding:6px 12px; min-width:auto; height:32px; background:none; border:1px solid var(--gray-light); color:${hasUnsavedConfigureChanges() ? 'var(--gray-dark)' : 'var(--gray-mid)'}; cursor:${hasUnsavedConfigureChanges() ? 'pointer' : 'not-allowed'}">${isEn ? 'Discard' : 'Hủy thay đổi'}</button>
        <button id="cSaveBtn" class="btn primary" onclick="saveConfigureToProd()" ${hasUnsavedConfigureChanges() ? '' : 'disabled'} style="display: inline-block; font-size:9pt; padding:6px 16px; min-width:auto; height:32px; background:${hasUnsavedConfigureChanges() ? 'var(--blue)' : 'var(--gray-light)'}; border-color:${hasUnsavedConfigureChanges() ? 'var(--blue)' : 'var(--gray-light)'}; color:${hasUnsavedConfigureChanges() ? '#fff' : 'var(--gray-mid)'}; cursor:${hasUnsavedConfigureChanges() ? 'pointer' : 'not-allowed'}">${isEn ? 'Save Config' : 'Lưu tùy chỉnh'}</button>
        <button class="btn danger" onclick="resetAllConfig()" style="font-size:9pt; padding:6px 12px; min-width:auto; height:32px; font-weight:700">${isEn ? 'Reset Defaults' : 'Khôi phục mặc định'}</button>
      </div>
    </div>
    <div style="display:flex; flex-direction:column; gap:24px">
      <section class="card" style="padding:20px; border-radius:12px; background:#f8fafc; border:1px solid var(--gray-light)">
        <h4 style="margin-top:0; margin-bottom:12px; color:var(--navy); font-size:11pt; font-weight:700; border-bottom:1px solid var(--gray-light); padding-bottom:8px">
          ${isEn ? 'Configure Assumed Profile (Hồ sơ giả định)' : 'Cấu hình Hồ sơ giả định'}
        </h4>
        <p style="color:var(--gray-dark); font-size:9pt; margin-bottom:16px; line-height:1.4">
          ${isEn 
            ? 'These fields define the hypothetical profile that participants will roleplay and see in the survey. You can add, edit, and remove fields.' 
            : 'Các thông tin này định nghĩa hồ sơ nhân sự giả lập mà người tham gia sẽ đóng vai khi thực hiện khảo sát. Bạn có thể thêm, sửa và xóa trường.'}
        </p>
        <div style="display:flex; flex-direction:column; gap:16px">
          ${(() => {
            const profileList = window.normalizeAssumedProfile(assumed);
            const isSingleField = profileList.length <= 1;
            return profileList.map((field, idx) => `
              <div class="profile-field-row" style="background:#fff; border:1px solid var(--gray-light); border-radius:8px; padding:14px; display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; position:relative; box-shadow: 0 1px 3px rgba(0,0,0,0.02)">
                <div style="grid-column: span 2; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:8px; margin-bottom:4px">
                  <div style="display:flex; align-items:center; gap:8px">
                    <span style="font-size:8.5pt; font-weight:700; color:var(--navy)">ID/Key:</span>
                    <input type="text" value="${field.id || ''}" oninput="this.value = this.value.replace(/\\s+/g, '_'); window.updateDraftAssumedProfile(${idx}, 'id', this.value)" style="font-family:monospace; font-size:8.5pt; padding:4px 8px; border:1px solid var(--gray-mid); border-radius:6px; width:180px">
                  </div>
                  <div style="display:flex; align-items:center; gap:8px">
                    <button class="btn btn-sm" onclick="window.translateDraftAssumedProfileRow(${idx}, this)" style="font-size:8pt; padding:4px 8px; min-width:auto; height:26px; border:1px solid var(--blue-light); color:var(--blue); background:var(--blue-xlight); border-radius:4px; cursor:pointer">
                      ${isEn ? 'Translate to EN' : 'Dịch sang EN'}
                    </button>
                    <button class="btn btn-sm danger-light" onclick="window.deleteDraftAssumedProfileField(${idx})" ${isSingleField ? 'disabled' : ''} style="font-size:8pt; padding:4px 8px; min-width:auto; height:26px; border:1px solid var(--red-light); color:var(--red); background:rgba(239,68,68,0.05); border-radius:4px; opacity:${isSingleField ? '0.4' : '1'}; cursor:${isSingleField ? 'not-allowed' : 'pointer'}">
                      ${isEn ? 'Delete' : 'Xóa'}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label style="display:block; font-size:8pt; font-weight:600; color:var(--gray-dark); margin-bottom:4px">${isEn ? 'Label (VI)' : 'Nhãn (VI)'}</label>
                  <input type="text" value="${field.label || ''}" oninput="window.updateDraftAssumedProfile(${idx}, 'label', this.value)" style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:9pt; border:1px solid var(--gray-mid); border-radius:6px">
                </div>
                <div>
                  <label style="display:block; font-size:8pt; font-weight:600; color:var(--gray-dark); margin-bottom:4px">${isEn ? 'Label (EN)' : 'Nhãn (EN)'}</label>
                  <input type="text" value="${field.labelEN || ''}" oninput="window.updateDraftAssumedProfile(${idx}, 'labelEN', this.value)" style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:9pt; border:1px solid var(--gray-mid); border-radius:6px">
                </div>
                <div>
                  <label style="display:block; font-size:8pt; font-weight:600; color:var(--gray-dark); margin-bottom:4px">${isEn ? 'Value (VI)' : 'Giá trị (VI)'}</label>
                  <input type="text" value="${field.value || ''}" oninput="window.updateDraftAssumedProfile(${idx}, 'value', this.value)" style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:9pt; border:1px solid var(--gray-mid); border-radius:6px">
                </div>
                <div>
                  <label style="display:block; font-size:8pt; font-weight:600; color:var(--gray-dark); margin-bottom:4px">${isEn ? 'Value (EN)' : 'Giá trị (EN)'}</label>
                  <input type="text" value="${field.valueEN || ''}" oninput="window.updateDraftAssumedProfile(${idx}, 'valueEN', this.value)" style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:9pt; border:1px solid var(--gray-mid); border-radius:6px">
                </div>
              </div>
            `).join('');
          })()}
        </div>
        <div style="margin-top:16px; display:flex; justify-content:flex-start">
          <button class="btn primary" onclick="window.addDraftAssumedProfileField()" style="font-size:9pt; padding:6px 16px; min-width:auto; height:32px; font-weight:600">
            + ${isEn ? 'Add Field' : 'Thêm trường mới'}
          </button>
        </div>
      </section>

      ${window.getTypographySettingsCardHtml(typo, isEn)}
  `;

  let fieldIdx = 0;
  window.CONFIG_CATEGORIES.forEach(cat => {
    html += `
      <div class="gf-card" style="padding:20px; border-top: 4px solid var(--navy)">
        <h3 style="margin-bottom:16px; font-size:12pt; border-left:4px solid var(--blue); padding-left:10px">${cat.name}</h3>
        <div style="display:flex; flex-direction:column; gap:20px">
    `;

    cat.keys.forEach(key => {
      const defVI = LANG.vi[key] || '';
      const defEN = (LANG.en && LANG.en[key]) || '';

      const valVI = custom.vi[key] || '';
      const valEN = custom.en[key] || '';

      const idx = fieldIdx++;
      const isMultiVI = defVI.length > 80;
      const editorIdVI = `config_vi_${idx}`;
      const isMultiEN = defEN.length > 80 || defVI.length > 80;
      const editorIdEN = `config_en_${idx}`;

      html += `
        <div style="border-bottom:1px solid var(--gray-xlight); padding-bottom:16px">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
            <span style="font-family:monospace; font-weight:700; font-size:9.5pt; color:var(--navy)">${key}</span>
            <button class="btn" onclick="resetCustomField('${key}', ${idx})" style="font-size:8pt; padding:2px 8px; background:none; border:1px solid var(--gray-light); color:var(--gray-dark); cursor:pointer; min-width:auto">Xóa chỉnh sửa</button>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">
                <label style="display:block; font-size:8.5pt; font-weight:600; color:var(--gray-dark); margin-bottom:0">Tiếng Việt</label>
                ${getFormatToolbarHtml(editorIdVI)}
              </div>
              <div 
                id="${editorIdVI}" 
                class="wysiwyg-editor" 
                contenteditable="true" 
                data-key="${key}"
                data-lang="vi"
                oninput="saveCustomTranslation('${key}', 'vi', getEditorValue('${editorIdVI}'))" 
                placeholder="${defVI.replace(/<[^>]+>/g, '').replace(/"/g, '&quot;')}" 
                ${isMultiVI ? '' : 'onkeydown="handleSingleLineKeydown(event)"'}
                style="width:100%; min-height:${isMultiVI ? '70px' : '38px'}"
              >${valVI}</div>
              <div id="preview_container_${editorIdVI}" class="live-preview-box" style="margin-top:6px; margin-bottom:12px; padding:10px 14px; background:#fff; border:1px dashed var(--gray-mid); border-radius:8px; display:none; font-family:var(--font);">
                <span style="font-size:7.5pt; font-weight:700; color:var(--gray-mid); margin-bottom:6px; display:block; text-transform:uppercase; letter-spacing:0.05em;">Xem trước / Live Preview</span>
                <div id="preview_content_${editorIdVI}" style="font-size:9.5pt; color:var(--gray-dark); line-height:1.5;"></div>
              </div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">
                <label style="display:block; font-size:8.5pt; font-weight:600; color:var(--gray-dark); margin-bottom:0">English</label>
                ${getFormatToolbarHtml(editorIdEN)}
              </div>
              <div style="display:flex; gap:8px; align-items:stretch; width:100%">
                <div 
                  id="${editorIdEN}" 
                  data-key="${key}"
                  data-lang="en" 
                  class="wysiwyg-editor" 
                  contenteditable="true" 
                  oninput="saveCustomTranslation('${key}', 'en', getEditorValue('${editorIdEN}'))" 
                  placeholder="${defEN.replace(/<[^>]+>/g, '').replace(/"/g, '&quot;')}" 
                  ${isMultiEN ? '' : 'onkeydown="handleSingleLineKeydown(event)"'}
                  style="flex:1; min-height:${isMultiEN ? '70px' : '38px'}; border-color:${valEN ? 'var(--blue-light)' : 'var(--gray-light)'}"
                >${valEN}</div>
                <button onclick="translateCustomField('${key}', ${idx})" id="config_btn_${idx}" style="white-space:nowrap; padding:6px 12px; font-size:8.5pt; font-weight:700; background:var(--blue-xlight); color:var(--blue); border:1px solid var(--blue-light); border-radius:6px; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center">${t('admin_translate_btn')}</button>
              </div>
              <div id="preview_container_${editorIdEN}" class="live-preview-box" style="margin-top:6px; margin-bottom:12px; padding:10px 14px; background:#fff; border:1px dashed var(--gray-mid); border-radius:8px; display:none; font-family:var(--font);">
                <span style="font-size:7.5pt; font-weight:700; color:var(--gray-mid); margin-bottom:6px; display:block; text-transform:uppercase; letter-spacing:0.05em;">Xem trước / Live Preview</span>
                <div id="preview_content_${editorIdEN}" style="font-size:9.5pt; color:var(--gray-dark); line-height:1.5;"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  html += `</div>`;
  c.innerHTML = html;

  // Initialize previews
  let initIdx = 0;
  window.CONFIG_CATEGORIES.forEach(cat => {
    cat.keys.forEach(key => {
      window.updateFieldPreview(`config_vi_${initIdx}`);
      window.updateFieldPreview(`config_en_${initIdx}`);
      initIdx++;
    });
  });
}

window.saveCustomTranslation = function (key, lang, value) {
  try {
    pushHistory();
    initializeDrafts();
    const custom = JSON.parse(localStorage.getItem('draft_hr_custom_translations')) || { vi: {}, en: {} };
    if (!custom[lang]) custom[lang] = {};
    if (value === null || value.trim() === '' || value.trim() === '<br>') {
      delete custom[lang][key];
    } else {
      custom[lang][key] = value;
    }
    localStorage.setItem('draft_hr_custom_translations', JSON.stringify(custom));
    updateAdminSaveButtonsState();
  } catch (e) {
    console.error(e);
  }
};

window.translateCustomField = async function (key, idx) {
  const viInput = document.getElementById(`config_vi_${idx}`);
  const enInput = document.getElementById(`config_en_${idx}`);
  const btn = document.getElementById(`config_btn_${idx}`);
  if (!viInput || !enInput || !btn) return;

  const text = window.getEditorValue(`config_vi_${idx}`) || viInput.getAttribute('placeholder') || '';
  if (!text) return;

  btn.textContent = '...';
  btn.disabled = true;

  try {
    const translated = await window.translateText(text, 'en');
    if (translated) {
      const decoded = translated.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      enInput.innerHTML = decoded;
      saveCustomTranslation(key, 'en', decoded);
      enInput.style.borderColor = 'var(--blue-light)';
      window.updateFieldPreview(`config_en_${idx}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    btn.textContent = 'Dịch';
    btn.disabled = false;
  }
};

window.resetCustomField = function (key, idx) {
  pushHistory();
  const viInput = document.getElementById(`config_vi_${idx}`);
  const enInput = document.getElementById(`config_en_${idx}`);
  if (viInput) {
    viInput.innerHTML = '';
    viInput.style.borderColor = '';
    window.updateFieldPreview(`config_vi_${idx}`);
  }
  if (enInput) {
    enInput.innerHTML = '';
    enInput.style.borderColor = '';
    window.updateFieldPreview(`config_en_${idx}`);
  }
  saveCustomTranslation(key, 'vi', '');
  saveCustomTranslation(key, 'en', '');
};

window.resetAllConfig = async function () {
  const currentLang = localStorage.getItem('lang') || 'vi';
  const msg = currentLang === 'en'
    ? 'Are you sure you want to clear all custom configurations and restore system defaults immediately? This will overwrite the live database.'
    : 'Anh/chị có chắc chắn muốn xóa toàn bộ chữ tùy chỉnh và quay về mặc định ban đầu của hệ thống ngay lập tức? Thao tác này sẽ ghi đè trực tiếp lên cơ sở dữ liệu.';

  if (await showConfirm(msg)) {
    try {
      if (typeof window.syncSettingsFromDb === 'function') {
        await window.syncSettingsFromDb();
      }

      const defTrans = localStorage.getItem('default_hr_custom_translations') || '{"vi":{},"en":{}}';
      const defAssumedProfile = JSON.stringify(window.defaultAssumedProfile || []);

      // Overwrite both drafts and production storage immediately
      localStorage.setItem('draft_hr_custom_translations', defTrans);
      localStorage.setItem('draft_hr_typography', '{}');
      localStorage.setItem('draft_hr_assumed_profile', defAssumedProfile);

      localStorage.setItem('hr_custom_translations', defTrans);
      localStorage.setItem('hr_typography', '{}');
      localStorage.setItem('hr_assumed_profile', defAssumedProfile);

      // Save directly to the database
      if (typeof window.saveSettingToDb === 'function') {
        await window.saveSettingToDb('hr_custom_translations', JSON.parse(defTrans));
        await window.saveSettingToDb('hr_typography', {});
        await window.saveSettingToDb('hr_assumed_profile', window.defaultAssumedProfile || []);
      }

      // Re-apply typography and update UI
      if (typeof window.applyTypographySettings === 'function') {
        window.applyTypographySettings();
      }
      if (typeof window.updateAdminSaveButtonsState === 'function') {
        window.updateAdminSaveButtonsState();
      }

      renderAdmin();
      await showAlert(currentLang === 'en' ? 'Configuration restored to defaults successfully!' : 'Khôi phục cấu hình về mặc định thành công!');
    } catch (err) {
      console.error('Failed to restore config to default:', err);
      await showAlert(currentLang === 'en' ? 'Failed to restore defaults: ' + err.message : 'Khôi phục mặc định thất bại: ' + err.message);
    }
  }
};

window.resetAllQuestions = async function () {
  const currentLang = localStorage.getItem('lang') || 'vi';
  const msg = currentLang === 'en'
    ? 'Are you sure you want to restore all questions and section structures to the system defaults immediately? This will overwrite the live database.'
    : 'Anh/chị có chắc chắn muốn khôi phục toàn bộ câu hỏi và cấu trúc phần về mặc định ban đầu của hệ thống ngay lập tức? Thao tác này sẽ ghi đè trực tiếp lên cơ sở dữ liệu.';

  if (await showConfirm(msg)) {
    try {
      if (typeof window.syncSettingsFromDb === 'function') {
        await window.syncSettingsFromDb();
      }

      const defQsStr = localStorage.getItem('default_hr_questions');
      const defMetaStr = localStorage.getItem('default_hr_section_metadata') || '{}';
      const defDescStr = localStorage.getItem('default_hr_section_descriptions') || '{}';

      let defQs = null;
      if (defQsStr) {
        try {
          defQs = JSON.parse(defQsStr);
        } catch (e) {
          console.error(e);
        }
      }
      if (!defQs && typeof window.defaultQuestions === 'function') {
        defQs = window.defaultQuestions();
      }

      if (defQs) {
        const defQsJsonStr = JSON.stringify(defQs);

        // Overwrite both drafts and production storage immediately
        localStorage.setItem('draft_hr_questions', defQsJsonStr);
        localStorage.setItem('draft_hr_section_metadata', defMetaStr);
        localStorage.setItem('draft_hr_section_descriptions', defDescStr);

        localStorage.setItem('hr_questions', defQsJsonStr);
        localStorage.setItem('hr_section_metadata', defMetaStr);
        localStorage.setItem('hr_section_descriptions', defDescStr);

        // Save directly to the database
        if (typeof window.saveSettingToDb === 'function') {
          await window.saveSettingToDb('hr_questions', defQs);
          await window.saveSettingToDb('hr_section_metadata', JSON.parse(defMetaStr));
          await window.saveSettingToDb('hr_section_descriptions', JSON.parse(defDescStr));
        }

        if (typeof window.updateAdminSaveButtonsState === 'function') {
          window.updateAdminSaveButtonsState();
        }

        renderAdmin();
        await showAlert(currentLang === 'en' ? 'Questions and sections restored to defaults successfully!' : 'Khôi phục câu hỏi và cấu trúc phần về mặc định thành công!');
      } else {
        throw new Error('Default questions could not be loaded.');
      }
    } catch (err) {
      console.error('Failed to restore questions to default:', err);
      await showAlert(currentLang === 'en' ? 'Failed to restore defaults: ' + err.message : 'Khôi phục mặc định thất bại: ' + err.message);
    }
  }
};

function getSectionDescriptions() {
  try {
    return JSON.parse(localStorage.getItem('draft_hr_section_descriptions')) || {};
  } catch (e) {
    return {};
  }
}

window.saveSectionDescription = function (secName, desc) {
  try {
    const descs = getSectionDescriptions();
    descs[secName] = desc;
    localStorage.setItem('draft_hr_section_descriptions', JSON.stringify(descs));
    updateAdminSaveButtonsState();
  } catch (e) { }
};

window.saveSectionMetadataField = function (secName, field, val) {
  try {
    const meta = JSON.parse(localStorage.getItem('draft_hr_section_metadata')) || {};
    if (!meta[secName]) meta[secName] = {};
    meta[secName][field] = val;
    localStorage.setItem('draft_hr_section_metadata', JSON.stringify(meta));
    updateAdminSaveButtonsState();

    if (field === 'descVI') {
      window.saveSectionDescription(secName, val);
    }
  } catch (e) {
    console.error('Error saving section metadata field', e);
  }
};

window.renameSection = function (oldName, newName) {
  if (oldName === 'Thông tin chung') {
    showToast('Không thể đổi tên phần "Thông tin chung" chứa các câu hỏi sàng lọc.');
    return;
  }
  if (!newName || !newName.trim()) return;
  newName = newName.trim();
  if (oldName === newName) return;

  pushHistory();

  // 1. Update questions
  const qs = adminGetQuestions();
  qs.forEach(q => {
    if (q.section === oldName) {
      q.section = newName;
    }
  });
  adminSaveQuestions(qs);

  // 2. Update metadata key in draft_hr_section_metadata
  try {
    const meta = JSON.parse(localStorage.getItem('draft_hr_section_metadata')) || {};
    if (meta[oldName]) {
      meta[newName] = meta[oldName];
      delete meta[oldName];
      localStorage.setItem('draft_hr_section_metadata', JSON.stringify(meta));
    }
  } catch (e) { }

  // 3. Update description key in draft_hr_section_descriptions
  let descs = {};
  try {
    descs = JSON.parse(localStorage.getItem('draft_hr_section_descriptions')) || {};
  } catch (e) { }
  if (descs[oldName]) {
    descs[newName] = descs[oldName];
    delete descs[oldName];
    localStorage.setItem('draft_hr_section_descriptions', JSON.stringify(descs));
  }

  updateAdminSaveButtonsState();
  activeQIndex = -1;
  renderAdmin();
};

window.moveSection = function (secName, direction) {
  pushHistory();
  const { preSections, postSections, ctrlSections } = adminGetSurveySectionDivision();
  const isPre = preSections.includes(secName);
  const isCtrl = ctrlSections.includes(secName);
  const arr = isPre ? preSections : (isCtrl ? ctrlSections : postSections);
  const idx = arr.indexOf(secName);
  if (idx === -1) return;

  const minIdx = 0;
  const maxIdx = arr.length - 1;
  const nextIdx = idx + direction;

  if (nextIdx < minIdx || nextIdx > maxIdx) return;

  // Swap
  const temp = arr[idx];
  arr[idx] = arr[nextIdx];
  arr[nextIdx] = temp;

  // Save updated orders to metadata
  let metadata = {};
  try {
    metadata = JSON.parse(localStorage.getItem('draft_hr_section_metadata')) || {};
  } catch (e) { }

  arr.forEach((sec, index) => {
    if (!metadata[sec]) metadata[sec] = {};
    metadata[sec].order = index;
  });

  localStorage.setItem('draft_hr_section_metadata', JSON.stringify(metadata));

  // Re-sort questions as well
  const qs = adminGetQuestions();
  adminSaveQuestions(qs);

  updateAdminSaveButtonsState();
  renderAdmin();
};

window.handleDragStart = function (event) {
  // Prevent drag from child inputs/textareas/selects/buttons triggering drag start
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT' || event.target.tagName === 'BUTTON') {
    event.preventDefault();
    return;
  }

  document.body.classList.add('gf-dragging-active');

  const isQuestion = event.currentTarget.classList.contains('gf-question-card');
  if (isQuestion) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'question', index: event.currentTarget.getAttribute('data-q-index') }));
  } else {
    event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'section', name: event.currentTarget.getAttribute('data-sec-name'), idx: event.currentTarget.getAttribute('data-sec-idx') }));
  }
  event.dataTransfer.effectAllowed = 'move';
};

window.handleDragEnd = function (event) {
  document.body.classList.remove('gf-dragging-active');
  document.querySelectorAll('.gf-drag-over').forEach(el => {
    el.classList.remove('gf-drag-over');
  });
};

window.handleDragOver = function (event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  event.currentTarget.classList.add('gf-drag-over');

  // Auto-scroll viewport when dragging near edges
  const threshold = 120;
  const y = event.clientY;
  const h = window.innerHeight;
  if (y < threshold) {
    window.scrollBy(0, -15);
  } else if (h - y < threshold) {
    window.scrollBy(0, 15);
  }
};

window.handleDragLeave = function (event) {
  event.currentTarget.classList.remove('gf-drag-over');
};

window.handleDrop = function (event) {
  event.preventDefault();
  document.body.classList.remove('gf-dragging-active');
  event.currentTarget.classList.remove('gf-drag-over');

  let data;
  try {
    data = JSON.parse(event.dataTransfer.getData('text/plain'));
  } catch (e) {
    return;
  }

  if (!data || !data.type) return;

  pushHistory();

  if (data.type === 'section') {
    const sourceSecName = data.name;
    let target = event.currentTarget;
    if (!target.classList.contains('gf-section-card')) return;
    const targetSecName = target.getAttribute('data-sec-name');

    if (sourceSecName === targetSecName) return;

    const sourceIsSystem = ['Câu hỏi ban đầu', 'Face Concern', 'Thông tin chung'].includes(sourceSecName);
    const targetIsSystem = ['Câu hỏi ban đầu', 'Face Concern', 'Thông tin chung'].includes(targetSecName);

    const { preSections, postSections, ctrlSections } = adminGetSurveySectionDivision();
    const sourceIsPre = preSections.includes(sourceSecName);
    const targetIsPre = preSections.includes(targetSecName);
    const sourceIsCtrl = ctrlSections.includes(sourceSecName);
    const targetIsCtrl = ctrlSections.includes(targetSecName);

    const sourcePhase = sourceIsPre ? 'pre' : (sourceIsCtrl ? 'ctrl' : 'post');
    const targetPhase = targetIsPre ? 'pre' : (targetIsCtrl ? 'ctrl' : 'post');

    if (sourceIsSystem || targetIsSystem) {
      if (sourcePhase !== targetPhase) {
        showToast("Không thể chuyển các nhóm câu hỏi hệ thống qua lại giữa Trước/Sau Demo/Biến kiểm soát.");
        return;
      }
    }

    let metadata = {};
    try {
      metadata = JSON.parse(localStorage.getItem('draft_hr_section_metadata')) || {};
    } catch (e) { }

    if (sourcePhase !== targetPhase) {
      if (!metadata[sourceSecName]) metadata[sourceSecName] = {};
      metadata[sourceSecName].phase = targetPhase;
    }

    const updatedPre = [...preSections];
    const updatedPost = [...postSections];
    const updatedCtrl = [...ctrlSections];

    if (sourcePhase !== targetPhase) {
      const sArr = sourceIsPre ? updatedPre : (sourceIsCtrl ? updatedCtrl : updatedPost);
      const sIdx = sArr.indexOf(sourceSecName);
      if (sIdx !== -1) sArr.splice(sIdx, 1);

      const tArr = targetIsPre ? updatedPre : (targetIsCtrl ? updatedCtrl : updatedPost);
      const tIdx = tArr.indexOf(targetSecName);
      tArr.splice(tIdx, 0, sourceSecName);
    } else {
      const arr = sourceIsPre ? updatedPre : (sourceIsCtrl ? updatedCtrl : updatedPost);
      const sIdx = arr.indexOf(sourceSecName);
      const tIdx = arr.indexOf(targetSecName);
      if (sIdx !== -1 && tIdx !== -1) {
        const [removed] = arr.splice(sIdx, 1);
        arr.splice(tIdx, 0, removed);
      }
    }

    updatedPre.forEach((sec, index) => {
      if (!metadata[sec]) metadata[sec] = {};
      metadata[sec].order = index;
    });
    updatedPost.forEach((sec, index) => {
      if (!metadata[sec]) metadata[sec] = {};
      metadata[sec].order = index;
    });
    updatedCtrl.forEach((sec, index) => {
      if (!metadata[sec]) metadata[sec] = {};
      metadata[sec].order = index;
    });

    localStorage.setItem('draft_hr_section_metadata', JSON.stringify(metadata));

    const qs = adminGetQuestions();
    adminSaveQuestions(qs);
    renderAdmin();

  } else if (data.type === 'question') {
    const sourceIndex = parseInt(data.index, 10);
    if (isNaN(sourceIndex)) return;

    let target = event.currentTarget;
    const qs = adminGetQuestions();
    const draggedQ = qs[sourceIndex];
    if (!draggedQ) return;

    if (target.classList.contains('gf-question-card')) {
      const targetIndex = parseInt(target.getAttribute('data-q-index'), 10);
      if (isNaN(targetIndex) || sourceIndex === targetIndex) return;

      const targetQ = qs[targetIndex];
      if (!targetQ) return;

      draggedQ.section = targetQ.section;

      const [removed] = qs.splice(sourceIndex, 1);
      qs.splice(targetIndex, 0, removed);

      adminSaveQuestions(qs);
      activeQIndex = targetIndex;
      renderAdmin();

    } else if (target.classList.contains('gf-section-card')) {
      const targetSecName = target.getAttribute('data-sec-name');
      if (!targetSecName) return;

      draggedQ.section = targetSecName;

      const [removed] = qs.splice(sourceIndex, 1);
      const targetFirstIdx = qs.findIndex(q => q.section === targetSecName);
      if (targetFirstIdx !== -1) {
        qs.splice(targetFirstIdx, 0, removed);
        activeQIndex = targetFirstIdx;
      } else {
        qs.push(removed);
        activeQIndex = qs.length - 1;
      }

      adminSaveQuestions(qs);
      renderAdmin();
    }
  }
};

// Disable dragging when interacting with editable/input areas to allow easy text selection
document.addEventListener('mousedown', function(e) {
  const interactive = e.target.closest('input, textarea, select, button, [contenteditable="true"], .format-toolbar, .color-dropdown');
  if (interactive) {
    const card = e.target.closest('.gf-question-card, .gf-section-card');
    if (card) {
      card.setAttribute('draggable', 'false');
    }
  }
}, true); // Use capture phase to catch it early

document.addEventListener('mouseup', function(e) {
  const card = e.target.closest('.gf-question-card, .gf-section-card');
  if (card) {
    // If no interactive element inside this card currently has focus, restore draggable
    const focused = document.activeElement;
    if (!focused || !card.contains(focused) || !focused.matches('input, textarea, [contenteditable="true"]')) {
      card.setAttribute('draggable', 'true');
    }
  }
}, true);

document.addEventListener('focusin', function(e) {
  const interactive = e.target.closest('input, textarea, select, [contenteditable="true"]');
  if (interactive) {
    const card = e.target.closest('.gf-question-card, .gf-section-card');
    if (card) {
      card.setAttribute('draggable', 'false');
    }
  }
}, true);

document.addEventListener('focusout', function(e) {
  const card = e.target.closest('.gf-question-card, .gf-section-card');
  if (card) {
    // Delay slightly to check if focus moved to another element in the same card
    setTimeout(() => {
      const focused = document.activeElement;
      if (!focused || !card.contains(focused) || !focused.matches('input, textarea, [contenteditable="true"]')) {
        card.setAttribute('draggable', 'true');
      }
    }, 50);
  }
}, true);

window.deleteSection = async function (secName) {
  if (secName === 'Thông tin chung') {
    showToast('Không thể xóa phần "Thông tin chung" chứa các câu hỏi sàng lọc.');
    return;
  }
  const { preSections, postSections, ctrlSections } = adminGetSurveySectionDivision();
  const isPre = preSections.includes(secName);
  const isCtrl = ctrlSections.includes(secName);
  const arr = isPre ? preSections : (isCtrl ? ctrlSections : postSections);

  if (arr.length <= 1) {
    showToast(`Phải còn ít nhất 1 phần trong nhóm ${isPre ? 'Trước Demo' : (isCtrl ? 'Biến kiểm soát' : 'Sau Demo')}`);
    return;
  }

  if (await showConfirm(`Anh/chị có chắc muốn xóa phần "${secName}" và tất cả câu hỏi trong phần này?`)) {
    pushHistory();
    const qs = adminGetQuestions();
    const updated = qs.filter(q => q.section !== secName);
    adminSaveQuestions(updated);

    // Delete from metadata
    try {
      const meta = JSON.parse(localStorage.getItem('draft_hr_section_metadata')) || {};
      delete meta[secName];
      localStorage.setItem('draft_hr_section_metadata', JSON.stringify(meta));
    } catch (e) { }

    const descs = getSectionDescriptions();
    delete descs[secName];
    localStorage.setItem('draft_hr_section_descriptions', JSON.stringify(descs));

    updateAdminSaveButtonsState();
    activeQIndex = -1;
    renderAdmin();
  }
};

window.mergeSection = function (secName) {
  pushHistory();
  const qs = adminGetQuestions();
  const { preSections, postSections, ctrlSections } = adminGetSurveySectionDivision();
  const uniqueSections = [...preSections, ...postSections, ...ctrlSections];
  const idx = uniqueSections.indexOf(secName);
  if (idx <= 0) return;
  const prevSec = uniqueSections[idx - 1];

  qs.forEach(q => {
    if (q.section === secName) {
      q.section = prevSec;
    }
  });
  adminSaveQuestions(qs);
  updateAdminSaveButtonsState();
  renderAdmin();
};

window.translateSecTitle = async function (secIdx, secName) {
  const text = window.getEditorValue(`sec_title_vi_${secIdx}`);
  if (!text) return;

  const btn = document.getElementById(`sec_title_trans_btn_${secIdx}`);
  const inputEN = document.getElementById(`sec_title_en_${secIdx}`);
  if (!btn || !inputEN) return;

  btn.textContent = '...';
  btn.disabled = true;

  try {
    const translated = await window.translateText(text, 'en');
    if (translated) {
      const decoded = translated.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      inputEN.innerHTML = decoded;
      window.saveSectionMetadataField(secName, 'titleEN', decoded);
      inputEN.style.borderColor = 'var(--blue-light)';
      window.updateFieldPreview(`sec_title_en_${secIdx}`);
    }
  } catch (e) {
    console.error('Translation error', e);
  } finally {
    btn.textContent = 'Dịch';
    btn.disabled = false;
  }
};

window.translateSecDesc = async function (secIdx, secName) {
  const text = window.getEditorValue(`sec_desc_vi_${secIdx}`);
  if (!text) return;

  const btn = document.getElementById(`sec_desc_trans_btn_${secIdx}`);
  const textareaEN = document.getElementById(`sec_desc_en_${secIdx}`);
  if (!btn || !textareaEN) return;

  btn.textContent = '...';
  btn.disabled = true;

  try {
    const translated = await window.translateText(text, 'en');
    if (translated) {
      const decoded = translated.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      textareaEN.innerHTML = decoded;
      window.saveSectionMetadataField(secName, 'descEN', decoded);
      textareaEN.style.borderColor = 'var(--blue-light)';
      window.updateFieldPreview(`sec_desc_en_${secIdx}`);
    }
  } catch (e) {
    console.error('Translation error', e);
  } finally {
    btn.textContent = 'Dịch';
    btn.disabled = false;
  }
};

function renderAdminQuestions(c) {
  let qs = adminGetQuestions();
  if (!qs) { qs = defaultQuestions(); adminSaveQuestions(qs); }
  const { preSections, postSections, ctrlSections } = adminGetSurveySectionDivision();
  const uniqueSections = [...preSections, ...postSections, ...ctrlSections];
  console.log('[renderAdminQuestions] qs:', qs.map(q => ({id: q.id, text: q.text, textEN: q.textEN})));
  const totalSections = uniqueSections.length;
  const sections = uniqueSections; // for the datalist lookup

  let typo = {};
  try {
    typo = JSON.parse(localStorage.getItem('draft_hr_typography') || '{}');
  } catch(e) {}

  if (typeof ensureAdminFontsLoaded === 'function') ensureAdminFontsLoaded();

  let html = `
    <div class="gf-actions-bar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px">
      <h3 style="margin:0">${t('admin_q_mgmt')} (${qs.length} ${t('admin_q_count')})</h3>
      <div style="display:flex; gap:8px; align-items:center">
        <button id="qDiscardBtn" class="btn" onclick="discardQuestionsChanges()" ${hasUnsavedQuestionsChanges() ? '' : 'disabled'} style="display: inline-block; font-size:9pt; padding:6px 12px; min-width:auto; height:32px; background:none; border:1px solid var(--gray-light); color:${hasUnsavedQuestionsChanges() ? 'var(--gray-dark)' : 'var(--gray-mid)'}; cursor:${hasUnsavedQuestionsChanges() ? 'pointer' : 'not-allowed'}">${currentLang === 'en' ? 'Discard' : 'Hủy thay đổi'}</button>
        <button id="qSaveBtn" class="btn primary" onclick="saveQuestionsToProd()" ${hasUnsavedQuestionsChanges() ? '' : 'disabled'} style="display: inline-block; font-size:9pt; padding:6px 16px; min-width:auto; height:32px; background:${hasUnsavedQuestionsChanges() ? 'var(--blue)' : 'var(--gray-light)'}; border-color:${hasUnsavedQuestionsChanges() ? 'var(--blue)' : 'var(--gray-light)'}; color:${hasUnsavedQuestionsChanges() ? '#fff' : 'var(--gray-mid)'}; cursor:${hasUnsavedQuestionsChanges() ? 'pointer' : 'not-allowed'}">${currentLang === 'en' ? 'Save Changes' : 'Lưu câu hỏi'}</button>
        <button class="btn danger" onclick="resetAllQuestions()" style="font-size:9pt; padding:6px 12px; min-width:auto; height:32px; font-weight:700">${currentLang === 'en' ? 'Reset Defaults' : 'Khôi phục mặc định'}</button>
      </div>
    </div>

    ${window.getTypographySettingsCardHtml(typo, currentLang === 'en')}

    <div class="gf-questions-list">
  `;

  uniqueSections.forEach((secName, secIdx) => {
    const titleObj = adminGetSectionTitle(secName);
    const descObj = adminGetSectionDescription(secName);
    const isFirstSec = secIdx === 0;

    const isPre = preSections.includes(secName);
    const isCtrl = ctrlSections.includes(secName);
    
    let phaseLabel = 'Sau Demo (Post-Demo)';
    let phaseColor = 'var(--green)';
    let phaseBg = 'var(--green-light)';
    let borderLeftColor = 'var(--green)';
    
    if (isPre) {
      phaseLabel = 'Trước Demo (Pre-Demo)';
      phaseColor = 'var(--blue)';
      phaseBg = 'var(--blue-xlight)';
      borderLeftColor = 'var(--navy)';
    } else if (isCtrl) {
      phaseLabel = 'Biến kiểm soát (Control Variables)';
      phaseColor = '#d97706';
      phaseBg = '#fef3c7';
      borderLeftColor = '#fd7e14';
    }

    const arr = isPre ? preSections : (isCtrl ? ctrlSections : postSections);
    const idx = arr.indexOf(secName);
    const minIdx = 0;
    const maxIdx = arr.length - 1;
    const canMoveUp = idx > minIdx;
    const canMoveDown = idx < maxIdx;

    html += `
      <div class="gf-section-card" draggable="true" data-sec-name="${secName.replace(/"/g, '&quot;')}" data-sec-idx="${secIdx}" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)" ondragend="handleDragEnd(event)" style="border-left:4px solid ${borderLeftColor};margin-bottom:20px;padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="gf-section-badge" style="margin-bottom:0">${t('admin_sec_badge')} ${secIdx + 1} ${t('admin_sec_of')} ${totalSections}</div>
          <span style="font-size:9pt;font-weight:700;color:${phaseColor};background:${phaseBg};padding:3px 10px;border-radius:12px">${phaseLabel}</span>
        </div>
        
        <!-- Section Identification & Actions -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px">
          <div>
            <label style="display:block;font-weight:700;font-size:9pt;color:var(--gray-dark);margin-bottom:4px">Mã định danh nhóm / Section Key</label>
            <input type="text" class="gf-section-title-input" value="${secName.replace(/"/g, '&quot;')}" onfocus="pushHistory()" onchange="renameSection('${secName.replace(/'/g, "\\'")}', this.value)" placeholder="Mã nhóm..." style="margin-bottom:0">
          </div>
          <div style="display:flex;align-items:flex-end;justify-content:flex-end">
            <div class="gf-section-footer" style="margin-top:0;width:100%;justify-content:flex-end;display:flex;gap:8px">
              <button class="gf-section-action-btn" onclick="moveSection('${secName.replace(/'/g, "\\'")}', -1)" ${!canMoveUp ? 'disabled' : ''} title="${t('admin_move_up_sec_title')}">${t('admin_move_up_sec')}</button>
              <button class="gf-section-action-btn" onclick="moveSection('${secName.replace(/'/g, "\\'")}', 1)" ${!canMoveDown ? 'disabled' : ''} title="${t('admin_move_down_sec_title')}">${t('admin_move_down_sec')}</button>
              ${!isFirstSec ? `<button class="gf-section-action-btn" onclick="mergeSection('${secName.replace(/'/g, "\\'")}')" title="${t('admin_merge_prev')}">${t('admin_merge_prev')}</button>` : ''}
              <button class="gf-section-action-btn danger" onclick="deleteSection('${secName.replace(/'/g, "\\'")}')" title="${t('admin_del_sec')}">${t('admin_del_sec')}</button>
            </div>
          </div>
        </div>
        
        <!-- Section Position Selector -->
        <div style="margin-bottom:16px;max-width:50%">
          <label style="display:block;font-weight:700;font-size:9pt;color:var(--gray-dark);margin-bottom:4px">Vị trí tương quan với AI Demo (Survey Phase)</label>
<select onchange="saveSectionMetadataField('${secName.replace(/'/g, "\\'")}', 'phase', this.value); renderAdmin();" style="margin-bottom:0;font-size:10pt;font-weight:600">
              <option value="pre" ${isPre ? 'selected' : ''}>Trước Demo (Pre-Demo) - Xuất hiện trước trang bối cảnh</option>
              <option value="post" ${(!isPre && !isCtrl) ? 'selected' : ''}>Sau Demo (Post-Demo) - Xuất hiện sau trang AI báo cáo</option>
              <option value="ctrl" ${isCtrl ? 'selected' : ''}>Biến kiểm soát (Control Variables) - Xuất hiện ở trang biến kiểm soát</option>
            </select>
        </div>
        
        <!-- Section Titles (VI & EN) -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <label style="display:block;font-weight:700;font-size:9pt;color:var(--gray-dark);margin-bottom:0">${t('admin_sec_title_vi_label')}</label>
              ${getFormatToolbarHtml(`sec_title_vi_${secIdx}`)}
            </div>
            <div 
              id="sec_title_vi_${secIdx}" 
              data-sec-name="${secName.replace(/"/g, '&quot;')}"
              data-meta-field="titleVI" 
              class="wysiwyg-editor" 
              contenteditable="true" 
              onfocus="pushHistory()" 
              oninput="saveSectionMetadataField('${secName.replace(/'/g, "\\'")}', 'titleVI', getEditorValue('sec_title_vi_${secIdx}'))" 
              placeholder="${t('admin_sec_title_vi_ph').replace(/"/g, '&quot;')}" 
              onkeydown="handleSingleLineKeydown(event)"
              style="width:100%; min-height:38px"
            >${titleObj.vi}</div>
            <div id="preview_container_sec_title_vi_${secIdx}" class="live-preview-box" style="margin-top:6px; margin-bottom:12px; padding:10px 14px; background:#fff; border:1px dashed var(--gray-mid); border-radius:8px; display:none; font-family:var(--font);">
              <span style="font-size:7.5pt; font-weight:700; color:var(--gray-mid); margin-bottom:6px; display:block; text-transform:uppercase; letter-spacing:0.05em;">Xem trước / Live Preview</span>
              <div id="preview_content_sec_title_vi_${secIdx}" style="font-size:11.5pt; font-weight:600; color:var(--navy);"></div>
            </div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <label style="display:block;font-weight:700;font-size:9pt;color:var(--gray-dark);margin-bottom:0">${t('admin_sec_title_en_label')}</label>
              ${getFormatToolbarHtml(`sec_title_en_${secIdx}`)}
            </div>
            <div style="display:flex;gap:8px;align-items:stretch;width:100%">
              <div 
                id="sec_title_en_${secIdx}" 
                data-sec-name="${secName.replace(/"/g, '&quot;')}"
                data-meta-field="titleEN" 
                class="wysiwyg-editor" 
                contenteditable="true" 
                onfocus="pushHistory()" 
                oninput="saveSectionMetadataField('${secName.replace(/'/g, "\\'")}', 'titleEN', getEditorValue('sec_title_en_${secIdx}'))" 
                placeholder="${t('admin_sec_title_en_ph').replace(/"/g, '&quot;')}" 
                onkeydown="handleSingleLineKeydown(event)"
                style="flex:1; min-height:38px; border-color:${titleObj.en ? 'var(--blue-light)' : 'var(--gray-light)'}"
              >${titleObj.en || ''}</div>
              <button onclick="translateSecTitle(${secIdx}, '${secName.replace(/'/g, "\\'")}')" id="sec_title_trans_btn_${secIdx}" style="white-space:nowrap;padding:6px 12px;font-size:8.5pt;font-weight:700;background:var(--blue-xlight);color:var(--blue);border:1px solid var(--blue-light);border-radius:6px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center">${t('admin_translate_btn')}</button>
            </div>
            <div id="preview_container_sec_title_en_${secIdx}" class="live-preview-box" style="margin-top:6px; margin-bottom:12px; padding:10px 14px; background:#fff; border:1px dashed var(--gray-mid); border-radius:8px; display:none; font-family:var(--font);">
              <span style="font-size:7.5pt; font-weight:700; color:var(--gray-mid); margin-bottom:6px; display:block; text-transform:uppercase; letter-spacing:0.05em;">Xem trước / Live Preview</span>
              <div id="preview_content_sec_title_en_${secIdx}" style="font-size:11.5pt; font-weight:600; color:var(--navy);"></div>
            </div>
          </div>
        </div>

        <!-- Section Descriptions (VI & EN) -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:4px">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <label style="display:block;font-weight:700;font-size:9pt;color:var(--gray-dark);margin-bottom:0">${t('admin_sec_desc_vi_label')}</label>
              ${getFormatToolbarHtml(`sec_desc_vi_${secIdx}`)}
            </div>
            <div 
              id="sec_desc_vi_${secIdx}" 
              data-sec-name="${secName.replace(/"/g, '&quot;')}"
              data-meta-field="descVI" 
              class="wysiwyg-editor" 
              contenteditable="true" 
              onfocus="pushHistory()" 
              oninput="saveSectionMetadataField('${secName.replace(/'/g, "\\'")}', 'descVI', getEditorValue('sec_desc_vi_${secIdx}'))" 
              placeholder="${t('admin_sec_desc_vi_ph').replace(/"/g, '&quot;')}" 
              style="width:100%; min-height:70px"
            >${descObj.vi || ''}</div>
            <div id="preview_container_sec_desc_vi_${secIdx}" class="live-preview-box" style="margin-top:6px; margin-bottom:12px; padding:10px 14px; background:#fff; border:1px dashed var(--gray-mid); border-radius:8px; display:none; font-family:var(--font);">
              <span style="font-size:7.5pt; font-weight:700; color:var(--gray-mid); margin-bottom:6px; display:block; text-transform:uppercase; letter-spacing:0.05em;">Xem trước / Live Preview</span>
              <div id="preview_content_sec_desc_vi_${secIdx}" style="font-size:9.5pt; color:var(--gray-dark); line-height:1.5;"></div>
            </div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <label style="display:block;font-weight:700;font-size:9pt;color:var(--gray-dark);margin-bottom:0">${t('admin_sec_desc_en_label')}</label>
              ${getFormatToolbarHtml(`sec_desc_en_${secIdx}`)}
            </div>
            <div style="display:flex;gap:8px;align-items:stretch;width:100%">
              <div 
                id="sec_desc_en_${secIdx}" 
                data-sec-name="${secName.replace(/"/g, '&quot;')}"
                data-meta-field="descEN" 
                class="wysiwyg-editor" 
                contenteditable="true" 
                onfocus="pushHistory()" 
                oninput="saveSectionMetadataField('${secName.replace(/'/g, "\\'")}', 'descEN', getEditorValue('sec_desc_en_${secIdx}'))" 
                placeholder="${t('admin_sec_desc_en_ph').replace(/"/g, '&quot;')}" 
                style="flex:1; min-height:70px; border-color:${descObj.en ? 'var(--blue-light)' : 'var(--gray-light)'}"
              >${descObj.en || ''}</div>
              <button onclick="translateSecDesc(${secIdx}, '${secName.replace(/'/g, "\\'")}')" id="sec_desc_trans_btn_${secIdx}" style="white-space:nowrap;padding:6px 12px;font-size:8.5pt;font-weight:700;background:var(--blue-xlight);color:var(--blue);border:1px solid var(--blue-light);border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0">${t('admin_translate_btn')}</button>
            </div>
            <div id="preview_container_sec_desc_en_${secIdx}" class="live-preview-box" style="margin-top:6px; margin-bottom:12px; padding:10px 14px; background:#fff; border:1px dashed var(--gray-mid); border-radius:8px; display:none; font-family:var(--font);">
              <span style="font-size:7.5pt; font-weight:700; color:var(--gray-mid); margin-bottom:6px; display:block; text-transform:uppercase; letter-spacing:0.05em;">Xem trước / Live Preview</span>
              <div id="preview_content_sec_desc_en_${secIdx}" style="font-size:9.5pt; color:var(--gray-dark); line-height:1.5;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const secQs = qs.filter(q => q.section === secName);
    secQs.forEach(q => {
      const i = qs.findIndex(item => item.id === q.id);
      const isActive = i === activeQIndex;
      if (isActive) {
        // Edit Mode
        let optionsHtml = '';
        if (q.type === 'radio' || q.type === 'checkbox' || q.type === 'select' || q.type === 'combobox') {
          const opts = q.options || ['Lựa chọn 1'];
          optionsHtml = `<div class="q-options-list">`;
          opts.forEach((opt, oIdx) => {
            const optEN = (q.optionsEN && q.optionsEN[oIdx] !== undefined) ? q.optionsEN[oIdx] : '';
            optionsHtml += `
              <div class="gf-option-row ${q.type === 'checkbox' ? 'checkbox-style' : ''}" style="display:flex;gap:12px;align-items:center;">
                <div class="${q.type === 'select' || q.type === 'combobox' ? 'opt-number' : 'opt-bullet'}" style="${q.type === 'select' || q.type === 'combobox' ? 'font-size:9pt;font-weight:700;color:var(--gray-dark);width:20px;display:flex;align-items:center;justify-content:center;' : ''}">${q.type === 'select' || q.type === 'combobox' ? oIdx + 1 : ''}</div>
                <div style="flex:1;display:flex;gap:8px;">
                  <input type="text" style="flex:1;" value="${opt.replace(/"/g, '&quot;')}" onfocus="pushHistory()" oninput="updateQOption(${i}, ${oIdx}, this.value)" placeholder="Tùy chọn ${oIdx + 1} (VI)">
                  <input type="text" style="flex:1;" value="${optEN.replace(/"/g, '&quot;')}" onfocus="pushHistory()" oninput="updateQOptionEN(${i}, ${oIdx}, this.value)" placeholder="Option ${oIdx + 1} (EN)">
                </div>
                <button class="remove-opt-btn" onclick="removeQOption(${i}, ${oIdx})" title="Xóa tùy chọn">Xóa</button>
              </div>
            `;
          });
          optionsHtml += `
            <button class="gf-add-option-btn" onclick="addQOption(${i})">${t('admin_add_option')}</button>
          </div>`;
        } else if (q.type === 'likert') {
          const startVal = q.scaleStart !== undefined ? Number(q.scaleStart) : 1;
          const endVal = q.scaleEnd !== undefined ? Number(q.scaleEnd) : 5;
          const labelStart = q.labelStart || '';
          const labelEnd = q.labelEnd || '';
          const labelStartEN = q.labelStartEN || '';
          const labelEndEN = q.labelEndEN || '';
          optionsHtml = `
            <div class="gf-scale-config" style="margin-top:12px;display:flex;flex-direction:column;gap:12px;padding:16px;background:var(--gray-xlight);border-radius:8px;border:1px solid rgba(211, 209, 199, 0.4)">
              <div style="display:flex;align-items:center;gap:10px;font-size:10pt;font-weight:600;color:var(--navy)">
                <span>${t('admin_scale_from')}</span>
                <select style="width:auto;padding:6px 12px;font-size:10pt" onchange="updateQField(${i}, 'scaleStart', Number(this.value))">
                  <option value="0" ${startVal === 0 ? 'selected' : ''}>0</option>
                  <option value="1" ${startVal === 1 ? 'selected' : ''}>1</option>
                </select>
                <span>${t('admin_scale_to')}</span>
                <select style="width:auto;padding:6px 12px;font-size:10pt" onchange="updateQField(${i}, 'scaleEnd', Number(this.value))">
                  ${[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}" ${endVal === n ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div>
                  <label style="display:block;font-weight:700;font-size:9pt;color:var(--gray-dark);margin-bottom:6px">Nhãn cho ${startVal} (VI - tùy chọn)</label>
                  <input type="text" style="padding:8px 12px;font-size:9.5pt;background:#fff;margin-bottom:8px" value="${labelStart.replace(/"/g, '&quot;')}" onfocus="pushHistory()" oninput="updateQField(${i}, 'labelStart', this.value)" placeholder="Ví dụ: Không đồng ý">
                  <label style="display:block;font-weight:700;font-size:9pt;color:var(--gray-dark);margin-bottom:6px;margin-top:8px">Label for ${startVal} (EN - optional)</label>
                  <input type="text" style="padding:8px 12px;font-size:9.5pt;background:#fff" value="${labelStartEN.replace(/"/g, '&quot;')}" onfocus="pushHistory()" oninput="updateQField(${i}, 'labelStartEN', this.value)" placeholder="e.g. Disagree">
                </div>
                <div>
                  <label style="display:block;font-weight:700;font-size:9pt;color:var(--gray-dark);margin-bottom:6px">Nhãn cho ${endVal} (VI - tùy chọn)</label>
                  <input type="text" style="padding:8px 12px;font-size:9.5pt;background:#fff;margin-bottom:8px" value="${labelEnd.replace(/"/g, '&quot;')}" onfocus="pushHistory()" oninput="updateQField(${i}, 'labelEnd', this.value)" placeholder="Ví dụ: Hoàn toàn đồng ý">
                  <label style="display:block;font-weight:700;font-size:9pt;color:var(--gray-dark);margin-bottom:6px;margin-top:8px">Label for ${endVal} (EN - optional)</label>
                  <input type="text" style="padding:8px 12px;font-size:9.5pt;background:#fff" value="${labelEndEN.replace(/"/g, '&quot;')}" onfocus="pushHistory()" oninput="updateQField(${i}, 'labelEndEN', this.value)" placeholder="e.g. Strongly agree">
                </div>
              </div>
            </div>
          `;
        } else if (q.type === 'text') {
          optionsHtml = `
            <div style="margin-top:12px;padding:4px 0">
              <input type="text" disabled placeholder="Văn bản câu trả lời ngắn" style="border:none !important;border-bottom:1px dashed var(--gray-light) !important;background:transparent !important;width:60%;padding:4px 0 !important;font-size:10pt;color:var(--gray-mid);cursor:not-allowed">
            </div>
          `;
        }

        const reqChecked = q.required !== false ? 'checked' : '';

        html += `
          <div class="gf-question-card active" draggable="true" data-q-index="${i}" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)" ondragend="handleDragEnd(event)">
            <div class="gf-floating-toolbar">
              <button class="gf-floating-btn" onclick="addQ(${i})" title="Thêm câu hỏi mới">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              </button>
              <button class="gf-floating-btn" onclick="addSection(${i})" title="Thêm phần mới">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><rect x="3" y="3" width="18" height="7" rx="1"></rect><rect x="3" y="14" width="18" height="7" rx="1"></rect></svg>
              </button>
            </div>
            
            <div class="q-edit-fields">
              <div class="q-row-header">
                <div>
                  <!-- VI text -->
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                    <label style="font-weight:700;font-size:9pt;color:var(--gray-dark);margin-bottom:0">${t('admin_q_text_label')}</label>
                    ${getFormatToolbarHtml(`q_text_input_${i}`)}
                  </div>
                    <div 
                     id="q_text_input_${i}" 
                     class="wysiwyg-editor" 
                     contenteditable="true" 
                     data-q-id="${q.id}"
                     data-field="text"
                     onfocus="pushHistory()" 
                     oninput="updateQFieldByEl(this)" 
                     onblur="updateQFieldByEl(this)"
                    placeholder="Nhập câu hỏi tiếng Việt..." 
                    onkeydown="handleSingleLineKeydown(event)"
                    style="width:100%; min-height:38px; margin-bottom:8px"
                  >${q.text}</div>
                  <div id="preview_container_q_text_input_${i}" class="live-preview-box" style="margin-top:6px; margin-bottom:12px; padding:10px 14px; background:#fff; border:1px dashed var(--gray-mid); border-radius:8px; display:none; font-family:var(--font);">
                    <span style="font-size:7.5pt; font-weight:700; color:var(--gray-mid); margin-bottom:6px; display:block; text-transform:uppercase; letter-spacing:0.05em;">Xem trước / Live Preview</span>
                    <div id="preview_content_q_text_input_${i}" style="font-size:11.5pt; font-weight:600; color:var(--navy);"></div>
                  </div>
                  
                  <!-- EN text -->
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                    <label style="font-weight:700;font-size:9pt;color:var(--gray-dark);margin-bottom:0">${t('admin_q_en_label')}</label>
                    ${getFormatToolbarHtml(`q_en_input_${i}`)}
                  </div>
                  <div style="display:flex;gap:8px;align-items:stretch;width:100%;margin-bottom:8px">
                    <div 
                       id="q_en_input_${i}" 
                       class="wysiwyg-editor" 
                       contenteditable="true" 
                       data-q-id="${q.id}"
                       data-field="textEN"
                       onfocus="pushHistory()" 
                       oninput="updateQFieldByEl(this)" 
                       onblur="updateQFieldByEl(this)"
                      placeholder="Enter English version..." 
                      onkeydown="handleSingleLineKeydown(event)"
                      style="flex:1; min-height:38px; border-color:${q.textEN ? 'var(--blue-light)' : 'var(--gray-light)'}"
                    >${q.textEN || ''}</div>
                    <button onclick="translateToEN(${i})" id="trans_btn_${i}" title="Auto-translate VI sang EN" style="
                      white-space:nowrap;padding:6px 12px;font-size:8.5pt;font-weight:700;
                      background:var(--blue-xlight);color:var(--blue);border:1px solid var(--blue-light);
                      border-radius:6px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center">${t('admin_translate')}</button>
                  </div>
                  <div id="preview_container_q_en_input_${i}" class="live-preview-box" style="margin-top:6px; margin-bottom:12px; padding:10px 14px; background:#fff; border:1px dashed var(--gray-mid); border-radius:8px; display:none; font-family:var(--font);">
                    <span style="font-size:7.5pt; font-weight:700; color:var(--gray-mid); margin-bottom:6px; display:block; text-transform:uppercase; letter-spacing:0.05em;">Xem trước / Live Preview</span>
                    <div id="preview_content_q_en_input_${i}" style="font-size:11.5pt; font-weight:600; color:var(--navy);"></div>
                  </div>
                  <div id="q_en_preview_${i}" style="margin-top:4px;font-size:8.5pt;color:var(--gray-dark);min-height:14px"></div>
                </div>
                 <div style="display:flex; flex-direction:column; gap:10px">
                  <div>
                    <label style="display:block; font-weight:700; font-size:9pt; color:var(--gray-dark); margin-bottom:4px">${currentLang === 'en' ? 'Variable Name' : 'Tên biến'}</label>
                    <input type="text" value="${q.alias || q.id || ''}" onfocus="pushHistory()" oninput="updateQField(${i}, 'alias', this.value.trim().replace(/[^a-zA-Z0-9_]/g, ''))" placeholder="${currentLang === 'en' ? 'e.g. FC1' : 'Ví dụ: FC1'}" style="padding:8px 12px; font-size:9.5pt; margin-bottom:0">
                  </div>
                  <div>
                    <label style="display:block; font-weight:700; font-size:9pt; color:var(--gray-dark); margin-bottom:4px">${t('admin_q_type_label')}</label>
                    <select onchange="updateQField(${i}, 'type', this.value)" style="padding:8px 12px; font-size:9.5pt; margin-bottom:0">
                      <option value="likert" ${q.type === 'likert' ? 'selected' : ''}>Thang đo tuyến tính (Linear scale)</option>
                      <option value="radio" ${q.type === 'radio' ? 'selected' : ''}>Trắc nghiệm (Radio)</option>
                      <option value="checkbox" ${q.type === 'checkbox' ? 'selected' : ''}>Hộp kiểm (Checkbox)</option>
                      <option value="text" ${q.type === 'text' ? 'selected' : ''}>Văn bản ngắn (Text)</option>
                      <option value="select" ${q.type === 'select' ? 'selected' : ''}>Hộp chọn sốxuống (Select)</option>
                      <option value="combobox" ${q.type === 'combobox' ? 'selected' : ''}>Hộp chọn sốxuống (Combobox)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              ${optionsHtml}
            </div>
            
            <div class="q-card-footer">
              <button class="gf-card-footer-btn" onclick="moveQ(${i},-1)" ${i === 0 ? 'disabled' : ''} title="${t('admin_move_up')}">${t('admin_move_up')}</button>
              <button class="gf-card-footer-btn" onclick="moveQ(${i},1)" ${i === qs.length - 1 ? 'disabled' : ''} title="${t('admin_move_down')}">${t('admin_move_down')}</button>
              <div class="gf-card-footer-divider"></div>
              <button class="gf-card-footer-btn" onclick="duplicateQ(${i})" title="${t('admin_duplicate')}">${t('admin_duplicate')}</button>
              ${(q.id === 'resp_ft' || q.id === 'resp_eval') ? '' : `<button class="gf-card-footer-btn danger" onclick="deleteQ(${i})" title="${t('admin_delete_q')}">${t('admin_delete_q')}</button>`}
              <div class="gf-card-footer-divider"></div>
              <div class="gf-switch-container" onclick="toggleQRequired(${i})" style="">
                <span>${t('admin_required')}</span>
                <label class="gf-switch">
                   <input type="checkbox" ${reqChecked} disabled>
                   <span class="gf-slider"></span>
                </label>
              </div>
            </div>
          </div>
        `;
      } else {
        // Preview Mode
        const isReqLabel = q.required !== false ? '<span style="color:var(--red);white-space:nowrap;">&nbsp;*</span>' : '';
        const typeLabels = {
          likert: 'Thang đo tuyến tính (Linear scale)',
          radio: 'Trắc nghiệm (Radio)',
          checkbox: 'Hộp kiểm (Checkbox)',
          text: 'Văn bản ngắn (Text)',
          select: 'Hộp chọn sốxuống (Select)',
          combobox: 'Hộp chọn sốxuống (Combobox)'
        };
        html += `
          <div class="gf-question-card" draggable="true" data-q-index="${i}" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)" ondragend="handleDragEnd(event)" onclick="setActiveQ(${i})">
            <div class="q-preview">
              <div>
                <div class="q-preview-text">${i + 1}. ${q.text}${isReqLabel}${q.textEN ? `<span style="margin-left:8px;font-size:7.5pt;background:#e8f0fe;color:#1a73e8;padding:2px 6px;border-radius:4px;font-weight:600">EN · ${q.textEN}</span>` : ''}</div>
                <div class="q-preview-meta" style="margin-top:4px">
                  ${t('admin_type_label')}: <span>${typeLabels[q.type] || q.type}</span>
                </div>
              </div>
              <div>
                <span style="color:var(--blue);font-size:9pt;font-weight:600">${t('admin_click_edit')}</span>
              </div>
            </div>
          </div>
        `;
      }
    });
  });

  html += `</div>`;
  c.innerHTML = html;

  // Initialize previews
  uniqueSections.forEach((secName, secIdx) => {
    window.updateFieldPreview(`sec_title_vi_${secIdx}`);
    window.updateFieldPreview(`sec_title_en_${secIdx}`);
    window.updateFieldPreview(`sec_desc_vi_${secIdx}`);
    window.updateFieldPreview(`sec_desc_en_${secIdx}`);
  });

  if (activeQIndex !== -1) {
    window.updateFieldPreview(`q_text_input_${activeQIndex}`);
    window.updateFieldPreview(`q_en_input_${activeQIndex}`);
  }
}

window.setActiveQ = function (i) {
  activeQIndex = i;
  renderAdmin();
};

window.updateQField = function (i, field, val) {
  const qs = adminGetQuestions();
  if (!qs[i]) { console.log('[updateQField] index out of bounds', {i, field, val: val?.substring?.(0,100) ?? val}); return; }
  console.log('[updateQField] saving', {id: qs[i].id, field, val_preview: val?.substring?.(0,100) ?? val});
  if (field === 'type' || field === 'scaleStart' || field === 'scaleEnd') {
    pushHistory();
  }
  qs[i][field] = val;
  if (field === 'type' && (val === 'radio' || val === 'checkbox' || val === 'select' || val === 'combobox') && (!qs[i].options || qs[i].options.length === 0)) {
    qs[i].options = ['Lựa chọn 1'];
    qs[i].optionsEN = ['Option 1'];
  }
  adminSaveQuestions(qs);
  if (field === 'type' || field === 'scaleStart' || field === 'scaleEnd') {
    renderAdmin();
  }
};

window.updateQFieldByEl = function(el) {
  const id = el.dataset.qId;
  const field = el.dataset.field;
  if (!id || !field) return;
  const val = el.innerHTML;
  const qs = adminGetQuestions();
  const idx = qs.findIndex(q => q.id === id);
  if (idx === -1) return;
  updateQField(idx, field, val);
};

window.updateQOption = function (i, oIdx, val) {
  const qs = adminGetQuestions();
  if (!qs[i] || !qs[i].options) return;
  qs[i].options[oIdx] = val;
  adminSaveQuestions(qs);
};

window.updateQOptionEN = function (i, oIdx, val) {
  const qs = adminGetQuestions();
  if (!qs[i]) return;
  if (!qs[i].optionsEN) {
    qs[i].optionsEN = [];
  }
  while (qs[i].optionsEN.length < qs[i].options.length) {
    qs[i].optionsEN.push('');
  }
  qs[i].optionsEN[oIdx] = val;
  adminSaveQuestions(qs);
};

window.addQOption = function (i) {
  pushHistory();
  const qs = adminGetQuestions();
  if (!qs[i]) return;
  if (!qs[i].options) qs[i].options = [];
  qs[i].options.push('Lựa chọn ' + (qs[i].options.length + 1));
  if (!qs[i].optionsEN) qs[i].optionsEN = [];
  while (qs[i].optionsEN.length < qs[i].options.length - 1) {
    qs[i].optionsEN.push('');
  }
  qs[i].optionsEN.push('Option ' + qs[i].options.length);
  adminSaveQuestions(qs);
  renderAdmin();
};

window.removeQOption = function (i, oIdx) {
  pushHistory();
  const qs = adminGetQuestions();
  if (!qs[i] || !qs[i].options) return;
  qs[i].options.splice(oIdx, 1);
  if (qs[i].optionsEN) {
    qs[i].optionsEN.splice(oIdx, 1);
  }
  if (qs[i].options.length === 0) {
    qs[i].options = ['Lựa chọn 1'];
    qs[i].optionsEN = ['Option 1'];
  }
  adminSaveQuestions(qs);
  renderAdmin();
};

window.toggleQRequired = function (i) {
  pushHistory();
  const qs = adminGetQuestions();
  if (!qs[i]) return;
  qs[i].required = !(qs[i].required !== false);
  adminSaveQuestions(qs);
  renderAdmin();
};

window.duplicateQ = function (i) {
  pushHistory();
  const qs = adminGetQuestions();
  if (!qs[i]) return;
  const dup = JSON.parse(JSON.stringify(qs[i]));
  dup.id = 'Q_' + Date.now();
  dup.text = dup.text + ' (Bản sao)';
  qs.splice(i + 1, 0, dup);
  adminSaveQuestions(qs);
  activeQIndex = i + 1;
  renderAdmin();
  setTimeout(() => {
    const el = document.querySelector(`.gf-question-card.active`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
};

window.moveQ = function (i, d) {
  pushHistory();
  const qs = adminGetQuestions();
  if (d === -1 && i > 0) {
    [qs[i], qs[i - 1]] = [qs[i - 1], qs[i]];
    activeQIndex = i - 1;
  } else if (d === 1 && i < qs.length - 1) {
    [qs[i], qs[i + 1]] = [qs[i + 1], qs[i]];
    activeQIndex = i + 1;
  } else {
    return;
  }
  adminSaveQuestions(qs);
  renderAdmin();
  setTimeout(() => {
    const el = document.querySelector(`.gf-question-card.active`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
};

window.deleteQ = async function (i) {
  const qs = adminGetQuestions();
  const q = qs[i];
  if (q && (q.id === 'resp_ft' || q.id === 'resp_eval')) {
    showToast('Không thể xóa câu hỏi điều kiện sàng lọc.');
    return;
  }
  if (!await showConfirm('Xóa câu hỏi này?')) return;
  pushHistory();
  qs.splice(i, 1);
  adminSaveQuestions(qs);
  activeQIndex = -1;
  renderAdmin();
};

window.addQ = function (i) {
  pushHistory();
  const qs = adminGetQuestions() || [];
  const targetSection = (i !== undefined && qs[i]) ? qs[i].section : (qs.length > 0 ? qs[qs.length - 1].section : 'Câu hỏi ban đầu');
  const newQ = {
    id: 'Q_' + Date.now(),
    text: 'Câu hỏi mới',
    type: 'likert',
    section: targetSection,
    required: false,
    order: qs.length + 1
  };
  if (i !== undefined) {
    qs.splice(i + 1, 0, newQ);
    activeQIndex = i + 1;
  } else {
    qs.push(newQ);
    activeQIndex = qs.length - 1;
  }
  adminSaveQuestions(qs);
  renderAdmin();
  setTimeout(() => {
    const el = document.querySelector(`.gf-question-card.active`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
};

window.addSection = async function (i) {
  const name = await showPrompt('Nhập tên phần (section) mới:');
  if (!name || !name.trim()) return;
  pushHistory();
  const qs = adminGetQuestions() || [];
  const secName = name.trim();
  const newQ = {
    id: 'Q_' + Date.now(),
    text: 'Câu hỏi đầu tiên của phần mới',
    type: 'likert',
    section: secName,
    required: false,
    order: qs.length + 1
  };
  if (i !== undefined) {
    qs.splice(i + 1, 0, newQ);
    activeQIndex = i + 1;
  } else {
    qs.push(newQ);
    activeQIndex = qs.length - 1;
  }
  adminSaveQuestions(qs);

  const totalSections = new Set(qs.map(q => q.section)).size;
  const meta = JSON.parse(localStorage.getItem('draft_hr_section_metadata')) || {};
  if (!meta[secName]) {
    meta[secName] = { phase: 'pre', order: totalSections - 1, titleVI: secName, titleEN: secName };
    localStorage.setItem('draft_hr_section_metadata', JSON.stringify(meta));
  }
  const descs = JSON.parse(localStorage.getItem('draft_hr_section_descriptions')) || {};
  if (!descs[secName]) {
    descs[secName] = '';
    localStorage.setItem('draft_hr_section_descriptions', JSON.stringify(descs));
  }

  renderAdmin();
  setTimeout(() => {
    const el = document.querySelector(`.gf-question-card.active`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
};

window._activeRules = window._activeRules || [];
window._matchType = window._matchType || 'AND';

window.addFilterRule = function () {
  const allCols = window._svCols || [];
  if (!allCols.length) return;
  window._activeRules.push({
    column: allCols[0],
    operator: 'contains',
    value: ''
  });
  window.renderFilterRules();
  window.applyQueryFilters();
};

window.removeFilterRule = function (index) {
  window._activeRules.splice(index, 1);
  window.renderFilterRules();
  window.applyQueryFilters();
};

window.updateMatchCondition = function () {
  const sel = document.getElementById('qb-match-type');
  if (sel) {
    window._matchType = sel.value;
  }
  window.applyQueryFilters();
};

window.renderFilterRules = function () {
  const container = document.getElementById('qb-rules-list');
  if (!container) return;
  
  if (window._activeRules.length === 0) {
    container.innerHTML = `<div style="color:var(--gray-mid);font-size:9.5pt;font-style:italic">Chưa có điều kiện lọc nào. Hiển thị toàn bộ dữ liệu.</div>`;
    return;
  }
  
  const allCols = window._svCols || [];
  const qs = adminGetQuestions() || [];
  const qDict = {};
  qs.forEach(q => { qDict[q.id] = q.text; });
  const colLabels = {
    participant_id: 'Participant ID', email: 'Email', condition: 'Condition', case_id: 'Case ID',
    transparency: 'Transparency', outcome: 'Outcome', fill_started_at: 'Fill Started At', submitted_at: 'Submitted At'
  };
  const getColLabel = (c) => {
    if (colLabels[c]) return colLabels[c];
    if (qDict[c]) {
      const text = qDict[c];
      return `${c}: ${text.length > 40 ? text.substring(0, 37) + '...' : text}`;
    }
    return c;
  };
  
  container.innerHTML = window._activeRules.map((rule, idx) => {
    const colOptions = allCols.map(c => 
      `<option value="${c}" ${rule.column === c ? 'selected' : ''}>${getColLabel(c)}</option>`
    ).join('');
    
    return `
    <div class="qb-rule-row" data-index="${idx}" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:#fff;padding:8px;border:1px solid #e0e0e0;border-radius:6px">
      <select class="qb-col-select" onchange="window.updateRule(${idx}, 'column', this.value)" style="flex:2;min-width:180px;padding:6px 8px;font-size:9pt;border-radius:4px;width:auto">
        ${colOptions}
      </select>
      <select class="qb-op-select" onchange="window.updateRule(${idx}, 'operator', this.value)" style="flex:1;min-width:100px;padding:6px 8px;font-size:9pt;border-radius:4px;width:auto">
        <option value="contains" ${rule.operator === 'contains' ? 'selected' : ''}>Chứa</option>
        <option value="equals" ${rule.operator === 'equals' ? 'selected' : ''}>Bằng</option>
        <option value="starts_with" ${rule.operator === 'starts_with' ? 'selected' : ''}>Bắt đầu với</option>
        <option value="gt" ${rule.operator === 'gt' ? 'selected' : ''}>&gt; (Lớn hơn)</option>
        <option value="lt" ${rule.operator === 'lt' ? 'selected' : ''}>&lt; (Nhỏ hơn)</option>
        <option value="gte" ${rule.operator === 'gte' ? 'selected' : ''}>&gt;= (Lớn hơn hoặc bằng)</option>
        <option value="lte" ${rule.operator === 'lte' ? 'selected' : ''}>&lt;= (Nhỏ hơn hoặc bằng)</option>
        <option value="is_empty" ${rule.operator === 'is_empty' ? 'selected' : ''}>Rỗng</option>
        <option value="is_not_empty" ${rule.operator === 'is_not_empty' ? 'selected' : ''}>Không rỗng</option>
      </select>
      <input class="qb-val-input" type="text" placeholder="Giá trị lọc..." value="${(rule.value || '').replace(/"/g, '&quot;')}" oninput="window.updateRule(${idx}, 'value', this.value)" 
        style="flex:2;min-width:150px;padding:6px 8px;font-size:9pt;border-radius:4px;width:auto;display:${(rule.operator === 'is_empty' || rule.operator === 'is_not_empty') ? 'none' : 'block'}">
      <button onclick="window.removeFilterRule(${idx})" class="btn danger" style="padding:6px 12px;font-size:9pt;min-width:auto;border-radius:4px;margin-bottom:0">Xóa</button>
    </div>`;
  }).join('');
};

window.updateRule = function (index, field, value) {
  if (window._activeRules[index]) {
    window._activeRules[index][field] = value;
    if (field === 'operator') {
      window.renderFilterRules();
    }
    window.applyQueryFilters();
  }
};

const getActiveQs = () => {
  try {
    const draftStr = localStorage.getItem('draft_hr_questions');
    if (draftStr) return JSON.parse(draftStr) || [];
  } catch (e) {}
  if (typeof getQuestions === 'function') return getQuestions() || [];
  if (typeof window.getQuestions === 'function') return window.getQuestions() || [];
  if (typeof window.adminGetQuestions === 'function') return window.adminGetQuestions() || [];
  try {
    const qStr = localStorage.getItem('hr_questions');
    if (qStr) return JSON.parse(qStr) || [];
  } catch (e) {}
  return [];
};

const getQKeyMap = () => {
  const activeQs = getActiveQs();
  const map = {};
  activeQs.forEach(q => {
    if (q.alias && q.alias.trim() !== '') {
      const lowerAlias = q.alias.trim().toLowerCase();
      const lowerId = q.id.trim().toLowerCase();
      map[lowerAlias] = lowerId;
      map[lowerId] = lowerAlias;
    }
  });
  return map;
};

const getCellValue = (r, c) => {
  if (!r) return '';
  // 1. Direct match on row column
  if (r[c] !== undefined && r[c] !== null) return r[c];
  
  // 2. Direct match inside r.data
  if (r.data && typeof r.data === 'object') {
    if (r.data[c] !== undefined && r.data[c] !== null) return r.data[c];
    
    // 3. Check case-insensitive match inside r.data
    const keys = Object.keys(r.data);
    const lowerC = c.toLowerCase();
    const foundKey = keys.find(k => k.toLowerCase() === lowerC);
    if (foundKey && r.data[foundKey] !== undefined && r.data[foundKey] !== null) {
      return r.data[foundKey];
    }

    // 3.5 Check mapped alias or ID in r.data
    const keyMap = getQKeyMap();
    const mapped = keyMap[lowerC];
    if (mapped) {
      if (r.data[mapped] !== undefined && r.data[mapped] !== null) return r.data[mapped];
      const foundMappedKey = keys.find(k => k.toLowerCase() === mapped);
      if (foundMappedKey && r.data[foundMappedKey] !== undefined && r.data[foundMappedKey] !== null) {
        return r.data[foundMappedKey];
      }
    }
    
    // 4. Check special mapped fields (e.g., loginUser, resp_experience, etc.)
    if (c === 'login_user' && r.data.loginUser !== undefined) return r.data.loginUser;
    if (c === 'loginUser' && r.data.login_user !== undefined) return r.data.login_user;
    if (c === 'resp_years' && r.data.resp_experience !== undefined) return r.data.resp_experience;
    if (c === 'resp_experience' && r.data.resp_years !== undefined) return r.data.resp_years;
    if (c === 'resp_ft_work' && r.data.resp_ft !== undefined) return r.data.resp_ft;
    if (c === 'resp_ft' && r.data.resp_ft_work !== undefined) return r.data.resp_ft_work;
    if (c === 'resp_perf_eval' && r.data.resp_eval !== undefined) return r.data.resp_eval;
    if (c === 'resp_eval' && r.data.resp_perf_eval !== undefined) return r.data.resp_perf_eval;
  }

  // 5. Check case-insensitive match on the row object directly (e.g., c is SCR1, but DB has scr1)
  const rowKeys = Object.keys(r);
  const lowerC = c.toLowerCase();

  // Also check if c is mapped to a key on the row object
  const keyMap = getQKeyMap();
  const mapped = keyMap[lowerC];
  if (mapped) {
    const foundMappedRowKey = rowKeys.find(k => k.toLowerCase() === mapped);
    if (foundMappedRowKey && r[foundMappedRowKey] !== undefined && r[foundMappedRowKey] !== null) {
      return r[foundMappedRowKey];
    }
  }

  const foundRowKey = rowKeys.find(k => k.toLowerCase() === lowerC);
  if (foundRowKey && r[foundRowKey] !== undefined && r[foundRowKey] !== null) {
    return r[foundRowKey];
  }
  
  return '';
};
window._svGetCellValue = getCellValue;

const getDynamicColumns = (rows) => {
  const activeQs = getActiveQs();
  const activeQIds = activeQs.map(q => q.alias && q.alias.trim() !== '' ? q.alias.trim() : q.id);

  const fixedCols = ['participant_id', 'email', 'condition', 'case_id', 'transparency', 'outcome', 'fill_started_at', 'submitted_at'];
  
  // Map fixed columns (like email) to their alias if defined
  const mappedFixedCols = fixedCols.map(col => {
    if (col === 'email') {
      const emailQ = activeQs.find(q => q.id === 'email');
      if (emailQ && emailQ.alias && emailQ.alias.trim() !== '') {
        return emailQ.alias.trim();
      }
    }
    return col;
  });

  const ignoredKeys = new Set([
    'id', 'created_at', 'fill_started_at', 'submitted_at', 
    'participant_id', 'email', 'condition', 'case_id', 
    'transparency', 'outcome', 'login_user', 'loginuser', 
    'loginpass', 'login_pass', 'custommodalinputfield', 'data',
    'dept', 'region', 'age', 'years', 'role', 'level', 'employee_id'
  ]);

  const activeQIdsLower = new Set();
  activeQs.forEach(q => {
    activeQIdsLower.add(q.id.toLowerCase());
    if (q.alias) {
      activeQIdsLower.add(q.alias.trim().toLowerCase());
    }
  });
  const fixedColsLower = new Set(fixedCols.map(id => id.toLowerCase()));
  const mappedFixedColsLower = new Set(mappedFixedCols.map(id => id.toLowerCase()));

  // Profile / demographic fields to show in the spreadsheet
  const profileKeys = new Set([
    'consent',
    'ctrl_ai_fam', 'ctrl_ai_exp', 'att1', 'detail_level',
    'resp_gender', 'resp_age', 'resp_region', 'resp_dept', 'resp_experience', 
    'resp_years', 'resp_ft_work', 'resp_ft', 'resp_perf_eval', 'resp_eval', 
    'resp_ai_dev'
  ]);

  const aliasMap = {
    'resp_years': 'resp_experience',
    'resp_experience': 'resp_years',
    'resp_ft_work': 'resp_ft',
    'resp_ft': 'resp_ft_work',
    'resp_perf_eval': 'resp_eval',
    'resp_eval': 'resp_perf_eval',
    'loginuser': 'login_user',
    'login_user': 'loginuser'
  };

  const extraKeysSet = new Set();
  rows.forEach(r => {
    Object.keys(r).forEach(k => {
      const kl = k.toLowerCase();
      const alias = aliasMap[kl] || aliasMap[k];
      const hasAliasActive = alias && (activeQIdsLower.has(alias.toLowerCase()) || fixedColsLower.has(alias.toLowerCase()));

      const isAllowed = false;

      if (isAllowed && !ignoredKeys.has(kl) && !fixedColsLower.has(kl) && !activeQIdsLower.has(kl) && !hasAliasActive) {
        const existing = [...extraKeysSet].some(x => x.toLowerCase() === kl);
        if (!existing) {
          extraKeysSet.add(k);
        }
      }
    });
    if (r.data && typeof r.data === 'object') {
      Object.keys(r.data).forEach(k => {
        const kl = k.toLowerCase();
        const alias = aliasMap[kl] || aliasMap[k];
        const hasAliasActive = alias && (activeQIdsLower.has(alias.toLowerCase()) || fixedColsLower.has(alias.toLowerCase()));

        const isAllowed = false;

        if (isAllowed && !ignoredKeys.has(kl) && !fixedColsLower.has(kl) && !activeQIdsLower.has(kl) && !hasAliasActive) {
          const existing = [...extraKeysSet].some(x => x.toLowerCase() === kl);
          if (!existing) {
            extraKeysSet.add(k);
          }
        }
      });
    }
  });

  const extraCols = [...extraKeysSet].sort();
  const filteredActiveQIds = activeQIds.filter(id => !fixedColsLower.has(id.toLowerCase()) && !mappedFixedColsLower.has(id.toLowerCase()));
  return [...mappedFixedCols, ...filteredActiveQIds, ...extraCols];
};
window._svGetDynamicColumns = getDynamicColumns;

window.applyQueryFilters = function () {
  const tbody = document.getElementById('sv-body');
  if (!tbody || !window._svRows) return;
  
  const rows = window._svRows;
  const allCols = window._svCols;
  const toDisplay = window._svToDisplay;
  const rules = window._activeRules;
  const matchType = window._matchType;
  
  const matchRule = (rowVal, op, filterVal) => {
    const rowStr = (rowVal === null || rowVal === undefined) ? '' : String(rowVal).trim().toLowerCase();
    const fVal = String(filterVal).trim().toLowerCase();
    
    if (op === 'contains') return rowStr.includes(fVal);
    if (op === 'equals') return rowStr === fVal;
    if (op === 'starts_with') return rowStr.startsWith(fVal);
    if (op === 'is_empty') return rowStr === '';
    if (op === 'is_not_empty') return rowStr !== '';
    
    const rowNum = parseFloat(rowVal);
    const fNum = parseFloat(filterVal);
    if (isNaN(rowNum) || isNaN(fNum)) return false;
    
    if (op === 'gt') return rowNum > fNum;
    if (op === 'lt') return rowNum < fNum;
    if (op === 'gte') return rowNum >= fNum;
    if (op === 'lte') return rowNum <= fNum;
    
    return false;
  };
  
  let filteredCount = 0;
  
  const html = rows.map((r, ri) => {
    let matches = true;
    if (rules.length > 0) {
      if (matchType === 'AND') {
        matches = rules.every(rule => {
          return matchRule(getCellValue(r, rule.column), rule.operator, rule.value);
        });
      } else {
        matches = rules.some(rule => {
          return matchRule(getCellValue(r, rule.column), rule.operator, rule.value);
        });
      }
    }
    
    if (!matches) return '';
    
    filteredCount++;
    const cells = allCols.map(c => {
      const v = toDisplay(c, getCellValue(r, c));
      return `<td title="${v}">${v}</td>`;
    }).join('');
    
    return `<tr>
      <td style="text-align:center;padding:4px;background:#f8f9fa;border-right:2px solid #e0e0e0"><input type="checkbox" class="row-cb" value="${r.id}" onchange="updateDeleteBtn()"></td>
      <td style="color:#9aa0a6;text-align:center;background:#f8f9fa;border-right:1px solid #e0e0e0;font-size:8pt;min-width:30px">${filteredCount}</td>
      ${cells}
    </tr>`;
  }).join('');
  
  tbody.innerHTML = html;
  
  const countEl = document.getElementById('sv-filtered-count');
  if (countEl) {
    countEl.textContent = `Hiển thị${filteredCount} / ${rows.length} phản hồi`;
  }
};

async function renderAdminResponses(c) {
  let { data: responses, error } = await sb.from('responses').select('*').order('created_at', { ascending: false });
  if (error) return c.innerHTML = `<p style="color:red">Lỗi tải dữ liệu: ${error.message}</p>`;
  responses = normalizeDbRows(responses);

  // Dynamic columns detection using Hybrid Option B+C
  const allCols = getDynamicColumns(responses);

  const toDisplay = (key, val) => {
    if (!val && val !== 0) return '';
    if (key === 'fill_started_at' || key === 'submitted_at') {
      try { return new Date(val).toLocaleString('vi-VN'); } catch (e) { return val; }
    }
    return String(val);
  };

  window._svRows = responses;
  window._svCols = allCols;
  window._svToDisplay = toDisplay;

  let html = `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <h3>Dữ liệu thu thập <span id="sv-filtered-count" style="font-size:10.5pt;font-weight:normal;color:var(--gray-mid);margin-left:8px">Hiển thị ${responses.length} / ${responses.length} phản hồi</span></h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" onclick="exportResponses('csv')">Export CSV</button>
      <button class="btn" onclick="exportResponses('json')">Export JSON</button>
      <button class="btn danger" id="delSelectedBtn" onclick="deleteSelected()" style="display:none">Xóa đã chọn (0)</button>
      <button class="btn danger" onclick="clearResponses()">Xóa tất cả</button>
    </div>
  </div>`;

  if (!responses.length) { 
    html += '<p style="color:var(--gray-dark)">Chưa có dữ liệu nào.</p>'; 
    c.innerHTML = html;
    return;
  }

  // Add Query Builder panel
  html += `
  <div class="query-builder" style="background:#f8f9fa;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-weight:700;color:var(--navy);font-size:9.5pt;letter-spacing:0.5px">BỘ LỌC NÂNG CAO (QUERY BUILDER)</div>
      <div style="display:flex;align-items:center;gap:8px;font-size:9pt">
        <span style="font-weight:500;color:var(--gray-dark)">Kiểu khớp điều kiện:</span>
        <select id="qb-match-type" onchange="window.updateMatchCondition()" style="width:auto;padding:4px 8px;font-size:9pt;border-radius:4px;border:1px solid var(--gray-light)">
          <option value="AND" ${window._matchType === 'AND' ? 'selected' : ''}>Tất cỡcác điều kiện (AND)</option>
          <option value="OR" ${window._matchType === 'OR' ? 'selected' : ''}>Bất kỳ điều kiện nào (OR)</option>
        </select>
      </div>
    </div>
    <div id="qb-rules-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
      <!-- Active filter rules will go here -->
    </div>
    <div>
      <button class="btn" onclick="window.addFilterRule()" style="padding:6px 12px;font-size:9pt;border-radius:6px;background:#fff;border:1px dashed var(--blue);color:var(--blue);display:inline-flex;align-items:center;gap:4px">
        ＋Thêm điều kiện lọc
      </button>
    </div>
  </div>`;

  // Dynamic Spreadsheet Table header
  const headerCells = allCols.map(c =>
    `<th style="min-width:${c.length > 20 ? 160 : c.length > 10 ? 120 : 90}px;white-space:nowrap">${c}</th>`
  ).join('');

  html += `
  <div id="sv-wrap" style="overflow:auto;max-height:600px;border:1px solid #e2e8f0;border-radius:8px;box-shadow:inset 0 1px 3px rgba(0,0,0,0.02);background:#fff">
    <table id="sv-table" style="border-collapse:collapse;font-size:9pt;width:max-content;min-width:100%">
      <thead>
        <tr style="background:#f8f9fa;position:sticky;top:0;z-index:10;border-bottom:2px solid #e2e8f0">
          <th style="width:32px;background:#f8f9fa;border-right:2px solid #e0e0e0;text-align:center"><input type="checkbox" onchange="toggleAllRows(this.checked)" title="Chọn tất cả"></th>
          <th style="width:30px;background:#f8f9fa;border-right:1px solid #e0e0e0;text-align:center">STT</th>
          ${headerCells}
        </tr>
      </thead>
      <tbody id="sv-body">
        <!-- Body rows populated dynamically by applyQueryFilters -->
      </tbody>
    </table>
  </div>`;

  c.innerHTML = html;

  // Initialize and apply filters
  window.renderFilterRules();
  window.applyQueryFilters();
}


window.openSheetView = async function () {
  let { data: rows, error } = await sb.from('responses').select('*').order('created_at', { ascending: false });
  if (error) { await showAlert('Lỗi tải dữ liệu: ' + error.message); return; }
  rows = normalizeDbRows(rows);

  // Build all columns dynamically from the data using Hybrid Option B+C
  const allCols = getDynamicColumns(rows);

  const toDisplay = (key, val) => {
    if (!val && val !== 0) return '';
    if (key === 'fill_started_at' || key === 'submitted_at') {
      try { return new Date(val).toLocaleString('vi-VN'); } catch (e) { return val; }
    }
    return String(val);
  };

  // Build HTML for the full-screen spreadsheet modal
  const headerCells = allCols.map((c, i) =>
    `<th style="min-width:${c.length > 20 ? 160 : c.length > 10 ? 120 : 90}px;white-space:nowrap">${c}</th>`
  ).join('');

  const bodyRows = rows.map((r, ri) => {
    const cells = allCols.map(c => {
      const v = toDisplay(c, getCellValue(r, c));
      return `<td title="${v}">${v}</td>`;
    }).join('');
    return `<tr><td style="color:#9aa0a6;text-align:center;background:#f8f9fa;border-right:2px solid #e0e0e0;font-size:8pt;min-width:30px">${ri + 1}</td>${cells}</tr>`;
  }).join('');

  const modalHtml = `
  <div id="sheet-overlay" onclick="if(event.target===this)closeSheetView()" style="
    position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;
    display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px">
    <div style="background:#fff;border-radius:12px;width:100%;max-width:1400px;height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
      <!-- Toolbar -->
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f8f9fa;border-bottom:1px solid #e0e0e0;flex-shrink:0">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:32px;height:32px;background:#34a853;border-radius:6px;display:flex;align-items:center;justify-content:center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 8h10M7 12h10M7 16h6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>
          </div>
          <div>
            <div style="font-size:13pt;font-weight:700;color:#1a1a1a">HR Survey Responses</div>
            <div style="font-size:8pt;color:#5f6368">${rows.length} phản hồi · ${allCols.length} cột</div>
          </div>
        </div>
        <!-- Search -->
        <div style="flex:1;max-width:320px;margin-left:20px;position:relative">
          <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input id="sv-search" type="text" placeholder="Tìm kiếm..." oninput="filterSheetView()"
            style="width:100%;padding:7px 10px 7px 32px;border:1px solid #dadce0;border-radius:6px;font-size:9.5pt;outline:none">
        </div>
        <!-- Actions -->
        <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
          <button onclick="exportResponses('csv')" style="background:#1a73e8;color:#fff;border:none;border-radius:6px;padding:7px 14px;font-size:9pt;font-weight:600;cursor:pointer">⇓Export CSV</button>
          <button onclick="closeSheetView()" style="background:transparent;border:1px solid #dadce0;border-radius:6px;padding:7px 12px;font-size:9pt;cursor:pointer;color:#5f6368">✕Đóng</button>
        </div>
      </div>
      <!-- Column letters bar (like Google Sheets) -->
      <div id="sv-wrap" style="overflow:auto;flex:1">
        <table id="sv-table" style="border-collapse:collapse;font-size:9pt;width:max-content;min-width:100%">
          <thead>
            <tr style="background:#f8f9fa;position:sticky;top:0;z-index:10">
              <th style="width:30px;background:#f8f9fa;border-right:2px solid #e0e0e0;border-bottom:2px solid #e0e0e0"></th>
              ${headerCells}
            </tr>
          </thead>
          <tbody id="sv-body">${bodyRows}</tbody>
        </table>
      </div>
    </div>
  </div>`;

  const div = document.createElement('div');
  div.id = 'sheet-modal-container';
  div.innerHTML = modalHtml;
  document.body.appendChild(div);

  // Store rows for filtering
  window._svRows = rows;
  window._svCols = allCols;
  window._svToDisplay = toDisplay;
};

window.filterSheetView = function () {
  const q = document.getElementById('sv-search')?.value.toLowerCase() || '';
  const tbody = document.getElementById('sv-body');
  if (!tbody || !window._svRows) return;
  const rows = window._svRows;
  const allCols = window._svCols;
  const toDisplay = window._svToDisplay;
  let ri = 0;
  tbody.innerHTML = rows.map(r => {
    const cells = allCols.map(c => toDisplay(c, getCellValue(r, c)));
    const match = !q || cells.some(v => v.toLowerCase().includes(q));
    if (!match) return '';
    ri++;
    const rowCells = cells.map(v =>
      `<td title="${v}">${v}</td>`
    ).join('');
    return `<tr><td style="color:#9aa0a6;text-align:center;background:#f8f9fa;border-right:2px solid #e0e0e0;font-size:8pt">${ri}</td>${rowCells}</tr>`;
  }).join('');
};

window.closeSheetView = function () {
  const el = document.getElementById('sheet-modal-container');
  if (el) el.remove();
};



window.exportResponses = async function (fmt) {
  let { data: responses, error } = await sb.from('responses').select('*');
  if (error) return await showAlert('Lỗi tải dữ liệu');
  responses = normalizeDbRows(responses);
  if (!responses.length) return await showAlert('Không có dữ liệu');

  const processed = responses.map(r => ({
    ...r.data,
    fill_started_at: r.fill_started_at,
    submitted_at: r.submitted_at,
    db_id: r.id
  }));

  if (fmt === 'json') {
    dl('hr_responses.json', JSON.stringify(processed, null, 2), 'application/json');
  } else {
    const keys = getDynamicColumns(responses);
    const esc = v => '"' + String(v ?? '').replaceAll('"', '""') + '"';
    const headerRow = keys.join(',');
    const dataRows = responses.map(r =>
      keys.map(k => esc(getCellValue(r, k))).join(',')
    ).join('\n');
    dl('hr_responses.csv', headerRow + '\n' + dataRows, 'text/csv');
  }
};
window.clearResponses = async function () {
  if (await showConfirm('Xóa TẤT CẢ dữ liệu thu thập từ database?')) {
    const { error } = await sb.from('responses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) await showAlert('Lỗi khi xóa: ' + error.message);
    renderAdmin();
  }
};
window.deleteResponse = async function (id) {
  if (!await showConfirm('Xóa phản hồi này?')) return;
  const { error } = await sb.from('responses').delete().eq('id', id);
  if (error) await showAlert('Lỗi khi xóa: ' + error.message);
  renderAdmin();
};
window.toggleAllRows = function(checked) {
  document.querySelectorAll('.row-cb').forEach(cb => cb.checked = checked);
  window.updateDeleteBtn();
};
window.updateDeleteBtn = function() {
  const count = document.querySelectorAll('.row-cb:checked').length;
  const btn = document.getElementById('delSelectedBtn');
  if (btn) {
    btn.style.display = count ? 'inline-block' : 'none';
    btn.textContent = `Xóa đã chọn (${count})`;
  }
};
window.deleteSelected = async function() {
  const ids = [...document.querySelectorAll('.row-cb:checked')].map(cb => cb.value);
  if (!ids.length) return;
  if (!await showConfirm(`Xóa ${ids.length} phản hồi đã chọn?`)) return;
  for (const id of ids) {
    const { error } = await sb.from('responses').delete().eq('id', id);
    if (error) await showAlert('Lỗi khi xóa: ' + error.message);
  }
  renderAdmin();
};

async function renderAdminSamples(c) {
  const targets = getTargets(), counts = await getCounts();
  let html = `<h3 style="margin-bottom:16px">Quản lý mẫu</h3><div class="case-progress">`;
  const caseLabels = {
    C1: 'Case 1: XAI (No DPP)',
    C2: 'Case 2: DPP (No XAI)',
    C3: 'Case 3: Both XAI & DPP',
    C4: 'Case 4: Neither (No XAI, No DPP)'
  };
  ['C1', 'C2', 'C3', 'C4'].forEach(k => {
    const count = counts[k] || 0, target = targets[k] || 100;
    const pct = Math.min(100, Math.round(count / target * 100));
    const full = count >= target;
    html += `<div class="case-row"><span class="case-name">${k}: ${caseLabels[k]}</span><div class="case-track"><div class="case-fill ${full ? 'full' : ''}" style="width:${pct}%"></div></div><span class="case-count">${count}/${target}</span><span class="case-target"><input type="number" min="1" max="1000" value="${target}" onchange="updateTarget('${k}',this.value)"></span></div>`;
  });
  html += `</div><div class="note"><strong>Lưu ý:</strong> Khi case đã đủ mẫu (thanh xanh lá), hệ thống sẽ không gán thêm người khảo sát vào case đó.</div>`;
  c.innerHTML = html;
}
window.updateTarget = function (k, v) { const t = getTargets(); t[k] = parseInt(v) || 100; saveSettingToDb('hr_targets', t); renderAdmin(); };

/* ── CASE SWITCHER (TEST) ── */
window.switchCase = function (c) {
  state.condition = c;
  const caseMap = { case_1: 'C1', case_2: 'C2', case_3: 'C3', case_4: 'C4' };
  const pool = DATASET[caseMap[c]];
  const idx = Math.floor(Math.random() * pool.length);
  state.profileIndex = idx;
  currentProfile = enrichProfileWithTdvMetrics(pool[idx]);
  render();
};

/* ── INIT ── */
async function initApp() {
  await loadDataset();
  await initAdmin();
}
initApp();

/* ── DASHBOARD ── */
window.adminCharts = window.adminCharts || {};

async function renderAdminDashboard(c) {
  let { data: rawResponses, error } = await sb.from('responses').select('*');
  if (error) return c.innerHTML = `<p style="color:red">Lỗi tải dữ liệu: ${error.message}</p>`;
  rawResponses = normalizeDbRows(rawResponses);
  
  // Normalize row keys by keeping original and adding lowercase versions for easy, foolproof lookup
  const responses = rawResponses.map(row => {
    const normalized = {};
    if (row.data) {
      Object.entries(row.data).forEach(([k, v]) => {
        normalized[k] = v;
        normalized[k.toLowerCase()] = v;
      });
    }
    Object.entries(row).forEach(([k, v]) => {
      if (k !== 'data') {
        normalized[k] = v;
        normalized[k.toLowerCase()] = v;
      }
    });
    return normalized;
  });

  // Clear old charts
  Object.values(window.adminCharts).forEach(chart => { if (chart && chart.destroy) chart.destroy(); });
  window.adminCharts = {};

  if (responses.length === 0) {
    c.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-dark);">Chưa có dữ liệu phản hồi nào để hiển thị thống kê.</div>';
    return;
  }

  // Resolve survey answer value for a given question q from a normalized response row r
  const getQuestionValue = (r, q) => {
    let val = undefined;
    
    // 1. Try original ID
    if (r[q.id] !== undefined && r[q.id] !== '') {
      val = r[q.id];
    }
    // 2. Try lowercase ID
    else {
      const idLower = q.id.toLowerCase();
      if (r[idLower] !== undefined && r[idLower] !== '') {
        val = r[idLower];
      }
    }
    
    // 3. Try alias if not found
    if ((val === undefined || val === '') && q.alias && q.alias.trim()) {
      const alias = q.alias.trim();
      if (r[alias] !== undefined && r[alias] !== '') {
        val = r[alias];
      } else {
        const aliasLower = alias.toLowerCase();
        if (r[aliasLower] !== undefined && r[aliasLower] !== '') {
          val = r[aliasLower];
        }
      }
    }
    
    // 4. Try specific legacy demographic mappings
    if (val === undefined || val === '') {
      const idLower = q.id.toLowerCase();
      if (idLower === 'resp_experience') {
        val = r['resp_years'];
      } else if (idLower === 'resp_ft') {
        val = r['resp_ft_work'];
      } else if (idLower === 'resp_eval') {
        val = r['resp_perf_eval'];
      }
    }
    
    // 5. Try specific legacy AI familiarity/experience mappings
    if (val === undefined || val === '') {
      const idLower = q.id.toLowerCase();
      if (idLower === 'ctrl_ai_fam' || q.id === 'Q_1782142002061') {
        val = r['ctrl_ai_fam'] !== undefined ? r['ctrl_ai_fam'] : r['CTRL_AI_FAM'];
      } else if (idLower === 'ctrl_ai_exp' || q.id === 'Q_1782142021255') {
        val = r['ctrl_ai_exp'] !== undefined ? r['ctrl_ai_exp'] : r['CTRL_AI_EXP'];
      }
    }

    // 6. Map string options to Likert scale numbers if target is likert
    if (val !== undefined && val !== '' && q.type === 'likert') {
      const vStr = String(val).trim();
      // Only map if it's not already a number 1-5
      if (!/^[1-5]$/.test(vStr)) {
        const mapping = {
          'rất thấp': '1', 'very low': '1', 'chưa từng': '1', 'never': '1',
          'thấp': '2', 'low': '2',
          'trung bình': '3', 'medium': '3', 'thỉnh thoảng': '3', 'occasionally': '3',
          'cao': '4', 'high': '4',
          'rất cao': '5', 'very high': '5', 'thường xuyên': '5', 'regularly': '5'
        };
        const mapped = mapping[vStr.toLowerCase()];
        if (mapped !== undefined) {
          val = mapped;
        }
      }
    }

    return val;
  };

  const newChartId = (prefix) => 'chart_' + prefix + '_' + Math.random().toString(36).substr(2, 9);
  const chartConfigs = [];
  const PIE_COLORS = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC', '#00ACC1', '#FF7043', '#9E9D24', '#5C6BC0', '#26A69A'];
  const BAR_GRADIENT = ['#0C447C', '#185FA5', '#2B7FD4', '#5DA3E8', '#93C4F5'];

  let html = '<div class="gf-dashboard">';
  html += `<div class="gf-summary-card"><h2>${responses.length} câu trả lời</h2><p>Thống kê dữ liệu từ người dùng</p></div>`;

  // ── Group questions by section ──
  let qs = (typeof adminGetQuestions === 'function') ? adminGetQuestions() : getQuestions();
  if (!qs || qs.length === 0) qs = defaultQuestions();

  const sectionMap = new Map();
  qs.forEach(q => {
    if (!sectionMap.has(q.section)) sectionMap.set(q.section, []);
    sectionMap.get(q.section).push(q);
  });

  sectionMap.forEach((sectionQs, secName) => {
    // Section divider header
    html += `
      <div style="
        display:flex; align-items:center; gap:12px;
        margin: 8px 0 4px;
        padding: 14px 20px;
        background: var(--gradient-navy);
        border-radius: var(--radius);
        box-shadow: 0 2px 8px rgba(12,68,124,0.18);
      ">
        <div style="
          background:rgba(255,255,255,0.15);
          border:1px solid rgba(255,255,255,0.25);
          border-radius:6px;
          padding:4px 12px;
          font-size:8.5pt;
          font-weight:700;
          color:#fff;
          letter-spacing:0.06em;
          text-transform:uppercase;
          white-space:nowrap;
        ">PHẦN</div>
        <div style="flex:1">
          <div style="font-size:13pt;font-weight:800;color:#fff;letter-spacing:0.01em">${secName}</div>
          <div style="font-size:9pt;color:rgba(255,255,255,0.7);margin-top:2px">${sectionQs.length} câu hỏi</div>
        </div>
      </div>`;

    sectionQs.forEach(q => {
      const answered = responses.filter(r => {
        const val = getQuestionValue(r, q);
        return val !== undefined && val !== '';
      }).length;
      
      // Small section badge shown on every card
      const secBadge = `<span style="
        display:inline-block; margin-bottom:8px;
        background:var(--blue-xlight); color:var(--blue);
        border:1px solid var(--blue-light);
        border-radius:99px; padding:2px 10px;
        font-size:8pt; font-weight:700; letter-spacing:0.04em;
      ">${secName}</span>`;

      if (q.type === 'likert') {
        const startVal = q.scaleStart !== undefined ? Number(q.scaleStart) : 1;
        const endVal = q.scaleEnd !== undefined ? Number(q.scaleEnd) : 5;
        const range = [];
        for (let n = startVal; n <= endVal; n++) range.push(String(n));
        const counts = {};
        range.forEach(n => counts[n] = 0);
        
        responses.forEach(r => {
          const val = getQuestionValue(r, q);
          if (val !== undefined && val !== '') {
            const v = String(val).trim();
            if (counts[v] !== undefined) counts[v]++;
          }
        });

        const chartId = newChartId(q.id);
        html += `
          <div class="gf-card">
            ${secBadge}
            <h3>${qText(q)}</h3>
            <p style="font-size:9pt;color:var(--gray-dark);margin-bottom:8px">${answered} câu trả lời · Thang đo ${startVal} – ${endVal}</p>
            <div class="gf-chart-container bar"><canvas id="${chartId}"></canvas></div>
          </div>`;
        chartConfigs.push({
          id: chartId, type: 'bar-vertical', data: counts, labels: range,
          colors: range.map((_, i) => BAR_GRADIENT[Math.round(i / Math.max(range.length - 1, 1) * (BAR_GRADIENT.length - 1))])
        });

      } else if (q.type === 'radio' || q.type === 'select' || q.type === 'combobox') {
        const opts = q.options || [];
        const counts = {};
        opts.forEach(o => counts[o] = 0);
        
        responses.forEach(r => {
          const val = getQuestionValue(r, q);
          if (val !== undefined && val !== '') {
            const v = String(val).trim();
            if (counts[v] !== undefined) {
              counts[v]++;
            } else {
              // Try case-insensitive options match
              const found = Object.keys(counts).find(k => k.toLowerCase().trim() === v.toLowerCase().trim());
              if (found) counts[found]++;
            }
          }
        });

        const chartId = newChartId(q.id);
        html += `
          <div class="gf-card">
            ${secBadge}
            <h3>${qText(q)}</h3>
            <p style="font-size:9pt;color:var(--gray-dark);margin-bottom:8px">${answered} câu trả lời · Chọn một</p>
            <div class="gf-chart-container pie"><canvas id="${chartId}"></canvas></div>
          </div>`;
        chartConfigs.push({ id: chartId, type: 'doughnut', data: counts, colors: PIE_COLORS });

      } else if (q.type === 'checkbox') {
        const opts = q.options || [];
        const counts = {};
        opts.forEach(o => counts[o] = 0);
        
        responses.forEach(r => {
          const val = getQuestionValue(r, q);
          if (!val) return;
          String(val).split(',').forEach(sel => {
            const s = sel.trim();
            if (s) {
              if (counts[s] !== undefined) {
                counts[s]++;
              } else {
                const found = Object.keys(counts).find(k => k.toLowerCase().trim() === s.toLowerCase().trim());
                if (found) counts[found]++;
              }
            }
          });
        });

        const chartId = newChartId(q.id);
        html += `
          <div class="gf-card">
            ${secBadge}
            <h3>${qText(q)}</h3>
            <p style="font-size:9pt;color:var(--gray-dark);margin-bottom:8px">${answered} câu trả lời · Chọn nhiều</p>
            <div class="gf-chart-container bar" style="height:${Math.max(180, opts.length * 44)}px"><canvas id="${chartId}"></canvas></div>
          </div>`;
        chartConfigs.push({
          id: chartId, type: 'bar-horizontal', data: counts, labels: opts,
          colors: opts.map((_, i) => PIE_COLORS[i % PIE_COLORS.length])
        });

      } else if (q.type === 'text') {
        const textCounts = {};
        responses.forEach(r => {
          const val = getQuestionValue(r, q);
          if (val !== undefined && val !== '') {
            const s = String(val).trim();
            if (s && s.toLowerCase() !== 'trống') {
              textCounts[s] = (textCounts[s] || 0) + 1;
            }
          }
        });
        
        const sorted = Object.entries(textCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
        let tableHtml = sorted.length === 0
          ? '<p style="color:var(--gray-mid);font-size:9pt">Chưa có câu trả lời.</p>'
          : `<table style="width:100%;border-collapse:collapse;font-size:9.5pt">
              <thead><tr>
                <th style="text-align:left;padding:6px 8px;border-bottom:2px solid var(--gray-light);color:var(--navy)">Câu trả lời</th>
                <th style="text-align:right;padding:6px 8px;border-bottom:2px solid var(--gray-light);color:var(--navy)">Số lần</th>
              </tr></thead>
              <tbody>${sorted.map(([val, cnt], i) => `<tr style="background:${i % 2 ? 'var(--gray-xlight)' : '#fff'}">
                <td style="padding:5px 8px;color:var(--black)">${val}</td>
                <td style="padding:5px 8px;text-align:right;font-weight:700;color:var(--blue)">${cnt}</td>
              </tr>`).join('')}</tbody>
            </table>`;
        html += `
          <div class="gf-card">
            ${secBadge}
            <h3>${qText(q)}</h3>
            <p style="font-size:9pt;color:var(--gray-dark);margin-bottom:12px">${answered} câu trả lời · Văn bản tự do (top 15)</p>
            ${tableHtml}
          </div>`;
      }
    });
  });

  html += '</div>';
  c.innerHTML = html;

  // ── Initialize charts after DOM insertion ──
  setTimeout(() => {
    if (typeof Chart === 'undefined') { console.error('Chart.js not loaded!'); return; }

    chartConfigs.forEach(cfg => {
      const ctx = document.getElementById(cfg.id);
      if (!ctx) return;

      let chartType, chartData, chartOptions;

      if (cfg.type === 'doughnut') {
        const labels = Object.keys(cfg.data);
        const dataVals = Object.values(cfg.data);
        chartType = 'doughnut';
        chartData = { labels, datasets: [{ data: dataVals, backgroundColor: cfg.colors, borderWidth: 2, borderColor: '#fff' }] };
        chartOptions = {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { font: { size: 11 }, padding: 12 } },
            tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} (${Math.round(ctx.raw / ctx.dataset.data.reduce((a, b) => a + b, 0) * 100)}%)` } }
          },
          cutout: '55%'
        };
      } else if (cfg.type === 'bar-vertical') {
        const dataVals = cfg.labels.map(l => cfg.data[l] || 0);
        chartType = 'bar';
        chartData = { labels: cfg.labels, datasets: [{ data: dataVals, backgroundColor: cfg.colors, borderRadius: 6, barPercentage: 0.65 }] };
        chartOptions = {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 12, weight: '700' } } },
            y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.06)' } }
          }
        };
      } else if (cfg.type === 'bar-horizontal') {
        const dataVals = cfg.labels.map(l => cfg.data[l] || 0);
        chartType = 'bar';
        chartData = { labels: cfg.labels, datasets: [{ data: dataVals, backgroundColor: cfg.colors, borderRadius: 4, barPercentage: 0.7 }] };
        chartOptions = {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
            y: { grid: { display: false } }
          }
        };
      }

      if (chartType) {
        window.adminCharts[cfg.id] = new Chart(ctx, { type: chartType, data: chartData, options: chartOptions });
      }
    });
  }, 150);
}

/* ── AUTO-TRANSLATE QUESTION TEXT (VI sang EN) ── */
/* ── AUTO-TRANSLATE QUESTION TEXT, OPTIONS & LABELS (VI sang EN) ── */
window.pendingTranslations = window.pendingTranslations || {};

window.translateToEN = async function (i) {
  const qs = adminGetQuestions();
  const q = qs[i];
  if (!q) return;

  const btn = document.getElementById(`trans_btn_${i}`);
  const preview = document.getElementById(`q_en_preview_${i}`);
  if (!btn || !preview) return;

  // Get current text from WYSIWYG editor if edited, else use current question text
  const text = (window.getEditorValue(`q_text_input_${i}`) || q.text || '').trim();
  if (!text) return;

  btn.textContent = t('admin_translating');
  btn.disabled = true;
  preview.textContent = '';
  preview.style.color = 'var(--gray-dark)';

  try {
    const updates = {};
    const tasks = [];

    // 1. Question text
    tasks.push((async () => {
      updates.textEN = await window.translateText(text, 'en');
    })());

    // 2. Options
    if (q.options && q.options.length > 0) {
      tasks.push((async () => {
        const translatedOpts = await Promise.all(q.options.map(opt => window.translateText(opt, 'en')));
        updates.optionsEN = translatedOpts;
      })());
    }

    // 3. Likert labels
    if (q.type === 'likert') {
      if (q.labelStart && q.labelStart.trim()) {
        tasks.push((async () => {
          updates.labelStartEN = await window.translateText(q.labelStart, 'en');
        })());
      }
      if (q.labelEnd && q.labelEnd.trim()) {
        tasks.push((async () => {
          updates.labelEndEN = await window.translateText(q.labelEnd, 'en');
        })());
      }
    }

    await Promise.all(tasks);

    // Save to window pending translations
    window.pendingTranslations[i] = updates;

    let previewHtml = `<span style="color:var(--gray-mid)">EN: </span><em style="color:var(--navy)">"${updates.textEN || ''}"</em>`;
    if (updates.optionsEN && updates.optionsEN.length > 0) {
      previewHtml += `<div style="margin-top:4px;font-size:8pt;color:var(--gray-dark)">Options: <em>${updates.optionsEN.join(', ')}</em></div>`;
    }
    if (updates.labelStartEN || updates.labelEndEN) {
      previewHtml += `<div style="margin-top:4px;font-size:8pt;color:var(--gray-dark)">Labels: <em>${updates.labelStartEN || ''} - ${updates.labelEndEN || ''}</em></div>`;
    }
    
    previewHtml += `
      <button onclick="applyAllTranslations(${i})" style="
        margin-top:6px; font-size:8.5pt; font-weight:700; padding:4px 12px;
        background:var(--blue); color:#fff; border:none; border-radius:4px; cursor:pointer;
      ">Áp dụng</button>
    `;

    preview.innerHTML = previewHtml;

  } catch (e) {
    preview.textContent = t('admin_trans_err') + ': ' + e.message;
    preview.style.color = 'var(--red)';
  } finally {
    btn.textContent = t('admin_translate');
    btn.disabled = false;
  }
};

window.applyAllTranslations = function (i) {
  const payload = window.pendingTranslations && window.pendingTranslations[i];
  if (!payload) return;

  pushHistory();
  const qs = adminGetQuestions();
  const q = qs[i];
  if (!q) return;

  if (payload.textEN !== undefined) {
    q.textEN = payload.textEN;
    const enInput = document.getElementById(`q_en_input_${i}`);
    if (enInput) {
      enInput.innerHTML = payload.textEN;
      enInput.style.borderColor = 'var(--blue-light)';
      window.updateFieldPreview(`q_en_input_${i}`);
    }
  }

  if (payload.optionsEN !== undefined) {
    q.optionsEN = payload.optionsEN;
  }

  if (payload.labelStartEN !== undefined) {
    q.labelStartEN = payload.labelStartEN;
  }
  if (payload.labelEndEN !== undefined) {
    q.labelEndEN = payload.labelEndEN;
  }

  adminSaveQuestions(qs);
  updateAdminSaveButtonsState();
  
  // Re-render the active question so the text inputs (like options, labels) show the newly applied values!
  renderAdmin();

  const preview = document.getElementById(`q_en_preview_${i}`);
  if (preview) preview.innerHTML = '<span style="color:var(--blue);font-size:8pt;font-weight:700">Đã áp dụng tất cả</span>';
};



/* ── LANGUAGE TOGGLE ── */
$('langToggle').onclick = () => {
  const newLang = currentLang === 'vi' ? 'en' : 'vi';
  setLang(newLang);
  render();
  // Also re-render admin panel if it's currently open
  if (isAdmin() && isAuthed()) renderAdmin();
};

// Initialize lang button text on load
(function initLangBtn() {
  const btn = $('langToggle');
  if (btn) btn.textContent = currentLang === 'vi' ? 'EN' : 'VI';
})();


$('testCaseSelect').onchange = (e) => {
  const val = e.target.value;
  if (!val) return;
  window.switchCase(val);
  localStorage.setItem('hr_state', JSON.stringify(state));
};

// ── Admin language toggle ──
window.toggleAdminLang = function () {
  const newLang = currentLang === 'vi' ? 'en' : 'vi';
  setLang(newLang);
  // Sync both toggle buttons
  const adminBtn = document.getElementById('adminLangToggle');
  const userBtn = document.getElementById('langToggle');
  if (adminBtn) adminBtn.textContent = newLang === 'vi' ? 'EN' : 'VI';
  if (userBtn) userBtn.textContent = newLang === 'vi' ? 'EN' : 'VI';
  // Re-render admin so question text / labels update
  renderAdmin();
};

// ── Admin Inactivity Session Timeout ──
let lastActivityUpdate = 0;
window.updateAdminActivity = function() {
  if (isAdmin() && isAuthed()) {
    const now = Date.now();
    if (now - lastActivityUpdate > 5000) { // Throttle updates to once every 5 seconds
      localStorage.setItem('last_admin_activity', now.toString());
      lastActivityUpdate = now;
    }
  }
};

if (isAdmin()) {
  ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, () => {
      if (typeof window.updateAdminActivity === 'function') {
        window.updateAdminActivity();
      }
    }, { passive: true });
  });

  setInterval(async () => {
    if (isAuthed()) {
      const lastAct = localStorage.getItem('last_admin_activity');
      if (lastAct) {
        const elapsed = Date.now() - parseInt(lastAct, 10);
        const timeoutLimit = 30 * 60 * 1000; // 30 minutes
        if (elapsed > timeoutLimit) {
          await window.logoutAndResetLocalData(true);
        }
      }
    }
  }, 10000); // Check every 10 seconds
}
