/**
 * ABYSS - THE INFINITE LOOP
 * Authentic replication with procedural undulating rings,
 * buttery smooth angular movement physics, inside-ring player orientation,
 * and seamless infinite zoom abyss transitions.
 */

// --- AUDIO MANAGER ---
class AudioManager {
  constructor() {
    this.ctx = null;
    this.sounds = {};
    this.muted = false;
    this.hasInteracted = false;
    this.bgmAudio = null;
    this.bgmVolume = 0.20; // 20% volume as requested
    this.sfxVolume = 0.80; // 80% default sfx volume
    this.isBgmPlaying = false;
    this.decayAudio = null;
    this.initAudioElements();
    this.initBgm();
    this.initDecayAudio();
  }

  initDecayAudio() {
    if (this.decayAudio) return;
    try {
      this.decayAudio = new Audio();
      this.decayAudio.preload = 'auto';
      this.decayAudio.volume = this.muted ? 0 : this.sfxVolume;
      this.decayAudio.src = 'decay audio.m4a';

      this.decayAudio.addEventListener('error', () => {
        if (this.decayAudio && this.decayAudio.src.includes('decay%20audio') || (this.decayAudio && this.decayAudio.src.endsWith('decay audio.m4a'))) {
          console.log('Switching Decay audio fallback to decay.m4a');
          this.decayAudio.src = 'decay.m4a';
          this.decayAudio.load();
        }
      });
    } catch (e) {
      console.warn('Decay audio init exception:', e);
    }
  }

