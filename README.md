# etlab SurveyBot

> Automatically fill teacher evaluation surveys on [etlab.in](https://etlab.in) — any college, any department, any semester.

One script. Paste it in the browser console on an etlab survey page. All 11 questions answered and submitted in under 5 seconds.

---

## How it works

Open a teacher evaluation survey on etlab → press `F12` → go to the **Console** tab → paste the script → hit `Enter`.

That's it. The script reads each question, matches it to the best answer, clicks the radio button, and submits the form.

For every subject after the first: go back to the survey list, click the next subject, then press `↑` in the console to recall the script and hit `Enter` again.

---

## The Script

```js
(function(){
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
      el = el.parentElement; if (!el) break;
      if ((el.className || '').toLowerCase().indexOf('answer') !== -1) { answerDiv = el; break; }
    }
    if (answerDiv) {
      var sib = answerDiv.previousSibling;
      while (sib) {
        var txt = (sib.textContent || sib.nodeValue || '').trim();
        if (txt.length > 3 && /\d+\./.test(txt)) return txt.toLowerCase();
        sib = sib.previousSibling;
      }
      var parent = answerDiv.parentElement;
      if (parent) {
        var kids = parent.childNodes;
        for (var j = 0; j < kids.length; j++) {
          if (kids[j] === answerDiv) break;
          var kt = (kids[j].textContent || kids[j].nodeValue || '').trim();
          if (kt.length > 3 && /\d+\./.test(kt)) return kt.toLowerCase();
        }
      }
    }
    el = radio;
    for (var k = 0; k < 10; k++) {
      el = el.parentElement; if (!el) break;
      var direct = '';
      el.childNodes.forEach(function(n){ if (n.nodeType === 3) direct += n.textContent; });
      direct = direct.trim();
      if (direct.length > 5 && /\d+\./.test(direct)) return direct.toLowerCase();
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
    var mkey = Object.keys(M).find(function(k){ return q.indexOf(k) !== -1; });
    if (mkey) {
      var target = M[mkey];
      rs.forEach(function(r, i){
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
    function(b){ return /submit/i.test(b.innerText || b.value || b.textContent || ''); }
  );
  if (sub) {
    if (confirm('SurveyBot: ' + n + '/' + order.length + ' answers filled.' + String.fromCharCode(10) + 'OK = submit | Cancel = review first'))
      sub.click();
  } else {
    alert('SurveyBot: ' + n + ' answers filled. Click Submit Answers.');
  }
  console.log('%cSurveyBot: ' + n + '/' + order.length + ' done', 'color:#10b981;font-weight:bold;font-size:13px');
})();
```

---

## Answer key

| # | Question | Answer selected |
|---|----------|----------------|
| 1 | Knowledge of the Teacher | Excellent |
| 2 | Clarity & Understandability | Excellent |
| 3 | Willingness to help | Excellent |
| 4 | Percentage of class not engaged | < 10% |
| 5 | Whether the teacher dictates notes only | No |
| 6 | Ability to organise lectures | Excellent |
| 7 | Speed of presentation | Just Right |
| 8 | Does the teacher encourage questioning | Yes |
| 9 | Behavior of the teacher | Pleasant |
| 10 | Sincerity of the teacher | Sincere |
| 11 | Overall teaching effectiveness | Excellent |

---

## Using on mobile

The browser console isn't directly available on mobile browsers. Options:

**Android — Kiwi Browser (easiest)**
Install [Kiwi Browser](https://play.google.com/store/apps/details?id=com.kiwibrowser.browser) from the Play Store. It supports full Chrome DevTools on Android. Open etlab, press the menu → DevTools.

**Android — USB Debugging**
Enable Developer Options on your phone → turn on USB Debugging → connect to a PC → open `chrome://inspect` in Chrome on the PC → find your device and inspect.

**iPhone / iOS**
Settings → Safari → Advanced → Web Inspector. Connect to a Mac via USB. Open Safari on Mac → Develop menu → your device → inspect the page.

If none of these work, just use a laptop — the whole thing takes under 2 minutes.

---

## Is this safe?

**What the script does:**
- Reads radio inputs already on the page
- Clicks the correct option for each question
- Clicks the existing Submit button
- Logs a count to the console

**What it does NOT do:**
- Send data anywhere outside etlab
- Access your cookies, passwords, or localStorage
- Make network requests to any third-party server
- Affect any other tab or page

The script is fully readable above — no minification, no obfuscation. Read it before you paste it. This is general advice for any console script from any source.

---

## Files

```
etlab-surveybot/
├── index.html    — page structure
├── style.css     — all styles, fully responsive
├── script.js     — UI logic + the survey filler script
└── README.md
```

No build step. No npm. Open `index.html` in a browser and it works.

---

## Contributing

If the script shows **"0 answers filled"** on your college's etlab, open an issue and paste the output of this debug script run on the question page:

```js
(function(){
  console.clear();
  var radios = document.querySelectorAll('input[type=radio]');
  console.log('Radios found:', radios.length);
  if (!radios.length) { console.error('No radios on this page!'); return; }
  var r = radios[0];
  console.log('id:', r.id, '| name:', r.name, '| value:', r.value);
  console.log('outerHTML:', r.outerHTML);
  console.log('parent:', r.parentElement.outerHTML.slice(0, 300));
  var sib = r.nextSibling;
  console.log('nextSibling type:', sib ? sib.nodeType : 'none', sib ? (sib.textContent||'').trim().slice(0,40) : '');
})();
```

Pull requests to support additional question sets or etlab variants are welcome.

---

## License

MIT — do whatever you want with it.

---