(function () {
  'use strict';

  var WA = 'https://wa.me/213774161251?text=';
  var MSG = {
    general: {
      en: "Hi Amine! I found your website and I'd like to talk about a video project.",
      ar: 'مرحباً أمين، وجدت موقعك وأريد التحدث عن مشروع فيديو.'
    },
    pack1: {
      en: "Hi Amine, I'm interested in the Starter package (6 reels + 6 covers — 70 €). Can we talk?",
      ar: 'مرحباً أمين، مهتم بباقة البداية (6 ريلز + 6 أغلفة — 70 €). ممكن نتحدث؟'
    },
    pack2: {
      en: "Hi Amine, I'm interested in the Launch package (15 reels + 15 covers — 140 €). Can we talk?",
      ar: 'مرحباً أمين، مهتم بباقة الانطلاقة (15 ريل + 15 غلاف — 140 €). ممكن نتحدث؟'
    },
    pack3: {
      en: "Hi Amine, I'm interested in the Growth package (30 reels + 4 YouTube — 259 €). Can we talk?",
      ar: 'مرحباً أمين، مهتم بباقة الصعود (30 ريل + 4 يوتيوب — 259 €). ممكن نتحدث؟'
    }
  };

  var html = document.documentElement;
  html.classList.add('js');
  var lang = 'en';

  function waLink(key) {
    var m = MSG[key] || MSG.general;
    return WA + encodeURIComponent(m[lang] || m.en);
  }

  function applyLang(next) {
    lang = next;
    html.lang = next;
    html.dir = next === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-en]').forEach(function (el) {
      var val = el.getAttribute('data-' + next);
      if (val !== null) el.textContent = val;
    });
    document.querySelectorAll('[data-en-html]').forEach(function (el) {
      var val = el.getAttribute('data-' + next + '-html');
      if (val !== null) el.innerHTML = val;
    });
    document.querySelectorAll('[data-wa]').forEach(function (el) {
      el.setAttribute('href', waLink(el.getAttribute('data-wa')));
    });
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-lang') === next);
    });
    try { localStorage.setItem('ab-lang', next); } catch (e) {}
  }

  document.querySelectorAll('[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () { applyLang(btn.getAttribute('data-lang')); });
  });

  // nav background on scroll
  var nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('nav-solid', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile menu
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // work filter
  var tabs = document.querySelectorAll('.tab');
  var cards = document.querySelectorAll('.work-card');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var cat = tab.getAttribute('data-cat');
      tabs.forEach(function (t) { t.classList.toggle('on', t === tab); });
      cards.forEach(function (card) {
        var show = cat === 'all' || card.getAttribute('data-cat') === cat;
        card.classList.toggle('hide', !show);
        if (show) card.classList.add('in');
      });
    });
  });

  // reveal on scroll
  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // year
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  // restore language
  var saved = null;
  try { saved = localStorage.getItem('ab-lang'); } catch (e) {}
  applyLang(saved === 'ar' ? 'ar' : 'en');
})();
