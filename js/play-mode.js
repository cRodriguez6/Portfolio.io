/**
 * Connor Rodriguez Portfolio - Interactive Play Mode
 * Built-in 2D Arcade Engine + Godot HTML5 Export Integration
 */

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, endFreq = null) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio might be blocked until user interacts
    }
  }

  jump() {
    this.playTone(180, 'square', 0.16, 480);
  }

  collect() {
    this.playTone(440, 'sine', 0.1, 880);
    setTimeout(() => {
      this.playTone(880, 'triangle', 0.15, 1320);
    }, 60);
  }

  interact() {
    this.playTone(320, 'triangle', 0.12, 640);
  }

  chirp() {
    this.playTone(520, 'sawtooth', 0.08, 260);
  }
}

class PortfolioPlayMode {
  constructor() {
    this.canvas = document.getElementById('portfolio-canvas-game');
    this.overlay = document.getElementById('play-mode-overlay');
    this.godotContainer = document.getElementById('godot-export-container');
    this.sfx = new SoundSynthesizer();
    
    this.isRunning = false;
    this.currentMode = 'canvas'; // 'canvas' or 'godot'
    this.keys = {};
    this.score = 0;
    this.gemsCollected = 0;
    this.totalGems = 6;
    this.currentPrompt = null;
    
    // Player State
    this.player = {
      x: 100,
      y: 350,
      width: 28,
      height: 36,
      vx: 0,
      vy: 0,
      speed: 4.8,
      jumpForce: -11.5,
      grounded: false,
      direction: 1, // 1 = right, -1 = left
      color: '#38bdf8',
      particles: []
    };

    this.worldWidth = 2400;
    this.cameraX = 0;

    // Interactive Kiosks & Stations in the 2D world
    this.kiosks = [
      {
        id: 'panda',
        x: 320,
        y: 370,
        title: 'Paint The Panda',
        genre: 'Educational · Pixel Painting',
        itchUrl: 'https://cjr1400.itch.io/paint-the-panda',
        color: '#10b981',
        icon: '🐼',
        description: 'Pixel painting canvas game! Playable directly in browser.'
      },
      {
        id: 'octopus',
        x: 680,
        y: 370,
        title: 'Beware The Space Octopus',
        genre: 'Sci-Fi Action',
        itchUrl: 'https://cjr1400.itch.io/beware-of-the',
        color: '#8b5cf6',
        icon: '🐙',
        description: 'Evade cosmic tentacles in deep space.'
      },
      {
        id: 'julio',
        x: 1040,
        y: 370,
        title: "Five Nights At Julio's",
        genre: 'Interactive Fiction / Survival',
        itchUrl: 'https://cjr1400.itch.io/five-nights-at-julios',
        color: '#f43f5e',
        icon: '🍕',
        description: "Can you survive the mysterious shift at Julio's?"
      },
      {
        id: 'diner',
        x: 1400,
        y: 370,
        title: "Isaiah's Diner",
        genre: 'Simulation · Fast Food',
        itchUrl: 'https://cjr1400.itch.io/isaiahs-diner',
        color: '#f59e0b',
        icon: '🍔',
        description: 'A Not so Vegan Vegan Burger cooking simulation!'
      },
      {
        id: 'josh',
        x: 1760,
        y: 370,
        title: 'Stop the evil Josh',
        genre: 'Action · 21 Games in 21 Days Sprint',
        itchUrl: 'https://cjr1400.itch.io/stop-the-evil-josh',
        color: '#06b6d4',
        icon: '⚔️',
        description: 'Day 2 of the ambitious 21 Games challenge!'
      },
      {
        id: 'data-science',
        x: 2120,
        y: 370,
        title: 'Data Science Final Project',
        genre: 'Python · GitHub Repository',
        githubUrl: 'https://github.com/cRodriguez6/Intro-To-Data-Science-Final-Project',
        color: '#3b82f6',
        icon: '📊',
        description: 'Applied statistical analysis & visualization in Python.'
      }
    ];

    // Collectible Gems
    this.gems = [
      { x: 320, y: 310, collected: false },
      { x: 500, y: 260, collected: false },
      { x: 680, y: 310, collected: false },
      { x: 1040, y: 310, collected: false },
      { x: 1400, y: 310, collected: false },
      { x: 1760, y: 310, collected: false },
      { x: 2120, y: 310, collected: false }
    ];

    // Platforms
    this.platforms = [
      { x: 0, y: 440, width: 2400, height: 100 }, // Main Ground
      { x: 440, y: 330, width: 140, height: 16 },
      { x: 800, y: 320, width: 160, height: 16 },
      { x: 1200, y: 300, width: 130, height: 16 },
      { x: 1560, y: 330, width: 140, height: 16 },
      { x: 1940, y: 320, width: 120, height: 16 }
    ];

    this.initEvents();
  }

