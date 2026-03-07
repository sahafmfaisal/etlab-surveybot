# etlab SurveyBot

> Automatically fill teacher evaluation surveys on [etlab.in](https://etlab.in) — any college, any department, any semester.

One script. Paste it in the browser console on an etlab survey page. All questions answered and submitted in under 3 seconds.

[![SurveyBot on Product Hunt](https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1091907&theme=dark&t=1772875883066)](https://www.producthunt.com/products/surveybot-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-surveybot-2)

<img width="1834" height="959" alt="screenshot2026-03-07165410" src="https://github.com/user-attachments/assets/0a2eaf12-3883-49b0-939e-c2418341a727" />
<img width="1852" height="962" alt="Screenshot from 2026-03-07 01-26-21" src="https://github.com/user-attachments/assets/f235b8c6-3ea3-4cd9-889a-52ac3f0b9123" />

---

## How it works

Open a teacher evaluation survey on etlab → press `F12` → go to the **Console** tab → paste the script → hit `Enter`.

That's it. The script reads each question, matches it to the best answer, clicks the radio button, and submits the form.

For every subject after the first: go back to the survey list, click the next subject, then press `↑` in the console to recall the script and hit `Enter` again.

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

All answers are customisable via the website before copying.

---

## Using on mobile

The browser console isn't directly available on mobile browsers. Options:

**Android — Kiwi Browser (easiest)**
Install [Kiwi Browser](https://play.google.com/store/apps/details?id=com.kiwibrowser.browser) from the Play Store. It supports full Chrome DevTools on Android. Open etlab, press the menu → DevTools.

**Android — USB Debugging**
Enable Developer Options on your phone → turn on USB Debugging → connect to a PC → open `chrome://inspect` in Chrome on the PC → find your device and inspect.

**iPhone / iOS**
Settings → Safari → Advanced → Web Inspector. Connect to a Mac via USB. Open Safari on Mac → Develop menu → your device → inspect the page.

If none of these work, just use a laptop — the whole thing takes under 3 minutes.

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
├── index.html          
├── style.css           
├── script.js           
├── counter-worker.js   
├── wrangler.toml       
├── README.md           
├── favicon.png         
├── .gitignore          
├── CNAME               
└── LICENSE    
         
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
