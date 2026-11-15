/* minoU-amine.github.io — page statique, données live depuis l'API GitHub */
const USER = "minoU-amine";
const API = `https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`;

const T = {
  fr: {
    star: (n) => `${n} étoile${n > 1 ? "s" : ""}`,
    pushed: (d) => `mise à jour ${d}`,
    noDesc: "Pas encore de description.",
    err: "GitHub n'a pas répondu — réessaie dans un instant.",
    rate: "Limite de l'API GitHub atteinte. Réessaie dans quelques minutes.",
    langs: (n) => `${n}`,
    now: "à l'instant",
    days: (n) => `il y a ${n} j`,
    months: (n) => `il y a ${n} mois`,
  },
  ar: {
    star: (n) => `${n} نجمة`,
    pushed: (d) => `آخر تحديث ${d}`,
    noDesc: "لا يوجد وصف بعد.",
    err: "GitHub لم يستجب — أعد المحاولة بعد قليل.",
    rate: "تم بلوغ حد واجهة GitHub. أعد المحاولة بعد دقائق.",
    langs: (n) => `${n}`,
    now: "الآن",
    days: (n) => `قبل ${n} يوم`,
    months: (n) => `قبل ${n} شهر`,
  },
};

let lang = localStorage.getItem("lang") === "ar" ? "ar" : "fr";
let repos = [];

const $ = (s) => document.querySelector(s);
const el = (tag, cls) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  return n;
};
const arrow = () => `<i data-lucide="arrow-up-right"></i>`;
const star = () => `<i data-lucide="star"></i>`;
const clock = () => `<i data-lucide="clock"></i>`;

function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 864e5);
  if (d < 1) return T[lang].now;
  if (d < 30) return T[lang].days(d);
  return T[lang].months(Math.max(1, Math.floor(d / 30)));
}

function applyLang(next) {
  lang = next;
  localStorage.setItem("lang", lang);
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === "ar" ? "rtl" : "ltr";
  document.body.dir = html.dir;
  document.querySelectorAll("[data-fr]").forEach((n) => {
    const txt = n.getAttribute(`data-${lang}`);
    if (txt) n.textContent = txt;
  });
  $("#langLabel").textContent = lang === "fr" ? "ع" : "FR";
  $("#langBtn").setAttribute("aria-label", lang === "fr" ? "Passer à l'arabe" : "التبديل إلى الفرنسية");
  renderRepos();
  if (window.lucide) lucide.createIcons();
}

function card(r) {
  const a = el("a", "card");
  a.href = r.html_url;
  a.target = "_blank";
  a.rel = "noopener";

  const top = el("div", "card-top");
  const name = el("span", "card-name");
  name.innerHTML = `${r.name}${arrow()}`;
  top.append(name);

  const desc = el("p", "card-desc");
  desc.textContent = r.description || T[lang].noDesc;

  const meta = el("div", "card-meta");
  if (r.language) {
    const lg = el("span", "lang-dot");
    lg.innerHTML = `<i></i>${r.language}`;
    meta.append(lg);
  }
  if (r.stargazers_count > 0) {
    const st = el("span", "meta-item");
    st.innerHTML = `${star()}${r.stargazers_count}`;
    meta.append(st);
  }
  const up = el("span", "meta-item");
  up.innerHTML = `${clock()}${relTime(r.pushed_at)}`;
  meta.append(up);

  a.append(top, desc, meta);
  return a;
}

function renderRepos() {
  const grid = $("#repoGrid");
  if (!grid) return;
  grid.textContent = "";
  const empty = $("#emptyState");
  if (repos.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  repos.forEach((r, i) => {
    const c = card(r);
    c.style.animationDelay = `${i * 45}ms`;
    grid.append(c);
  });
  if (window.lucide) lucide.createIcons();
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 4200);
}

async function load() {
  try {
    const res = await fetch(API, { headers: { Accept: "application/vnd.github+json" } });
    if (res.status === 403 || res.status === 429) throw new Error("rate");
    if (!res.ok) throw new Error("http");
    const data = await res.json();
    repos = (Array.isArray(data) ? data : [])
      .filter((r) => !r.fork && !r.archived && r.name !== "minou-amine.github.io")
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

    const langs = new Set(repos.map((r) => r.language).filter(Boolean));
    $("#statRepos").textContent = repos.length;
    $("#statLangs").textContent = langs.size;
    $("#statUpdated").textContent = repos.length ? relTime(repos[0].pushed_at) : "—";
    renderRepos();
  } catch (e) {
    const grid = $("#repoGrid");
    grid.textContent = "";
    const empty = $("#emptyState");
    empty.hidden = false;
    empty.innerHTML = `<i data-lucide="wifi-off"></i><span>${
      e.message === "rate" ? T[lang].rate : T[lang].err
    }</span>`;
    if (window.lucide) lucide.createIcons();
    toast(e.message === "rate" ? T[lang].rate : T[lang].err);
  }
}

function init() {
  $("#year").textContent = new Date().getFullYear();
  $("#langBtn").addEventListener("click", () => applyLang(lang === "fr" ? "ar" : "fr"));
  if (localStorage.getItem("lang") === "ar") {
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    document.body.dir = "rtl";
  }
  applyLang(lang);
  load();
}

document.addEventListener("DOMContentLoaded", init);
