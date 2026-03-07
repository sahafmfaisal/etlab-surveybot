/* ── QUESTION DEFINITIONS ── */
const QUESTION_OPTIONS = [
  { key: 'knowledge',           label: '1. Knowledge of the Teacher',              options: ['Excellent','Good','Fair','Poor'],            default: 'Excellent'  },
  { key: 'clarity',             label: '2. Clarity & Understandability',            options: ['Excellent','Good','Fair','Poor'],            default: 'Excellent'  },
  { key: 'willingness',         label: '3. Willingness to help',                    options: ['Excellent','Good','Fair','Poor'],            default: 'Excellent'  },
  { key: 'percentage of class', label: '4. Percentage of class not engaged',        options: ['< 10%','10% - 25%','> 25%'],                default: '< 10%'      },
  { key: 'dictates',            label: '5. Whether the teacher dictates notes',     options: ['No','Yes'],                                 default: 'No'         },
  { key: 'organis',             label: '6. Ability to organise lectures',           options: ['Excellent','Satisfactory','Inadequate'],    default: 'Excellent'  },
  { key: 'speed',               label: '7. Speed of presentation',                  options: ['Just Right','Too Fast','Too Slow'],         default: 'Just Right' },
  { key: 'encourage',           label: '8. Does the teacher encourage questioning', options: ['Yes','Sometimes','No'],                     default: 'Yes'        },
  { key: 'behavior',            label: '9. Behavior of the teacher',                options: ['Pleasant','Indifferent','Unpleasant'],      default: 'Pleasant'   },
  { key: 'sincerity',           label: '10. Sincerity of the teacher',              options: ['Sincere','Not Sincere','Unable to judge'],  default: 'Sincere'    },
  { key: 'overall',             label: '11. Overall teaching effectiveness',        options: ['Excellent','Good','Fair','Poor'],           default: 'Excellent'  },
];

/* ── COUNTER CONFIG ── */
const COUNTER_NS   = 'surveybot-sahaf';
const COUNTER_KEY  = 'surveys-completed';
const COUNTER_SEED = 20;

/* ── CURRENT ANSWER STATE ── */
let currentAnswers = {};

