// Dozelight has a page per platform. A visitor's choice in the macOS / Windows switch is remembered.
// Without a choice, each page offers the other one when the visitor seems to be on that platform. (The home
// page's redirect for Windows visitors is inline in index.html, so it runs before the page draws.) Loaded with defer.
(function () {
  var ua = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || "";
  var iPad = /Mac/i.test(ua) && navigator.maxTouchPoints > 1;  // iPads report themselves as Macs
  var detected = /Win/i.test(ua) ? "windows" : /Mac/i.test(ua) && !iPad ? "mac" : null;
  var chosen = null;
  try { chosen = localStorage.getItem("platform"); } catch (e) {}
  var page = document.documentElement.getAttribute("data-platform");
  document.querySelectorAll("[data-choose]").forEach(function (link) {
    link.addEventListener("click", function () {
      try { localStorage.setItem("platform", link.getAttribute("data-choose")); } catch (e) {}
    });
  });
  var hint = document.getElementById("platform-hint");
  if (hint && detected && page && detected !== page && !chosen) hint.hidden = false;
})();