  initEvents() {
    // Keyboard Controls
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (this.isRunning) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          e.preventDefault();
        }
        if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          this.jump();
        }
        if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
          this.triggerInteraction();
        }
        if (e.key === 'Escape') {
          this.closePlayMode();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    // Window Resize
    window.addEventListener('resize', () => {
      if (this.canvas) {
        this.resizeCanvas();
      }
    });

    // Sound toggle button in HUD
    const soundBtn = document.getElementById('hud-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        this.sfx.muted = !this.sfx.muted;
        soundBtn.innerHTML = this.sfx.muted ? '🔇 Sound: Off' : '🔊 Sound: On';
      });
    }

    // Tab buttons (Canvas Game vs Godot HTML5 Export)
    const tabCanvas = document.getElementById('play-tab-canvas');
    const tabGodot = document.getElementById('play-tab-godot');

    if (tabCanvas && tabGodot) {
      tabCanvas.addEventListener('click', () => {
        this.switchMode('canvas');
      });
      tabGodot.addEventListener('click', () => {
        this.switchMode('godot');
      });
    }

    // Godot Export URL Loader
    const loadGodotBtn = document.getElementById('load-godot-url-btn');
    const godotUrlInput = document.getElementById('godot-url-input');
    const godotIframe = document.getElementById('godot-iframe');

    if (loadGodotBtn && godotUrlInput && godotIframe) {
      loadGodotBtn.addEventListener('click', () => {
        const url = godotUrlInput.value.trim();
        if (url) {
          godotIframe.src = url;
          const banner = document.getElementById('godot-setup-banner');
          if (banner) banner.style.display = 'none';
          this.sfx.interact();
        }
      });
    }

    // Godot local test load button
    const loadLocalGodotBtn = document.getElementById('load-local-godot-btn');
    if (loadLocalGodotBtn && godotIframe) {
      loadLocalGodotBtn.addEventListener('click', () => {
        // Point to the local godot-build folder or default embed demo
        godotIframe.src = './godot-build/index.html';
        const banner = document.getElementById('godot-setup-banner');
        if (banner) banner.style.display = 'none';
        this.sfx.interact();
      });
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  openPlayMode() {
    if (!this.overlay) return;
    this.overlay.classList.add('active');
    this.isRunning = true;
    this.sfx.init();
    this.sfx.chirp();
    this.resizeCanvas();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  closePlayMode() {
    if (!this.overlay) return;
    this.overlay.classList.remove('active');
    this.isRunning = false;
  }

  switchMode(mode) {
    this.currentMode = mode;
    const tabCanvas = document.getElementById('play-tab-canvas');
    const tabGodot = document.getElementById('play-tab-godot');

    if (mode === 'canvas') {
      tabCanvas.classList.add('active');
      tabGodot.classList.remove('active');
      this.canvas.style.display = 'block';
      this.godotContainer.classList.remove('active');
      this.isRunning = true;
      requestAnimationFrame((t) => this.gameLoop(t));
    } else {
      tabGodot.classList.add('active');
      tabCanvas.classList.remove('active');
      this.canvas.style.display = 'none';
      this.godotContainer.classList.add('active');
      this.isRunning = false;
    }
    this.sfx.interact();
  }

  jump() {
    if (this.player.grounded) {
      this.player.vy = this.player.jumpForce;
      this.player.grounded = false;
      this.sfx.jump();

      // Jump dust particles
      for (let i = 0; i < 6; i++) {
        this.player.particles.push({
          x: this.player.x + this.player.width / 2,
          y: this.player.y + this.player.height,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * -2,
          life: 1,
          color: 'rgba(56, 189, 248, 0.7)'
        });
      }
    }
  }

  triggerInteraction() {
    if (this.currentPrompt) {
      this.sfx.interact();
      if (this.currentPrompt.itchUrl) {
        window.open(this.currentPrompt.itchUrl, '_blank');
      } else if (this.currentPrompt.githubUrl) {
        window.open(this.currentPrompt.githubUrl, '_blank');
      }
    }
  }

  update() {
    // Horizontal Movement
    const left = this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'];
    const right = this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'];

    if (left) {
      this.player.vx = -this.player.speed;
      this.player.direction = -1;
    } else if (right) {
      this.player.vx = this.player.speed;
      this.player.direction = 1;
    } else {
      this.player.vx *= 0.78;
      if (Math.abs(this.player.vx) < 0.1) this.player.vx = 0;
    }

    // Gravity
    this.player.vy += 0.55;
    if (this.player.vy > 12) this.player.vy = 12;

    // Move X
    this.player.x += this.player.vx;

    // Boundaries
    if (this.player.x < 10) this.player.x = 10;
    if (this.player.x > this.worldWidth - this.player.width - 10) {
      this.player.x = this.worldWidth - this.player.width - 10;
    }

    // Move Y
    this.player.y += this.player.vy;
    this.player.grounded = false;

    // Platform Collisions
    for (const p of this.platforms) {
      if (
        this.player.x + this.player.width > p.x &&
        this.player.x < p.x + p.width &&
        this.player.y + this.player.height >= p.y &&
        this.player.y + this.player.height <= p.y + p.height + this.player.vy &&
        this.player.vy >= 0
      ) {
        this.player.y = p.y - this.player.height;
        this.player.vy = 0;
        this.player.grounded = true;
      }
    }

    // Collect Gem Collisions
    for (const gem of this.gems) {
      if (!gem.collected) {
        const dx = (this.player.x + this.player.width / 2) - gem.x;
        const dy = (this.player.y + this.player.height / 2) - gem.y;
        if (Math.sqrt(dx * dx + dy * dy) < 28) {
          gem.collected = true;
          this.score += 100;
          this.gemsCollected++;
          this.sfx.collect();
          
          // Pop particles
          for (let i = 0; i < 10; i++) {
            this.player.particles.push({
              x: gem.x,
              y: gem.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 1,
              color: '#a855f7'
            });
          }

          // Update HUD
          const scoreEl = document.getElementById('hud-score-display');
          if (scoreEl) {
            scoreEl.innerText = `SCORE: ${this.score} | GEMS: ${this.gemsCollected}/${this.totalGems}`;
          }
        }
      }
    }

    // Update Particles
    for (let i = this.player.particles.length - 1; i >= 0; i--) {
      const pt = this.player.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= 0.04;
      if (pt.life <= 0) {
        this.player.particles.splice(i, 1);
      }
    }

    // Check Nearest Kiosk Interaction
    this.currentPrompt = null;
    for (const k of this.kiosks) {
      const dist = Math.abs((this.player.x + this.player.width / 2) - (k.x + 30));
      if (dist < 55) {
        this.currentPrompt = k;
        break;
      }
    }

    // Smooth Camera Follow
    const targetCameraX = this.player.x - this.canvas.width / 2 + this.player.width / 2;
    this.cameraX += (targetCameraX - this.cameraX) * 0.1;
    if (this.cameraX < 0) this.cameraX = 0;
    if (this.cameraX > this.worldWidth - this.canvas.width) {
      this.cameraX = Math.max(0, this.worldWidth - this.canvas.width);
    }
  }

  render() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // Parallax Star Background
    ctx.fillStyle = '#070a12';
    ctx.fillRect(this.cameraX, 0, this.canvas.width, this.canvas.height);

    // Distant Grid Lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.worldWidth; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }

    // Draw Platforms
    for (const p of this.platforms) {
      // Platform Body
      ctx.fillStyle = '#111827';
      ctx.fillRect(p.x, p.y, p.width, p.height);

      // Top Neon Glowing Edge
      ctx.fillStyle = 'linear-gradient(90deg, #38bdf8, #a855f7)';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(p.x, p.y, p.width, 3);
      ctx.shadowBlur = 0;
    }

    // Draw Interactive Kiosks / Arcade Podiums
    for (const k of this.kiosks) {
      // Podium Base
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(k.x, k.y, 60, 70);

      // Glass Cabinet Bezel
      ctx.strokeStyle = k.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(k.x, k.y, 60, 70);

      // Screen inside cabinet
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(k.x + 8, k.y + 10, 44, 34);

      // Screen icon
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(k.icon, k.x + 30, k.y + 34);

      // Kiosk Header Marquee
      ctx.fillStyle = k.color;
      ctx.font = '10px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(k.title, k.x + 30, k.y - 12);
    }

    // Draw Gems
    const time = Date.now() * 0.004;
    for (const gem of this.gems) {
      if (!gem.collected) {
        const hoverY = gem.y + Math.sin(time + gem.x) * 5;

        ctx.save();
        ctx.translate(gem.x, hoverY);
        ctx.rotate(time);
        ctx.fillStyle = '#a855f7';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 15;
        
        // Diamond Shape
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(8, 0);
        ctx.lineTo(0, 9);
        ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }

    // Draw Particles
    for (const pt of this.player.particles) {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.life);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw Player (Connor's Pixel Bot)
    const px = this.player.x;
    const py = this.player.y;
    const pw = this.player.width;
    const ph = this.player.height;

    // Player Glow
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;

    // Character Body
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(px, py + 8, pw, ph - 8, 6);
    ctx.fill();

    // Head Visor
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(px + 4, py + 2, pw - 8, 12);

    // Animated Glowing Visor Eyes
    ctx.fillStyle = '#ffffff';
    const eyeOffset = this.player.direction === 1 ? 5 : 2;
    ctx.fillRect(px + eyeOffset + 4, py + 5, 4, 4);
    ctx.fillRect(px + eyeOffset + 12, py + 5, 4, 4);

    // Antenna
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(px + pw / 2 - 2, py - 4, 4, 6);

    ctx.shadowBlur = 0;

    // Draw Speech Bubble / Interaction Tooltip
    if (this.currentPrompt) {
      const bubbleX = this.currentPrompt.x + 30;
      const bubbleY = this.currentPrompt.y - 45;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      
      const text = `[E / ENTER] Open ${this.currentPrompt.title}`;
      ctx.font = '12px "Space Grotesk", sans-serif';
      const textWidth = ctx.measureText(text).width + 24;

      ctx.beginPath();
      ctx.roundRect(bubbleX - textWidth / 2, bubbleY - 14, textWidth, 28, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(text, bubbleX, bubbleY + 4);
    }

    ctx.restore();
  }

  gameLoop(timestamp) {
    if (!this.isRunning || this.currentMode !== 'canvas') return;
    this.update();
    this.render();
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.portfolioPlayMode = new PortfolioPlayMode();
});
