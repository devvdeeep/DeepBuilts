/* ============ IronPulse Fitness — Interactions ============ */

// ---- Loading Screen ----
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('done'), 900);
});

// ---- Year ----
document.getElementById('year').textContent = new Date().getFullYear();

// ---- Sticky Navbar ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ---- Mobile menu ----
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
}));

// ---- Scroll Reveal ----
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObs.observe(el));

// ---- Counters ----
const counters = document.querySelectorAll('.counter h3');
const countObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.target;
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.floor(eased * target);
      el.textContent = val.toLocaleString() + (target >= 1000 ? '+' : '');
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString() + (target >= 1000 ? '+' : '');
    };
    requestAnimationFrame(step);
    countObs.unobserve(el);
  });
}, { threshold: 0.4 });
counters.forEach(c => countObs.observe(c));

// ---- BMI Calculator ----
const bmiCalc = document.getElementById('bmiCalc');
const bmiHeight = document.getElementById('bmiHeight');
const bmiWeight = document.getElementById('bmiWeight');
const bmiAge = document.getElementById('bmiAge');
const bmiResult = document.getElementById('bmiResult');
const bmiNum = bmiResult.querySelector('.bmi-num');
const bmiCat = bmiResult.querySelector('.bmi-cat');
const bmiMarker = document.getElementById('bmiMarker');

function classifyBMI(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#f4a13b', tip: 'Fuel up. Our coaches can build a lean-mass plan for you.' };
  if (bmi < 25)   return { label: 'Healthy',      color: '#3ecf6b', tip: 'Solid baseline — let\'s level you up.' };
  if (bmi < 30)   return { label: 'Overweight',   color: '#f2c94c', tip: 'A focused plan can shift this fast.' };
  return { label: 'Obese', color: '#e10600', tip: 'We\'ve helped hundreds start here. You can too.' };
}

function calcBMI() {
  const h = parseFloat(bmiHeight.value);
  const w = parseFloat(bmiWeight.value);
  const age = parseFloat(bmiAge.value);

  if (!h || !w || h < 50 || w < 20) {
    bmiNum.textContent = '—';
    bmiCat.textContent = 'Please enter valid height & weight';
    bmiCat.style.color = '#e10600';
    bmiMarker.classList.remove('show');
    return;
  }

  const bmi = w / Math.pow(h / 100, 2);
  const info = classifyBMI(bmi);
  bmiNum.textContent = bmi.toFixed(1);
  bmiNum.style.color = info.color;
  bmiCat.innerHTML = `<strong style="color:${info.color}">${info.label}</strong>${age ? ` · Age ${age}` : ''} — <span style="color:#aaa">${info.tip}</span>`;
  bmiCat.style.color = '#ddd';

  // Position marker on the 15/50/25/10 band (0-40 range mapped visually)
  // Bands: <18.5 (0-15%), 18.5-25 (15-45%), 25-30 (45-70%), 30+ (70-100%)
  let pct;
  if (bmi < 18.5) pct = (bmi / 18.5) * 15;
  else if (bmi < 25) pct = 15 + ((bmi - 18.5) / 6.5) * 30;
  else if (bmi < 30) pct = 45 + ((bmi - 25) / 5) * 25;
  else pct = Math.min(70 + ((bmi - 30) / 15) * 30, 100);

  bmiMarker.style.left = `calc(${pct}% - 2px)`;
  bmiMarker.classList.add('show');
}

bmiCalc.addEventListener('click', calcBMI);
[bmiHeight, bmiWeight].forEach(inp => inp.addEventListener('keydown', e => {
  if (e.key === 'Enter') calcBMI();
}));

// ---- Smooth active nav highlight (optional subtle) ----
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');
const spyObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.getAttribute('id');
      navItems.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}` ? '#fff' : '';
      });
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spyObs.observe(s));
