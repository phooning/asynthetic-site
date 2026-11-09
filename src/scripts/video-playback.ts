/** Progressive enhancement for muted, controllable videos. Native controls remain
 * usable if this module, IntersectionObserver, or autoplay is unavailable. */
export function initVideoPlayback(): () => void {
  if (!("IntersectionObserver" in window)) return () => {};

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const controller = new AbortController();
  const states = new Map<HTMLVideoElement, { visible: boolean; wanted: boolean; automatic: boolean; pendingPauses: number }>();

  const pauseAutomatic = (video: HTMLVideoElement) => {
    if (!video.paused) {
      states.get(video)!.pendingPauses++;
      video.pause();
    }
  };

  const update = (video: HTMLVideoElement) => {
    const state = states.get(video)!;
    const eligible = state.visible && !document.hidden && !motion.matches;
    if (eligible && state.wanted && video.paused && !video.ended) {
      state.automatic = true;
      void video.play().then(() => {
        // Playback can resolve after the scene leaves view or the page hides.
        if ((!state.visible || document.hidden || motion.matches) && state.automatic && states.has(video)) pauseAutomatic(video);
      }).catch(() => { state.automatic = false; });
    } else if (!eligible && state.automatic && !video.paused) {
      pauseAutomatic(video);
    }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target as HTMLVideoElement;
      states.get(video)!.visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      update(video);
    });
  }, { threshold: 0.35 });

  document.querySelectorAll<HTMLVideoElement>("[data-autoplay-in-view]").forEach((video) => {
    states.set(video, { visible: false, wanted: true, automatic: false, pendingPauses: 0 });
    video.addEventListener("pause", () => {
      const state = states.get(video)!;
      if (state.pendingPauses) { state.pendingPauses--; return; }
      // A pause while eligible came from the visitor, not visibility management.
      if (state.visible && !document.hidden && !motion.matches && !video.ended) {
        state.wanted = false;
        state.automatic = false;
      }
    }, { signal: controller.signal });
    video.addEventListener("play", () => {
      const state = states.get(video)!;
      if (motion.matches) state.automatic = false;
      if (!state.automatic) state.wanted = true;
    }, { signal: controller.signal });
    video.addEventListener("ended", () => { states.get(video)!.wanted = false; }, { signal: controller.signal });
    observer.observe(video);
  });
  const updateAll = () => states.forEach((_, video) => update(video));
  document.addEventListener("visibilitychange", updateAll, { signal: controller.signal });
  motion.addEventListener("change", updateAll, { signal: controller.signal });

  return () => {
    observer.disconnect();
    controller.abort();
    states.forEach((state, video) => { if (state.automatic) video.pause(); });
    states.clear();
  };
}
