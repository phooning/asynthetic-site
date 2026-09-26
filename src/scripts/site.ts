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
if (revealTargets.length && "IntersectionObserver" in window && !reducedMotion.matches) {
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
if (sceneTrigger) {
  const root = document.documentElement;

  const setProductSceneActive = (active: boolean) => {
    root.classList.toggle("is-sigma-lit", active);
    sceneTrigger.classList.toggle("is-scene-active", active);
    nav?.classList.toggle("is-product-active", active);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => setProductSceneActive(entry.isIntersecting),
      { rootMargin: "-28% 0px -28% 0px", threshold: 0 },
    );
    observer.observe(sceneTrigger);
  }
}

const heroMedia = document.querySelector<HTMLElement>("[data-hero-media]");
if (heroMedia) {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            heroMedia.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    observer.observe(heroMedia);
  } else {
    heroMedia.classList.add("is-visible");
  }
}

const demoVideo = document.querySelector<HTMLVideoElement>("[data-autoplay-in-view]");
if (demoVideo) {
  if (reducedMotion.matches) {
    demoVideo.removeAttribute("autoplay");
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            void demoVideo.play().catch(() => undefined);
          } else {
            demoVideo.pause();
          }
        });
      },
      { threshold: 0.35 },
    );
    observer.observe(demoVideo);
  }
}
