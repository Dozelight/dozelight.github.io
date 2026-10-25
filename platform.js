// Dozelight has a page per platform. A visitor's choice in the macOS / Windows switch is remembered.
// Without a choice, each page offers the other one when the visitor seems to be on that platform: that hint is shown by a
// script right after it in the page, and the home page's redirect for Windows visitors is inline in index.html, so both
// happen before the page draws. Loaded with defer.
(function () {
  document.querySelectorAll("[data-choose]").forEach(function (link) {
    link.addEventListener("click", function () {
      try { localStorage.setItem("platform", link.getAttribute("data-choose")); } catch (e) {}
    });
  });
  // The header's language link remembers the choice, so the English pages stop sending a Polish browser to /pl/.
  document.querySelectorAll("[data-lang]").forEach(function (link) {
    link.addEventListener("click", function () {
      try { localStorage.setItem("lang", link.getAttribute("data-lang")); } catch (e) {}
    });
  });
})();
