/* Camada de efeitos de pixel art do jogo.
 * Usa a biblioteca pixelfx (c) 2026 Patch e Hugo Duprez, licenca MIT: https://github.com/patch-gg/pixelfx
 * Os efeitos sao carregados da CDN, fixados num commit. Se falharem, o jogo segue normalmente sem eles. */
import { createFrame, clearFrame, createFx, composite } from "https://cdn.jsdelivr.net/gh/patch-gg/pixelfx@a841596/src/core/index.js";
import * as clawSwipe from "https://cdn.jsdelivr.net/gh/patch-gg/pixelfx@a841596/src/fx/melee/claw-swipe.js";
import * as swordSlash from "https://cdn.jsdelivr.net/gh/patch-gg/pixelfx@a841596/src/fx/melee/sword-slash.js";
import * as spinSlash from "https://cdn.jsdelivr.net/gh/patch-gg/pixelfx@a841596/src/fx/melee/spin-slash.js";
import * as hitSpark from "https://cdn.jsdelivr.net/gh/patch-gg/pixelfx@a841596/src/fx/impacts/hit-spark.js";
import * as critHit from "https://cdn.jsdelivr.net/gh/patch-gg/pixelfx@a841596/src/fx/impacts/crit-hit.js";
import * as shieldBlock from "https://cdn.jsdelivr.net/gh/patch-gg/pixelfx@a841596/src/fx/impacts/shield-block.js";
import * as groundSlam from "https://cdn.jsdelivr.net/gh/patch-gg/pixelfx@a841596/src/fx/impacts/ground-slam.js";
import * as smallExplosion from "https://cdn.jsdelivr.net/gh/patch-gg/pixelfx@a841596/src/fx/explosions/small-explosion.js";
import * as lightningStrike from "https://cdn.jsdelivr.net/gh/patch-gg/pixelfx@a841596/src/fx/lightning/lightning-strike.js";
import * as magicMissile from "https://cdn.jsdelivr.net/gh/patch-gg/pixelfx@a841596/src/fx/projectiles/magic-missile.js";
import * as poof from "https://cdn.jsdelivr.net/gh/patch-gg/pixelfx@a841596/src/fx/spawn/poof.js";
import * as collectBurst from "https://cdn.jsdelivr.net/gh/patch-gg/pixelfx@a841596/src/fx/pickups/collect-burst.js";

const REG = { clawSwipe, swordSlash, spinSlash, hitSpark, critHit, shieldBlock, groundSlam, smallExplosion, lightningStrike, magicMissile, poof, collectBurst };

const strip = (m) => (m.meta && m.meta.actor ? { ...m, meta: { ...m.meta, actor: 0 } } : m);
for (const k of Object.keys(REG)) REG[k] = strip(REG[k]);
const SCALE = 2; // pixels de tela por pixel do efeito
let stage = null;

function attach(host) {
  detach();
  const canvas = document.createElement("canvas");
  canvas.className = "pfx-layer";
  host.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const s = { host, canvas, ctx, list: [], raf: 0, last: 0, w: 0, h: 0, frame: null, img: null };
  stage = s;
  resize();
  return s;
}
function resize() {
  const s = stage; if (!s) return;
  const r = s.host.getBoundingClientRect();
  s.w = Math.max(1, Math.ceil(r.width / SCALE)); s.h = Math.max(1, Math.ceil(r.height / SCALE));
  s.canvas.width = s.w; s.canvas.height = s.h;
  s.canvas.style.width = s.w * SCALE + "px"; s.canvas.style.height = s.h * SCALE + "px";
  s.frame = createFrame(s.w, s.h); s.img = new ImageData(s.w, s.h);
}
function detach() {
  if (!stage) return;
  cancelAnimationFrame(stage.raf);
  stage.canvas.remove();
  stage = null;
}
function tick(now) {
  const s = stage; if (!s) return;
  const dt = Math.min(0.05, (now - s.last) / 1000 || 0.016); s.last = now;
  clearFrame(s.frame);
  for (const e of s.list) {
    if (e.delay > 0) { e.delay -= dt; continue; }
    e.fx.update(dt); e.age += dt;
    if (e.maxT && e.age >= e.maxT) e.fx.stop();
    e.fx.draw(s.frame);
  }
  s.list = s.list.filter((e) => e.delay > 0 || !e.fx.done());
  composite(s.frame, s.img.data, null);
  s.ctx.putImageData(s.img, 0, 0);
  if (s.list.length) s.raf = requestAnimationFrame(tick);
  else { s.ctx.clearRect(0, 0, s.w, s.h); s.raf = 0; }
}
// x, y: pixels de tela dentro do elemento hospedeiro (ponto de origem do efeito)
function play(name, o = {}) {
  const s = stage, mod = REG[name];
  if (!s || !mod || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = s.host.getBoundingClientRect();
  if (Math.ceil(r.width / SCALE) !== s.w || Math.ceil(r.height / SCALE) !== s.h) resize();
  const { x = 0, y = 0, delay = 0, maxT = 0, ...rest } = o;
  const fx = createFx(mod, { ...rest, x: Math.round(x / SCALE), y: Math.round(y / SCALE) });
  s.list.push({ fx, delay, maxT, age: 0 });
  if (!s.raf) { s.last = performance.now(); s.raf = requestAnimationFrame(tick); }
}
window.addEventListener("resize", resize);
window.PixelFX = { attach, detach, play, resize, SCALE, names: Object.keys(REG) };