/* ══════════════════════════════════════
   BUILD SCRIPT FROM CURRENT ANSWERS
══════════════════════════════════════ */
function buildSurveyScript() {
  const mapLines = QUESTION_OPTIONS
    .map(q => `    '${q.key}': '${currentAnswers[q.key] || q.default}'`)
    .join(',\n');

  return `(function(){
  var M = {
${mapLines}
  };

  function getLabel(radio) {
    var s = radio.nextSibling;
    while (s) {
      if (s.nodeType === 3 && s.textContent.trim()) return s.textContent.trim();
      if (s.nodeType === 1 && s.tagName !== 'BR' && s.tagName !== 'INPUT') return s.innerText.trim();
      s = s.nextSibling;
    }
    return radio.value || '';
  }

  function getQuestion(radio) {
    var el = radio, answerDiv = null;
    for (var i = 0; i < 6; i++) {
      el = el.parentElement;
      if (!el) break;
      if ((el.className || '').toLowerCase().indexOf('answer') !== -1) { answerDiv = el; break; }
    }
    if (answerDiv) {
      var sib = answerDiv.previousSibling;
      while (sib) {
        var txt = (sib.textContent || sib.nodeValue || '').trim();
        if (txt.length > 3 && /\\d+\\./.test(txt)) return txt.toLowerCase();
        sib = sib.previousSibling;
      }
      var parent = answerDiv.parentElement;
      if (parent) {
        var kids = parent.childNodes;
        for (var j = 0; j < kids.length; j++) {
          if (kids[j] === answerDiv) break;
          var kt = (kids[j].textContent || kids[j].nodeValue || '').trim();
          if (kt.length > 3 && /\\d+\\./.test(kt)) return kt.toLowerCase();
        }
      }
    }
    el = radio;
    for (var k = 0; k < 10; k++) {
      el = el.parentElement;
      if (!el) break;
      var direct = '';
      el.childNodes.forEach(function(node) { if (node.nodeType === 3) direct += node.textContent; });
      direct = direct.trim();
      if (direct.length > 5 && /\\d+\\./.test(direct)) return direct.toLowerCase();
    }
    return '';
  }

  var G = {}, order = [];
  [].forEach.call(document.querySelectorAll('input[type=radio]'), function(r) {
    var k = r.name || ('_' + r.id);
    if (!G[k]) { G[k] = []; order.push(k); }
    G[k].push(r);
  });

  var n = 0, done = {};
  order.forEach(function(nm) {
    if (done[nm]) return;
    var rs = G[nm], q = getQuestion(rs[0]), labels = rs.map(getLabel);
    var mkey = Object.keys(M).find(function(k) { return q.indexOf(k) !== -1; });
    if (mkey) {
      var target = M[mkey];
      rs.forEach(function(r, i) {
        if (labels[i] === target && !r.checked) {
          r.click(); r.checked = true;
          r.dispatchEvent(new Event('change', { bubbles: true }));
          n++; done[nm] = 1;
        }
      });
    } else {
      if (!rs[0].checked) {
        rs[0].click(); rs[0].checked = true;
        rs[0].dispatchEvent(new Event('change', { bubbles: true }));
        n++; done[nm] = 1;
      }
    }
  });

  var sub = [].find.call(
    document.querySelectorAll('input[type=submit], button[type=submit], .btn-success, button, a.btn'),
    function(b) { return /submit/i.test(b.innerText || b.value || b.textContent || ''); }
  );
  if (sub) {
    if (confirm('SurveyBot: ' + n + ' / ' + order.length + ' answers filled.' + String.fromCharCode(10) + 'OK = submit now | Cancel = review first'))
      sub.click();
  } else {
    alert('SurveyBot: ' + n + ' answers filled.' + String.fromCharCode(10) + 'Click Submit Answers to finish.');
  }
  console.log('%cSurveyBot: ' + n + '/' + order.length + ' done', 'color:#10b981;font-weight:bold;font-size:13px');
})();`;
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  // Seed currentAnswers from defaults
  QUESTION_OPTIONS.forEach(q => { currentAnswers[q.key] = q.default; });

  renderScript();
  renderAnswerKey();
  renderCustomizeGrid();
  initNav();
  initSmoothLinks();
  loadCounter();
});

/* ── Render script into <pre> ── */
function renderScript() {
  const codeEl = document.getElementById('scriptCode');
  const lineEl = document.getElementById('lineCount');
  if (!codeEl) return;
  const script = buildSurveyScript();
  codeEl.textContent = script;
  if (lineEl) lineEl.textContent = script.split('\n').length + ' lines';
}

/* ── Static answer key ── */
function renderAnswerKey() {
  const grid = document.getElementById('akGrid');
  if (!grid) return;
  grid.innerHTML = QUESTION_OPTIONS.map(q => `
    <div class="ak-row">
      <span class="ak-q">${q.label}</span>
      <span class="ak-a" id="ak-val-${q.key}">${q.default}</span>
    </div>
  `).join('');
}

/* ── Update answer key badge when user customizes ── */
function updateAnswerKeyBadge(key, value) {
  const badge = document.getElementById(`ak-val-${key}`);
  if (badge) badge.textContent = value;
}

