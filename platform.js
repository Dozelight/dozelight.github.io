// Dozelight has a page per platform. A visitor's choice in the macOS / Windows switch is remembered.
// Without a choice, the home page (the Mac page) sends Windows visitors to the Windows page, and each
// page offers the other one when the visitor seems to be on that platform. Loaded in <head>, before the page draws.
(function () {
  var ua = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || "";
  var iPad = /Mac/i.test(ua) && navigator.maxTouchPoints > 1;  // iPads report themselves as Macs
  var detected = /Win/i.test(ua) ? "windows" : /Mac/i.test(ua) && !iPad ? "mac" : null;
  var chosen = null;
  try { chosen = localStorage.getItem("platform"); } catch (e) {}
  var root = document.documentElement, page = root.getAttribute("data-platform");
  // Search engine crawlers (Bing's runs on Windows) always get the page they asked for.
  var crawler = /bot|crawl|spider|slurp|bing|google|yandex|duckduck|baidu|facebookexternalhit|embedly|preview/i.test(navigator.userAgent);
  if (root.hasAttribute("data-home") && !chosen && detected && detected !== page && !crawler) {
    location.replace("windows.html" + location.hash);
    return;
  }
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-choose]").forEach(function (link) {
      link.addEventListener("click", function () {
        try { localStorage.setItem("platform", link.getAttribute("data-choose")); } catch (e) {}
      });
    });
    var hint = document.getElementById("platform-hint");
    if (hint && detected && page && detected !== page && !chosen) hint.hidden = false;
  });
})();
