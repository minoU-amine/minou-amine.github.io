/* ============================================================
   Amine Bechiri — tracking layer
   Fill the IDs below and everything fires automatically.
   Leave an ID empty ("") and that platform is simply skipped.
   ============================================================ */
window.TRACK_CONFIG = {
  // NOTE: this must be the DATASET / PIXEL ID shown under the dataset name
  // (e.g. "ads oman" -> 1390654969578339) — NOT the ad-account ID in the top bar.
  metaPixelId:  "1390654969578339",
  // Meta's fbevents.js loads from Meta's own CDN first (fast, already cached in most
  // browsers). ./fb-events.js is a self-hosted fallback used automatically if a host
  // blocks connect.facebook.net. Refresh it with:
  //   curl -o fb-events.js https://connect.facebook.net/en_US/fbevents.js
  metaScript:   "./fb-events.js",
  tiktokPixelId:"",   // TikTok Events Manager -> Pixel code          e.g. "CXXXXXXXXXXXXXXXXXXX"
  ga4Id:        "",   // Google Analytics 4 measurement ID            e.g. "G-XXXXXXXXXX"
  googleAdsId:  "",   // optional Google Ads conversion tag           e.g. "AW-123456789"
  requireConsent: false // false = fire the pixel for every visitor (max ad attribution), no banner
};

