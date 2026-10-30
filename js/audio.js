/* Efeitos sonoros sintetizados com Web Audio (sem arquivos externos) */
(function (R) {
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem('briga-de-rua-mute') === '1'; } catch (e) { /* ignora */ }

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, o) {
    const c = ac();
    if (!c || muted) return;
    o = o || {};
    const t = c.currentTime + (o.delay || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(freq, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function noise(dur, o) {
    const c = ac();
    if (!c || muted) return;
    o = o || {};
    const t = c.currentTime + (o.delay || 0);
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.freq || 1800;
    const g = c.createGain();
    g.gain.value = o.vol || 0.18;
    src.connect(f).connect(g).connect(c.destination);
    src.start(t);
  }

  const SFX = {
    click: () => tone(520, 0.05, { type: 'triangle', vol: 0.07 }),
    hit: () => { noise(0.12, { freq: 2200 }); tone(160, 0.12, { type: 'sawtooth', slide: 70, vol: 0.12 }); },
    crit: () => { noise(0.18, { freq: 3500, vol: 0.25 }); tone(300, 0.2, { type: 'sawtooth', slide: 60, vol: 0.16 }); tone(880, 0.12, { delay: 0.05, type: 'square', vol: 0.08 }); },
    hurt: () => { noise(0.14, { freq: 900 }); tone(110, 0.2, { type: 'sawtooth', slide: 50, vol: 0.14 }); },
    miss: () => tone(700, 0.15, { type: 'sine', slide: 300, vol: 0.06 }),
    magic: () => { tone(500, 0.3, { type: 'sine', slide: 1200, vol: 0.1 }); tone(750, 0.3, { delay: 0.05, type: 'triangle', slide: 1500, vol: 0.06 }); },
    heal: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.18, { delay: i * 0.08, type: 'sine', vol: 0.09 })); },
    coin: () => { tone(988, 0.07, { type: 'square', vol: 0.06 }); tone(1319, 0.18, { delay: 0.07, type: 'square', vol: 0.06 }); },
    win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { delay: i * 0.12, type: 'triangle', vol: 0.12 })); },
    levelup: () => { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, { delay: i * 0.09, type: 'square', vol: 0.08 })); },
    lose: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, { delay: i * 0.18, type: 'sawtooth', vol: 0.1 })); },
    boss: () => { tone(110, 0.6, { type: 'sawtooth', slide: 80, vol: 0.15 }); tone(147, 0.6, { delay: 0.2, type: 'sawtooth', slide: 100, vol: 0.12 }); },
  };

  R.sfx = (name) => { try { if (SFX[name]) SFX[name](); } catch (e) { /* áudio indisponível */ } };
  R.isMuted = () => muted;
  R.toggleMute = () => {
    muted = !muted;
    try { localStorage.setItem('briga-de-rua-mute', muted ? '1' : '0'); } catch (e) { /* ignora */ }
    if (!muted) R.sfx('click');
    return muted;
  };
})(window.RPG);
