// Dozelight website: interactive tint demo, waitlist form and small effects.

// To collect emails, paste a form endpoint here (for example from Formspree, Tally or Buttondown).
// While it's empty, the page offers "Watch for the release on GitHub" instead.
const WAITLIST_ENDPOINT = "https://formspree.io/f/mljdanql";

// --- Tint demo -------------------------------------------------------------
// Same model as the app: blackbody RGB (Tanner Helland's fit) relative to 6500K white,
// applied as a multiply, which is what a display gamma table does.
function blackbody(k) {
  const t = k / 100;
  const g = Math.min(255, Math.max(0, 99.4708025861 * Math.log(t) - 161.1195681661));
  const b = t <= 19 ? 0 : Math.min(255, Math.max(0, 138.5177312231 * Math.log(t - 10) - 305.0447927307));
  return [255, g, b];
}
const WHITE = blackbody(6500);
function gains(k) {
  const c = blackbody(k);
  return c.map((v, i) => Math.min(1, v / WHITE[i]));
}

const MIN_K = 1000, MAX_K = 6500;
const slider = document.getElementById("kelvin");
const tint = document.getElementById("tint");
const readout = document.getElementById("readout");
const label = document.getElementById("readout-label");
const presetButtons = [...document.querySelectorAll(".presets button")];

// Slider position is logarithmic so the warm end (where the interesting range is) gets more room.
const toKelvin = v => Math.round(Math.exp(Math.log(MAX_K) - (v / 1000) * (Math.log(MAX_K) - Math.log(MIN_K))) / 50) * 50;
const toSlider = k => Math.round(((Math.log(MAX_K) - Math.log(k)) / (Math.log(MAX_K) - Math.log(MIN_K))) * 1000);

function describe(k) {
  if (k >= 5000) return "Daylight";
  if (k > 2700) return "Evening";
  if (k === 2700) return "Night Shift's limit";
  if (k > 2200) return "Warm";
  if (k > 1800) return "Candlelight";
  if (k > 1400) return "Firelight";
  return "Ember";
}

function show(k, red) {
  const [r, g, b] = red ? [1, 0, 0] : gains(k);
  tint.style.backgroundColor = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  readout.textContent = red ? "Red" : `${k}K`;
  label.textContent = red ? "Red only, no blue or green" : describe(k);
  presetButtons.forEach(btn => {
    const match = red ? btn.dataset.k === "red" : Number(btn.dataset.k) === k;
    btn.setAttribute("aria-pressed", String(match));
  });
}

slider.addEventListener("input", () => show(toKelvin(Number(slider.value)), false));
presetButtons.forEach(btn => btn.addEventListener("click", () => {
  if (btn.dataset.k === "red") { slider.value = 1000; show(MIN_K, true); return; }
  const k = Number(btn.dataset.k);
  slider.value = toSlider(k);
  show(k, false);
}));
show(MAX_K, false);

// A gentle hint: when the demo first scrolls into view, ease from daylight to candlelight.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion && "IntersectionObserver" in window) {
  let played = false;
  new IntersectionObserver((entries, observer) => {
    if (played || !entries.some(e => e.isIntersecting)) return;
    played = true;
    observer.disconnect();
    const start = performance.now(), from = 0, to = toSlider(2000), duration = 2200;
    const step = now => {
      const p = Math.min(1, (now - start) / duration), eased = 1 - Math.pow(1 - p, 3);
      slider.value = Math.round(from + (to - from) * eased);
      show(toKelvin(Number(slider.value)), false);
      if (p < 1 && document.activeElement !== slider) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, { threshold: 0.5 }).observe(document.getElementById("screen"));
}

// --- Waitlist ----------------------------------------------------------------
const form = document.getElementById("signup");
const status = document.getElementById("signup-status");
if (WAITLIST_ENDPOINT) {
  form.hidden = false;
  document.getElementById("github-notify").hidden = true;
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector("button");
    button.disabled = true;
    status.textContent = "Adding you…";
    try {
      const response = await fetch(WAITLIST_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!response.ok) throw new Error(String(response.status));
      form.hidden = true;
      status.textContent = "You're on the list. We'll email you once, when Dozelight launches.";
    } catch {
      status.textContent = "That didn't go through. Please try again in a moment.";
      button.disabled = false;
    }
  });
}

// --- Small effects -------------------------------------------------------------
const nav = document.querySelector(".nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); revealer.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".section-head, .card, .demo-stage, .timeline, .table-wrap, .waitlist-card, .faq details")
    .forEach(el => { el.classList.add("reveal"); revealer.observe(el); });
}

// --- Buy buttons -----------------------------------------------------------------
// Polar's checkout takes a couple of seconds to open, so give instant feedback on click, and connect to
// Polar early when someone is about to click (only then, so ordinary visitors never contact Polar).
const buyLinks = [...document.querySelectorAll('a[href^="https://buy.polar.sh/"]')];
let warmedUp = false;
function warmUp() {
  if (warmedUp) return;
  warmedUp = true;
  for (const origin of ["https://buy.polar.sh", "https://polar.sh"]) {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
}
buyLinks.forEach(link => {
  link.dataset.label = link.textContent;
  link.addEventListener("pointerenter", warmUp);
  link.addEventListener("focus", warmUp);
  link.addEventListener("touchstart", warmUp, { passive: true });
  link.addEventListener("click", event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;  // new tab: leave as is
    if (link.classList.contains("loading")) { event.preventDefault(); return; }       // ignore double clicks
    link.classList.add("loading");
    link.textContent = "Opening secure checkout…";
  });
});
// Coming back with the browser's Back button restores the original label.
window.addEventListener("pageshow", event => {
  if (!event.persisted) return;
  buyLinks.forEach(link => { link.classList.remove("loading"); link.textContent = link.dataset.label; });
});
