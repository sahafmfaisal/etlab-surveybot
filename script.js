const SURVEY_SCRIPT = `(function(){
  /* ── Answer map: question keyword → best answer ── */
  var M = {
    'knowledge':           'Excellent',
    'clarity':             'Excellent',
    'willingness':         'Excellent',
    'percentage of class': '< 10%',
    'dictates':            'No',
    'organis':             'Excellent',
    'speed':               'Just Right',
    'encourage':           'Yes',
    'behavior':            'Pleasant',
    'sincerity':           'Sincere',
    'overall':             'Excellent'
  };

  /* ── Get label text from a radio ──
     etlab: <input type="radio" name="Option[4]" value="12"> Excellent <br>
     The label is a raw TEXT NODE (type 3) right after the input. */
  function getLabel(radio) {
    var s = radio.nextSibling;
    while (s) {
      if (s.nodeType === 3 && s.textContent.trim()) {
        return s.textContent.trim();
      }
      if (s.nodeType === 1 && s.tagName !== 'BR' && s.tagName !== 'INPUT') {
        return s.innerText.trim();
      }
      s = s.nextSibling;
    }
    return radio.value || '';
  }

  /* ── Get question text for a radio group ──
     The radio lives inside <div class="answer">.
     The question text is a SIBLING of .answer, not inside it.
     Walk up to the .answer container, then check preceding siblings. */
  function getQuestion(radio) {
    var el = radio;
    var answerDiv = null;

    for (var i = 0; i < 6; i++) {
      el = el.parentElement;
      if (!el) break;
      var cls = (el.className || '').toLowerCase();
      if (cls.indexOf('answer') !== -1 || cls.indexOf('option') !== -1) {
        answerDiv = el;
        break;
      }
    }

    if (answerDiv) {
      /* Check previous siblings of the .answer div */
      var sib = answerDiv.previousSibling;
      while (sib) {
        var txt = (sib.textContent || sib.nodeValue || '').trim();
        if (txt.length > 3 && /\\d+\\./.test(txt)) return txt.toLowerCase();
        sib = sib.previousSibling;
      }
      /* Check parent's children before answerDiv */
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

    /* Fallback: walk ancestors, read direct text nodes only */
    el = radio;
    for (var k = 0; k < 10; k++) {
      el = el.parentElement;
      if (!el) break;
      var direct = '';
      el.childNodes.forEach(function(node) {
        if (node.nodeType === 3) direct += node.textContent;
      });
      direct = direct.trim();
      if (direct.length > 5 && /\\d+\\./.test(direct)) return direct.toLowerCase();
    }
    return '';
  }

  /* ── Group radios by name ── */
  var G = {}, order = [];
  [].forEach.call(document.querySelectorAll('input[type=radio]'), function(r) {
    var k = r.name || ('_' + r.id);
    if (!G[k]) { G[k] = []; order.push(k); }
    G[k].push(r);
  });

  var n = 0, done = {};

  order.forEach(function(nm) {
    if (done[nm]) return;
    var rs = G[nm];
    var q = getQuestion(rs[0]);
    var labels = rs.map(getLabel);

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
      /* No question match — select first option (best answer) */
      if (!rs[0].checked) {
        rs[0].click(); rs[0].checked = true;
        rs[0].dispatchEvent(new Event('change', { bubbles: true }));
        n++; done[nm] = 1;
      }
    }
  });

  /* ── Find and click submit ── */
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

/* ── ANSWER KEY DATA ── */
const ANSWER_KEY = [
  { q: '1. Knowledge of the Teacher?', a: 'Excellent' },
  { q: '2. Clarity & Understandability', a: 'Excellent' },
  { q: '3. Willingness to help', a: 'Excellent' },
  { q: '4. Percentage of class not engaged', a: '< 10%' },
  { q: '5. Whether the teacher dictates notes?', a: 'No' },
  { q: '6. Ability to organise lectures', a: 'Excellent' },
  { q: '7. Speed of presentation', a: 'Just Right' },
  { q: '8. Does the teacher encourage questioning?', a: 'Yes' },
  { q: '9. Behavior of the teacher', a: 'Pleasant' },
  { q: '10. Sincerity of the teacher', a: 'Sincere' },
  { q: '11. Overall teaching effectiveness', a: 'Excellent' },
];

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  renderScript();
  renderAnswerKey();
  initNav();
  initSmoothLinks();
});

/* ── Render script into <pre> ── */
function renderScript() {
  const codeEl = document.getElementById('scriptCode');
  const preEl = document.getElementById('scriptPre');
  const lineEl = document.getElementById('lineCount');
  if (!codeEl) return;

  codeEl.textContent = SURVEY_SCRIPT;

  const lines = SURVEY_SCRIPT.split('\n').length;
  if (lineEl) lineEl.textContent = lines + ' lines';
}

/* ── Render answer key grid ── */
function renderAnswerKey() {
  const grid = document.getElementById('akGrid');
  if (!grid) return;
  grid.innerHTML = ANSWER_KEY.map(item => `
    <div class="ak-row">
      <span class="ak-q">${item.q}</span>
      <span class="ak-a">${item.a}</span>
    </div>
  `).join('');
}

/* ── Copy script to clipboard ── */
function copyScript() {
  navigator.clipboard.writeText(SURVEY_SCRIPT).then(() => {
    const btn = document.getElementById('copyBtn');
    if (btn) {
      btn.classList.add('copied');
      const span = btn.querySelector('span');
      const orig = span ? span.textContent : '';
      if (span) span.textContent = 'Copied!';
      setTimeout(() => {
        btn.classList.remove('copied');
        if (span) span.textContent = orig;
      }, 2200);
    }
    showToast();
  }).catch(() => {
    /* Fallback for browsers without clipboard API */
    const el = document.getElementById('scriptCode');
    if (el) {
      const range = document.createRange();
      range.selectNodeContents(el);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
      showToast();
    }
  });
}

/* ── Toast notification ── */
function showToast() {
  const t = document.getElementById('toast');
  if (!t) return;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

/* ── Toggle answer key ── */
function toggleAK() {
  const body = document.getElementById('akBody');
  const toggle = document.getElementById('akToggle');
  if (!body) return;
  const open = body.classList.toggle('open');
  if (toggle) {
    toggle.innerHTML = open
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> Hide answer key`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> See what answers get selected`;
  }
}

/* ── Mobile nav toggle ── */
function initNav() {
  const toggle = document.getElementById('mobileNavToggle');
  const menu = document.getElementById('mobileNavMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  /* Close on link click */
  menu.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
    });
  });
}

/* ── Smooth anchor scrolling with nav offset ── */
function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── Expose functions to HTML onclick handlers ── */
window.copyScript = copyScript;
window.toggleAK = toggleAK;
