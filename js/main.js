(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");

  /* Mobile nav toggle */
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.getAttribute("data-open") === "true";
      navLinks.setAttribute("data-open", String(!isOpen));
      navToggle.setAttribute("aria-expanded", String(!isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.setAttribute("data-open", "false");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Sticky nav background on scroll */
  const nav = document.querySelector("[data-site-nav]");
  if (nav) {
    const updateNavState = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    updateNavState();
    window.addEventListener("scroll", updateNavState, { passive: true });
  }

  /* Reveal-on-scroll for elements opted in via [data-reveal] */
  const revealTargets = document.querySelectorAll("[data-reveal]");
  if (revealTargets.length) {
    if ("IntersectionObserver" in window && !reducedMotion.matches) {
      revealTargets.forEach((el) => el.classList.add("js-reveal"));
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      revealTargets.forEach((el) => observer.observe(el));
    }
  }

  /* Hero pointer parallax — desktop, fine-pointer only, disabled for
     reduced motion. Purely decorative; page works identically without it. */
  if (!reducedMotion.matches && finePointer.matches) {
    const root = document.documentElement;
    let frame = 0;

    const updatePointer = (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        root.style.setProperty("--pointer-a-x", `${x * 18}px`);
        root.style.setProperty("--pointer-a-y", `${y * 14}px`);
        root.style.setProperty("--pointer-b-x", `${x * -12}px`);
        root.style.setProperty("--pointer-b-y", `${y * -16}px`);
        frame = 0;
      });
    };

    const resetPointer = () => {
      root.style.setProperty("--pointer-a-x", "0px");
      root.style.setProperty("--pointer-a-y", "0px");
      root.style.setProperty("--pointer-b-x", "0px");
      root.style.setProperty("--pointer-b-y", "0px");
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    document.documentElement.addEventListener("mouseleave", resetPointer);
  }

  /* SIGMA section: --scene-light (0..1, peak when the panel is centred)
     scrubs the ambient glow; html.is-sigma-lit flips the palette. */
  const sceneTrigger = document.querySelector("[data-scene-trigger]");
  if (sceneTrigger) {
    const root = document.documentElement;
    let lit = false;

    // Hysteresis so the palette doesn't flicker when scrolling stops near the threshold.
    const updateTone = (value) => {
      const next = lit ? value >= 0.4 : value >= 0.5;
      if (next !== lit) {
        lit = next;
        root.classList.toggle("is-sigma-lit", lit);
      }
    };

    const targetSceneLight = () => {
      const rect = sceneTrigger.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const elCenter = rect.top + rect.height / 2;
      const viewportCenter = vh / 2;
      const maxDist = vh / 2 + rect.height / 2;
      if (maxDist <= 0) return 0;
      const dist = Math.abs(elCenter - viewportCenter);
      return Math.min(1, Math.max(0, 1 - dist / maxDist));
    };

    if (reducedMotion.matches) {
      /* No easing loop for reduced motion — the value still tracks
         scroll position, it just snaps instead of animating. */
      let ticking = false;
      const snap = () => {
        const value = targetSceneLight();
        root.style.setProperty("--scene-light", value.toFixed(4));
        updateTone(value);
        ticking = false;
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(snap);
      };
      snap();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
    } else {
      let target = targetSceneLight();
      let current = target;
      let looping = false;
      let ticking = false;

      root.style.setProperty("--scene-light", current.toFixed(4));
      updateTone(target);

      const settled = () => Math.abs(target - current) < 0.001;

      const ease = () => {
        current += (target - current) * 0.1;
        if (settled()) current = target;
        root.style.setProperty("--scene-light", current.toFixed(4));
        if (settled()) {
          looping = false;
          return;
        }
        requestAnimationFrame(ease);
      };

      const ensureLoop = () => {
        if (!looping) {
          looping = true;
          requestAnimationFrame(ease);
        }
      };

      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          target = targetSceneLight();
          updateTone(target);
          ensureLoop();
          ticking = false;
        });
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
    }
  }

  /* Product hero media: scale-in once visible */
  const heroMedia = document.querySelector("[data-hero-media]");
  if (heroMedia) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              heroMedia.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      io.observe(heroMedia);
    } else {
      heroMedia.classList.add("is-visible");
    }
  }

  /* Play SIGMA demo video only while it's actually on screen, and only
     when the visitor hasn't asked for reduced motion. The <video> ships
     with preload="metadata" so nothing is fetched until this decides to
     play it. */
  const demoVideo = document.querySelector("[data-autoplay-in-view]");
  if (demoVideo) {
    if (reducedMotion.matches) {
      demoVideo.removeAttribute("autoplay");
    } else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              demoVideo.play().catch(() => {});
            } else {
              demoVideo.pause();
            }
          });
        },
        { threshold: 0.35 }
      );
      io.observe(demoVideo);
    }
  }
})();
