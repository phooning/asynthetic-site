import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initVideoPlayback } from '../src/scripts/video-playback.ts';

class Video extends EventTarget {
  paused = true;
  ended = false;
  play() { this.paused = false; this.dispatchEvent(new Event('play')); return Promise.resolve(); }
  pause() { if (!this.paused) { this.paused = true; this.dispatchEvent(new Event('pause')); } }
}

test('video visibility, user pause, motion preference, and cleanup', async () => {
  const video = new Video();
  const motion = new EventTarget();
  motion.matches = false;
  const document = new EventTarget();
  document.hidden = false;
  document.querySelectorAll = () => [video];
  let observer;
  class Observer {
    constructor(callback) { this.callback = callback; observer = this; }
    observe() {}
    disconnect() { this.disconnected = true; }
    setVisible(visible) { this.callback([{ target: video, isIntersecting: visible, intersectionRatio: visible ? 1 : 0 }]); }
  }
  globalThis.window = { IntersectionObserver: Observer, matchMedia: () => motion };
  globalThis.IntersectionObserver = Observer;
  globalThis.document = document;
  const destroy = initVideoPlayback();
  observer.setVisible(true);
  await Promise.resolve();
  assert.equal(video.paused, false);
  observer.setVisible(false);
  assert.equal(video.paused, true);
  observer.setVisible(true);
  await Promise.resolve();
  assert.equal(video.paused, false);
  video.pause();
  observer.setVisible(false);
  observer.setVisible(true);
  assert.equal(video.paused, true, 'manual pause survives leaving and re-entering view');
  await video.play();
  // Manual playback remains under the visitor's control.
  video.pause();
  destroy();
  assert.equal(observer.disconnected, true);
});

test('reduced motion prevents autoplay and hidden tabs pause automatic playback', async () => {
  const video = new Video();
  const motion = new EventTarget(); motion.matches = true;
  const document = new EventTarget(); document.hidden = false;
  document.querySelectorAll = () => [video];
  let observer;
  class Observer {
    constructor(callback) { this.callback = callback; observer = this; }
    observe() {}
    disconnect() {}
  }
  globalThis.window = { IntersectionObserver: Observer, matchMedia: () => motion };
  globalThis.IntersectionObserver = Observer;
  globalThis.document = document;
  const destroy = initVideoPlayback();
  observer.callback([{ target: video, isIntersecting: true, intersectionRatio: 1 }]);
  assert.equal(video.paused, true);
  motion.matches = false; motion.dispatchEvent(new Event('change'));
  await Promise.resolve();
  assert.equal(video.paused, false);
  document.hidden = true; document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(video.paused, true);
  document.hidden = false; document.dispatchEvent(new Event('visibilitychange'));
  await Promise.resolve();
  assert.equal(video.paused, false);
  motion.matches = true; motion.dispatchEvent(new Event('change'));
  assert.equal(video.paused, true);
  destroy();
});
