(() => {
  const canvas = document.querySelector("#accretion-disk");

  if (!canvas) {
    return;
  }

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: "high-performance",
    premultipliedAlpha: true
  });

  if (!gl) {
    document.documentElement.classList.add("no-webgl");
    return;
  }

  const vertexSource = `
    attribute vec2 position;

    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;

    uniform vec2 resolution;
    uniform vec2 pointer;
    uniform float time;

    #define PI 3.14159265359

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x),
        f.y
      );
    }

    mat2 rotate(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat2(c, -s, s, c);
    }

    void main() {
      vec2 p = (2.0 * gl_FragCoord.xy - resolution.xy)
        / min(resolution.x, resolution.y);
      p -= pointer * 0.018;
      p = rotate(-0.075 + pointer.x * 0.018) * p;

      float t = time * 0.32;
      float r = length(p);
      float theta = atan(p.y, p.x);

      // Bend an otherwise flat energy plane away from the event horizon.
      float gravity = 0.075 / (r * r + 0.032);
      float diskY = p.y + p.x * 0.018;
      float warpedY = diskY * (1.0 + gravity);
      float ellipticalRadius = length(vec2(p.x, warpedY * 5.1));

      float innerCut = smoothstep(0.24, 0.33, ellipticalRadius);
      float outerCut = 1.0 - smoothstep(1.35, 2.15, ellipticalRadius);
      float plane = exp(-pow(abs(warpedY) * 10.5, 1.22));
      float body = plane * innerCut * outerCut;

      float flow = theta * 2.5 - ellipticalRadius * 17.0 - t * 5.5;
      float fibers = 0.57
        + 0.25 * sin(flow)
        + 0.12 * sin(flow * 2.7 + noise(p * 8.0) * 4.0);
      float particulate = noise(vec2(ellipticalRadius * 18.0 - t * 2.0, theta * 5.0));
      fibers *= 0.72 + particulate * 0.62;

      // A brighter pressure front travels through the disk from left to right.
      float sweepPhase = fract(t * 0.13);
      float sweepX = mix(-2.25, 2.25, sweepPhase);
      float sweep = exp(-pow(abs(p.x - sweepX) * 2.1, 1.35));
      float wake = exp(-pow(abs(p.x - sweepX + 0.32) * 1.15, 1.6)) * 0.26;

      float heat = exp(-max(ellipticalRadius - 0.25, 0.0) * 1.65);
      float coreHeat = exp(-abs(ellipticalRadius - 0.29) * 9.0);
      float doppler = smoothstep(-1.15, 1.15, -p.x);

      vec3 violet = vec3(0.31, 0.24, 1.0);
      vec3 cyan = vec3(0.18, 0.88, 1.0);
      vec3 whiteHot = vec3(1.0, 0.96, 0.88);
      vec3 diskColor = mix(violet, cyan, doppler);
      diskColor = mix(diskColor, whiteHot, coreHeat * 0.82 + sweep * 0.44);

      float intensity = body
        * (0.34 + fibers * 0.82)
        * (0.65 + heat * 1.75)
        * (1.0 + sweep * 2.15 + wake);
      vec3 color = diskColor * intensity;

      // Atmospheric bloom above and below the disk adds depth without blur.
      float atmosphere = exp(-abs(warpedY) * 3.1)
        * innerCut
        * (1.0 - smoothstep(0.85, 2.5, ellipticalRadius));
      color += mix(violet, cyan, doppler) * atmosphere * (0.06 + sweep * 0.14);

      // The photon ring tightens and brightens on the approaching side.
      float photonRing = exp(-abs(r - 0.205) * 94.0);
      float secondaryRing = exp(-abs(r - 0.232) * 42.0) * 0.28;
      float ringModulation = 0.52 + 0.48 * smoothstep(-0.9, 0.85, -cos(theta));
      color += mix(violet, whiteHot, doppler * 0.78)
        * (photonRing * (1.45 + sweep * 1.1) + secondaryRing)
        * ringModulation;

      // Gravitationally lensed arcs lift the far edge above and below the core.
      float arcRadius = 0.265 + 0.018 * cos(theta * 2.0);
      float arcs = exp(-abs(r - arcRadius) * 72.0);
      float arcMask = pow(abs(sin(theta)), 5.5);
      color += mix(violet, cyan, step(0.0, p.y))
        * arcs
        * arcMask
        * (0.35 + coreHeat * 0.8);

      // Keep the event horizon optically empty.
      float horizon = smoothstep(0.176, 0.196, r);
      color *= horizon;

      // Sparse, slow-moving hot particles make the large field feel spatial.
      vec2 starGrid = floor((p + vec2(t * 0.018, 0.0)) * 88.0);
      float starSeed = hash(starGrid);
      float stars = step(0.994, starSeed)
        * (1.0 - smoothstep(0.25, 1.8, r))
        * (0.25 + 0.75 * sin(starSeed * 21.0 + t * 3.0));
      color += mix(violet, cyan, starSeed) * max(stars, 0.0) * 0.55;

      color = 1.0 - exp(-color * 1.12);
      float alpha = clamp(max(max(color.r, color.g), color.b) * 1.18, 0.0, 1.0);
      gl_FragColor = vec4(color * alpha, alpha);
    }
  `;

  const compileShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) {
    document.documentElement.classList.add("no-webgl");
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    document.documentElement.classList.add("no-webgl");
    return;
  }

  const vertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );

  gl.useProgram(program);

  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {
    resolution: gl.getUniformLocation(program, "resolution"),
    pointer: gl.getUniformLocation(program, "pointer"),
    time: gl.getUniformLocation(program, "time")
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const targetPointer = { x: 0, y: 0 };
  const smoothPointer = { x: 0, y: 0 };
  let start = performance.now();
  let animationFrame = 0;
  let width = 0;
  let height = 0;

  const resize = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
    width = Math.max(1, Math.round(window.innerWidth * pixelRatio));
    height = Math.max(1, Math.round(window.innerHeight * pixelRatio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  };

  const draw = (now) => {
    resize();
    smoothPointer.x += (targetPointer.x - smoothPointer.x) * 0.035;
    smoothPointer.y += (targetPointer.y - smoothPointer.y) * 0.035;

    const elapsed = reducedMotion.matches ? 4.8 : (now - start) / 1000;
    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform2f(uniforms.pointer, smoothPointer.x, smoothPointer.y);
    gl.uniform1f(uniforms.time, elapsed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    canvas.classList.add("is-ready");

    if (!reducedMotion.matches && !document.hidden) {
      animationFrame = requestAnimationFrame(draw);
    }
  };

  const restart = () => {
    cancelAnimationFrame(animationFrame);
    start = performance.now();
    animationFrame = requestAnimationFrame(draw);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      targetPointer.x = event.clientX / window.innerWidth - 0.5;
      targetPointer.y = 0.5 - event.clientY / window.innerHeight;
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      restart();
    }
  });

  reducedMotion.addEventListener?.("change", restart);
  animationFrame = requestAnimationFrame(draw);
})();