  playDecayAudio() {
    this.initContext();
    if (!this.decayAudio) this.initDecayAudio();
    if (this.decayAudio) {
      try {
        this.decayAudio.currentTime = 0;
        this.decayAudio.volume = this.muted ? 0 : this.sfxVolume;
        const playPromise = this.decayAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.log('Decay audio waiting for gesture, synth fallback:', e);
            this.playSynth('decay_warning', 0.9);
          });
        }
      } catch (err) {
        this.playSynth('decay_warning', 0.9);
      }
    } else {
      this.playSynth('decay_warning', 0.9);
    }
  }

  stopDecayAudio() {
    if (this.decayAudio) {
      try {
        this.decayAudio.pause();
        this.decayAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.hasInteracted = true;
  }

  initAudioElements() {
    if (typeof GAME_ASSETS !== 'undefined' && GAME_ASSETS.audio) {
      for (const [key, dataUri] of Object.entries(GAME_ASSETS.audio)) {
        try {
          const audio = new Audio();
          audio.src = dataUri;
          audio.preload = 'auto';
          this.sounds[key] = audio;
        } catch (e) {
          console.warn('Audio init error for', key, e);
        }
      }
    }
  }

  initBgm() {
    if (this.bgmAudio) return;
    try {
      this.bgmAudio = new Audio();
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.muted ? 0 : this.bgmVolume;
      this.bgmAudio.preload = 'auto';
      this.bgmAudio.src = 'bgm.mp4';

      this.bgmAudio.addEventListener('error', () => {
        if (this.bgmAudio && this.bgmAudio.src.endsWith('bgm.mp4')) {
          console.log('Switching BGM source fallback to bgm.m4a');
          this.bgmAudio.src = 'bgm.m4a';
          this.bgmAudio.load();
          if (this.isBgmPlaying && !this.muted) {
            this.bgmAudio.play().catch(() => {});
          }
        }
      });
    } catch (e) {
      console.warn('BGM init exception:', e);
    }
  }

  playBgm() {
    this.isBgmPlaying = true;
    this.initContext();
    if (!this.bgmAudio) this.initBgm();
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.muted ? 0 : this.bgmVolume;
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.log('BGM playback waiting for user gesture:', e);
        });
      }
    }
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  play(name, volume = 1.0) {
    if (this.muted) return;
    this.initContext();

    const audio = this.sounds[name];
    if (audio) {
      try {
        const clone = audio.cloneNode();
        clone.volume = Math.max(0, Math.min(1, volume));
        clone.play().catch(() => this.playSynth(name, volume));
        return;
      } catch (e) {
        this.playSynth(name, volume);
      }
    } else {
      this.playSynth(name, volume);
    }
  }

  playSynth(name, volume = 1.0) {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      gain.connect(this.ctx.destination);
      osc.connect(gain);

      if (name === 'jump') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.15);
        gain.gain.setValueAtTime(0.3 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (name === 'key') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        osc.frequency.setValueAtTime(1174.66, now + 0.16);
        gain.gain.setValueAtTime(0.4 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (name === 'win') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.12);
        osc.frequency.setValueAtTime(659.25, now + 0.24);
        osc.frequency.setValueAtTime(880, now + 0.36);
        gain.gain.setValueAtTime(0.35 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.62);
      } else if (name === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        gain.gain.setValueAtTime(0.5 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (name === 'death') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
        gain.gain.setValueAtTime(0.6 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.52);
      } else if (name === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        gain.gain.setValueAtTime(0.08 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (name === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.3);
        gain.gain.setValueAtTime(0.3 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.32);
      } else if (name === 'warning') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(440, now + 0.1);
        gain.gain.setValueAtTime(0.3 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (name === 'dialogue') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, now);
        gain.gain.setValueAtTime(0.12 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (name === 'glitch') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.35 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.24);
      } else if (name === 'void_fall') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.7);
        gain.gain.setValueAtTime(0.55 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);
        osc.start(now);
        osc.stop(now + 0.78);
      } else if (name === 'heartbeat') {
        // Deep organic double-pulse "lub-dub"
        osc.type = 'sine';
        osc.frequency.setValueAtTime(75, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
        osc.frequency.setValueAtTime(95, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.38);
        gain.gain.setValueAtTime(0.65 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        gain.gain.setValueAtTime(0.85 * volume, now + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (name === 'decay_warning') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.35);
        gain.gain.setValueAtTime(0.4 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (name === 'chomp') {
        // Brutal crunchy monster bite for cursor easter egg
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);
        gain.gain.setValueAtTime(0.9 * volume * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (name === 'burp') {
        // Comic satisfied burp
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(155, now);
        osc.frequency.linearRampToValueAtTime(65, now + 0.35);
        gain.gain.setValueAtTime(0.7 * volume * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      // Audio fallback fail silently
    }
  }

  playVoice(url) {
    if (this.muted || !url) return;
    try {
      const a = new Audio(url);
      a.volume = 1.0;
      a.addEventListener('error', () => {
        if (url === 'lvl3.mp4') {
          const fallback = new Audio('lvl3.mp4.mp3');
          fallback.volume = 1.0;
          fallback.play().catch(e => console.log('Voice fallback note:', e));
        }
      });
      a.play().catch(e => console.log('Voice audio playback note:', e));
    } catch (e) {
      console.warn('Voice playback exception:', e);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.muted ? 0 : this.bgmVolume;
    }
    return this.muted;
  }
}

// --- CONTINUOUS VIBRANT COLOR SEQUENCE ---
// Every level L shifts the chain forward by 1:
//   bg: COLOR_SEQUENCE[L - 1]
//   r0: COLOR_SEQUENCE[L]      (active running ring)
//   r1: COLOR_SEQUENCE[L + 1]  (middle ring)
//   r2: COLOR_SEQUENCE[L + 2]  (center core)
//   r3: COLOR_SEQUENCE[L + 3]  (emerging core during transition)
// As r0 expands into the background, r1 becomes r0, r2 becomes r1, r3 becomes r2.
const COLOR_SEQUENCE = [
  '#1e082b', // 0: Deep violet/navy (initial start bg)
  '#18dedd', // 1: Vibrant Cyan
  '#fd2181', // 2: Hot Magenta / Pink
  '#ffc820', // 3: Radiant Golden Yellow
  '#2693f8', // 4: Sky Blue
  '#4eed8b', // 5: Neon Lime Green
  '#ff4757', // 6: Coral Red
  '#a855f7', // 7: Bright Purple
  '#ffa502', // 8: Electric Amber Orange
  '#00d2d3', // 9: Bright Aqua Teal
  '#5f27cd', // 10: Royal Violet
  '#ff6b81'  // 11: Electric Blossom
];

function getLevelPalette(level) {
  const getCol = (idx) => COLOR_SEQUENCE[((idx % COLOR_SEQUENCE.length) + COLOR_SEQUENCE.length) % COLOR_SEQUENCE.length];
  return {
    bg: getCol(level - 1),
    r0: getCol(level),
    r1: getCol(level + 1),
    r2: getCol(level + 2),
    r3: getCol(level + 3),
    num: '#2b0d3a'
  };
}

// --- PARTICLE SYSTEM ---
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, options = {}) {
    const {
      color = '#ffffff',
      size = 3,
      speed = 60,
      life = 0.6,
      gravity = 0,
      decay = 0.95,
      shape = 'circle'
    } = options;

    for (let i = 0; i < count; i++) {
      const angle = options.angle !== undefined
        ? options.angle + (Math.random() - 0.5) * (options.spread || 0.6)
        : Math.random() * Math.PI * 2;
      const spd = speed * (0.4 + Math.random() * 0.8);

      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: size * (0.6 + Math.random() * 0.7),
        life: life * (0.6 + Math.random() * 0.8),
        maxLife: life,
        color,
        gravity,
        decay,
        shape
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vx *= Math.pow(p.decay, dt * 60);
      p.vy *= Math.pow(p.decay, dt * 60);
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'star' || p.shape === 'square') {
        const sz = p.size;
        ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

// --- MAIN GAME ENGINE ---
class AbyssGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.container = document.getElementById('game-container');
    this.ctx = this.canvas.getContext('2d');
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();

    // Virtual sizing
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.cx = this.width / 2;
    this.cy = this.height / 2;
    this.scale = 1.0;

    // Geometric Progression of Concentric Rings
    this.BASE_R0_OUTER = 280;
    this.R_RATIO = 1.4359;
    this.BASE_R1_OUTER = this.BASE_R0_OUTER / this.R_RATIO; // ~195
    this.BASE_R2_OUTER = this.BASE_R1_OUTER / this.R_RATIO; // ~135.8
    this.BASE_R3_OUTER = this.BASE_R2_OUTER / this.R_RATIO; // ~94.6

    // Game state
    const urlParams = new URLSearchParams(window.location.search);
    const lvlParam = parseInt(urlParams.get('level') || urlParams.get('lvl') || '0', 10);
    this.startLevelParam = (lvlParam > 0) ? lvlParam : 1;

    this.state = 'SPLASH';
    this.hasPlayedIntro = false;
    this.introFading = false;
    this.introVideo = null;
    this.level = this.startLevelParam;
    this.lives = 5;
    this.maxLives = 5;
    this.hasKey = false;
    this.keysCollected = 0;
    this.bestDepth = parseInt(localStorage.getItem('abyss_best_depth') || '1', 10);

    if (this.startLevelParam > 1) {
      setTimeout(() => {
        const splashBtn = document.getElementById('splash-start-btn');
        if (splashBtn) {
          splashBtn.innerHTML = `⚡ TEST LEVEL ${this.startLevelParam} <span class="splash-btn-sub">CLICK TO PLAY DIRECTLY</span>`;
        }
      }, 50);
    }

    // Timers & Animations
    this.gameTime = 0;
    this.damageDeformTimer = 0;
    this.damageDeformIntensity = 0;
    this.screenShake = 0;

    // Transition state
    this.transitionProgress = 0;
    this.transitionDuration = 0.95;

    // Player with smooth velocity & damping
    this.player = {
      angle: Math.PI / 2, // 6 o'clock
      omega: 0,           // Angular velocity (rad/s)
      maxOmega: 1.35,     // Smooth, controllable cruise speed
      accel: 8.5,         // Angular acceleration (rad/s^2)
      friction: 12.0,     // Damping deceleration (rad/s^2)
      radialHeight: 0,    // Jump distance inward from outer wall (0 = on wall, >0 = inward)
      vr: 0,              // Radial velocity (inward)
      facing: 1,          // +1 = counterclockwise, -1 = clockwise
      isRunning: false,
      isGrounded: true,
      coyoteTimer: 0,
      invincibleTimer: 0,
      animTime: 0,
      animFrame: 0,
      width: 22,
      height: 28,
      footstepCooldown: 0
    };

    // Doorway / Gate
    this.door = {
      angle: -Math.PI / 2, // 12 o'clock
      width: 0.32,         // Opening angular width in radians (~18 deg)
      unlocked: false,
      visible: true,
      pulseAnim: 0
    };

    // Key Item
    this.keyItem = {
      angle: 0,
      collected: false,
      bobTimer: 0,
      sparkleTimer: 0
    };

    this.spikes = [];
    this.flyingSaws = [];
    this.walkers = [];

    // Twist Mechanics: Time Dilation, Dual Lasers, Inverted Controls & Rage Mode Traps
    this.timeScale = 1.0;
    this.targetTimeScale = 1.0;
    this.controlsInverted = false;
    this.levelMode = 'NORMAL';
    this.lasers = [];
    this.ambushSpikes = [];
    this.collapsingSectors = [];
    this.rouletteKeys = [];
    this.disappearingTrail = [];
    this.lastPlayerTrailAngle = Math.PI / 2;
    this.illusionDoors = [];
    this.heartTimer = 0;
    this.heartPulse = 0;
    this.heartSpikeHeight = 0;
    this.playedDub = false;
    this.isDarkness = false;
    this.dialogueTimer = 0;
    this.alertTimer = 0;
    this.voidFallTimer = 0;

    // Decay Mechanic (Levels >= 4)
    this.decayActive = false;
    this.decayDuration = 8.0;
    this.decayTimer = 8.0;
    this.decayAudioStarted = false;
    this.isDecayDemoting = false;
    this.decayDemoteTimer = 0;
    this.decayDemoteDuration = 5.8;
    this.outerRingDecaying = false;
    this.decayGaugeCanvas = document.getElementById('decay-gauge-canvas');
    this.decayGaugeCtx = this.decayGaugeCanvas ? this.decayGaugeCanvas.getContext('2d') : null;
    this.decayGaugeParticles = [];

    // Ambient floating stardust
    this.ambientMotes = [];
    for (let i = 0; i < 40; i++) {
      this.ambientMotes.push({
        angle: Math.random() * Math.PI * 2,
        dist: 40 + Math.random() * 450,
        speed: (Math.random() - 0.5) * 0.15,
        radSpeed: (Math.random() - 0.5) * 6,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.15 + Math.random() * 0.4
      });
    }

    this.keys = {};

    this.images = {
      player: [],
      key: [],
      door: [],
      spikes: [],
      saw: null,
      heart: null,
      walker: [],
      flyer: []
    };

    this.loadSprites();
    this.setupResize();
    this.setupInputs();
    this.setupUI();
    this.updateHUD();

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  setupResize() {
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.round(this.width * dpr);
      this.canvas.height = Math.round(this.height * dpr);
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      this.cx = this.width / 2;
      this.cy = this.height / 2;
      this.scale = Math.min(this.width / 880, this.height / 700);
      this.scale = Math.max(0.65, Math.min(1.3, this.scale));
    };

    window.addEventListener('resize', resize);
    resize();
  }

  loadSprites() {
    if (typeof GAME_ASSETS === 'undefined') return;

    const loadImg = (uri) => {
      const img = new Image();
      img.src = uri;
      return img;
    };

    if (GAME_ASSETS.sprites) {
      const sp = GAME_ASSETS.sprites;
      if (Array.isArray(sp.player)) this.images.player = sp.player.map(loadImg);
      if (Array.isArray(sp.key)) this.images.key = sp.key.map(loadImg);
      if (Array.isArray(sp.door)) this.images.door = sp.door.map(loadImg);
      if (Array.isArray(sp.spikes)) this.images.spikes = sp.spikes.map(loadImg);
      if (sp.saw) this.images.saw = loadImg(sp.saw);
      if (sp.heart) this.images.heart = loadImg(sp.heart);
      if (Array.isArray(sp.walker)) this.images.walker = sp.walker.map(loadImg);
      if (Array.isArray(sp.flyer)) this.images.flyer = sp.flyer.map(loadImg);
    }
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (['Space', 'ArrowUp', 'KeyW', 'KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (this.state === 'SPLASH') {
        if (e.code === 'Space' || e.code === 'Enter') {
          if (this.startLevelParam > 1) {
            this.audio.initContext();
            this.audio.playBgm();
            this.startGame(this.startLevelParam);
          } else {
            this.startIntroSequence();
          }
        }
      } else if (this.state === 'INTRO') {
        if (e.code === 'Space' || e.code === 'Escape' || e.code === 'Enter') {
          this.skipIntro();
        }
      } else if (this.state === 'START' || this.state === 'MENU') {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Enter') {
          this.startGame(this.startLevelParam);
        }
      } else if (this.state === 'GAMEOVER') {
        if (e.code === 'Space' || e.code === 'Enter') {
          this.restartGame();
        }
      } else if (this.state === 'PLAYING') {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          this.triggerJump();
        } else if (e.code === 'KeyL') {
          const target = prompt('Jump to level (1-14):', this.level);
          const parsed = parseInt(target, 10);
          if (parsed && parsed >= 1) {
            this.level = parsed;
            this.spawnLevel(this.level);
            this.updateHUD();
          }
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && this.state === 'PLAYING') {
        // Variable jump height: release early cuts upward radial velocity
        if (this.player.vr > 60 * this.scale) {
          this.player.vr *= 0.45;
        }
      }
    });

    // Touch controls
    const btnLeft = document.getElementById('touch-left');
    const btnRight = document.getElementById('touch-right');
    const btnJump = document.getElementById('touch-jump');

    const handleTouch = (btn, code) => {
      const onPress = (e) => {
        if (e.cancelable) e.preventDefault();
        this.keys[code] = true;
        if (code === 'Space') {
          if (this.state === 'SPLASH') this.startIntroSequence();
          else if (this.state === 'INTRO') this.skipIntro();
          else if (this.state === 'START' || this.state === 'MENU') this.startGame();
          else if (this.state === 'GAMEOVER') this.restartGame();
          else this.triggerJump();
        }
      };

      const onRelease = (e) => {
        if (e.cancelable) e.preventDefault();
        this.keys[code] = false;
        if (code === 'Space' && this.player.vr > 60 * this.scale) {
          this.player.vr *= 0.45;
        }
      };

      btn.addEventListener('touchstart', onPress, { passive: false });
      btn.addEventListener('touchend', onRelease, { passive: false });
      btn.addEventListener('touchcancel', onRelease, { passive: false });
      btn.addEventListener('pointerdown', onPress);
      btn.addEventListener('pointerup', onRelease);
      btn.addEventListener('pointercancel', onRelease);
      btn.addEventListener('pointerleave', onRelease);
    };

    if (btnLeft) handleTouch(btnLeft, 'ArrowLeft');
    if (btnRight) handleTouch(btnRight, 'ArrowRight');
    if (btnJump) handleTouch(btnJump, 'Space');

    this.canvas.addEventListener('pointerdown', () => {
      if (this.state === 'SPLASH') this.startIntroSequence();
      else if (this.state === 'INTRO') this.skipIntro();
      else if (this.state === 'START' || this.state === 'MENU') this.startGame();
      else if (this.state === 'GAMEOVER') this.restartGame();
    });
  }

  setupUI() {
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isMuted = this.audio.toggleMute();
        const iconOn = document.getElementById('sound-icon-on');
        const iconOff = document.getElementById('sound-icon-off');
        if (iconOn) iconOn.classList.toggle('hidden', isMuted);
        if (iconOff) iconOff.classList.toggle('hidden', !isMuted);
      });
    }

    const fsBtn = document.getElementById('fullscreen-btn');
    if (fsBtn) {
      fsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // 1. Initial Splash Screen START GAME button
    const splashBtn = document.getElementById('splash-start-btn');
    if (splashBtn) {
      splashBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.startLevelParam > 1) {
          this.audio.initContext();
          this.audio.playBgm();
          this.startGame(this.startLevelParam);
        } else {
          this.startIntroSequence();
        }
      });
      splashBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
    }

    // 2. Intro video SKIP button
    const skipBtn = document.getElementById('intro-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.skipIntro();
      });
      skipBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
    }

    // 3. Main Menu START DIVE buttons
    const startBtns = [document.getElementById('play-btn'), document.getElementById('btn-start')].filter(Boolean);
    for (const btn of startBtns) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.startGame();
      });
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
    }

    // 4. Game Over DIVE AGAIN buttons
    const restartBtns = [document.getElementById('retry-btn'), document.getElementById('btn-restart')].filter(Boolean);
    for (const btn of restartBtns) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.restartGame();
      });
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
    }

    // 5. Settings Modal Controls
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsClose = document.getElementById('settings-close-btn');
    const settingsDone = document.getElementById('settings-done-btn');

    const openSettings = (e) => {
      if (e) e.stopPropagation();
      this.audio.initContext();
      if (settingsModal) settingsModal.classList.remove('hidden');
    };
    const closeSettings = (e) => {
      if (e) e.stopPropagation();
      if (settingsModal) settingsModal.classList.add('hidden');
    };

    if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
    if (settingsClose) settingsClose.addEventListener('click', closeSettings);
    if (settingsDone) settingsDone.addEventListener('click', closeSettings);

    const bgmSlider = document.getElementById('bgm-slider');
    const bgmVal = document.getElementById('bgm-vol-val');
    if (bgmSlider) {
      bgmSlider.value = Math.round(this.audio.bgmVolume * 100);
      if (bgmVal) bgmVal.textContent = bgmSlider.value + '%';
      bgmSlider.addEventListener('input', (e) => {
        const v = parseInt(e.target.value, 10) / 100;
        this.audio.bgmVolume = v;
        if (this.audio.bgmAudio && !this.audio.muted) {
          this.audio.bgmAudio.volume = v;
        }
        if (bgmVal) bgmVal.textContent = e.target.value + '%';
      });
    }

    const sfxSlider = document.getElementById('sfx-slider');
    const sfxVal = document.getElementById('sfx-vol-val');
    if (sfxSlider) {
      sfxSlider.value = Math.round((this.audio.sfxVolume || 0.8) * 100);
      if (sfxVal) sfxVal.textContent = sfxSlider.value + '%';
      sfxSlider.addEventListener('input', (e) => {
        const v = parseInt(e.target.value, 10) / 100;
        this.audio.sfxVolume = v;
        if (sfxVal) sfxVal.textContent = e.target.value + '%';
      });
    }

    const shakeToggle = document.getElementById('shake-toggle');
    if (shakeToggle) {
      shakeToggle.addEventListener('change', (e) => {
        this.enableScreenShake = e.target.checked;
      });
    }

    const touchToggle = document.getElementById('touch-toggle');
    const touchControls = document.getElementById('touch-controls');
    if (touchToggle && touchControls) {
      touchToggle.addEventListener('change', (e) => {
        touchControls.style.display = e.target.checked ? 'flex' : 'none';
      });
    }

    // 6. Character Easter Egg ("Don't Click" Motor Slice Jumpscare)
    const charBox = document.getElementById('interactive-char-box');
    if (charBox) {
      charBox.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerCursorEater(e);
      });
    }
  }

  // --- ONE-TIME INTRO VIDEO SEQUENCE ---
  startIntroSequence() {
    if (this.state === 'INTRO') return;
    this.audio.initContext();

    const splash = document.getElementById('splash-overlay');
    if (splash) splash.classList.add('hidden');

    this.state = 'INTRO';
    this.introFading = false;

    const introOverlay = document.getElementById('intro-overlay');
    const scrim = document.getElementById('intro-fade-scrim');
    const video = document.getElementById('intro-video');

    if (!introOverlay || !video) {
      this.endIntroSequence();
      return;
    }

    introOverlay.classList.remove('hidden', 'fade-out');
    if (scrim) scrim.classList.remove('active');

    this.introVideo = video;
    video.currentTime = 0;
    video.volume = 1.0;

    // Monitor playback: user requirement: "in mainintro.mp4 video which is intro add a fade effect after 0;16 seconds"
    const checkTime = () => {
      if (this.state !== 'INTRO') return;

      if (video.currentTime >= 16.0 && !this.introFading) {
        this.fadeIntroOut(video);
        return;
      }

      if (!video.paused && !video.ended) {
        requestAnimationFrame(checkTime);
      }
    };

    video.onended = () => {
      if (!this.introFading) {
        this.fadeIntroOut(video);
      }
    };

    video.onerror = (e) => {
      console.warn('Intro video error:', e);
      this.endIntroSequence();
    };

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        requestAnimationFrame(checkTime);
      }).catch((err) => {
        console.log('Video autoplay blocked or error:', err);
        this.endIntroSequence();
      });
    }
  }

  fadeIntroOut(video) {
    if (this.introFading) return;
    this.introFading = true;

    const introOverlay = document.getElementById('intro-overlay');
    const scrim = document.getElementById('intro-fade-scrim');
    if (introOverlay) introOverlay.classList.add('fade-out');
    if (scrim) scrim.classList.add('active');

    // Smoothly fade audio volume down to 0 over 1.2s
    const startVol = (video && !isNaN(video.volume)) ? video.volume : 1.0;
    const fadeDuration = 1200;
    const startTime = performance.now();

    const fadeAudio = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / fadeDuration);
      if (video) {
        video.volume = Math.max(0, startVol * (1 - progress));
      }

      if (progress < 1) {
        requestAnimationFrame(fadeAudio);
      } else {
        this.endIntroSequence();
      }
    };

    requestAnimationFrame(fadeAudio);
  }

  skipIntro() {
    if (this.introVideo && !this.introFading) {
      this.fadeIntroOut(this.introVideo);
    } else {
      this.endIntroSequence();
    }
  }

  endIntroSequence() {
    if (this.state === 'MENU' || this.state === 'PLAYING') return;

    if (this.introVideo) {
      this.introVideo.pause();
    }

    const introOverlay = document.getElementById('intro-overlay');
    if (introOverlay) {
      introOverlay.classList.add('hidden');
      introOverlay.classList.remove('fade-out');
    }

    this.hasPlayedIntro = true;
    this.introFading = false;
    this.state = 'MENU';

    // Start background music at 20% volume in loop
    this.audio.playBgm();

    // Show the Main Menu to start
    const startOverlay = document.getElementById('start-overlay');
    if (startOverlay) {
      startOverlay.classList.remove('hidden');
    }
  }

  // --- MOTOR SLICE EASTER EGG: CURSOR EATER ---
  triggerCursorEater(e) {
    if (this.isEatingCursor) return;
    this.isEatingCursor = true;

    this.audio.initContext();
    this.audio.playSynth('chomp', 1.0);
    if (this.enableScreenShake !== false) this.screenShake = 26;

    const overlay = document.getElementById('cursor-eater-overlay');
    const sign = document.getElementById('dont-click-sign');
    const reaction = document.getElementById('char-reaction-text');

    if (sign) {
      sign.innerHTML = '<span class="warning-icon">💀</span> YOU DID IT ANYWAY! <span class="arrow-down">🤦</span>';
      sign.style.borderColor = '#ff0000';
    }

    if (overlay) {
      overlay.classList.remove('hidden');
    }

    // Hide the real cursor across the entire window
    document.body.classList.add('cursor-eaten');

    // Ferocious successive chomping bites
    setTimeout(() => {
      this.audio.playSynth('chomp', 0.9);
      if (this.enableScreenShake !== false) this.screenShake = 18;
    }, 350);

    setTimeout(() => {
      this.audio.playSynth('chomp', 1.0);
      if (this.enableScreenShake !== false) this.screenShake = 24;
    }, 850);

    setTimeout(() => {
      this.audio.playSynth('chomp', 0.85);
      if (this.enableScreenShake !== false) this.screenShake = 14;
    }, 1350);

    // After 2.5 seconds, burp and restore cursor
    setTimeout(() => {
      this.audio.playSynth('burp', 1.0);

      const banner = document.getElementById('eater-banner');
      const sub = document.getElementById('eater-sub');
      if (banner) banner.textContent = 'CURSOR RESPAWNED!';
      if (sub) sub.textContent = 'BURP! 💨 (DO NOT TOUCH AGAIN)';

      setTimeout(() => {
        if (overlay) overlay.classList.add('hidden');
        document.body.classList.remove('cursor-eaten');
        this.isEatingCursor = false;

        if (reaction) {
          reaction.textContent = '"I told you not to click."';
          reaction.classList.remove('hidden');
          setTimeout(() => reaction.classList.add('hidden'), 4500);
        }

        if (sign) {
          sign.innerHTML = '<span class="warning-icon">⚠️</span> DON\'T CLICK <span class="arrow-down">👇</span>';
          sign.style.borderColor = '#ff0055';
        }
      }, 700);
    }, 2500);
  }

  // --- INTERACTIVE MENU CHARACTER PREVIEW ---
  renderMenuCharacter() {
    const canvas = document.getElementById('menu-char-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const time = this.gameTime;
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.72;

    // Idle breathing/bobbing
    const bob = Math.sin(time * 3.5) * 4;

    ctx.save();
    ctx.translate(cx, cy + bob);

    // Radiant cyberpunk aura glow
    const auraGrad = ctx.createRadialGradient(0, -42, 8, 0, -42, 65);
    auraGrad.addColorStop(0, 'rgba(24, 222, 221, 0.38)');
    auraGrad.addColorStop(0.65, 'rgba(253, 33, 129, 0.16)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, -42, 65, 0, Math.PI * 2);
    ctx.fill();

    // Floating cyan/magenta energy embers
    for (let i = 0; i < 4; i++) {
      const moteAngle = (time * 1.8 + i * (Math.PI / 2)) % (Math.PI * 2);
      const moteR = 30 + Math.sin(time * 2.2 + i) * 10;
      const mx = Math.cos(moteAngle) * moteR;
      const my = -42 + Math.sin(moteAngle) * (moteR * 0.5);
      ctx.fillStyle = i % 2 === 0 ? '#18dedd' : '#fd2181';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shadow on pedestal
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 28 + bob * 0.6, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw Character (Scale ~ 3.4x)
    const scale = 3.4;
    const pw = this.player.width * scale;
    const ph = this.player.height * scale;

    const animFrame = (this.images.player && this.images.player.length > 0)
      ? Math.floor(time * 4) % this.images.player.length
      : 0;
    const frameImg = (this.images.player && this.images.player[animFrame]);

    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 18;

    if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {
      ctx.drawImage(frameImg, -pw / 2, -ph, pw, ph);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-pw / 2, -ph, pw, ph);
    }

    ctx.restore();
  }

  updateHUD() {
    const depthVal = document.getElementById('depth-val');
    if (depthVal) {
      depthVal.textContent = this.level.toString();
    }

    const heartsContainer = document.getElementById('hearts-container');
    if (heartsContainer) {
      heartsContainer.innerHTML = '';
      for (let i = 0; i < this.maxLives; i++) {
        const heart = document.createElement('img');
        heart.className = 'heart-icon' + (i >= this.lives ? ' lost' : '');
        heart.src = (GAME_ASSETS && GAME_ASSETS.sprites && GAME_ASSETS.sprites.heart)
          ? GAME_ASSETS.sprites.heart
          : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23fff"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
        heartsContainer.appendChild(heart);
      }
    }

    const keyBadge = document.getElementById('key-badge');
    const keyIcon = document.getElementById('key-icon');
    if (keyBadge) {
      if (this.hasKey) {
        keyBadge.classList.remove('hidden');
        if (keyIcon && GAME_ASSETS && GAME_ASSETS.sprites && GAME_ASSETS.sprites.key && GAME_ASSETS.sprites.key[0]) {
          keyIcon.src = GAME_ASSETS.sprites.key[0];
        }
      } else {
        keyBadge.classList.add('hidden');
      }
    }
  }

  showDialogue(text, speaker = 'DYING LIGHT', duration = 5.0, voiceUrl = null) {
    const banner = document.getElementById('dialogue-banner');
    const speakerEl = banner ? banner.querySelector('.dialogue-speaker') : null;
    const textEl = document.getElementById('dialogue-text');
    if (speakerEl) speakerEl.textContent = speaker;
    if (textEl) textEl.textContent = text;
    if (banner) banner.classList.remove('hidden');

    this.dialogueTimer = duration;
    this.audio.play('dialogue', 0.6);
    if (voiceUrl) {
      this.audio.playVoice(voiceUrl);
    }
  }

  hideDialogue() {
    const banner = document.getElementById('dialogue-banner');
    if (banner) banner.classList.add('hidden');
    this.dialogueTimer = 0;
  }

  showAlert(text, duration = 3.5) {
    const banner = document.getElementById('alert-banner');
    const textEl = document.getElementById('alert-text');
    if (textEl) textEl.textContent = text;
    if (banner) banner.classList.remove('hidden');

    this.alertTimer = duration;
    this.audio.play('warning', 0.8);
  }

  hideAlert() {
    const banner = document.getElementById('alert-banner');
    if (banner) banner.classList.add('hidden');
    this.alertTimer = 0;
  }

  startGame(overrideLevel = null) {
    this.audio.initContext();
    this.audio.play('start', 0.85);
    this.audio.playBgm(); // Loop BGM throughout gameplay at 20% volume

    const startOverlay = document.getElementById('start-overlay');
    if (startOverlay) startOverlay.classList.add('hidden');
    const splash = document.getElementById('splash-overlay');
    if (splash) splash.classList.add('hidden');
    const intro = document.getElementById('intro-overlay');
    if (intro) intro.classList.add('hidden');

    this.state = 'PLAYING';
    this.level = (overrideLevel !== null && overrideLevel > 0) ? overrideLevel : (this.startLevelParam || 1);
    this.lives = this.maxLives;
    this.hasKey = false;
    this.keysCollected = 0;
    this.timeScale = 1.0;
    this.targetTimeScale = 1.0;
    this.controlsInverted = false;
    this.hideDialogue();
    this.hideAlert();
    if (this.container) this.container.classList.remove('screen-invert');
    this.player.angle = Math.PI / 2; // bottom
    this.player.omega = 0;
    this.player.radialHeight = 0;
    this.spawnLevel(this.level);
    this.updateHUD();
  }

  restartGame() {
    this.audio.initContext();
    this.audio.play('start', 0.85);
    this.audio.playBgm(); // Keep BGM playing in loop

    // CRITICAL USER REQUIREMENT: "dont make restart play meu everytime a common glitch"
    // Directly hide gameover overlay and jump straight back into PLAYING without showing menu or intro!
    const go = document.getElementById('gameover-overlay');
    if (go) go.classList.add('hidden');

    this.state = 'PLAYING';
    this.level = (this.startLevelParam > 1) ? this.startLevelParam : 1;
    this.lives = this.maxLives;
    this.hasKey = false;
    this.keysCollected = 0;
    this.timeScale = 1.0;
    this.targetTimeScale = 1.0;
    this.controlsInverted = false;
    this.hideDialogue();
    this.hideAlert();
    if (this.container) this.container.classList.remove('screen-invert');
    this.player.angle = Math.PI / 2;
    this.player.omega = 0;
    this.player.radialHeight = 0;
    this.spawnLevel(this.level);
    this.updateHUD();
  }

  spawnLevel(level) {
    this.hasKey = false;
    this.door.unlocked = false;
    this.door.visible = true; // default visible unless hidden by twist
    this.spikes = [];
    this.flyingSaws = [];
    this.walkers = [];
    this.lasers = [];
    this.ambushSpikes = [];
    this.collapsingSectors = [];
    this.rouletteKeys = [];
    this.disappearingTrail = [];
    this.lastPlayerTrailAngle = this.player.angle;
    this.illusionDoors = [];
    this.heartTimer = 0;
    this.heartPulse = 0;
    this.heartSpikeHeight = 0;
    this.playedDub = false;
    this.isDarkness = false;
    this.isFallingInVoid = false;
    this.voidFallTimer = 0;

    // --- LEVEL MODE & TWIST CONFIGURATION ---
    if (level === 1 || level === 2) {
      this.levelMode = 'NORMAL';
      this.controlsInverted = false;
      this.targetTimeScale = 1.0;
      this.timeScale = 1.0;
      this.hideDialogue();
      this.hideAlert();
      if (this.container) this.container.classList.remove('screen-invert');
    } else if (level === 3) {
      // --- TWIST 1: DUAL LASER SWEEP & CINEMATIC SLOW-MO ---
      this.levelMode = 'LASER_CORNER';
      this.controlsInverted = false;
      this.targetTimeScale = 0.52; // Cinematic slow motion
      this.timeScale = 0.52;
      if (this.container) this.container.classList.remove('screen-invert');
      this.hideAlert();

      // User requirement: "in lvl 3 that text comes remove that only audio we will be keeping (i will be uploading file as lvl3.mp4)"
      this.hideDialogue();
      this.audio.playVoice('lvl3.mp4');

      // Player starts at bottom (6 o'clock)
      this.player.angle = Math.PI / 2;

      // No door at start until lasers close in dangerously
      this.door.visible = false;
      this.door.unlocked = false;
      this.door.angle = Math.PI / 3;
      this.hasKey = false;
      this.keyItem.collected = true; // No key in laser levels

      // Horizontal laser starts at top and sweeps downward
      this.lasers.push({
        id: 'top_down',
        type: 'horizontal',
        pos: this.cy - 320 * this.scale,
        targetPos: this.cy + 165 * this.scale,
        speed: 135 * this.scale,
        thickness: 7 * this.scale,
        color: '#ff0055',
        active: true
      });

      // Vertical laser starts at left and sweeps rightward
      this.lasers.push({
        id: 'left_right',
        type: 'vertical',
        pos: this.cx - 320 * this.scale,
        targetPos: this.cx + 80 * this.scale,
        speed: 135 * this.scale,
        thickness: 7 * this.scale,
        color: '#ff0055',
        active: true
      });

    } else if (level === 4) {
      // --- LEVEL 4: DECAY INTRO (SIMPLE OBSTACLES + 8S DECAY METER) ---
      // User requirement: "From the level fourth, keep it simple. But at level four the decay meter comes, And like a countdown of eight seconds will be started."
      this.levelMode = 'NORMAL';
      this.controlsInverted = false;
      this.targetTimeScale = 1.0;
      this.timeScale = 1.0;
      this.hideDialogue();
      this.hideAlert();
      if (this.container) this.container.classList.remove('screen-invert');

      // Player spawns at bottom (6 o'clock)
      this.player.angle = Math.PI / 2;

      this.door.visible = true;
      this.door.unlocked = false;
      this.door.angle = (this.player.angle + Math.PI * 1.5) % (Math.PI * 2);

      this.keyItem.angle = (this.player.angle + Math.PI * 0.75) % (Math.PI * 2);
      this.keyItem.collected = false;
      this.hasKey = false;

      // Clean, simple hazards for the 8s time challenge
      this.spikes = [
        { angle: (this.player.angle + Math.PI * 0.38) % (Math.PI * 2), spriteIdx: 0, isRetracting: false, isExtended: true },
        { angle: (this.player.angle + Math.PI * 1.15) % (Math.PI * 2), spriteIdx: 1, isRetracting: false, isExtended: true }
      ];

      this.flyingSaws = [
        {
          angle: (this.player.angle + Math.PI) % (Math.PI * 2),
          orbitSpeed: -0.4,
          heightOffset: 26,
          rotation: 0
        }
      ];

    } else if (level === 5) {
      // --- RAGE BAIT LEVEL 1: SUDDEN AMBUSH SPIKES ---
      this.levelMode = 'RAGE_AMBUSH';
      this.controlsInverted = false;
      this.targetTimeScale = 1.0;
      this.timeScale = 1.0;
      this.hideDialogue();
      this.hideAlert();
      if (this.container) this.container.classList.remove('screen-invert');

      // Player starts at bottom (6 o'clock)
      this.player.angle = Math.PI / 2;

      this.door.visible = true;
      this.door.unlocked = false;
      this.door.angle = 3 * Math.PI / 2; // 12 o'clock (top)

      this.keyItem.angle = Math.PI * 1.05; // ~9 o'clock
      this.keyItem.collected = false;
      this.hasKey = false;

      // Rhythmic retracting spikes
      this.spikes = [
        { angle: Math.PI * 0.25, spriteIdx: 0, isRetracting: true, retractTimer: 0.5, isExtended: true },
        { angle: Math.PI * 1.75, spriteIdx: 1, isRetracting: true, retractTimer: 1.5, isExtended: true }
      ];

      // RAGE BAIT: Sudden surprise ambush spikes popping up in the player's path, under the key, and before the door!
      this.ambushSpikes = [
        // Surprise 1: Along the clockwise path from spawn toward the key
        { angle: Math.PI * 0.78, state: 'hidden', height: 0, triggered: false },
        // Surprise 2: TROLL KEY BAIT - erupts right when approaching the key!
        { angle: Math.PI * 1.05 - 0.16, state: 'hidden', height: 0, triggered: false },
        // Surprise 3: Path between key and door
        { angle: Math.PI * 1.28, state: 'hidden', height: 0, triggered: false },
        // Surprise 4: TROLL DOOR GUARDIAN - erupts right before the door gate!
        { angle: 3 * Math.PI / 2 - 0.16, state: 'hidden', height: 0, triggered: false }
      ];

    } else if (level === 6) {
      // --- RAGE BAIT LEVEL 2: COLLAPSING VOID PITFALLS & SURPRISE SPIKES ---
      this.levelMode = 'RAGE_VOID';
      this.controlsInverted = false;
      this.targetTimeScale = 1.0;
      this.timeScale = 1.0;
      this.hideDialogue();
      this.hideAlert();
      if (this.container) this.container.classList.remove('screen-invert');

      // Player starts at bottom (6 o'clock)
      this.player.angle = Math.PI / 2;

      this.door.visible = true;
      this.door.unlocked = false;
      this.door.angle = Math.PI * 1.62; // ~10 o'clock

      this.keyItem.angle = Math.PI * 0.12; // ~4 o'clock
      this.keyItem.collected = false;
      this.hasKey = false;

      // RAGE BAIT: Collapsing floor void pitfalls
      this.collapsingSectors = [
        // Pitfall 1: On path from spawn toward key
        { centerAngle: Math.PI * 0.35, halfWidth: 0.22, state: 'idle', timer: 0 },
        // Pitfall 2: On route from key to door
        { centerAngle: Math.PI * 1.88, halfWidth: 0.22, state: 'idle', timer: 0 },
        // Pitfall 3: Right before exit door!
        { centerAngle: Math.PI * 1.62 - 0.22, halfWidth: 0.18, state: 'idle', timer: 0 }
      ];

      // RAGE BAIT: Ambush spikes waiting at landing zones
      this.ambushSpikes = [
        // Surprise 1: Landing zone after pitfall 1
        { angle: Math.PI * 0.55, state: 'hidden', height: 0, triggered: false },
        // Surprise 2: Right next to key
        { angle: Math.PI * 0.12 - 0.15, state: 'hidden', height: 0, triggered: false },
        // Surprise 3: Near door
        { angle: Math.PI * 1.62 + 0.15, state: 'hidden', height: 0, triggered: false }
      ];

    } else if (level === 7) {
      // --- LEVEL 7: BREATHER LEVEL ---
      this.levelMode = 'NORMAL';
      this.controlsInverted = false;
      this.targetTimeScale = 1.0;
      this.timeScale = 1.0;
      this.hideDialogue();
      this.hideAlert();
      if (this.container) this.container.classList.remove('screen-invert');

    } else if (level === 8) {
      // --- LEVEL 8: KEY ROULETTE (GREEN = ADVANCE, RED = DAMAGE) ---
      // User requirement: "All the obstacles is not there. Just the whole circle is filled with keys, and two keys will be highlighted: one red color key, one green color key. Green color key lets the player move to the next level, while the red key decreases the player's health."
      this.levelMode = 'KEY_ROULETTE';
      this.controlsInverted = false;
      this.targetTimeScale = 1.0;
      this.timeScale = 1.0;
      this.hideDialogue();
      this.hideAlert();
      if (this.container) this.container.classList.remove('screen-invert');

      this.player.angle = Math.PI / 2;

      // No obstacles!
      this.spikes = [];
      this.flyingSaws = [];
      this.walkers = [];
      this.lasers = [];
      this.ambushSpikes = [];
      this.collapsingSectors = [];

      this.door.visible = false;
      this.door.unlocked = false;
      this.hasKey = false;
      this.keyItem.collected = true; // Standard single key hidden

      // Fill entire circle with 16 keys:
      this.rouletteKeys = [];
      const numKeys = 16;
      const greenIdx = 4; // ~9 o'clock
      const redIdx = 12;  // ~3 o'clock

      for (let i = 0; i < numKeys; i++) {
        const angle = (this.player.angle + (i / numKeys) * Math.PI * 2) % (Math.PI * 2);
        if (i === greenIdx) {
          this.rouletteKeys.push({
            angle,
            type: 'WIN',
            color: '#00ff66',
            name: 'GREEN',
            collected: false,
            bobTimer: i * 0.4
          });
        } else if (i === redIdx) {
          this.rouletteKeys.push({
            angle,
            type: 'DAMAGE',
            color: '#ff0044',
            name: 'RED',
            collected: false,
            bobTimer: i * 0.4
          });
        } else {
          this.rouletteKeys.push({
            angle,
            type: 'DUMMY',
            color: '#fece2c',
            name: 'GOLD',
            collected: false,
            bobTimer: i * 0.4
          });
        }
      }

    } else if (level === 9) {
      // --- LEVEL 9: KEY ROULETTE INVERTED (GREEN = DAMAGE, RED = ADVANCE) ---
      // User requirement: "Then on the next level, level nine, again the same loop will be repeated. It will be filled with multiple keys, but this time the green kills the player and red lets the player in another level."
      this.levelMode = 'KEY_ROULETTE';
      this.controlsInverted = false;
      this.targetTimeScale = 1.0;
      this.timeScale = 1.0;
      this.hideDialogue();
      this.hideAlert();
      if (this.container) this.container.classList.remove('screen-invert');

      this.player.angle = Math.PI / 2;

      this.spikes = [];
      this.flyingSaws = [];
      this.walkers = [];
      this.lasers = [];
      this.ambushSpikes = [];
      this.collapsingSectors = [];

      this.door.visible = false;
      this.door.unlocked = false;
      this.hasKey = false;
      this.keyItem.collected = true;

      this.rouletteKeys = [];
      const numKeys = 16;
      const greenIdx = 4;
      const redIdx = 12;

      for (let i = 0; i < numKeys; i++) {
        const angle = (this.player.angle + (i / numKeys) * Math.PI * 2) % (Math.PI * 2);
        if (i === greenIdx) {
          // In Level 9: Green damages / kills the player!
          this.rouletteKeys.push({
            angle,
            type: 'DAMAGE',
            color: '#00ff66',
            name: 'GREEN',
            collected: false,
            bobTimer: i * 0.4
          });
        } else if (i === redIdx) {
          // In Level 9: Red lets player into the next level!
          this.rouletteKeys.push({
            angle,
            type: 'WIN',
            color: '#ff0044',
            name: 'RED',
            collected: false,
            bobTimer: i * 0.4
          });
        } else {
          this.rouletteKeys.push({
            angle,
            type: 'DUMMY',
            color: '#fece2c',
            name: 'GOLD',
            collected: false,
            bobTimer: i * 0.4
          });
        }
      }

    } else if (level === 10) {
      // --- LEVEL 10: DISAPPEARING RING TRAIL ---
      // User requirement: "in level 10 The ring begins disappearing behind the player. Every segment you cross collapses into the void."
      this.levelMode = 'DISAPPEARING_RING';
      this.controlsInverted = false;
      this.targetTimeScale = 1.0;
      this.timeScale = 1.0;
      this.hideDialogue();
      this.hideAlert();
      if (this.container) this.container.classList.remove('screen-invert');

      this.player.angle = Math.PI / 2;
      this.lastPlayerTrailAngle = this.player.angle;
      this.disappearingTrail = [];

      this.door.visible = true;
      this.door.unlocked = false;
      this.door.angle = (this.player.angle + Math.PI * 1.82) % (Math.PI * 2);

      this.keyItem.angle = (this.player.angle + Math.PI * 1.0) % (Math.PI * 2);
      this.keyItem.collected = false;
      this.hasKey = false;

    } else if (level === 11) {
      // --- LEVEL 11: THREE DOORS (TWO ILLUSIONS, ONE GLOWING REAL DOOR) ---
      // User requirement: "lvl 11 Three doors appear around the ring. Two are illusions, and only one leads forward. the real doo will be glowing"
      this.levelMode = 'THREE_DOORS';
      this.controlsInverted = false;
      this.targetTimeScale = 1.0;
      this.timeScale = 1.0;
      this.hideDialogue();
      this.hideAlert();
      if (this.container) this.container.classList.remove('screen-invert');

      this.player.angle = Math.PI / 2;
      this.door.visible = false;
      this.door.unlocked = false;
      this.hasKey = true;
      this.keyItem.collected = true;

      const d1 = (this.player.angle + Math.PI * 0.65) % (Math.PI * 2);
      const d2 = (this.player.angle + Math.PI * 1.35) % (Math.PI * 2);
      const d3 = (this.player.angle + Math.PI * 1.85) % (Math.PI * 2);

      this.illusionDoors = [
        { angle: d1, isReal: false, shattered: false },
        { angle: d2, isReal: true, shattered: false }, // Radiant glowing real door
        { angle: d3, isReal: false, shattered: false }
      ];

      this.spikes = [
        { angle: (d1 + d2) / 2, spriteIdx: 0, isRetracting: true, retractTimer: 0.5, isExtended: true },
        { angle: (d2 + d3) / 2, spriteIdx: 1, isRetracting: true, retractTimer: 1.2, isExtended: true }
      ];

    } else if (level === 12) {
      // --- LEVEL 12: LIVING HEARTBEAT ARENA ---
      // User requirement: "lvl 12 The entire arena pulses like a living heart. Spikes emerge on every beat. (add heart sound sort of and give time so player could jump and the landing time if done correctly the spike goes inside)"
      this.levelMode = 'LIVING_HEART';
      this.controlsInverted = false;
      this.targetTimeScale = 1.0;
      this.timeScale = 1.0;
      this.hideDialogue();
      this.hideAlert();
      if (this.container) this.container.classList.remove('screen-invert');

      this.player.angle = Math.PI / 2;
      this.heartTimer = 0;
      this.heartPulse = 0;
      this.heartSpikeHeight = 0;
      this.playedDub = false;

      this.door.visible = true;
      this.door.unlocked = false;
      this.door.angle = (this.player.angle + Math.PI * 1.7) % (Math.PI * 2);

      this.keyItem.angle = (this.player.angle + Math.PI * 0.85) % (Math.PI * 2);
      this.keyItem.collected = false;
      this.hasKey = false;

    } else if (level === 13) {
      // --- LEVEL 13: ABYSSAL DARKNESS (SPOTLIGHT FLASHLIGHT) ---
      // User requirement: "lvl 13 The arena goes almost completely dark. Only the player's immediate surroundings are visible. (here only include spikes)"
      this.levelMode = 'DARKNESS';
      this.isDarkness = true;
      this.controlsInverted = false;
      this.targetTimeScale = 1.0;
      this.timeScale = 1.0;
      this.hideDialogue();
      this.hideAlert();
      if (this.container) this.container.classList.remove('screen-invert');

      this.player.angle = Math.PI / 2;

      this.door.visible = true;
      this.door.unlocked = false;
      this.door.angle = (this.player.angle + Math.PI * 1.75) % (Math.PI * 2);

      this.keyItem.angle = (this.player.angle + Math.PI * 0.9) % (Math.PI * 2);
      this.keyItem.collected = false;
      this.hasKey = false;

      // Only spikes!
      this.flyingSaws = [];
      this.walkers = [];
      this.lasers = [];
      this.ambushSpikes = [];
      this.collapsingSectors = [];

      this.spikes = [
        { angle: (this.player.angle + 0.5) % (Math.PI * 2), spriteIdx: 0, isRetracting: false, isExtended: true },
        { angle: (this.player.angle + 1.2) % (Math.PI * 2), spriteIdx: 1, isRetracting: false, isExtended: true },
        { angle: (this.player.angle + 2.0) % (Math.PI * 2), spriteIdx: 2, isRetracting: false, isExtended: true },
        { angle: (this.player.angle + 3.1) % (Math.PI * 2), spriteIdx: 3, isRetracting: false, isExtended: true },
        { angle: (this.player.angle + 4.2) % (Math.PI * 2), spriteIdx: 0, isRetracting: false, isExtended: true },
        { angle: (this.player.angle + 5.0) % (Math.PI * 2), spriteIdx: 1, isRetracting: false, isExtended: true }
      ];

    } else {
      // --- LEVEL 14+: INFINITE DYNAMIC RAGE BAIT COMBINATIONS ---
      // User requirement: "then lvl 14, and so on rage bait"
      const combo = level % 5;
      this.controlsInverted = (level % 7 === 0);
      this.targetTimeScale = 1.0;
      this.timeScale = 1.0;
      this.hideDialogue();
      this.hideAlert();
      if (this.container) this.container.classList.remove('screen-invert');

      this.door.visible = true;
      this.door.unlocked = false;
      this.door.angle = (this.player.angle + Math.PI + (Math.random() - 0.5) * 0.6) % (Math.PI * 2);
      this.keyItem.angle = (this.player.angle + 1.4) % (Math.PI * 2);
      this.keyItem.collected = false;
      this.hasKey = false;

      if (combo === 0) {
        // Disappearing ring + ambush spikes
        this.levelMode = 'DISAPPEARING_RING';
        this.lastPlayerTrailAngle = this.player.angle;
        this.disappearingTrail = [];
        this.ambushSpikes = [
          { angle: (this.player.angle + 0.9) % (Math.PI * 2), state: 'hidden', height: 0, triggered: false },
          { angle: (this.player.angle + 2.1) % (Math.PI * 2), state: 'hidden', height: 0, triggered: false }
        ];
      } else if (combo === 1) {
        // Darkness + ambush spikes
        this.levelMode = 'DARKNESS';
        this.isDarkness = true;
        this.spikes = [
          { angle: (this.player.angle + 0.8) % (Math.PI * 2), spriteIdx: 0, isRetracting: true, retractTimer: 0.5, isExtended: true },
          { angle: (this.player.angle + 2.2) % (Math.PI * 2), spriteIdx: 1, isRetracting: true, retractTimer: 1.5, isExtended: true }
        ];
      } else if (combo === 2) {
        // Living heart
        this.levelMode = 'LIVING_HEART';
        this.heartTimer = 0;
        this.heartPulse = 0;
        this.heartSpikeHeight = 0;
        this.playedDub = false;
      } else if (combo === 3) {
        // Three doors illusion
        this.levelMode = 'THREE_DOORS';
        this.door.visible = false;
        this.hasKey = true;
        this.keyItem.collected = true;
        const d1 = (this.player.angle + 1.1) % (Math.PI * 2);
        const d2 = (this.player.angle + 2.5) % (Math.PI * 2);
        const d3 = (this.player.angle + 4.1) % (Math.PI * 2);
        const realIdx = Math.floor(Math.random() * 3);
        this.illusionDoors = [
          { angle: d1, isReal: realIdx === 0, shattered: false },
          { angle: d2, isReal: realIdx === 1, shattered: false },
          { angle: d3, isReal: realIdx === 2, shattered: false }
        ];
      } else {
        // Rage void crumbling
        this.levelMode = 'RAGE_VOID';
        this.collapsingSectors = [
          { centerAngle: (this.player.angle + 0.8) % (Math.PI * 2), halfWidth: 0.22, state: 'idle', timer: 0 },
          { centerAngle: (this.player.angle + 2.4) % (Math.PI * 2), halfWidth: 0.22, state: 'idle', timer: 0 }
        ];
        this.ambushSpikes = [
          { angle: (this.player.angle + 1.5) % (Math.PI * 2), state: 'hidden', height: 0, triggered: false }
        ];
      }
    }

    // Set up standard door, key, and hazards if not in scripted laser or rage modes
    if (this.levelMode === 'NORMAL') {
      // Door position across from player
      this.door.angle = (this.player.angle + Math.PI + (Math.random() - 0.5) * 0.6) % (Math.PI * 2);
      if (this.door.angle < 0) this.door.angle += Math.PI * 2;

      // Key position midway
      const keyOffset = Math.random() < 0.5 ? 1.4 : -1.4;
      this.keyItem.angle = (this.player.angle + keyOffset + (Math.random() - 0.5) * 0.4) % (Math.PI * 2);
      if (this.keyItem.angle < 0) this.keyItem.angle += Math.PI * 2;
      this.keyItem.collected = false;

      // Spikes
      const spikeCount = Math.min(6, 2 + Math.floor(level * 0.7));
      const reservedAngles = [this.player.angle, this.door.angle, this.keyItem.angle];

      for (let i = 0; i < spikeCount; i++) {
        let candidate = Math.random() * Math.PI * 2;
        let valid = true;
        for (const res of reservedAngles) {
          const diff = Math.abs(Math.atan2(Math.sin(candidate - res), Math.cos(candidate - res)));
          if (diff < 0.35) {
            valid = false;
            break;
          }
        }
        if (valid) {
          this.spikes.push({
            angle: candidate,
            spriteIdx: i % 4,
            isRetracting: level >= 2 && Math.random() < 0.45,
            retractTimer: Math.random() * 3,
            isExtended: true
          });
          reservedAngles.push(candidate);
        }
      }

      // Flying Saws
      if (level >= 2) {
        const sawCount = 1;
        for (let i = 0; i < sawCount; i++) {
          this.flyingSaws.push({
            angle: (this.door.angle + Math.PI * 0.5 * (i + 1)) % (Math.PI * 2),
            orbitSpeed: (0.35 + level * 0.05) * (i % 2 === 0 ? 1 : -1),
            heightOffset: 26 + (i % 2) * 12,
            rotation: 0
          });
        }
      }
    }

    // --- DECAY MECHANIC CONFIGURATION (ACTIVE FOR LEVEL >= 4) ---
    // User requirement: "the decay concept will remain after level 3"
    if (level >= 4) {
      this.decayActive = true;
      this.decayDuration = 8.0;
      this.decayTimer = this.decayDuration;
      this.decayAudioStarted = false;
      this.isDecayDemoting = false;
      this.outerRingDecaying = false;
      this.decayGaugeParticles = [];
      if (this.player) {
        this.player.isFloatingInSpace = false;
        this.player.tumbleAngle = 0;
      }
      this.audio.stopDecayAudio();

      const container = document.getElementById('decay-meter-container');
      if (container) container.classList.remove('hidden', 'caution-phase', 'warning-phase');
      const timerVal = document.getElementById('decay-timer-val');
      if (timerVal) timerVal.textContent = '8.0s';
      const barFill = document.getElementById('decay-bar-fill');
      if (barFill) barFill.style.width = '100%';
      this.renderDecayGauge(0.016, 1.0);
    } else {
      this.decayActive = false;
      this.decayAudioStarted = false;
      this.isDecayDemoting = false;
      this.outerRingDecaying = false;
      this.decayGaugeParticles = [];
      if (this.player) {
        this.player.isFloatingInSpace = false;
        this.player.tumbleAngle = 0;
      }
      this.audio.stopDecayAudio();

      const container = document.getElementById('decay-meter-container');
      if (container) container.classList.add('hidden');
    }

    this.updateHUD();
  }

  // Organic harmonic undulating ripples
  getWobble(angle, time, phase = 0) {
    const t = time;
    const l1 = Math.sin(3 * angle + 1.15 * t + phase) * 16;
    const l2 = Math.sin(5 * angle - 1.45 * t + phase + 1.2) * 8.5;
    const l3 = Math.cos(2 * angle + 0.75 * t) * 6;

    let dmg = 0;
    if (this.damageDeformTimer > 0) {
      const decay = this.damageDeformTimer / 0.45;
      dmg = Math.sin(10 * angle - 16 * this.damageDeformTimer) * this.damageDeformIntensity * decay;
    }

    return (l1 + l2 + l3 + dmg) * this.scale;
  }

  // Outer running wall radius (Ring 0 outer rim)
  getFloorRadius(angle) {
    let heartPulseOffset = 0;
    if (this.levelMode === 'LIVING_HEART' && this.heartPulse) {
      heartPulseOffset = this.heartPulse * 16 * this.scale;
    }
    return (this.BASE_R0_OUTER * this.scale) + this.getWobble(angle, this.gameTime, 0) + heartPulseOffset;
  }

  triggerJump() {
    if (this.player.isGrounded || this.player.coyoteTimer > 0) {
      // Inward jump velocity
      this.player.vr = 390 * Math.sqrt(this.scale);
      this.player.isGrounded = false;
      this.player.coyoteTimer = 0;
      this.audio.play('jump', 0.8);

      const r = this.getFloorRadius(this.player.angle) - 2 * this.scale;
      const px = this.cx + r * Math.cos(this.player.angle);
      const py = this.cy + r * Math.sin(this.player.angle);
      this.particles.emit(px, py, 8, {
        color: '#ffffff',
        speed: 35 * this.scale,
        life: 0.35,
        size: 3 * this.scale
      });
    }
  }

  takeDamage() {
    if (this.player.invincibleTimer > 0 || this.state !== 'PLAYING') return;

    this.lives--;
    this.player.invincibleTimer = 2.4;
    this.screenShake = 16;
    this.damageDeformTimer = 0.45;
    this.damageDeformIntensity = 20;

    this.audio.play('hit', 0.9);

    // Slight knockback in direction opposite to facing
    this.player.omega = -this.player.facing * 0.7;
    this.player.vr = 220 * Math.sqrt(this.scale);
    this.player.isGrounded = false;

    const r = this.getFloorRadius(this.player.angle) - 2 * this.scale;
    const px = this.cx + r * Math.cos(this.player.angle);
    const py = this.cy + r * Math.sin(this.player.angle);
    this.particles.emit(px, py, 20, {
      color: '#ff2a6d',
      speed: 120 * this.scale,
      life: 0.6,
      size: 4 * this.scale
    });

    this.updateHUD();

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Respawn at current level checkpoint
      this.respawnInCurrentLevel();
    }
  }

  fallIntoVoid() {
    if (this.player.invincibleTimer > 0 || this.state !== 'PLAYING') return;

    this.lives--;
    this.screenShake = 22;
    this.audio.play('void_fall', 1.0);

    const r = this.getFloorRadius(this.player.angle) - 2 * this.scale;
    const px = this.cx + r * Math.cos(this.player.angle);
    const py = this.cy + r * Math.sin(this.player.angle);
    this.particles.emit(px, py, 35, {
      color: '#00ffff',
      speed: 150 * this.scale,
      life: 0.7,
      size: 4.5 * this.scale
    });

    this.updateHUD();

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Checkpoint respawn at start of current level
      this.respawnInCurrentLevel();
    }
  }

  respawnInCurrentLevel() {
    this.player.angle = (this.level === 4) ? (3 * Math.PI / 2) : (Math.PI / 2);
    this.player.omega = 0;
    this.player.radialHeight = 0;
    this.player.vr = 0;
    this.player.isGrounded = true;
    this.player.invincibleTimer = 2.4; // 2.4 seconds invincibility

    // Reset lasers for level 3 / 4 if player took damage
    if (this.level === 3) {
      for (const l of this.lasers) {
        if (l.id === 'top_down') l.pos = this.cy - 320 * this.scale;
        if (l.id === 'left_right') l.pos = this.cx - 320 * this.scale;
      }
    } else if (this.level === 4) {
      for (const l of this.lasers) {
        if (l.id === 'bottom_up') l.pos = this.cy + 320 * this.scale;
        if (l.id === 'right_left') l.pos = this.cx + 320 * this.scale;
      }
    }

    // Reset triggered ambush spikes & collapsing sectors so they can be re-navigated
    for (const spike of this.ambushSpikes) {
      spike.state = 'hidden';
      spike.height = 0;
      spike.triggered = false;
    }
    for (const sector of this.collapsingSectors) {
      sector.state = 'idle';
      sector.timer = 0;
    }

    // Reset roulette keys if collected
    if (this.rouletteKeys) {
      for (const k of this.rouletteKeys) {
        k.collected = false;
      }
    }

    // Reset disappearing trail
    this.disappearingTrail = [];
    this.lastPlayerTrailAngle = this.player.angle;

    // Reset illusion doors
    if (this.illusionDoors) {
      for (const d of this.illusionDoors) {
        d.shattered = false;
      }
    }

    // Reset heart timer
    this.heartTimer = 0;
    this.heartPulse = 0;
    this.heartSpikeHeight = 0;
    this.playedDub = false;
  }

  gameOver() {
    this.state = 'GAMEOVER';
    this.audio.play('death', 1.0);

    if (this.level > this.bestDepth) {
      this.bestDepth = this.level;
      localStorage.setItem('abyss_best_depth', this.bestDepth.toString());
    }

    document.getElementById('stat-depth').textContent = this.level;
    document.getElementById('stat-best').textContent = this.bestDepth;
    document.getElementById('stat-keys').textContent = this.keysCollected;
    document.getElementById('gameover-overlay').classList.remove('hidden');
  }

  startAbyssTransition() {
    this.state = 'TRANSITION';
    this.transitionProgress = 0;
    this.player.omega = 0;
    this.player.radialHeight = 0;
    this.player.angle = this.door.angle;

    // Reset decay timer on clear as requested by user
    if (this.decayActive) {
      this.decayTimer = this.decayDuration;
      this.decayAudioStarted = false;
      this.decayGaugeParticles = [];
      this.audio.stopDecayAudio();
      this.screenShake = 0;
      const container = document.getElementById('decay-meter-container');
      if (container) container.classList.remove('caution-phase', 'warning-phase');
      const barFill = document.getElementById('decay-bar-fill');
      if (barFill) barFill.style.width = '100%';
      const timerVal = document.getElementById('decay-timer-val');
      if (timerVal) timerVal.textContent = '8.0s';
      this.renderDecayGauge(0.016, 1.0);
    }

    this.audio.play('win', 1.0);

    const rGate = (this.BASE_R1_OUTER * this.scale) + this.getWobble(this.door.angle, this.gameTime, 1.2);
    const gx = this.cx + rGate * Math.cos(this.door.angle);
    const gy = this.cy + rGate * Math.sin(this.door.angle);
    this.particles.emit(gx, gy, 40, {
      color: '#ffffff',
      speed: 150 * this.scale,
      life: 0.8,
      size: 5 * this.scale
    });
  }

  updateDecay(dt) {
    if (this.isDecayDemoting) {
      // Keep gauge rendering at 0% during zero-g float
      this.renderDecayGauge(dt, 0);

      // Space floating physics when outer surface disintegrated
      this.decayDemoteTimer += dt;
      const p = this.player;

      // Cinematic zero-g inward drift: player floats automatically and smoothly all the way to center (0.0s - 2.4s)
      // No key presses (W / Up) required
      const floatProgress = Math.min(1.0, this.decayDemoteTimer / 2.4);
      const floatEase = floatProgress < 0.5
        ? 4 * floatProgress * floatProgress * floatProgress
        : 1 - Math.pow(-2 * floatProgress + 2, 3) / 2;

      const floorR = this.getFloorRadius(p.angle) - 2 * this.scale;
      const startR = (this.decayDemoteStartRadius !== undefined) ? this.decayDemoteStartRadius : floorR;
      const currentR = startR * (1 - floatEase);
      p.radialHeight = floorR - currentR;
      p.isGrounded = false;
      p.vr = 0;

      // Gentle zero-g tumbling rotation as player drifts into center
      p.omega *= Math.pow(0.92, dt * 60);
      p.angle -= p.omega * dt;
      p.tumbleAngle = (p.tumbleAngle || 0) + (0.75 + Math.abs(p.omega)) * dt;

      // Visual Timeline per User Requirements:
      // 0.0s - 2.4s: Floor disappears, player floats smoothly and automatically all the way to center
      // 2.4s - 4.6s: Once player reaches center, fine retro black & red pixel corruption creeps in towards center
      // 4.6s - 5.2s: Glitch transition (scanlines & chromatic flicker with glitch audio)
      // 5.2s - 5.8s: Clean black screen void (blackout)
      // 5.8s+: Regress to previous level, fade out smoothly into new level!
      const overlay = document.getElementById('decay-demote-overlay');
      if (overlay) {
        if (this.decayDemoteTimer >= 4.6 && this.decayDemoteTimer < 5.2) {
          // Phase 1: Earlier subtle glitch effect
          if (!overlay.classList.contains('glitch-active')) {
            overlay.classList.remove('hidden', 'blackout', 'fade-out');
            overlay.classList.add('glitch-active');
            this.audio.play('glitch', 0.85);
          }
        } else if (this.decayDemoteTimer >= 5.2) {
          // Phase 2: Clean solid black screen void
          if (!overlay.classList.contains('blackout')) {
            overlay.classList.remove('glitch-active');
            overlay.classList.add('blackout');
          }
        }
      }

      // Finish demotion and regress to previous level
      if (this.decayDemoteTimer >= this.decayDemoteDuration) {
        const prevLevel = Math.max(1, this.level - 1);
        this.isDecayDemoting = false;
        p.isFloatingInSpace = false;
        p.radialHeight = 0;
        p.vr = 0;
        p.isGrounded = true;
        p.tumbleAngle = 0;
        this.outerRingDecaying = false;
        this.decayAudioStarted = false;
        this.audio.stopDecayAudio();

        if (overlay) {
          overlay.classList.remove('blackout', 'glitch-active');
          overlay.classList.add('fade-out');
          setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('fade-out');
          }, 700);
        }

        this.level = prevLevel;
        this.spawnLevel(this.level);
        this.updateHUD();
      }
      return;
    }

    // Normal decay countdown
    this.decayTimer = Math.max(0, this.decayTimer - dt);
    const pct = Math.max(0, Math.min(1, this.decayTimer / this.decayDuration));

    // Update UI elements & state classes
    const timerVal = document.getElementById('decay-timer-val');
    const barFill = document.getElementById('decay-bar-fill');
    const container = document.getElementById('decay-meter-container');

    if (timerVal) timerVal.textContent = this.decayTimer.toFixed(1) + 's';
    if (barFill) barFill.style.width = (pct * 100) + '%';

    if (container) {
      if (pct <= 0.25) {
        container.classList.add('warning-phase');
        container.classList.remove('caution-phase');
      } else if (pct <= 0.5) {
        container.classList.add('caution-phase');
        container.classList.remove('warning-phase');
      } else {
        container.classList.remove('caution-phase', 'warning-phase');
      }
    }

    // Render the Semicircular Segmented Decay Gauge
    this.renderDecayGauge(dt, pct);

    // Halfway mark (4.0s or less):
    // 1. Play decay audio
    // 2. Increase camera shake noticeably as requested by user
    if (this.decayTimer <= 4.0) {
      if (!this.decayAudioStarted) {
        this.decayAudioStarted = true;
        this.audio.playDecayAudio();
      }

      // Camera shake scales up noticeably as timer approaches zero (increased intensity)
      const shakeFactor = (4.0 - this.decayTimer) / 4.0;
      this.screenShake = Math.max(this.screenShake, 4.0 + shakeFactor * 7.0);
    }

    // Timer hits 0: Trigger zero-g disintegration & space float demotion!
    if (this.decayTimer <= 0 && !this.isDecayDemoting) {
      this.triggerDecayDemote();
    }
  }

  triggerDecayDemote() {
    this.isDecayDemoting = true;
    this.decayDemoteTimer = 0;
    this.outerRingDecaying = true;
    this.player.isFloatingInSpace = true;
    this.player.isGrounded = false;
    this.player.vr = 0;
    this.screenShake = 18; // Platform collapse impact

    const floorR = this.getFloorRadius(this.player.angle) - 2 * this.scale;
    this.decayDemoteStartRadius = Math.max(10, floorR - this.player.radialHeight);

    this.audio.play('hit', 1.0);

    // Start decay audio if not already playing so it plays completely
    if (!this.decayAudioStarted) {
      this.decayAudioStarted = true;
      this.audio.playDecayAudio();
    }

    // Emit crumbling ring shards all around the outer ring
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      const r = (this.BASE_R0_OUTER * this.scale);
      const px = this.cx + r * Math.cos(a);
      const py = this.cy + r * Math.sin(a);
      this.particles.emit(px, py, 4, {
        color: Math.random() < 0.5 ? '#ff0055' : '#ff9900',
        speed: 110 * this.scale,
        life: 0.8,
        size: 4 * this.scale
      });
    }
  }

  // Neon color transition based on decay percentage
  getDecayColor(pct) {
    if (pct > 0.5) {
      // 1.0 (Cyber Green #00ff9d) -> 0.5 (Solar Gold #ffd000)
      const t = (pct - 0.5) / 0.5;
      const r = Math.round(255 * (1 - t));
      const g = Math.round(208 + (255 - 208) * t);
      const b = Math.round(157 * t);
      return {
        main: `rgb(${r}, ${g}, ${b})`,
        glow: t > 0.65 ? '#00ff9d' : '#ffe600'
      };
    } else {
      // 0.5 (Solar Gold #ffd000) -> 0.0 (Neon Crimson #ff0055)
      const t = Math.max(0, pct / 0.5);
      const r = 255;
      const g = Math.round(208 * t);
      const b = Math.round(85 * (1 - t));
      return {
        main: `rgb(${r}, ${g}, ${b})`,
        glow: '#ff0055'
      };
    }
  }

  // Renders the glowing left-edge semicircle decay gauge (Anchored to left border in semicircle format showing 8s)
  renderDecayGauge(dt, pct) {
    if (!this.decayGaugeCanvas) {
      this.decayGaugeCanvas = document.getElementById('decay-gauge-canvas');
      if (this.decayGaugeCanvas) {
        this.decayGaugeCtx = this.decayGaugeCanvas.getContext('2d');
      }
    }
    const ctx = this.decayGaugeCtx;
    if (!ctx) return;

    const w = this.decayGaugeCanvas.width;
    const h = this.decayGaugeCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const cy = h / 2;
    const decayColor = this.getDecayColor(pct);

    // 1. Dark high-contrast glass backing semicircle (Flat against left edge, curving right)
    const rBacking = 330;
    ctx.beginPath();
    ctx.arc(0, cy, rBacking, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(0, cy - rBacking);
    ctx.closePath();

    const bgGrad = ctx.createRadialGradient(0, cy, 30, 0, cy, rBacking);
    bgGrad.addColorStop(0, 'rgba(18, 12, 30, 0.97)');
    bgGrad.addColorStop(0.74, 'rgba(8, 4, 16, 0.98)');
    bgGrad.addColorStop(1, 'rgba(3, 1, 6, 1.0)');
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Subtle luminous outer stroke
    ctx.strokeStyle = decayColor.glow;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // 2. Semicircular Segmented Radial Arc (180 degree true semicircle from -PI/2 to +PI/2)
    const totalSegments = 24;
    const dTheta = Math.PI / totalSegments;
    const gap = 0.032;
    const activeCount = Math.round(pct * totalSegments);
    const rInner = 260;
    const rOuter = 314; // 54px chunky block width
    const rMid = (rInner + rOuter) / 2;

    for (let i = 0; i < totalSegments; i++) {
      const a0 = -Math.PI / 2 + i * dTheta + gap / 2;
      const a1 = -Math.PI / 2 + (i + 1) * dTheta - gap / 2;
      const isActive = i < activeCount;

      ctx.beginPath();
      ctx.arc(0, cy, rOuter, a0, a1, false);
      ctx.arc(0, cy, rInner, a1, a0, true);
      ctx.closePath();

      if (isActive) {
        ctx.save();
        ctx.fillStyle = decayColor.main;
        ctx.shadowColor = decayColor.glow;
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.restore();
      } else {
        // Inactive sleek translucent track segment
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 3. Crisp Semicircle Time Markers ("8s", "6s", "4s", "2s", "0s")
    // Showing 8 seconds explicitly formatted along the semicircle curve
    const markers = [
      { text: '8s', angle: -Math.PI / 2 },
      { text: '6s', angle: -Math.PI / 4 },
      { text: '4s', angle: 0 },
      { text: '2s', angle: Math.PI / 4 },
      { text: '0s', angle: Math.PI / 2 }
    ];

    ctx.save();
    ctx.font = "800 13px 'Press Start 2P', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const rMarker = 236;
    for (const m of markers) {
      const mx = Math.max(22, rMarker * Math.cos(m.angle));
      const my = cy + rMarker * Math.sin(m.angle);
      ctx.fillStyle = decayColor.glow;
      ctx.shadowColor = decayColor.glow;
      ctx.shadowBlur = 8;
      ctx.fillText(m.text, mx, my);
    }
    ctx.restore();

    // 4. Trailing Dissolver Embers / Particles at Leading Active Tip
    if (activeCount > 0 && pct > 0.01) {
      const tipAngle = -Math.PI / 2 + activeCount * dTheta;
      const tipX = rMid * Math.cos(tipAngle);
      const tipY = cy + rMid * Math.sin(tipAngle);

      for (let k = 0; k < 2; k++) {
        const spd = 26 + Math.random() * 36;
        const tanAngle = tipAngle + Math.PI / 2 + (Math.random() - 0.5) * 0.9;
        this.decayGaugeParticles.push({
          x: tipX + (Math.random() - 0.5) * 8,
          y: tipY + (Math.random() - 0.5) * 8,
          vx: Math.cos(tanAngle) * spd + (Math.random() - 0.5) * 16,
          vy: Math.sin(tanAngle) * spd + (Math.random() - 0.5) * 16,
          size: 2.6 + Math.random() * 4.8,
          life: 0.6 + Math.random() * 0.35,
          maxLife: 0.95,
          color: decayColor.glow
        });
      }
    }

    // Update and draw existing trailing particles
    for (let i = this.decayGaugeParticles.length - 1; i >= 0; i--) {
      const p = this.decayGaugeParticles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.decayGaugeParticles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(0.92, dt * 60);
      p.vy *= Math.pow(0.92, dt * 60);

      const pAlpha = Math.max(0, p.life / p.maxLife);
      const pSize = p.size * (0.35 + 0.65 * pAlpha);

      ctx.save();
      ctx.globalAlpha = pAlpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, pSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Center Labels inside Semicircle (DECAY + big bold 8-second timer + percentage)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textX = 112;

    // Top: "DECAY" title
    ctx.font = "900 16px 'Press Start 2P', monospace";
    ctx.fillStyle = decayColor.main;
    ctx.shadowColor = decayColor.glow;
    ctx.shadowBlur = 10;
    ctx.fillText('DECAY', textX, cy - 48);

    // Center: Big Bold 8-Second Countdown Timer (Showing 8.0s down to 0.0s)
    ctx.font = "900 52px 'Outfit', sans-serif";
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = decayColor.glow;
    ctx.shadowBlur = 20;
    ctx.fillText(this.decayTimer.toFixed(1) + 's', textX, cy + 12);

    // Bottom: Percentage
    const pctInt = Math.round(pct * 100);
    ctx.font = "800 24px 'Outfit', sans-serif";
    ctx.fillStyle = decayColor.main;
    ctx.shadowBlur = 8;
    ctx.fillText(`${pctInt}%`, textX, cy + 60);

    ctx.restore();
  }

  // Renders retro blackish-reddish pixel corruption closing up towards center
  drawPixelCorruption(ctx) {
    if (!this.decayActive || !this.isDecayDemoting) return;

    // First 2.4s: user clearly sees platform break and person float all the way to center
    if (this.decayDemoteTimer < 2.4) return;

    // Once player reaches center, fine retro black and red pixels steadily creep in (2.4s to 4.6s)
    const rawProgress = Math.min(1.0, (this.decayDemoteTimer - 2.4) / 2.2);
    const demoteProgress = Math.pow(rawProgress, 1.12);

    // Fine, dense retro digital pixels (~7-8px) instead of huge chunky blocks
    const pixelSize = Math.max(7, Math.floor(8 * this.scale));
    const cols = Math.ceil(this.width / pixelSize);
    const rows = Math.ceil(this.height / pixelSize);

    const D_max = Math.hypot(this.cx, this.cy);
    const maxEdge = Math.min(this.width, this.height) * 0.5;

    const getNoise = (x, y) => {
      let n = (x * 374761393 + y * 668265263) ^ 0x5bf03635;
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
    };

    ctx.save();

    for (let c = 0; c < cols; c++) {
      const px = (c + 0.5) * pixelSize;
      const distEdgeX = Math.min(px, this.width - px);

      for (let r = 0; r < rows; r++) {
        const py = (r + 0.5) * pixelSize;
        const distCenter = Math.hypot(px - this.cx, py - this.cy);

        const distEdgeY = Math.min(py, this.height - py);
        const distEdge = Math.min(distEdgeX, distEdgeY);

        // Chunky 2x2 macro-block noise + micro cell noise for natural pixel clusters
        const bx = Math.floor(c / 2);
        const by = Math.floor(r / 2);
        const bNoise = getNoise(bx, by);
        const cNoise = getNoise(c, r);
        const noise = bNoise * 0.65 + cNoise * 0.35;

        // Inward progression metrics: distance from outer edges and center
        const edgeProgress = Math.max(0, 1 - (distEdge / maxEdge));
        const radProgress = Math.min(1.0, distCenter / (D_max * 0.72));
        const creepProgress = edgeProgress * 0.68 + radProgress * 0.32;

        // Threshold advancing towards center - when demoteProgress >= 1.0, covers 100%
        const threshold = (1.0 - demoteProgress * 1.15) + (noise - 0.5) * 0.22;

        if (creepProgress < threshold) {
          continue;
        }

        const invasionDepth = creepProgress - threshold;

        // Authentic Retro Thematic Blackish-Reddish Palette
        if (invasionDepth > 0.24) {
          // Deep consumed zone: mostly void obsidian with bruised maroon
          if (cNoise < 0.55) {
            ctx.fillStyle = '#050207'; // obsidian black
          } else if (cNoise < 0.80) {
            ctx.fillStyle = '#0f020a'; // charred black
          } else if (cNoise < 0.93) {
            ctx.fillStyle = '#22010c'; // dried blood maroon
          } else {
            ctx.fillStyle = '#450014'; // deep burgundy
          }
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        } else if (invasionDepth > 0.06) {
          // Mid creeping zone: rich blackish-reddish mosaic
          if (cNoise < 0.35) {
            ctx.fillStyle = '#09030d'; // void charcoal
          } else if (cNoise < 0.65) {
            ctx.fillStyle = '#2d010d'; // blood maroon
          } else if (cNoise < 0.85) {
            ctx.fillStyle = '#520018'; // charred crimson
          } else {
            ctx.fillStyle = '#7a0024'; // raw burgundy
          }
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        } else {
          // Frontline creeping edge: glowing jagged crimson with digital flicker
          const flicker = (Math.sin(this.gameTime * 24 + c * 5 + r * 7) > 0.1) ? 1.0 : 0.7;
          ctx.globalAlpha = flicker;
          if (cNoise < 0.40) {
            ctx.fillStyle = '#ff0044'; // vivid neon crimson
          } else if (cNoise < 0.70) {
            ctx.fillStyle = '#bd002a'; // rich blood scarlet
          } else {
            ctx.fillStyle = '#5a0014'; // dark edge ember
          }
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);

          // Hot 1px edge highlight for retro pixel accent
          if (cNoise < 0.30) {
            ctx.fillStyle = '#ff6b8b';
            ctx.fillRect(c * pixelSize + 1, r * pixelSize + 1, pixelSize - 2, 2);
          }
          ctx.globalAlpha = 1.0;
        }
      }
    }

    ctx.restore();
  }

  update(dt, rawDt = dt) {
    this.gameTime += dt;
    this.particles.update(dt);

    // Dialogue and alert timers
    if (this.dialogueTimer > 0) {
      this.dialogueTimer -= rawDt;
      if (this.dialogueTimer <= 0) {
        this.hideDialogue();
      }
    }
    if (this.alertTimer > 0) {
      this.alertTimer -= rawDt;
      if (this.alertTimer <= 0) {
        this.hideAlert();
      }
    }

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 45);
    }
    if (this.damageDeformTimer > 0) {
      this.damageDeformTimer -= dt;
    }

    for (const m of this.ambientMotes) {
      m.angle += m.speed * dt;
      m.dist += m.radSpeed * dt * this.scale;
      if (m.dist > 520 * this.scale) m.dist = 40 * this.scale;
      if (m.dist < 40 * this.scale) m.dist = 520 * this.scale;
    }

    if (this.state === 'PLAYING') {
      if (this.decayActive) {
        this.updateDecay(dt);
      }
      this.updatePlayer(dt);
      this.updateHazards(dt);
      this.checkCollisions();
    } else if (this.state === 'TRANSITION') {
      this.updateTransition(dt);
    }
  }

  updatePlayer(dt) {
    const p = this.player;

    if (this.isDecayDemoting) {
      // Space floating physics when outer surface disintegrated
      return;
    }

    if (p.invincibleTimer > 0) {
      p.invincibleTimer -= dt;
    }

    // 1. Smooth Angular Motion Physics (Buttery responsiveness & natural friction)
    let inputDir = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) inputDir -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) inputDir += 1;

    // Twist Mechanic: Controls Inversion
    if (this.controlsInverted) {
      inputDir = -inputDir;
    }

    const targetOmega = inputDir * p.maxOmega;

    if (inputDir !== 0) {
      // Accelerate smoothly toward target velocity
      if (Math.sign(p.omega) !== inputDir && Math.abs(p.omega) > 0.05) {
        // Turning around has extra grip
        p.omega += inputDir * p.accel * 2.5 * dt;
      } else {
        p.omega += (targetOmega - p.omega) * (1 - Math.exp(-p.accel * dt));
      }
      p.facing = inputDir;
    } else {
      // Exponential damping to a smooth halt
      p.omega *= Math.exp(-p.friction * dt);
      if (Math.abs(p.omega) < 0.015) {
        p.omega = 0;
      }
    }

    // Advance angle around circle:
    p.angle -= p.omega * dt;
    p.angle = (p.angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

    p.isRunning = Math.abs(p.omega) > 0.06;

    // Sync animation speed with actual angular movement speed
    if (p.isRunning && p.isGrounded) {
      p.animTime += dt * (Math.abs(p.omega) / p.maxOmega) * 16;
      p.animFrame = Math.floor(p.animTime) % 16;

      p.footstepCooldown -= dt;
      if (p.footstepCooldown <= 0) {
        p.footstepCooldown = 0.22 / Math.max(0.4, Math.abs(p.omega) / p.maxOmega);
        this.audio.play('move', 0.2);

        const r = this.getFloorRadius(p.angle) - 2 * this.scale;
        const px = this.cx + r * Math.cos(p.angle);
        const py = this.cy + r * Math.sin(p.angle);
        const trailColor = this.controlsInverted ? 'rgba(255, 0, 85, 0.7)' : 'rgba(0, 242, 254, 0.7)';
        this.particles.emit(px, py, 2, {
          color: trailColor,
          speed: 24 * this.scale,
          life: 0.25,
          size: 2.2 * this.scale
        });
      }
    } else if (p.isGrounded) {
      p.animFrame = 0;
    }

    // 2. Radial Jump Physics (Inward toward center, gravity pulls outward)
    if (!p.isGrounded) {
      p.animFrame = 4;
      // Gravity pulls outward back toward the outer wall
      const gravity = (p.vr < 0 ? 1200 : 900) * this.scale;
      p.vr -= gravity * dt;
      p.radialHeight += p.vr * dt;

      // Landed back on outer wall
      if (p.radialHeight <= 0) {
        p.radialHeight = 0;
        p.vr = 0;
        p.isGrounded = true;

        const r = this.getFloorRadius(p.angle) - 2 * this.scale;
        const px = this.cx + r * Math.cos(p.angle);
        const py = this.cy + r * Math.sin(p.angle);
        this.particles.emit(px, py, 5, {
          color: '#ffffff',
          speed: 30 * this.scale,
          life: 0.25,
          size: 2.5 * this.scale
        });
      }
    } else {
      p.coyoteTimer = 0.12;
    }

    if (!p.isGrounded && p.coyoteTimer > 0) {
      p.coyoteTimer -= dt;
    }
  }

  updateHazards(dt) {
    // 1. Lasers Update
    for (const laser of this.lasers) {
      if (laser.oscillate) {
        laser.pos += laser.dir * laser.speed * dt;
        if (laser.pos >= laser.maxPos) {
          laser.pos = laser.maxPos;
          laser.dir = -1;
        } else if (laser.pos <= laser.minPos) {
          laser.pos = laser.minPos;
          laser.dir = 1;
        }
      } else if (laser.targetPos !== undefined) {
        const diff = laser.targetPos - laser.pos;
        if (Math.abs(diff) > 1) {
          laser.pos += Math.sign(diff) * Math.min(Math.abs(diff), laser.speed * dt);
        }
      }
    }

    // Check scripted door sudden opening beneath player for laser levels
    if (this.levelMode === 'LASER_CORNER') {
      const topLaser = this.lasers.find(l => l.id === 'top_down');
      // "in 3rd level laser one dont give the door in start, let the laser come too close then suddenly door opens below them taking to next level"
      if (topLaser && topLaser.pos >= this.cy + 130 * this.scale) {
        if (!this.door.unlocked) {
          this.door.angle = this.player.angle;
          this.door.visible = true;
          this.door.unlocked = true;
          this.hasKey = true;
          this.audio.play('win', 1.0);
          const rDoor = this.getFloorRadius(this.door.angle) - 2 * this.scale;
          this.particles.emit(this.cx + rDoor * Math.cos(this.door.angle), this.cy + rDoor * Math.sin(this.door.angle), 40, {
            color: '#00ffff',
            speed: 160 * this.scale,
            life: 0.8,
            size: 5 * this.scale
          });
          // Suddenly plunge through the newly opened door below them directly into next level!
          this.startAbyssTransition();
        }
      }
    } else if (this.levelMode === 'LASER_INVERT') {
      const bottomLaser = this.lasers.find(l => l.id === 'bottom_up');
      if (bottomLaser && bottomLaser.pos <= this.cy - 130 * this.scale) {
        if (!this.door.unlocked) {
          this.door.angle = this.player.angle;
          this.door.visible = true;
          this.door.unlocked = true;
          this.hasKey = true;
          this.audio.play('win', 1.0);
          const rDoor = this.getFloorRadius(this.door.angle) - 2 * this.scale;
          this.particles.emit(this.cx + rDoor * Math.cos(this.door.angle), this.cy + rDoor * Math.sin(this.door.angle), 40, {
            color: '#ff0055',
            speed: 160 * this.scale,
            life: 0.8,
            size: 5 * this.scale
          });
          // Plunge into Level 5!
          this.startAbyssTransition();
        }
      }
    }

    // 2. Ambush Spikes Update
    for (const spike of this.ambushSpikes) {
      const diff = Math.abs(Math.atan2(Math.sin(this.player.angle - spike.angle), Math.cos(this.player.angle - spike.angle)));
      if (diff < 0.28 && spike.state === 'hidden') {
        spike.state = 'triggering';
        spike.triggered = true;
        this.audio.play('warning', 0.7);
        const rSpk = this.getFloorRadius(spike.angle) - 2 * this.scale;
        this.particles.emit(this.cx + rSpk * Math.cos(spike.angle), this.cy + rSpk * Math.sin(spike.angle), 10, {
          color: '#ff0055',
          speed: 60 * this.scale,
          life: 0.35,
          size: 3 * this.scale
        });
      }
      if (spike.state === 'triggering') {
        spike.height = Math.min(1, spike.height + dt * 4.5);
        if (spike.height >= 1) spike.state = 'extended';
      }
    }

    // 3. Collapsing Floor Sectors Update
    for (const sector of this.collapsingSectors) {
      const diff = Math.abs(Math.atan2(Math.sin(this.player.angle - sector.centerAngle), Math.cos(this.player.angle - sector.centerAngle)));
      if (diff < sector.halfWidth && sector.state === 'idle') {
        sector.state = 'cracking';
        this.audio.play('glitch', 0.6);
      }
      if (sector.state === 'cracking') {
        sector.timer += dt;
        if (sector.timer > 0.45) {
          sector.state = 'fallen';
          this.audio.play('hit', 0.5);
          const r = this.getFloorRadius(sector.centerAngle);
          this.particles.emit(this.cx + r * Math.cos(sector.centerAngle), this.cy + r * Math.sin(sector.centerAngle), 20, {
            color: '#ff4757',
            speed: 80 * this.scale,
            life: 0.5,
            size: 3 * this.scale
          });
        }
      }
    }

    // 4. Standard Retracting Spikes
    for (const s of this.spikes) {
      if (s.isRetracting) {
        s.retractTimer += dt;
        s.isExtended = (s.retractTimer % 3.2) < 2.0;
      }
    }

    // 5. Flying Saws
    for (const saw of this.flyingSaws) {
      saw.angle = (saw.angle + saw.orbitSpeed * dt) % (Math.PI * 2);
      saw.rotation += dt * 12;
    }

    // 6. Walkers
    for (const w of this.walkers) {
      w.angle = (w.angle + w.dir * w.speed * dt) % (Math.PI * 2);
      w.animTime += dt * 8;
      w.animFrame = Math.floor(w.animTime) % 6;
      if (Math.random() < 0.005) {
        w.dir *= -1;
      }
    }

    // 7. Key Item Animation
    this.keyItem.bobTimer += dt * 3.5;
    this.keyItem.sparkleTimer += dt;
    if (this.keyItem.sparkleTimer > 0.25 && !this.keyItem.collected && !this.hasKey) {
      this.keyItem.sparkleTimer = 0;
      const r = this.getFloorRadius(this.keyItem.angle) - (28 * this.scale) + Math.sin(this.keyItem.bobTimer) * 4;
      const kx = this.cx + r * Math.cos(this.keyItem.angle);
      const ky = this.cy + r * Math.sin(this.keyItem.angle);
      this.particles.emit(kx, ky, 2, {
        color: '#fece2c',
        speed: 25 * this.scale,
        life: 0.4,
        size: 3 * this.scale,
        shape: 'star'
      });
    }

    // 8. Key Roulette Animation (Levels 8 & 9)
    if (this.rouletteKeys) {
      for (const k of this.rouletteKeys) {
        k.bobTimer += dt * 3.5;
      }
    }

    // 9. Disappearing Ring Trail (Level 10)
    if (this.levelMode === 'DISAPPEARING_RING') {
      if (this.lastPlayerTrailAngle === null || this.lastPlayerTrailAngle === undefined) {
        this.lastPlayerTrailAngle = this.player.angle;
      }
      const trailDiff = Math.abs(Math.atan2(Math.sin(this.player.angle - this.lastPlayerTrailAngle), Math.cos(this.player.angle - this.lastPlayerTrailAngle)));
      if (trailDiff > 0.16) {
        this.disappearingTrail.push({
          centerAngle: this.lastPlayerTrailAngle,
          halfWidth: 0.14,
          state: 'cracking',
          timer: 0
        });
        this.lastPlayerTrailAngle = this.player.angle;
        this.audio.play('glitch', 0.35);
      }

      for (const seg of this.disappearingTrail) {
        if (seg.state === 'cracking') {
          seg.timer += dt;
          if (seg.timer > 0.32) {
            seg.state = 'fallen';
            this.audio.play('hit', 0.45);
            const r = this.getFloorRadius(seg.centerAngle);
            this.particles.emit(this.cx + r * Math.cos(seg.centerAngle), this.cy + r * Math.sin(seg.centerAngle), 12, {
              color: '#ff4757',
              speed: 70 * this.scale,
              life: 0.45,
              size: 3 * this.scale
            });
          }
        }
      }
    }

    // 10. Living Heartbeat Arena (Level 12)
    if (this.levelMode === 'LIVING_HEART') {
      this.heartTimer += dt;
      const cycle = this.heartTimer % 2.4;
      if (cycle < 0.2) {
        this.heartPulse = Math.sin((cycle / 0.2) * Math.PI) * 0.4;
        this.heartSpikeHeight = 0;
      } else if (cycle >= 0.2 && cycle < 0.45) {
        const u = (cycle - 0.2) / 0.25;
        this.heartPulse = Math.sin(u * Math.PI);
        this.heartSpikeHeight = 0;
        if (!this.playedDub) {
          this.audio.play('heartbeat', 0.85);
          this.playedDub = true;
        }
      } else if (cycle >= 0.45 && cycle < 0.65) {
        const u = (cycle - 0.45) / 0.2;
        this.heartSpikeHeight = u;
        this.heartPulse = Math.max(0, this.heartPulse - dt * 2);
      } else if (cycle >= 0.65 && cycle < 1.25) {
        this.heartSpikeHeight = 1.0;
        this.playedDub = false;
      } else if (cycle >= 1.25 && cycle < 1.5) {
        const u = 1 - (cycle - 1.25) / 0.25;
        this.heartSpikeHeight = Math.max(0, u);
      } else {
        this.heartSpikeHeight = 0;
        this.heartPulse = 0;
        this.playedDub = false;
      }
    }
  }

  checkCollisions() {
    if (this.isDecayDemoting) return;
    const p = this.player;
    const pFloor = this.getFloorRadius(p.angle) - 2 * this.scale;
    const pRadius = pFloor - p.radialHeight - 12 * this.scale;
    const px = this.cx + pRadius * Math.cos(p.angle);
    const py = this.cy + pRadius * Math.sin(p.angle);

    // Key Roulette Collision (Levels 8 & 9)
    if (this.levelMode === 'KEY_ROULETTE' && this.rouletteKeys) {
      for (const k of this.rouletteKeys) {
        if (k.collected) continue;
        const kFloor = this.getFloorRadius(k.angle) - 2 * this.scale;
        const kRadius = kFloor - (28 * this.scale) + Math.sin(k.bobTimer) * 4;
        const kx = this.cx + kRadius * Math.cos(k.angle);
        const ky = this.cy + kRadius * Math.sin(k.angle);
        const dist = Math.hypot(px - kx, py - ky);
        if (dist < 28 * this.scale) {
          k.collected = true;
          if (k.type === 'WIN') {
            this.audio.play('win', 1.0);
            this.particles.emit(kx, ky, 35, {
              color: k.color,
              speed: 130 * this.scale,
              life: 0.7,
              size: 4 * this.scale
            });
            this.door.angle = this.player.angle;
            this.door.visible = true;
            this.door.unlocked = true;
            this.startAbyssTransition();
            return;
          } else if (k.type === 'DAMAGE') {
            this.audio.play('hit', 1.0);
            this.particles.emit(kx, ky, 25, {
              color: k.color,
              speed: 100 * this.scale,
              life: 0.5,
              size: 4 * this.scale
            });
            this.takeDamage();
            return;
          } else {
            // DUMMY
            this.audio.play('key', 0.4);
            this.particles.emit(kx, ky, 8, {
              color: '#fece2c',
              speed: 40 * this.scale,
              life: 0.35,
              size: 2.5 * this.scale
            });
          }
        }
      }
    }

    // Disappearing Trail (Void Pitfall behind player - Level 10)
    if (this.levelMode === 'DISAPPEARING_RING' && this.disappearingTrail) {
      for (const seg of this.disappearingTrail) {
        if (seg.state === 'fallen') {
          const diff = Math.abs(Math.atan2(Math.sin(p.angle - seg.centerAngle), Math.cos(p.angle - seg.centerAngle)));
          if (diff < seg.halfWidth && p.radialHeight <= 2) {
            this.fallIntoVoid();
            return;
          }
        }
      }
    }

    // Three Doors Collision (Level 11)
    if (this.levelMode === 'THREE_DOORS' && this.illusionDoors) {
      for (const d of this.illusionDoors) {
        if (d.shattered) continue;
        const diff = Math.abs(Math.atan2(Math.sin(p.angle - d.angle), Math.cos(p.angle - d.angle)));
        if (diff < 0.22 && p.radialHeight < 28 * this.scale) {
          if (d.isReal) {
            this.door.angle = d.angle;
            this.door.visible = true;
            this.door.unlocked = true;
            this.audio.play('win', 1.0);
            this.startAbyssTransition();
            return;
          } else {
            d.shattered = true;
            this.audio.play('glitch', 0.9);
            const dFloor = this.getFloorRadius(d.angle) - 2 * this.scale;
            this.particles.emit(this.cx + dFloor * Math.cos(d.angle), this.cy + dFloor * Math.sin(d.angle), 25, {
              color: '#ff2a6d',
              speed: 90 * this.scale,
              life: 0.5,
              size: 3 * this.scale
            });
            this.takeDamage();
            return;
          }
        }
      }
    }

    // Living Heartbeat Spikes Collision (Level 12)
    if (this.levelMode === 'LIVING_HEART' && this.heartSpikeHeight > 0.45) {
      if (p.radialHeight < 15 * this.scale) {
        this.takeDamage();
        return;
      }
    }

    // 1. Lasers Collision (Instant lethal hazard)
    for (const laser of this.lasers) {
      if (!laser.active) continue;
      let hit = false;
      if (laser.type === 'horizontal') {
        if (Math.abs(py - laser.pos) < laser.thickness / 2 + 9 * this.scale) {
          hit = true;
        }
      } else if (laser.type === 'vertical') {
        if (Math.abs(px - laser.pos) < laser.thickness / 2 + 9 * this.scale) {
          hit = true;
        }
      }
      if (hit) {
        this.takeDamage();
        return;
      }
    }

    // 2. Ambush Spikes Collision
    for (const spike of this.ambushSpikes) {
      if (spike.height > 0.35) {
        const diff = Math.abs(Math.atan2(Math.sin(p.angle - spike.angle), Math.cos(p.angle - spike.angle)));
        if (diff < 0.08 && p.radialHeight < 15 * this.scale * spike.height) {
          this.takeDamage();
          return;
        }
      }
    }

    // 3. Collapsing Floor Sectors (Void Pitfall)
    for (const sector of this.collapsingSectors) {
      if (sector.state === 'fallen') {
        const diff = Math.abs(Math.atan2(Math.sin(p.angle - sector.centerAngle), Math.cos(p.angle - sector.centerAngle)));
        if (diff < sector.halfWidth && p.radialHeight <= 2) {
          this.fallIntoVoid();
          return;
        }
      }
    }

    // 4. Key Collision (inside playable tube)
    if (!this.hasKey) {
      const kFloor = this.getFloorRadius(this.keyItem.angle) - 2 * this.scale;
      const kRadius = kFloor - (28 * this.scale) + Math.sin(this.keyItem.bobTimer) * 4;
      const kx = this.cx + kRadius * Math.cos(this.keyItem.angle);
      const ky = this.cy + kRadius * Math.sin(this.keyItem.angle);

      const dist = Math.hypot(px - kx, py - ky);
      if (dist < 30 * this.scale) {
        this.hasKey = true;
        this.door.unlocked = true;
        this.keysCollected++;
        this.audio.play('key', 1.0);

        // Refill decay timer on collecting key / opening gateway
        if (this.decayActive) {
          this.decayTimer = this.decayDuration;
          this.decayAudioStarted = false;
          this.decayGaugeParticles = [];
          this.audio.stopDecayAudio();
          this.screenShake = 0;
          const container = document.getElementById('decay-meter-container');
          if (container) container.classList.remove('caution-phase', 'warning-phase');
          const barFill = document.getElementById('decay-bar-fill');
          if (barFill) barFill.style.width = '100%';
          const timerVal = document.getElementById('decay-timer-val');
          if (timerVal) timerVal.textContent = '8.0s';
          this.renderDecayGauge(0.016, 1.0);
        }

        this.particles.emit(kx, ky, 24, {
          color: '#fece2c',
          speed: 90 * this.scale,
          life: 0.6,
          size: 4 * this.scale,
          shape: 'star'
        });

        this.updateHUD();
      }
    }

    // 5. Doorway / Gate Entry Collision
    if (this.door.unlocked && this.door.visible !== false) {
      const angleDiff = Math.abs(Math.atan2(Math.sin(p.angle - this.door.angle), Math.cos(p.angle - this.door.angle)));
      if (angleDiff < this.door.width * 0.75 && p.radialHeight < 28 * this.scale) {
        this.startAbyssTransition();
        return;
      }
    }

    // 6. Spikes Collision (Base on wall, tips inward)
    for (const s of this.spikes) {
      if (s.isRetracting && !s.isExtended) continue;

      const angleDiff = Math.abs(Math.atan2(Math.sin(p.angle - s.angle), Math.cos(p.angle - s.angle)));
      if (angleDiff < 0.08 && p.radialHeight < 14 * this.scale) {
        this.takeDamage();
        return;
      }
    }

    // 7. Flying Saws Collision
    for (const saw of this.flyingSaws) {
      const sawFloor = this.getFloorRadius(saw.angle) - 2 * this.scale;
      const sawR = sawFloor - saw.heightOffset * this.scale;
      const sx = this.cx + sawR * Math.cos(saw.angle);
      const sy = this.cy + sawR * Math.sin(saw.angle);

      const dist = Math.hypot(px - sx, py - sy);
      if (dist < 24 * this.scale) {
        this.takeDamage();
        return;
      }
    }

    // 8. Walkers Collision
    for (const w of this.walkers) {
      const angleDiff = Math.abs(Math.atan2(Math.sin(p.angle - w.angle), Math.cos(p.angle - w.angle)));
      if (angleDiff < 0.08 && p.radialHeight < 18 * this.scale) {
        this.takeDamage();
        return;
      }
    }
  }

  // Seamless Continuous Abyss Zoom Transition
  updateTransition(dt) {
    this.transitionProgress += dt / this.transitionDuration;
    const u = Math.min(1, this.transitionProgress);

    // Smooth cubic ease-in-out
    const ease = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;

    this.player.radialHeight = 0;

    // Transition angle target:
    // If entering Level 4 (Invert level), player starts at the top (12 o'clock, 3 * Math.PI / 2)!
    // For all other levels, player starts at the bottom (6 o'clock, Math.PI / 2)!
    const nextLevel = this.level + 1;
    const targetAngle = Math.PI / 2;
    const diff = Math.atan2(Math.sin(targetAngle - this.door.angle), Math.cos(targetAngle - this.door.angle));
    this.player.angle = this.door.angle + diff * ease;

    // Emit gentle portal wake particles
    if (Math.random() < 0.35) {
      const r1 = (this.BASE_R1_OUTER + (this.BASE_R0_OUTER - this.BASE_R1_OUTER) * ease) * this.scale;
      const px = this.cx + r1 * Math.cos(this.player.angle);
      const py = this.cy + r1 * Math.sin(this.player.angle);
      this.particles.emit(px, py, 3, {
        color: '#ffffff',
        speed: 70 * this.scale,
        life: 0.4,
        size: 3 * this.scale
      });
    }

    // Boundary handoff at u = 1: zero popping, zero shrinking!
    if (u >= 1) {
      this.level++;
      this.state = 'PLAYING';
      this.transitionProgress = 0;
      this.player.angle = Math.PI / 2;
      this.player.omega = 0;
      this.player.facing = 1;
      this.spawnLevel(this.level);
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    const pal = getLevelPalette(this.level);
    let transitionEase = 0;

    if (this.state === 'TRANSITION') {
      const u = Math.min(1, this.transitionProgress);
      transitionEase = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    }

    // 1. Draw Fullscreen Background (fills 100% of viewport edge to edge)
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, this.width, this.height);
    if (this.container) {
      this.container.style.backgroundColor = pal.bg;
    }

    // Ambient floating motes
    for (const m of this.ambientMotes) {
      const mx = this.cx + m.dist * Math.cos(m.angle);
      const my = this.cy + m.dist * Math.sin(m.angle);
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = m.alpha;
      ctx.beginPath();
      ctx.arc(mx, my, m.size * this.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Draw Concentric Rippling Blobs (The Abyss Circles)
    this.drawRings(ctx, pal, transitionEase);

    // 3. Draw Level Elements (Spikes, Door, Key, Hazards, Rage Traps & Lasers)
    if (this.state === 'PLAYING') {
      this.drawDisappearingTrail(ctx);
      this.drawRageTraps(ctx);
      this.drawHeartbeatSpikes(ctx);
      this.drawSpikes(ctx);
      this.drawDoor(ctx);
      this.drawIllusionDoors(ctx);
      this.drawKey(ctx);
      this.drawRouletteKeys(ctx);
      this.drawHazards(ctx);
      this.drawLasers(ctx);
    }

    // 4. Draw Player (Inside the circle, head pointing inward)
    this.drawPlayer(ctx, transitionEase);

    // Decay Retro Blackish-Reddish Pixel Corruption Creep (Swallows player and arena as it converges to center)
    if (this.decayActive && this.state === 'PLAYING') {
      this.drawPixelCorruption(ctx);
    }

    // 5. Draw Abyssal Darkness Spotlight (Level 13 and dark rage modes)
    if (this.isDarkness && this.state === 'PLAYING') {
      this.drawDarkness(ctx);
    }

    // 6. Draw Particles
    this.particles.draw(ctx);

    ctx.restore();
  }

  drawRings(ctx, pal, ease) {
    const time = this.gameTime;
    const numPoints = 200;

    // Viewport fill radius for outer ring expansion off-screen
    const maxScreenR = Math.max(this.width, this.height) * 0.95;

    // Continuous Geometric Expansion Math:
    const heartPulseOffset = (this.levelMode === 'LIVING_HEART' && this.heartPulse) ? this.heartPulse * 16 * this.scale : 0;
    const r0_target = (this.BASE_R0_OUTER + (maxScreenR / this.scale - this.BASE_R0_OUTER) * ease) * this.scale + heartPulseOffset;
    const r1_target = (this.BASE_R1_OUTER + (this.BASE_R0_OUTER - this.BASE_R1_OUTER) * ease) * this.scale + heartPulseOffset * 0.7;
    const r2_target = (this.BASE_R2_OUTER + (this.BASE_R1_OUTER - this.BASE_R2_OUTER) * ease) * this.scale + heartPulseOffset * 0.4;
    const r3_target = (this.BASE_R2_OUTER * ease) * this.scale;

    // --- BLOB 0: Outer Active Ring ---
    ctx.save();
    if (this.outerRingDecaying) {
      // Disintegrate outer wall: fade opacity and add jagged decay fracturing
      ctx.globalAlpha = Math.max(0.08, 1 - (this.decayDemoteTimer / 2.6));
    }
    ctx.fillStyle = pal.r0;
    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      let wobble = this.getWobble(angle, time, 0) * (1 + ease * 0.5);
      if (this.outerRingDecaying) {
        wobble += (Math.sin(angle * 16 + time * 10) + Math.cos(angle * 9 - time * 8)) * 14 * this.scale;
      }
      const r = r0_target + wobble;
      const x = this.cx + r * Math.cos(angle);
      const y = this.cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Emit disintegration cyber-ash and burning embers
    if (this.outerRingDecaying && Math.random() < 0.6) {
      const randA = Math.random() * Math.PI * 2;
      const randR = (this.BASE_R0_OUTER * this.scale) + (Math.random() - 0.5) * 35 * this.scale;
      this.particles.emit(this.cx + randR * Math.cos(randA), this.cy + randR * Math.sin(randA), 2, {
        color: Math.random() < 0.5 ? '#ff0055' : '#00f3ff',
        speed: 75 * this.scale,
        life: 0.55,
        size: 3.5 * this.scale
      });
    }

    // If door is unlocked, cut out a clean channel in Ring 0 showing the background through it
    if (this.door.unlocked && this.door.visible !== false && this.state === 'PLAYING') {
      ctx.fillStyle = pal.bg;
      ctx.beginPath();
      const halfW = this.door.width / 2;
      const a1 = this.door.angle - halfW;
      const a2 = this.door.angle + halfW;
      const rout = r0_target + 30 * this.scale;
      const rin = r1_target - 15 * this.scale;

      ctx.moveTo(this.cx + rout * Math.cos(a1), this.cy + rout * Math.sin(a1));
      ctx.lineTo(this.cx + rout * Math.cos(a2), this.cy + rout * Math.sin(a2));
      ctx.lineTo(this.cx + rin * Math.cos(a2), this.cy + rin * Math.sin(a2));
      ctx.lineTo(this.cx + rin * Math.cos(a1), this.cy + rin * Math.sin(a1));
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // --- BLOB 1: Middle Ring ---
    ctx.save();
    ctx.fillStyle = pal.r1;
    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const wobble = this.getWobble(angle, time, 1.2) * (1 + ease * 0.3);
      const r = r1_target + wobble;
      const x = this.cx + r * Math.cos(angle);
      const y = this.cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // --- BLOB 2: Core Disc ---
    ctx.save();
    ctx.fillStyle = pal.r2;
    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const wobble = this.getWobble(angle, time, 2.4);
      const r = r2_target + wobble;
      const x = this.cx + r * Math.cos(angle);
      const y = this.cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // --- BLOB 3: Emerging New Core (During Transition) ---
    if (ease > 0 && pal.r3) {
      ctx.save();
      ctx.fillStyle = pal.r3;
      ctx.beginPath();
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const wobble = this.getWobble(angle, time, 3.6) * ease;
        const r = r3_target + wobble;
        const x = this.cx + r * Math.cos(angle);
        const y = this.cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // --- Center Depth Number ---
    ctx.save();
    ctx.fillStyle = pal.num || '#2b0d3a';
    const fontSize = Math.round(68 * this.scale);
    ctx.font = `900 ${fontSize}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const dispNum = (this.state === 'TRANSITION' && this.transitionProgress > 0.5)
      ? this.level + 1
      : this.level;
    ctx.fillText(dispNum.toString(), this.cx, this.cy + 6 * this.scale);
    ctx.restore();
  }

  drawPlayer(ctx, transitionEase = 0) {
    const p = this.player;

    if (p.invincibleTimer > 0 && Math.floor(this.gameTime * 24) % 2 === 0) {
      return;
    }

    let r;
    if (this.state === 'TRANSITION') {
      // During transition, player steps onto Blob 1 as it expands to become the new Ring 0
      const r1_target = (this.BASE_R1_OUTER + (this.BASE_R0_OUTER - this.BASE_R1_OUTER) * transitionEase) * this.scale;
      r = r1_target + this.getWobble(p.angle, this.gameTime, 1.2) - 2 * this.scale;
    } else {
      // Normal gameplay: feet on outer wall, jumping inward toward center
      const floorR = this.getFloorRadius(p.angle) - 2 * this.scale;
      r = floorR - p.radialHeight;
    }

    const px = this.cx + r * Math.cos(p.angle);
    const py = this.cy + r * Math.sin(p.angle);

    ctx.save();
    ctx.translate(px, py);
    // Tangent orientation: feet touch the outer wall, head points INWARD toward center
    ctx.rotate(p.angle - Math.PI / 2 + (p.tumbleAngle || 0));

    if (p.facing < 0) {
      ctx.scale(-1, 1);
    }

    const frameImg = this.images.player[p.animFrame];
    const pw = p.width * this.scale;
    const ph = p.height * this.scale;

    // --- Vibrant Cyber-Neon Character Glow ---
    const neonColor = this.controlsInverted ? '#ff0055' : '#00ffff';
    ctx.shadowColor = neonColor;
    ctx.shadowBlur = 16 * this.scale;

    // Subtle neon energy aura behind the character
    ctx.save();
    ctx.fillStyle = this.controlsInverted ? 'rgba(255, 0, 85, 0.22)' : 'rgba(0, 255, 255, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, p.isFloatingInSpace ? 0 : -ph / 2, pw * 0.72, ph * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const drawY = p.isFloatingInSpace ? -ph / 2 : -ph + 2;
    if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {
      // Feet at y = 0 when grounded, center of mass when floating in space
      ctx.drawImage(frameImg, -pw / 2, drawY, pw, ph);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-pw / 2, drawY, pw, ph);
    }

    ctx.restore();
  }

  drawDoor(ctx) {
    if (this.door.visible === false) return;
    const d = this.door;
    const floorR = this.getFloorRadius(d.angle) - 2 * this.scale;
    const dx = this.cx + floorR * Math.cos(d.angle);
    const dy = this.cy + floorR * Math.sin(d.angle);

    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(d.angle - Math.PI / 2);

    if (!d.unlocked) {
      // Locked: white hatch bar across the wall
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;
      ctx.fillRect(-14 * this.scale, -4 * this.scale, 28 * this.scale, 8 * this.scale);
    } else {
      // Unlocked: white gateway portal frame
      const doorImg = this.images.door[0];
      const dw = 26 * this.scale;
      const dh = 24 * this.scale;
      if (doorImg && doorImg.complete && doorImg.naturalWidth > 0) {
        ctx.drawImage(doorImg, -dw / 2, -dh, dw, dh);
      } else {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3 * this.scale;
        ctx.strokeRect(-12 * this.scale, -20 * this.scale, 24 * this.scale, 20 * this.scale);
      }
    }
    ctx.restore();
  }

  drawKey(ctx) {
    if (this.hasKey || this.keyItem.collected) return;

    const k = this.keyItem;
    // Key floats inside the playable tube (inward from outer wall)
    const floatDist = (28 * this.scale) + Math.sin(k.bobTimer) * 4;
    const r = this.getFloorRadius(k.angle) - floatDist;
    const kx = this.cx + r * Math.cos(k.angle);
    const ky = this.cy + r * Math.sin(k.angle);

    ctx.save();
    ctx.translate(kx, ky);
    ctx.rotate(k.angle - Math.PI / 2);

    const keyFrames = this.images.key;
    const fIdx = Math.floor(k.bobTimer * 2) % (keyFrames.length || 1);
    const keyImg = keyFrames[fIdx];
    const kw = 18 * this.scale;
    const kh = 24 * this.scale;

    if (keyImg && keyImg.complete && keyImg.naturalWidth > 0) {
      ctx.shadowColor = '#fece2c';
      ctx.shadowBlur = 10;
      ctx.drawImage(keyImg, -kw / 2, -kh / 2, kw, kh);
    } else {
      ctx.fillStyle = '#fece2c';
      ctx.beginPath();
      ctx.arc(0, -6 * this.scale, 6 * this.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-2 * this.scale, -2 * this.scale, 4 * this.scale, 12 * this.scale);
      ctx.fillRect(2 * this.scale, 4 * this.scale, 4 * this.scale, 3 * this.scale);
    }

    ctx.restore();
  }

  drawSpikes(ctx) {
    for (const s of this.spikes) {
      if (s.isRetracting && !s.isExtended) continue;

      const floorR = this.getFloorRadius(s.angle) - 2 * this.scale;
      const sx = this.cx + floorR * Math.cos(s.angle);
      const sy = this.cy + floorR * Math.sin(s.angle);

      ctx.save();
      ctx.translate(sx, sy);
      // Base on wall, pointing INWARD toward center
      ctx.rotate(s.angle - Math.PI / 2);

      const spikeImg = this.images.spikes[s.spriteIdx % (this.images.spikes.length || 1)];
      const sw = 20 * this.scale;
      const sh = 16 * this.scale;

      if (spikeImg && spikeImg.complete && spikeImg.naturalWidth > 0) {
        ctx.drawImage(spikeImg, -sw / 2, -sh + 2, sw, sh);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-8 * this.scale, 0);
        ctx.lineTo(-4 * this.scale, -14 * this.scale);
        ctx.lineTo(0, 0);
        ctx.lineTo(4 * this.scale, -14 * this.scale);
        ctx.lineTo(8 * this.scale, 0);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  drawHazards(ctx) {
    // Saws
    for (const saw of this.flyingSaws) {
      const sawFloor = this.getFloorRadius(saw.angle) - 2 * this.scale;
      const r = sawFloor - saw.heightOffset * this.scale;
      const sx = this.cx + r * Math.cos(saw.angle);
      const sy = this.cy + r * Math.sin(saw.angle);

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(saw.rotation);

      const sz = 28 * this.scale;
      if (this.images.saw && this.images.saw.complete && this.images.saw.naturalWidth > 0) {
        ctx.drawImage(this.images.saw, -sz / 2, -sz / 2, sz, sz);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 12 * this.scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Walkers
    for (const w of this.walkers) {
      const floorR = this.getFloorRadius(w.angle) - 2 * this.scale;
      const wx = this.cx + floorR * Math.cos(w.angle);
      const wy = this.cy + floorR * Math.sin(w.angle);

      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(w.angle - Math.PI / 2);
      if (w.dir < 0) ctx.scale(-1, 1);

      const wz = 20 * this.scale;
      const wImg = this.images.walker[w.animFrame % (this.images.walker.length || 1)];
      if (wImg && wImg.complete && wImg.naturalWidth > 0) {
        ctx.drawImage(wImg, -wz / 2, -wz + 2, wz, wz);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-7 * this.scale, -16 * this.scale, 14 * this.scale, 16 * this.scale);
      }
      ctx.restore();
    }
  }

  drawLasers(ctx) {
    for (const laser of this.lasers) {
      if (!laser.active) continue;

      ctx.save();
      const thick = laser.thickness;
      const glow = laser.color || '#ff0055';

      // Searing glowing halo
      ctx.shadowColor = glow;
      ctx.shadowBlur = 24 * this.scale;
      ctx.strokeStyle = glow;
      ctx.lineWidth = thick + Math.sin(this.gameTime * 25) * 2;
      ctx.beginPath();
      if (laser.type === 'horizontal') {
        ctx.moveTo(0, laser.pos);
        ctx.lineTo(this.width, laser.pos);
      } else {
        ctx.moveTo(laser.pos, 0);
        ctx.lineTo(laser.pos, this.height);
      }
      ctx.stroke();

      // Searing bright white core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, thick * 0.45);
      ctx.beginPath();
      if (laser.type === 'horizontal') {
        ctx.moveTo(0, laser.pos);
        ctx.lineTo(this.width, laser.pos);
      } else {
        ctx.moveTo(laser.pos, 0);
        ctx.lineTo(laser.pos, this.height);
      }
      ctx.stroke();

      // Emit sparks at beam intersection with outer ring
      if (Math.random() < 0.45) {
        if (laser.type === 'horizontal') {
          const dy = laser.pos - this.cy;
          const rFloor = this.BASE_R0_OUTER * this.scale;
          if (Math.abs(dy) < rFloor) {
            const dx = Math.sqrt(Math.max(0, rFloor * rFloor - dy * dy));
            this.particles.emit(this.cx - dx, laser.pos, 1, {
              color: glow,
              speed: 40 * this.scale,
              life: 0.22,
              size: 2.5 * this.scale
            });
            this.particles.emit(this.cx + dx, laser.pos, 1, {
              color: glow,
              speed: 40 * this.scale,
              life: 0.22,
              size: 2.5 * this.scale
            });
          }
        } else {
          const dx = laser.pos - this.cx;
          const rFloor = this.BASE_R0_OUTER * this.scale;
          if (Math.abs(dx) < rFloor) {
            const dy = Math.sqrt(Math.max(0, rFloor * rFloor - dx * dx));
            this.particles.emit(laser.pos, this.cy - dy, 1, {
              color: glow,
              speed: 40 * this.scale,
              life: 0.22,
              size: 2.5 * this.scale
            });
            this.particles.emit(laser.pos, this.cy + dy, 1, {
              color: glow,
              speed: 40 * this.scale,
              life: 0.22,
              size: 2.5 * this.scale
            });
          }
        }
      }

      ctx.restore();
    }
  }

  drawRageTraps(ctx) {
    // 1. Ambush Spikes
    for (const spike of this.ambushSpikes) {
      if (spike.height <= 0.05) continue;

      const floorR = this.getFloorRadius(spike.angle) - 2 * this.scale;
      const sx = this.cx + floorR * Math.cos(spike.angle);
      const sy = this.cy + floorR * Math.sin(spike.angle);

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(spike.angle - Math.PI / 2);

      const spw = 20 * this.scale;
      const sph = 24 * this.scale * spike.height;

      // Glow warning
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 10 * this.scale;

      ctx.fillStyle = '#ff2a6d';
      ctx.beginPath();
      ctx.moveTo(-spw / 2, 0);
      ctx.lineTo(0, -sph);
      ctx.lineTo(spw / 2, 0);
      ctx.closePath();
      ctx.fill();

      // Sharp white tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-spw / 4, -sph * 0.5);
      ctx.lineTo(0, -sph);
      ctx.lineTo(spw / 4, -sph * 0.5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // 2. Collapsing Void Sectors
    for (const sector of this.collapsingSectors) {
      const startAngle = sector.centerAngle - sector.halfWidth;
      const endAngle = sector.centerAngle + sector.halfWidth;

      if (sector.state === 'cracking') {
        ctx.save();
        ctx.strokeStyle = '#ffd32a';
        ctx.shadowColor = '#ff3838';
        ctx.shadowBlur = 14 * this.scale;
        ctx.lineWidth = 3.5 * this.scale;
        ctx.beginPath();
        const steps = 12;
        for (let j = 0; j <= steps; j++) {
          const a = startAngle + (endAngle - startAngle) * (j / steps);
          const jitter = (Math.random() - 0.5) * 8 * this.scale;
          const r = this.getFloorRadius(a) + jitter;
          const x = this.cx + r * Math.cos(a);
          const y = this.cy + r * Math.sin(a);
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      } else if (sector.state === 'fallen') {
        // Deep void gap in the outer wall
        ctx.save();
        ctx.strokeStyle = '#080312';
        ctx.lineWidth = 16 * this.scale;
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, this.BASE_R0_OUTER * this.scale - 2 * this.scale, startAngle, endAngle);
        ctx.stroke();

        // Neon crimson warning border on the void breach
        ctx.strokeStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 12 * this.scale;
        ctx.lineWidth = 2.5 * this.scale;
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, this.BASE_R0_OUTER * this.scale - 6 * this.scale, startAngle, endAngle);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  drawRouletteKeys(ctx) {
    if (!this.rouletteKeys || this.rouletteKeys.length === 0) return;

    for (const k of this.rouletteKeys) {
      if (k.collected) continue;

      const floatDist = (28 * this.scale) + Math.sin(k.bobTimer) * 4;
      const r = this.getFloorRadius(k.angle) - floatDist;
      const kx = this.cx + r * Math.cos(k.angle);
      const ky = this.cy + r * Math.sin(k.angle);

      ctx.save();
      ctx.translate(kx, ky);
      ctx.rotate(k.angle - Math.PI / 2);

      const col = k.color || '#fece2c';

      ctx.shadowColor = col;
      ctx.shadowBlur = k.type === 'DUMMY' ? 8 : 22 * this.scale;

      // Aura circle behind special Green / Red keys
      if (k.type !== 'DUMMY') {
        ctx.fillStyle = col === '#00ff66' ? 'rgba(0, 255, 102, 0.28)' : 'rgba(255, 0, 68, 0.28)';
        ctx.beginPath();
        ctx.arc(0, 0, 16 * this.scale + Math.sin(k.bobTimer * 2) * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(0, -6 * this.scale, 6 * this.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-2 * this.scale, -2 * this.scale, 4 * this.scale, 12 * this.scale);
      ctx.fillRect(2 * this.scale, 4 * this.scale, 4 * this.scale, 3 * this.scale);

      ctx.restore();
    }
  }

  drawDisappearingTrail(ctx) {
    if (!this.disappearingTrail || this.disappearingTrail.length === 0) return;

    for (const seg of this.disappearingTrail) {
      const startAngle = seg.centerAngle - seg.halfWidth;
      const endAngle = seg.centerAngle + seg.halfWidth;

      if (seg.state === 'cracking') {
        ctx.save();
        ctx.strokeStyle = '#ffd32a';
        ctx.shadowColor = '#ff3838';
        ctx.shadowBlur = 12 * this.scale;
        ctx.lineWidth = 3.5 * this.scale;
        ctx.beginPath();
        const steps = 8;
        for (let j = 0; j <= steps; j++) {
          const a = startAngle + (endAngle - startAngle) * (j / steps);
          const jitter = (Math.random() - 0.5) * 6 * this.scale;
          const r = this.getFloorRadius(a) + jitter;
          const x = this.cx + r * Math.cos(a);
          const y = this.cy + r * Math.sin(a);
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      } else if (seg.state === 'fallen') {
        ctx.save();
        ctx.strokeStyle = '#080312';
        ctx.lineWidth = 18 * this.scale;
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, this.BASE_R0_OUTER * this.scale - 2 * this.scale, startAngle, endAngle);
        ctx.stroke();

        ctx.strokeStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 10 * this.scale;
        ctx.lineWidth = 2.5 * this.scale;
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, this.BASE_R0_OUTER * this.scale - 6 * this.scale, startAngle, endAngle);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  drawIllusionDoors(ctx) {
    if (!this.illusionDoors || this.illusionDoors.length === 0) return;

    for (const d of this.illusionDoors) {
      if (d.shattered) continue;

      const floorR = this.getFloorRadius(d.angle) - 2 * this.scale;
      const dx = this.cx + floorR * Math.cos(d.angle);
      const dy = this.cy + floorR * Math.sin(d.angle);

      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(d.angle - Math.PI / 2);

      const dw = 28 * this.scale;
      const dh = 26 * this.scale;

      if (d.isReal) {
        // Glowing radiant real door
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 25 * this.scale + Math.sin(this.gameTime * 6) * 6;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5 * this.scale;
        ctx.strokeRect(-dw / 2, -dh, dw, dh);

        ctx.fillStyle = 'rgba(0, 255, 255, 0.35)';
        ctx.fillRect(-dw / 2 + 3, -dh + 3, dw - 6, dh - 6);

        if (Math.random() < 0.3) {
          this.particles.emit(dx, dy - 12 * this.scale, 1, {
            color: '#00ffff',
            speed: 30 * this.scale,
            life: 0.4,
            size: 3 * this.scale
          });
        }
      } else {
        // Illusion doors: normal un-glowing door frame
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2.5 * this.scale;
        ctx.strokeRect(-dw / 2, -dh, dw, dh);
      }

      ctx.restore();
    }
  }

  drawHeartbeatSpikes(ctx) {
    if (this.levelMode !== 'LIVING_HEART' || this.heartSpikeHeight <= 0.05) return;

    const numSpikes = 16;
    for (let i = 0; i < numSpikes; i++) {
      const angle = (i / numSpikes) * Math.PI * 2;
      const floorR = this.getFloorRadius(angle) - 2 * this.scale;
      const sx = this.cx + floorR * Math.cos(angle);
      const sy = this.cy + floorR * Math.sin(angle);

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle - Math.PI / 2);

      const spw = 16 * this.scale;
      const sph = 20 * this.scale * this.heartSpikeHeight;

      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 12 * this.scale;
      ctx.fillStyle = '#ff2a6d';

      ctx.beginPath();
      ctx.moveTo(-spw / 2, 0);
      ctx.lineTo(0, -sph);
      ctx.lineTo(spw / 2, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-spw / 4, -sph * 0.5);
      ctx.lineTo(0, -sph);
      ctx.lineTo(spw / 4, -sph * 0.5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  drawDarkness(ctx) {
    const p = this.player;
    const floorR = this.getFloorRadius(p.angle) - 2 * this.scale;
    const r = floorR - p.radialHeight - 12 * this.scale;
    const px = this.cx + r * Math.cos(p.angle);
    const py = this.cy + r * Math.sin(p.angle);

    ctx.save();
    const lightRadius = 135 * this.scale;
    const grad = ctx.createRadialGradient(px, py, 25 * this.scale, px, py, lightRadius);
    grad.addColorStop(0, 'rgba(3, 1, 7, 0)');
    grad.addColorStop(0.65, 'rgba(3, 1, 7, 0.45)');
    grad.addColorStop(0.9, 'rgba(3, 1, 7, 0.92)');
    grad.addColorStop(1, 'rgba(3, 1, 7, 0.98)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 2 * this.scale;
    ctx.beginPath();
    ctx.arc(px, py, lightRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  gameLoop(currentTime) {
    const rawDt = Math.min(0.08, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // Smoothly interpolate time scale for cinematic slow-mo
    if (this.targetTimeScale !== undefined) {
      this.timeScale += (this.targetTimeScale - this.timeScale) * Math.min(1, rawDt * 3.5);
    }
    const dt = rawDt * (this.timeScale || 1.0);

    this.update(dt, rawDt);
    this.render();

    // Render interactive menu character preview when in menu
    if (this.state === 'MENU' || this.state === 'START' || this.state === 'SPLASH') {
      this.renderMenuCharacter();
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.abyssGame = new AbyssGame();
});
