// Canonical URL: point both instances to agentmail.to/docs/...
// docs.agentmail.to/quickstart → canonical: agentmail.to/docs/quickstart
// agentmail.to/docs/quickstart → canonical: agentmail.to/docs/quickstart (already correct)
(function () {
  var link = document.querySelector('link[rel="canonical"]');
  var host = window.location.hostname;
  var path = window.location.pathname;

  var canonicalPath = host === "docs.agentmail.to"
    ? "/docs" + path  // prepend /docs for subdomain
    : path;           // subpath instance already has /docs

  var canonicalUrl = "https://agentmail.to" + canonicalPath;

  if (link) {
    link.href = canonicalUrl;
  } else {
    link = document.createElement("link");
    link.rel = "canonical";
    link.href = canonicalUrl;
    document.head.appendChild(link);
  }
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
