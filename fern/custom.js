// llms.txt discoverability
(function () {
  var link = document.createElement("link");
  link.rel = "help";
  link.type = "text/markdown";
  link.href = "/llms.txt";
  document.head.appendChild(link);
})();

// Reo.dev tracking script
!(function () {
  var e, t, n;
  (e = "b38ba24420b76f6"),
    (t = function () {
      Reo.init({ clientID: "b38ba24420b76f6" });
    }),
    ((n = document.createElement("script")).src =
      "https://static.reo.dev/" + e + "/reo.js"),
    (n.defer = !0),
    (n.onload = t),
    document.head.appendChild(n);
})();

// First-touch attribution. Mirrors packages/next-ui/src/lib/attribution.ts and
// consent.ts in agentmail-web: one cookie, agentmail_attribution_v1, written on
// Domain=agentmail.to so the console can read at signup where a docs visitor
// came from. No analytics SDK, no network calls.
(function () {
  try {
    var host = location.hostname;
    if (host !== "agentmail.to" && !/\.agentmail\.to$/.test(host)) return;
    var cookie = function (name) {
      var found = document.cookie.split(";").map(function (part) { return part.trim(); })
        .filter(function (part) { return part.indexOf(name + "=") === 0; })[0];
      return found ? found.slice(name.length + 1) : undefined;
    };
    // Consent: an explicit answer wins. Without one, a Global Privacy Control
    // signal refuses, and a visitor the landing site placed in an opt-in region
    // waits for the banner. Everyone else is captured.
    var consent = cookie("agentmail_consent_v1");
    if (consent !== undefined && consent !== "1" && consent !== "true") return;
    if (consent === undefined) {
      if (navigator.globalPrivacyControl) return;
      var region = cookie("agentmail_consent_region");
      if (region !== undefined && region !== "opt-out") return;
    }
    var now = Date.now();
    var path = location.pathname;
    if (host !== "docs.agentmail.to" && path.indexOf("/docs") !== 0) path = "/docs" + path;
    var touch = { captured_at: new Date(now).toISOString(), landing_path: path.slice(0, 256), referring_domain: "$direct" };
    try { touch.referring_domain = new URL(document.referrer).hostname.toLowerCase() || "$direct"; } catch (e) {}
    var params = new URLSearchParams(location.search), tagged = false;
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (key) {
      var value = (params.get(key) || "").trim();
      if (value) { touch[key] = value.slice(0, 200); tagged = true; }
    });
    var referrer = touch.referring_domain;
    var owned = referrer === "agentmail.to" || referrer === "agentmail.md" || /\.agentmail\.(to|md)$/.test(referrer);
    var nonDirect = tagged || (referrer !== "$direct" && !owned);
    var state;
    try { state = JSON.parse(decodeURIComponent(cookie("agentmail_attribution_v1"))); } catch (e) {}
    if (!state || !state.first_touch || !(state.expires_at > now)) {
      // A first visit sent here by another host we run stays a direct-class
      // touch that keeps its origin; a reload or same-host hop writes nothing.
      if (!nonDirect && referrer !== "$direct" && !(owned && referrer !== host)) return;
      state = { first_touch: touch, expires_at: now + 30 * 24 * 60 * 60 * 1000 };
    } else if (!nonDirect) return;
    if (nonDirect) state.last_non_direct_touch = touch;
    var value = encodeURIComponent(JSON.stringify(state));
    if (value.length > 3700) return;
    document.cookie = "agentmail_attribution_v1=" + value + "; Domain=agentmail.to; Path=/; Max-Age=" +
      Math.floor((state.expires_at - now) / 1000) + "; SameSite=Lax; Secure";
  } catch (e) {}
})();
