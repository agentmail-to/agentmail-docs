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
