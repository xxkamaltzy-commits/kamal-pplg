'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Theme toggle (remembered) ---------- */
const themeBtn = $('#themeBtn');
function applyTheme(t) {
  root.setAttribute('data-theme', t);
  themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  try { localStorage.setItem('theme', t); } catch (e) {}
}
let saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) {}
applyTheme(saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
themeBtn.addEventListener('click', () =>
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

/* ---------- 2. Hamburger menu ---------- */
const menu = $('#menu'), burger = $('#burger');
function setMenu(open) {
  menu.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  burger.textContent = open ? '✕' : '☰';
}
burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
$$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
matchMedia('(min-width: 821px)').addEventListener('change', e => e.matches && setMenu(false));

/* ---------- 4. Active nav link ---------- */
const links = $$('.menu a');
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting)
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id], footer[id]').forEach(s => spy.observe(s));

/* ---------- 3. Scroll progress + back-to-top ---------- */
const progress = $('#progress'), toTop = $('#toTop');
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  toTop.classList.toggle('show', scrollY > 400);
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- 5. Typing effect ---------- */
const roles = ['Web Developer', 'UI/UX Enthusiast', 'Problem Solver', 'Lifelong Learner'];
const typing = $('#typing');
let ri = 0, ci = 0, del = false;
function type() {
  const word = roles[ri];
  typing.textContent = word.slice(0, del ? --ci : ++ci);
  let delay = del ? 45 : 95;
  if (!del && ci === word.length) { del = true; delay = 1400; }
  else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; delay = 350; }
  setTimeout(type, delay);
}
reduceMotion ? (typing.textContent = roles[0]) : type();

/* ---------- 6. Reveal on scroll + counters + skill bars ---------- */
function countUp(el) {
  const target = +el.dataset.count;
  if (reduceMotion) { el.textContent = target; return; }
  const t0 = performance.now();
  (function step(now) {
    const p = Math.min((now - t0) / 1400, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
const reveal = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    $$('[data-count]', en.target).forEach(countUp);
    $$('.bar i', en.target).forEach(b => (b.style.width = b.dataset.w + '%'));
    reveal.unobserve(en.target);
  });
}, { threshold: 0.15 });
$$('.reveal').forEach(el => reveal.observe(el));

/* ---------- 7. Project filter ---------- */
$('#filters').addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  $$('.chip').forEach(c => c.classList.toggle('active', c === btn));
  $$('.card').forEach(card =>
    card.classList.toggle('hide', btn.dataset.f !== 'all' && card.dataset.c !== btn.dataset.f));
});

/* ---------- 8. Photo fallback (if image file is missing) ---------- */
function placeholder(n) {
  const c = n === '1' ? ['#22d3ee', '#a78bfa'] : ['#f472b6', '#a78bfa'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs>
    <rect width="300" height="400" fill="url(#g)"/>
    <circle cx="150" cy="150" r="58" fill="rgba(255,255,255,.85)"/>
    <path d="M45 400c0-85 48-130 105-130s105 45 105 130z" fill="rgba(255,255,255,.85)"/></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
$$('img[data-fallback]').forEach(img =>
  img.addEventListener('error', () => { img.src = placeholder(img.dataset.fallback); }, { once: true }));

/* ---------- 9. Contact form (opens email app) ---------- */
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#name').value.trim(), email = $('#email').value.trim(), msg = $('#msg').value.trim();
  const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
  location.href = `mailto:muhammad.kamaludin@example.com?subject=${encodeURIComponent('Pesan dari ' + name)}&body=${body}`;
});

/* ---------- 10. Footer year ---------- */
$('#year').textContent = new Date().getFullYear();

/* ---------- 11. Particle background (canvas) ---------- */
(function particles() {
  if (reduceMotion) return;
  const cv = $('#bg'), ctx = cv.getContext('2d');
  let w, h, pts = [];
  const mouse = { x: -999, y: -999 };
  function resize() {
    w = cv.width = innerWidth; h = cv.height = innerHeight;
    const n = Math.min(90, Math.floor((w * h) / 18000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, r: Math.random() * 1.8 + .6
    }));
  }
  addEventListener('resize', resize);
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  resize();
  (function draw() {
    ctx.clearRect(0, 0, w, h);
    const light = root.getAttribute('data-theme') === 'light';
    const rgb = light ? '80,70,170' : '200,215,255';
    pts.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = `rgba(${rgb},.7)`; ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) {
          ctx.strokeStyle = `rgba(${rgb},${.18 * (1 - d / 120)})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 160) {
        ctx.strokeStyle = `rgba(${rgb},${.35 * (1 - dm / 160)})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    });
    requestAnimationFrame(draw);
  })();
})();