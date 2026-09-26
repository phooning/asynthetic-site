# Performance notes

The site is static and has no framework runtime, but two visual systems can
still compete with scrolling: the full-viewport ambient scene and the SIGMA
demo video.

## Hot paths and mitigations

- **SIGMA demo loop:** the H.264 demo is 29.47 seconds long. Native looping
  seeks back to the first keyframe and restarts decoding at that interval,
  matching the reported periodic hitch. It now auto-plays once while in view;
  controls remain available for replay.
- **Ambient scene composition:** several viewport-sized gradient layers animate
  on the compositor. The costly blend-mode sweep now runs once, permanent
  `will-change` hints and redundant opacity-pulse animations were removed, and
  the sticky navigation no longer applies a continuously repainted backdrop
  blur.
- **SIGMA lighting:** a center-band `IntersectionObserver` now switches one
  stable product state. It replaces continuous scroll measurements, easing
  loops, CSS-variable writes, and scroll-time animation pause/resume toggles.
- **Pointer parallax:** pointer work is requestAnimationFrame-gated and writes
  direct compositor-friendly transforms to the two scene layers rather than
  invalidating CSS custom properties.
- **Long product content:** repeated capabilities and lower-page groups use
  `content-visibility: auto` with intrinsic-size estimates, so offscreen layout
  and paint can be deferred. Media dimensions and lazy loading prevent layout
  shifts.

Reduced-motion preferences still disable ambient animation and reveal effects.
When adding interactive content, profile the production build, not only Astro's
development server, and keep continuous work out of global scroll handlers.