(function () {
  var C = window.TRACK_CONFIG || {};
  var hasIds = !!(C.metaPixelId || C.tiktokPixelId || C.ga4Id || C.googleAdsId);
  if (!hasIds) return;                       // nothing configured -> zero footprint

  var KEY = "ab_consent_v1";
  var DEBUG = /[?&]debug=1/.test(location.search);

  function consent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  /* ---------- source / click-id capture (no cookies) ---------- */
  var params = new URLSearchParams(location.search);
  var src = {};
  ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid","ttclid","gclid"].forEach(function (k) {
    if (params.get(k)) src[k] = params.get(k);
  });
  if (Object.keys(src).length) {
    try {
      sessionStorage.setItem("ab_src", JSON.stringify(src));
      if (!localStorage.getItem("ab_src_first")) {
        localStorage.setItem("ab_src_first", JSON.stringify(src));
      }
    } catch (e) {}
  }
  window.__abSource = function () {
    try { return JSON.parse(sessionStorage.getItem("ab_src") || "{}"); } catch (e) { return {}; }
  };

  /* ---------- pixel loaders ---------- */
  function loadMeta() {
    if (!C.metaPixelId || window.fbq) return;
    var n = window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];

    // Meta CDN first; self-hosted copy as automatic fallback.
    var CDN = 'https://connect.facebook.net/en_US/fbevents.js';
    var LOCAL = C.metaScript || './fb-events.js';
    (function inject(src) {
      var s = document.createElement('script');
      s.async = true;
      s.src = src;
      s.onerror = function () { if (src !== LOCAL) inject(LOCAL); };
      document.head.appendChild(s);
    })(CDN);

    fbq('init', C.metaPixelId);
    if (src.fbclid) fbq('set', 'ad_storage', 'allow');
    fbq('track', 'PageView');
  }

  function loadTikTok() {
    if (!C.tiktokPixelId || window.ttq) return;
    !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
    ttq.methods=["page","track","identify","instances","debug","on","off","once",
    "ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
    ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
    for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
    ttq.instance=function(t){var e=ttq._i[t]||[];for(var n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
    ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
    ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";
    o.async=!0;o.src=r+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];
    a.parentNode.insertBefore(o,a)};
    ttq.load(C.tiktokPixelId);ttq.page();}(window,document,'ttq');
  }

  function loadGA() {
    var first = C.ga4Id || C.googleAdsId;
    if (!first || window.gtag) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(first);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    if (C.ga4Id) gtag("config", C.ga4Id, { anonymize_ip: true });
    if (C.googleAdsId) gtag("config", C.googleAdsId);
  }

  function boot() { loadMeta(); loadTikTok(); loadGA(); }

  /* ---------- one unified event API ---------- */
  // window.__track('Lead', { content_name: 'hero' })
  window.__track = function (event, data) {
    data = data || {};
    if (DEBUG) console.log("[track]", event, data);
    if (window.fbq) fbq("track", event === "ViewContent" ? "ViewContent" : event, data);
    if (window.ttq) {
      var map = { Lead: "SubmitForm", Contact: "Contact", ViewContent: "ViewContent", PageView: "Pageview" };
      ttq.track(map[event] || event, data);
    }
    if (window.gtag) {
      var gmap = { Lead: "generate_lead", Contact: "contact", ViewContent: "view_item" };
      gtag("event", gmap[event] || event, data);
    }
  };

  /* ---------- automatic event wiring ---------- */
  function wire() {
    document.addEventListener("click", function (ev) {
      var a = ev.target.closest("a,button");
      if (!a) return;
      var href = a.getAttribute("href") || "";
      var wa = a.getAttribute("data-wa");

      // WhatsApp CTA -> Contact (+ Lead on the two main ones)
      if (wa || /wa\.me|whatsapp\.com/.test(href)) {
        var tag = wa || "cta";
        window.__track("Contact", { content_name: "whatsapp_" + tag, content_category: "whatsapp" });
        if (wa === "hero" || wa === "contact" || /pack/.test(wa || "")) {
          window.__track("Lead", { content_name: "whatsapp_" + tag, value: 0, currency: "DZD" });
        }
        return;
      }

      if (/instagram\.com/.test(href)) {
        window.__track("ViewContent", { content_name: "instagram_profile" });
        return;
      }
      if (/^mailto:/.test(href)) {
        window.__track("Lead", { content_name: "email_click", value: 0, currency: "DZD" });
        return;
      }
      if (/^tel:/.test(href)) {
        window.__track("Contact", { content_name: "phone_click" });
        return;
      }

      // portfolio item / reel opened
      if (a.closest(".work-item,.reel,[data-work]") || a.matches("[data-work],.card")) {
        var label = (a.getAttribute("data-work") || a.getAttribute("aria-label") || "portfolio") + "";
        window.__track("ViewContent", { content_name: "work_" + label.slice(0, 40) });
      }
    }, true);
  }

  /* ---------- consent banner (only when pixels are configured) ---------- */
  function banner() {
    var el = document.createElement("div");
    el.id = "ab-consent";
    el.innerHTML =
      '<style>' +
      '#ab-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;' +
      'display:flex;gap:14px;flex-wrap:wrap;align-items:center;justify-content:space-between;' +
      'padding:16px 18px;border-radius:16px;background:rgba(18,16,14,.92);' +
      'backdrop-filter:blur(14px);border:1px solid rgba(244,240,232,.14);' +
      'box-shadow:0 18px 50px rgba(0,0,0,.55);font-family:\'Inter Tight\',system-ui,sans-serif;' +
      'color:#f4f0e8;font-size:14px;line-height:1.5;max-width:760px;margin:0 auto}' +
      '#ab-consent p{margin:0;max-width:520px;color:#c9c2b8}' +
      '#ab-consent b{color:#f4f0e8}' +
      '#ab-consent .ab-ar{display:block;margin-top:7px;color:#b6afa5;font-size:13px;line-height:1.85}' +
      '#ab-consent .ab-btns{display:flex;gap:8px;flex-shrink:0}' +
      '#ab-consent button{font:inherit;font-weight:600;padding:9px 16px;border-radius:999px;' +
      'border:1px solid rgba(244,240,232,.22);background:transparent;color:#f4f0e8;cursor:pointer}' +
      '#ab-consent button.ab-ok{background:#eaa43f;color:#150f04;border-color:#eaa43f}' +
      '#ab-consent button:hover{transform:translateY(-1px)}' +
      '@media(max-width:560px){#ab-consent{bottom:84px;font-size:13px}}' +
      '</style>' +
      '<p><b>Cookies.</b> We use measurement cookies (Meta / TikTok) to identify which ads bring clients. ' +
      'No data is sold.' +
      '<span class="ab-ar" dir="rtl" lang="ar">نستخدم ملفات تعريف الارتباط (كوكيز) للقياس لمعرفة الإعلانات التي تجلب العملاء. لا يتم بيع أي بيانات.</span></p>' +
      '<div class="ab-btns"><button type="button" class="ab-no">Refuse</button>' +
      '<button type="button" class="ab-ok">Accept</button></div>';
    document.body.appendChild(el);
    el.querySelector(".ab-ok").onclick = function () { setConsent("granted"); el.remove(); boot(); };
    el.querySelector(".ab-no").onclick = function () { setConsent("denied"); el.remove(); };
  }

  /* ---------- footer link to change the choice later ---------- */
  function reopenLink() {
    var host = document.querySelector("footer .container") || document.querySelector("footer");
    if (!host) return;
    var a = document.createElement("button");
    a.type = "button";
    a.textContent = "Cookies";
    a.style.cssText = "background:none;border:0;color:#9b938a;font:inherit;font-size:12px;cursor:pointer;padding:0;text-decoration:underline";
    a.onclick = function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      banner();
    };
    host.appendChild(a);
  }

  /* ---------- init ---------- */
  function start() {
    wire();
    reopenLink();
    var state = consent();
    if (!C.requireConsent) return boot();
    if (state === "granted") return boot();
    if (state === "denied") return;
    banner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