/* ══════════════════════════════════════
   CUSTOMIZE
══════════════════════════════════════ */
function renderCustomizeGrid() {
  const grid = document.getElementById('customizeGrid');
  if (!grid) return;
  grid.innerHTML = QUESTION_OPTIONS.map(q => `
    <div class="customize-row">
      <label class="customize-label">${q.label}</label>
      <div class="customize-options">
        ${q.options.map(opt => `
          <button
            class="customize-option ${opt === q.default ? 'is-default' : ''} ${currentAnswers[q.key] === opt ? 'selected' : ''}"
            data-key="${q.key}"
            data-value="${opt}"
            onclick="selectAnswer('${q.key}','${opt.replace(/'/g, "\\'")}')"
          >${opt}</button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function selectAnswer(key, value) {
  currentAnswers[key] = value;

  // Update button active states
  document.querySelectorAll(`.customize-option[data-key="${key}"]`).forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.value === value);
  });

  // Rebuild the displayed script live
  renderScript();

  // Keep the answer key in sync
  updateAnswerKeyBadge(key, value);

  // Pulse the status indicator
  const status = document.getElementById('customizeStatus');
  if (status) {
    status.innerHTML = `<span class="customize-dot customize-dot-updated"></span> Script updated!`;
    setTimeout(() => {
      status.innerHTML = `<span class="customize-dot"></span> Script auto-updates as you change answers`;
    }, 1800);
  }
}

function resetAnswers() {
  QUESTION_OPTIONS.forEach(q => { currentAnswers[q.key] = q.default; });
  renderCustomizeGrid();
  renderScript();
  renderAnswerKey();
}


function loadCounter() {
  fetch(`https://api.countapi.xyz/get/${COUNTER_NS}/${COUNTER_KEY}`)
    .then(r => r.json())
    .then(data => animateCounter((data.value || 0) + COUNTER_SEED))
    .catch(() => animateCounter(COUNTER_SEED)); // graceful fallback if API is down
}

function incrementCounter() {
  fetch(`https://api.countapi.xyz/hit/${COUNTER_NS}/${COUNTER_KEY}`)
    .then(r => r.json())
    .then(data => animateCounter((data.value || 0) + COUNTER_SEED))
    .catch(() => {}); // silent fail — don't break the copy flow
}

function animateCounter(target) {
  const el = document.getElementById('surveyCounter');
  if (!el) return;
  const duration = 1200;
  const startTime = performance.now();
  (function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    el.textContent = Math.floor(ease * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString() + '+';
  })(startTime);
}

/* ══════════════════════════════════════
   COPY
══════════════════════════════════════ */
function copyScript() {
  const script = buildSurveyScript();
  navigator.clipboard.writeText(script).then(onCopied).catch(() => {
    // Fallback for browsers without clipboard API
    const el = document.getElementById('scriptCode');
    if (el) {
      const r = document.createRange();
      r.selectNodeContents(el);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(r);
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
    }
    onCopied();
  });
}

function onCopied() {
  // Button feedback
  const btn = document.getElementById('copyBtn');
  if (btn) {
    btn.classList.add('copied');
    const span = btn.querySelector('span');
    const orig = span ? span.textContent : '';
    if (span) span.textContent = 'Copied!';
    setTimeout(() => { btn.classList.remove('copied'); if (span) span.textContent = orig; }, 2200);
  }
  showToast();
  incrementCounter(); // ← this is what makes the counter tick up live on copy
}

function showToast() {
  const t = document.getElementById('toast');
  if (!t) return;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

/* ══════════════════════════════════════
   ANSWER KEY TOGGLE
══════════════════════════════════════ */
function toggleAK() {
  const body   = document.getElementById('akBody');
  const toggle = document.getElementById('akToggle');
  if (!body) return;
  const open = body.classList.toggle('open');
  if (toggle) {
    toggle.innerHTML = open
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> Hide answer key`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> See what answers get selected`;
  }
}

/* ══════════════════════════════════════
   NAV + SMOOTH SCROLL
══════════════════════════════════════ */
function initNav() {
  const toggle = document.getElementById('mobileNavToggle');
  const menu   = document.getElementById('mobileNavMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('open', open);
  });
  menu.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
    });
  });
}

function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const id = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
    });
  });
}

/* ── Expose to HTML onclick handlers ── */
window.copyScript   = copyScript;
window.toggleAK     = toggleAK;
window.selectAnswer = selectAnswer;
window.resetAnswers = resetAnswers;