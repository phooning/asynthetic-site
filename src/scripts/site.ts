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

// Give the SIGMA panel and About principles a restrained pointer tilt.
const tiltCards = document.querySelectorAll<HTMLElement>(".project-panel, .pillar");
if (!reducedMotion.matches && finePointer.matches && tiltCards.length) {
  tiltCards.forEach((card) => {
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const maxTilt = card.classList.contains("project-panel") ? 1.15 : 1.4;

    const enter = () => {
      card.classList.add("is-tilting");
      card.style.setProperty("--card-lift", "-1.5px");
    };

    const move = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = card.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (pointerX - rect.left - rect.width / 2) / (rect.width / 2)));
        const y = Math.max(-1, Math.min(1, (pointerY - rect.top - rect.height / 2) / (rect.height / 2)));
        card.style.setProperty("--card-tilt-x", `${(-y * maxTilt).toFixed(2)}deg`);
        card.style.setProperty("--card-tilt-y", `${(x * maxTilt).toFixed(2)}deg`);
      });
    };

    const leave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      card.style.setProperty("--card-tilt-x", "0deg");
      card.style.setProperty("--card-tilt-y", "0deg");
      card.style.setProperty("--card-lift", "0px");
      card.classList.remove("is-tilting");
    };

    card.addEventListener("pointerenter", enter, { passive: true });
    card.addEventListener("pointermove", move, { passive: true });
    card.addEventListener("pointerleave", leave, { passive: true });
    card.addEventListener("pointercancel", leave, { passive: true });
  });
}

// Fade the Work dot field and trace its SVG signal paths with scroll progress.
const workHeading = document.querySelector<HTMLElement>("[data-work-heading]");
const workSignal = workHeading?.querySelector<HTMLElement>("[data-work-signal]");
if (workHeading && workSignal && !reducedMotion.matches) {
  const routeA = workSignal.querySelector<SVGPathElement>('[data-route="a"]');
  const routeB = workSignal.querySelector<SVGPathElement>('[data-route="b"]');
  const tracers = [
    { element: workSignal.querySelector<SVGCircleElement>('[data-tracer="a1"]'), route: routeA, start: 0.02, end: 0.7 },
    { element: workSignal.querySelector<SVGCircleElement>('[data-tracer="a2"]'), route: routeA, start: 0.28, end: 0.96 },
    { element: workSignal.querySelector<SVGCircleElement>('[data-tracer="b1"]'), route: routeB, start: 0.38, end: 1 },
  ].filter((tracer): tracer is { element: SVGCircleElement; route: SVGPathElement; start: number; end: number } =>
    tracer.element !== null && tracer.route !== null,
  );
  let frame = 0;
  const phase = (progress: number, start: number, end: number) =>
    Math.max(0, Math.min(1, (progress - start) / (end - start)));

  const update = () => {
    frame = 0;
    const rect = workHeading.getBoundingClientRect();
    const center = (rect.top + rect.height / 2) / window.innerHeight;
    const visibility = Math.max(0, 1 - Math.abs(center - 0.5) / 0.5);
    const eased = visibility * visibility * (3 - 2 * visibility);
    const progress = Math.max(0, Math.min(1, (0.95 - center) / (0.95 - 0.22)));

    workSignal.classList.add("is-scroll-driven");
    workSignal.style.setProperty("--work-signal-strength", (eased * 0.82).toFixed(3));
    workSignal.style.setProperty("--work-trace-a", phase(progress, 0, 0.76).toFixed(3));
    workSignal.style.setProperty("--work-trace-b", phase(progress, 0.2, 0.92).toFixed(3));

    tracers.forEach(({ element, route, start, end }) => {
      const travel = phase(progress, start, end);
      const point = route.getPointAtLength(route.getTotalLength() * travel);
      element.setAttribute("cx", point.x.toFixed(2));
      element.setAttribute("cy", point.y.toFixed(2));
      element.style.opacity = phase(progress, start, start + 0.08).toFixed(3);
    });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}

const sceneTrigger = document.querySelector<HTMLElement>("[data-scene-trigger]");
if (sceneTrigger) {
  const root = document.documentElement;

  const setProductSceneActive = (active: boolean) => {
    root.classList.toggle("is-sigma-lit", active);
    sceneTrigger.classList.toggle("is-scene-active", active);
    nav?.classList.toggle("is-product-active", active);
  };

  // Lit from the moment the product panel reaches the lower part of the viewport,
  // and it stays lit when scrolled past (through About) until Contact takes over.
  // Derived from scroll position so it can't get stuck on a stale observer entry.
  const contact = document.getElementById("contact");
  let frame = 0;

  const update = () => {
    frame = 0;
    const vh = window.innerHeight;
    const entered = sceneTrigger.getBoundingClientRect().top < vh * 0.72;
    const atContact = contact ? contact.getBoundingClientRect().top < vh * 0.5 : false;
    setProductSceneActive(entered && !atContact);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}

// Draw the Contact signal as its graphic moves through the viewport.
const contactSignal = document.querySelector<HTMLElement>("[data-contact-signal]");
if (contactSignal && !reducedMotion.matches) {
  let frame = 0;
  const phase = (progress: number, start: number, end: number) =>
    Math.max(0, Math.min(1, (progress - start) / (end - start)));

  const update = () => {
    frame = 0;
    const rect = contactSignal.getBoundingClientRect();
    const start = window.innerHeight * 0.95;
    const end = window.innerHeight * 0.3;
    const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    const values = {
      input: phase(progress, 0, 0.36),
      middle: phase(progress, 0.28, 0.72),
      lower: phase(progress, 0.42, 0.9),
      upper: phase(progress, 0.26, 0.64),
      hub: phase(progress, 0.12, 0.56),
    };

    contactSignal.classList.add("is-scroll-driven");
    Object.entries(values).forEach(([name, value]) => {
      contactSignal.style.setProperty(`--signal-${name}`, value.toFixed(3));
    });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
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
