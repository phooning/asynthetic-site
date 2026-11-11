const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(pointer: fine)");
const scene = document.querySelector<HTMLElement>("[data-scene]");

const navToggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
const navLinks = document.querySelector<HTMLElement>("[data-nav-links]");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.dataset.open === "true";
    navLinks.dataset.open = String(!isOpen);
    navToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.dataset.open = "false";
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Brief glow on the background grid lines once the scroll-to-top lands.
const sceneGrid = scene?.querySelector<HTMLElement>(".scene__grid") ?? null;

function glowGrid(restart: boolean) {
  const grid = sceneGrid;
  if (!grid || reducedMotion.matches) return;
  if (grid.classList.contains("is-glowing")) {
    if (!restart) return;
    grid.classList.remove("is-glowing");
    void grid.offsetWidth; // restart the animation
  }
  grid.classList.add("is-glowing");
  grid.addEventListener("animationend", () => grid.classList.remove("is-glowing"), { once: true });
}

function pulseGridWhenAtTop() {
  if (!sceneGrid || reducedMotion.matches) return;
  const deadline = performance.now() + 2500;
  // Ignite while the eased scroll is still settling, so the glow peaks on arrival.
  const igniteWithin = Math.min(180, window.scrollY * 0.2);
  const check = () => {
    if (window.scrollY <= igniteWithin) {
      glowGrid(true);
    } else if (performance.now() < deadline) {
      requestAnimationFrame(check);
    }
  };
  requestAnimationFrame(check);
}

// Tugging past the top (elastic overscroll, or wheel/touch pull where the
// browser has none) fires the same activation glow.
let wheelPull = 0;
window.addEventListener("scroll", () => {
  if (window.scrollY < -8) glowGrid(false);
}, { passive: true });
window.addEventListener("wheel", (event) => {
  if (window.scrollY > 0 || event.deltaY >= 0) {
    wheelPull = 0;
    return;
  }
  wheelPull += -event.deltaY;
  if (wheelPull > 60) {
    wheelPull = 0;
    glowGrid(false);
  }
}, { passive: true });
let touchStartY = 0;
window.addEventListener("touchstart", (event) => {
  touchStartY = event.touches[0]?.clientY ?? 0;
}, { passive: true });
window.addEventListener("touchmove", (event) => {
  const y = event.touches[0]?.clientY ?? 0;
  if (window.scrollY <= 0 && y - touchStartY > 40) glowGrid(false);
}, { passive: true });

// On the home page, the brand link scrolls back to the top instead of reloading.
document.querySelector<HTMLAnchorElement>(".site-nav__brand")?.addEventListener("click", (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  const target = new URL(event.currentTarget instanceof HTMLAnchorElement ? event.currentTarget.href : "/", location.href);
  if (target.pathname !== location.pathname) return;
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
  pulseGridWhenAtTop();
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
});

const nav = document.querySelector<HTMLElement>("[data-site-nav]");
if (nav) {
  let frame = 0;
  let isScrolled = false;

  const updateNavState = () => {
    const next = window.scrollY > 8;
    if (next !== isScrolled) {
      isScrolled = next;
      nav.classList.toggle("is-scrolled", isScrolled);
    }
  };

  const onScroll = () => {
    if (!frame) {
      frame = requestAnimationFrame(() => {
        updateNavState();
        frame = 0;
      });
    }
  };

  updateNavState();
  window.addEventListener("scroll", onScroll, { passive: true });
}

const revealTargets = document.querySelectorAll<HTMLElement>("[data-reveal]");
if (revealTargets.length && !reducedMotion.matches && "IntersectionObserver" in window) {
  revealTargets.forEach((element) => element.classList.add("js-reveal"));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );
  revealTargets.forEach((element) => observer.observe(element));
}

if (!reducedMotion.matches && finePointer.matches && scene) {
  const pointerA = scene.querySelector<HTMLElement>(".scene__pointer--a");
  const pointerB = scene.querySelector<HTMLElement>(".scene__pointer--b");
  let frame = 0;

  const updatePointer = (event: PointerEvent) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      if (pointerA) {
        pointerA.style.transform = `translate3d(${x * 18}px, ${y * 14}px, 0)`;
      }
      if (pointerB) {
        pointerB.style.transform = `translate3d(${x * -12}px, ${y * -16}px, 0)`;
      }
      frame = 0;
    });
  };

  const resetPointer = () => {
    if (pointerA) pointerA.style.transform = "translate3d(0, 0, 0)";
    if (pointerB) pointerB.style.transform = "translate3d(0, 0, 0)";
  };

  window.addEventListener("pointermove", updatePointer, { passive: true });
  document.documentElement.addEventListener("mouseleave", resetPointer);
}

const sceneTrigger = document.querySelector<HTMLElement>("[data-scene-trigger]");
if (sceneTrigger && "IntersectionObserver" in window) {
  const root = document.documentElement;

  const setProductSceneActive = (active: boolean) => {
    root.classList.toggle("is-sigma-lit", active);
    sceneTrigger.classList.toggle("is-scene-active", active);
    nav?.classList.toggle("is-product-active", active);
  };

  new IntersectionObserver(
    ([entry]) => setProductSceneActive(entry.isIntersecting),
    { rootMargin: "-28% 0px -28% 0px", threshold: 0 },
  ).observe(sceneTrigger);
}

// Load video behavior only on pages that contain an opted-in video.
if (document.querySelector("[data-autoplay-in-view]")) {
  void import("./video-playback").then(({ initVideoPlayback }) => {
    const destroy = initVideoPlayback();
    window.addEventListener("pagehide", (event) => {
      if (!event.persisted) destroy();
    });
  }).catch(() => { /* Native video controls remain available. */ });
}
