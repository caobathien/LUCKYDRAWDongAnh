/**
 * ====================================================================
 * LUCKY DRAW - EVENT STAGE ENGINE (GSAP + WEB AUDIO + SMART AABB)
 * Controlled Random Non-overlapping Placement & Suspenseful Deceleration
 * ====================================================================
 */

// Default Sample Participants
const SAMPLE_PARTICIPANTS_35 = [
  "Cao Bá Thiên", "Cao Tiểu Phương",
  "Hồ Thị Kỳ", "Lê Văn Đại Điền", "Anh Tuyến"
];

const SAMPLE_PARTICIPANTS_65 = [
  ...SAMPLE_PARTICIPANTS_35,
  "Hoàng Gia Bảo", "Bùi Mai Hương", "Đặng Quốc Anh", "Ngô Thanh Vân",
  "Nguyễn Văn An", "Trần Thị Bích", "Lê Hoàng Nam", "Phạm Thu Hà",
  "Đỗ Minh Tuấn", "Vũ Khánh Vy", "Dương Đình Trọng", "Lý Hải Yến",
  "Trịnh Công Sơn", "Phan Anh Tuấn", "Võ Mỹ Duyên", "Hồ Ngọc Hà",
  "Cao Thái Sơn", "Mai Phương Thúy", "Lương Bích Hữu", "Tô Hoài Nam",
  "Nguyễn Hữu Thắng", "Trần Đình Trọng", "Phạm Đức Huy", "Đỗ Duy Mạnh",
  "Đoàn Văn Hậu", "Nguyễn Quang Hải", "Nguyễn Công Phượng", "Nguyễn Văn Toàn",
  "Phan Văn Đức", "Hà Đức Chinh", "Bùi Tiến Dũng", "Nguyễn Tuấn Anh",
  "Lương Xuân Trường", "Vũ Văn Thanh", "Nguyễn Phong Hồng Duy", "Quế Ngọc Hải",
  "Nguyễn Thành Chung", "Bùi Hoàng Việt Anh", "Nguyễn Thanh Bình", "Đặng Văn Lâm",
  "Nguyễn Tiến Linh", "Phạm Tuấn Hải", "Nhâm Mạnh Dũng", "Khuất Văn Khang",
  "Phan Tuấn Tài", "Nguyễn Thái Sơn", "Võ Minh Trọng", "Nguyễn Đình Bắc",
  "Hồ Văn Cường", "Giáp Tuấn Dương", "Trần Ngọc Sơn", "Lê Phạm Thành Long",
  "Trương Tiến Anh", "Nguyễn Đức Chiến", "Triệu Việt Hưng", "Lê Văn Đô",
  "Nguyễn Thanh Nhân", "Huỳnh Công Đến", "Lê Minh Bình", "Nguyễn Hữu Khôi"
];

const SAMPLE_PARTICIPANTS_100 = [
  ...SAMPLE_PARTICIPANTS_65,
  "Đinh Thanh Bình", "Nguyễn Trọng Hoàng", "Nguyễn Anh Đức", "Lê Công Vinh",
  "Phạm Văn Quyến", "Lê Huỳnh Đức", "Nguyễn Hồng Sơn", "Trần Công Minh",
  "Đỗ Khải", "Vũ Như Thành", "Dương Hồng Sơn", "Nguyễn Minh Phương",
  "Phan Văn Tài Em", "Nguyễn Việt Thắng", "Huỳnh Quang Thanh", "Lê Tấn Tài",
  "Vũ Phong", "Phan Thanh Hưng", "Đinh Hoàng Max", "Huỳnh Kesley Alves",
  "Nguyễn Rogerio", "Hoàng Vũ Samson", "Đặng Văn Robert", "Michal Nguyễn",
  "Mạc Hồng Quân", "Adriano Schmidt", "Filip Nguyễn", "Patrik Lê Giang",
  "Đỗ Merlo", "Lê Văn Thắng", "Trần Đình Hoàng", "Hoàng Đình Tùng",
  "Vũ Minh Tuấn", "Nguyễn Huy Hùng", "Võ Huy Toàn", "Hồ Tuấn Tài"
];

class LuckyDrawEngine {
  constructor() {
    // Stage State
    this.state = 'idle'; // 'idle' | 'spinning' | 'slowing' | 'winner'
    this.participants = []; // active: { id, name, x, y, width, height, element }
    this.winners = [];      // { id, name, prize, wonAt }

    // Preset Prize Queue: 3 Giải Khuyến Khích, 1 Giải 3, 1 Giải 2, 1 Giải Nhất
    this.presetPrizes = [
      'GIẢI KHUYẾN KHÍCH (1/3)',
      'GIẢI KHUYẾN KHÍCH (2/3)',
      'GIẢI KHUYẾN KHÍCH (3/3)',
      'GIẢI BA',
      'GIẢI NHÌ',
      'GIẢI NHẤT'
    ];
    this.currentPrizeIndex = 0;
    this.currentPrize = this.presetPrizes[0];

    // Animation / Spin Handles
    this.spinInterval = null;
    this.slowingTimeout = null;
    this.currentBeamIndex = -1;
    this.chosenWinner = null;
    this.soundEnabled = true;

    // DOM Elements
    this.initDOMElements();

    // Audio Engine
    this.initAudioEngine();

    // Background Canvas
    this.initBackgroundCanvas();

    // Event Listeners
    this.bindEvents();

    // Interactive Mouse Trail ("Đông Anh")
    this.initMouseTrail();

    // Initialize with default 35 participants
    this.loadParticipants(SAMPLE_PARTICIPANTS_35);
  }

  /* -------------------------------------------------------------
   * DOM ELEMENTS INITIALIZATION
   * ----------------------------------------------------------- */
  initDOMElements() {
    this.stageArea = document.getElementById('stageArea');
    this.namesContainer = document.getElementById('namesContainer');
    this.laserHalo = document.getElementById('laserHalo');
    this.suspenseMeter = document.getElementById('suspenseMeter');
    this.meterBar = document.getElementById('meterBar');
    this.mouseTrailContainer = document.getElementById('mouseTrailContainer');

    // Cyber Telemetry & Tension HUD elements
    this.countdownWatermark = document.getElementById('countdownWatermark');
    this.tensionAlarmVignette = document.getElementById('tensionAlarmVignette');
    this.suspensePercent = document.getElementById('suspensePercent');
    this.reticleStatusText = document.getElementById('reticleStatusText');

    // Controls
    this.btnMainAction = document.getElementById('btnMainAction');
    this.mainActionLabel = document.getElementById('mainActionLabel');
    this.mainActionIcon = document.getElementById('mainActionIcon');
    this.btnRelayout = document.getElementById('btnRelayout');
    this.btnQuickAdd = document.getElementById('btnQuickAdd');
    this.btnSoundToggle = document.getElementById('btnSoundToggle');
    this.soundIcon = document.getElementById('soundIcon');
    this.btnFullscreen = document.getElementById('btnFullscreen');
    this.activeCount = document.getElementById('activeCount');
    this.historyCount = document.getElementById('historyCount');
    this.currentPrizeBadge = document.getElementById('currentPrizeBadge');
    this.currentPrizeName = document.getElementById('currentPrizeName');

    // Winner Overlay
    this.winnerOverlay = document.getElementById('winnerOverlay');
    this.winnerCard = document.getElementById('winnerCard');
    this.winnerText = document.getElementById('winnerText');
    this.winnerPrizeTag = document.getElementById('winnerPrizeTag');
    this.btnNextSpin = document.getElementById('btnNextSpin');
    this.btnCloseWinner = document.getElementById('btnCloseWinner');
    this.fireworksCanvas = document.getElementById('fireworksCanvas');

    // Modals
    this.settingsModal = document.getElementById('settingsModal');
    this.historyModal = document.getElementById('historyModal');
    this.btnOpenSettings = document.getElementById('btnOpenSettings');
    this.btnOpenHistory = document.getElementById('btnOpenHistory');
    this.btnCloseSettings = document.getElementById('btnCloseSettings');
    this.btnCloseHistory = document.getElementById('btnCloseHistory');
    this.namesTextarea = document.getElementById('namesTextarea');
    this.textareaCountBadge = document.getElementById('textareaCountBadge');
    this.btnApplySettings = document.getElementById('btnApplySettings');
    this.historyList = document.getElementById('historyList');

    // Preset buttons
    this.btnSample30 = document.getElementById('btnSample30');
    this.btnSample60 = document.getElementById('btnSample60');
    this.btnSample100 = document.getElementById('btnSample100');
    this.btnClearNames = document.getElementById('btnClearNames');
    this.btnExportHistory = document.getElementById('btnExportHistory');
    this.btnResetHistory = document.getElementById('btnResetHistory');
    this.btnResetAll = document.getElementById('btnResetAll');

    // Prize chips
    this.prizeSelectorGrid = document.getElementById('prizeSelectorGrid');
    this.customPrizeInput = document.getElementById('customPrizeInput');
    this.btnApplyCustomPrize = document.getElementById('btnApplyCustomPrize');

    // Options
    this.chkAmbientFloating = document.getElementById('chkAmbientFloating');
    this.chkBackgroundParticles = document.getElementById('chkBackgroundParticles');
    this.chkSoundEffects = document.getElementById('chkSoundEffects');
    this.bgVideo = document.getElementById('bgVideo');
    this.videoUrlInput = document.getElementById('videoUrlInput');
    this.btnApplyVideo = document.getElementById('btnApplyVideo');
  }

  /* -------------------------------------------------------------
   * WEB AUDIO SYNTHESIZER & MP3 SOUNDTRACK CONTROLLER
   * ----------------------------------------------------------- */
  initAudioEngine() {
    this.audioCtx = null;

    // Nhạc vinh quang khi bấm nút Dừng
    this.vinhQuangAudio = new Audio('music/vinh%20quang.mp3');
    this.vinhQuangAudio.preload = 'auto';

    // Nhạc nền từng hạng mục giải thưởng trước khi bấm quay
    this.bgAudios = {
      // Khuyến khích 1 & 2: Nhạc sổ số miền bắc.mp3
      kk1_2: new Audio('music/Nh%E1%BA%A1c%20s%E1%BB%95%20s%E1%BB%91%20mi%E1%BB%81n%20b%E1%BA%AFc.mp3'),
      // Khuyến khích 3: cầu cho trúng số.mp3
      kk3: new Audio('music/c%E1%BA%A7u%20cho%20tr%C3%BAng%20s%E1%BB%91.mp3'),
      // Giải 3: trúng số remix.mp3
      giai3: new Audio('music/tr%C3%BAng%20s%E1%BB%91%20remix.mp3'),
      // Giải nhì: cầu cho trúng số2.mp3
      giai2: new Audio('music/c%E1%BA%A7u%20cho%20tr%C3%BAng%20s%E1%BB%912.mp3'),
      // Giải nhất: quacamlamgiau.mp3
      giaiNhat: new Audio('music/quacamlamgiau.mp3')
    };

    // Thiết lập thuộc tính cho toàn bộ nhạc nền
    Object.values(this.bgAudios).forEach(audio => {
      audio.preload = 'auto';
      audio.loop = true; // Lặp lại nhạc nền khi chờ quay
    });

    this.currentBgAudio = null;
    this.userInteracted = false;
  }

  // Lấy nhạc nền tương ứng với giải thưởng hiện tại
  getBgAudioForCurrentPrize() {
    const p = (this.currentPrize || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Giải Khuyến khích 1 và 2: Nhạc sổ số miền bắc
    if (p.includes('KHUYEN KHICH (1/3)') || p.includes('KHUYEN KHICH (2/3)') || p.includes('KK 1') || p.includes('KK 2') || p.includes('KK1') || p.includes('KK2')) {
      return this.bgAudios.kk1_2;
    }
    // Giải Khuyến khích 3: Cầu cho trúng số 1
    if (p.includes('KHUYEN KHICH (3/3)') || p.includes('KK 3') || p.includes('KK3')) {
      return this.bgAudios.kk3;
    }
    // Nếu có chữ Khuyến khích chung chung: mặc định kk1_2
    if (p.includes('KHUYEN KHICH')) {
      return this.bgAudios.kk1_2;
    }
    // Giải Nhì: Cầu cho trúng số 2
    if (p.includes('NHI') || p.includes('GIAI 2') || p.includes('GIAI NHI')) {
      return this.bgAudios.giai2;
    }
    // Giải 3: Trúng số remix
    if (p.includes('GIAI BA') || p.includes('GIAI 3') || p.includes('BA')) {
      return this.bgAudios.giai3;
    }
    // Giải Nhất: quacamlamgiau
    if (p.includes('NHAT') || p.includes('GIAI 1') || p.includes('GIAI NHAT') || p.includes('DAC BIET')) {
      return this.bgAudios.giaiNhat;
    }

    return this.bgAudios.kk1_2;
  }

  // Phát nhạc nền trước khi quay
  playBackgroundMusic() {
    if (!this.soundEnabled || this.state !== 'idle') return;

    const targetAudio = this.getBgAudioForCurrentPrize();

    // Nếu đang phát bài khác thì dừng lại
    if (this.currentBgAudio && this.currentBgAudio !== targetAudio) {
      try {
        this.currentBgAudio.pause();
        this.currentBgAudio.currentTime = 0;
      } catch (e) {}
    }

    this.currentBgAudio = targetAudio;
    if (this.currentBgAudio) {
      try {
        const p = this.currentBgAudio.play();
        if (p !== undefined) {
          p.catch(() => {});
        }
      } catch (e) {}
    }
  }

  // Dừng toàn bộ nhạc nền (khi bấm quay)
  stopBackgroundMusic() {
    Object.values(this.bgAudios).forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    });
    this.currentBgAudio = null;
  }

  playVinhQuangMusic() {
    if (!this.soundEnabled || !this.vinhQuangAudio) return;
    try {
      this.vinhQuangAudio.currentTime = 0;
      const playPromise = this.vinhQuangAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy or interaction restriction
        });
      }
    } catch (e) {
      console.warn("Không thể phát nhạc vinh quang:", e);
    }
  }

  stopVinhQuangMusic() {
    if (!this.vinhQuangAudio) return;
    try {
      this.vinhQuangAudio.pause();
      this.vinhQuangAudio.currentTime = 0;
    } catch (e) {}
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSpinTick(frequency = 720, volume = 0.08) {
    if (!this.soundEnabled || !this.chkSoundEffects.checked) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {
      // Audio context might be restricted
    }
  }

  playSuspenseTick(pitchFactor = 1.0, isHeartbeat = false) {
    if (!this.soundEnabled || !this.chkSoundEffects.checked) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      if (isHeartbeat) {
        // Deep tension sub-thud
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(95, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.18);

        gain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.18);
      } else {
        // Rising tension click
        osc.type = 'sine';
        const baseFreq = 520 * pitchFactor;
        osc.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, this.audioCtx.currentTime + 0.07);

        gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.07);
      }

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + (isHeartbeat ? 0.2 : 0.08));
    } catch (e) {}
  }

  playCelebrationFanfare() {
    if (!this.soundEnabled || !this.chkSoundEffects.checked) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    try {
      const notes = [
        { f: 523.25, time: 0.00, dur: 0.18 }, // C5
        { f: 659.25, time: 0.16, dur: 0.18 }, // E5
        { f: 783.99, time: 0.32, dur: 0.24 }, // G5
        { f: 1046.50, time: 0.54, dur: 0.70 } // C6 (long victory ring)
      ];

      notes.forEach(({ f, time, dur }) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.audioCtx.currentTime + time);

        gain.gain.setValueAtTime(0, this.audioCtx.currentTime + time);
        gain.gain.linearRampToValueAtTime(0.25, this.audioCtx.currentTime + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + time + dur);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + time);
        osc.stop(this.audioCtx.currentTime + time + dur);
      });

      // Shimmer sparkles
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          this.playSpinTick(1200 + Math.random() * 800, 0.05);
        }, 500 + i * 110);
      }
    } catch (e) {}
  }

  /* -------------------------------------------------------------
   * DYNAMIC BACKGROUND CANVAS & PARTICLES
   * ----------------------------------------------------------- */
  /* -------------------------------------------------------------
   * 3D CYBER 5.0 DYNAMIC BACKGROUND CANVAS & QUANTUM PARTICLES
   * Màn hình chờ hiệu ứng nền động 3D lượn sóng ma trận công nghệ 5.0
   * ----------------------------------------------------------- */
  initBackgroundCanvas() {
    this.canvas = document.getElementById('stageCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();

    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });

    // 3D Cyber Wave Grid configuration
    this.waveTime = 0;
    this.gridCols = 28;
    this.gridRows = 20;

    // Floating Quantum Star Particles
    this.particles = [];
    const particleCount = 55;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 2.2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.5 - 0.12,
        color: Math.random() > 0.4 ? 'rgba(0, 242, 254,' : 'rgba(255, 215, 0,',
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01
      });
    }

    const renderLoop = () => {
      if (this.chkBackgroundParticles && this.chkBackgroundParticles.checked) {
        this.draw3DCyberBackground();
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  draw3DCyberBackground() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // Speed up waves when spinning
    const speedMult = (this.state === 'spinning' ? 2.6 : (this.state === 'slowing' ? 1.8 : 1.0));
    this.waveTime += 0.016 * speedMult;

    // 1. RENDER 3D CYBER 5.0 UNDULATING WAVE MESH
    const focalLength = 460;
    const centerX = w / 2;
    const horizonY = h * 0.46;

    const zStart = 150;
    const zEnd = 1350;
    const xRange = 860;

    const projectedGrid = [];

    for (let r = 0; r < this.gridRows; r++) {
      projectedGrid[r] = [];
      const zRatio = r / (this.gridRows - 1);
      const z = zStart + zRatio * (zEnd - zStart);
      const scale = focalLength / z;

      for (let c = 0; c < this.gridCols; c++) {
        const xRatio = (c / (this.gridCols - 1)) * 2 - 1; // -1 to 1
        const x3d = xRatio * xRange;

        // 3D Harmonic Wave Height (y3d)
        const wave1 = Math.sin(x3d * 0.0035 + this.waveTime * 1.6) * Math.cos(z * 0.003 + this.waveTime * 1.2) * 58;
        const wave2 = Math.sin((x3d - z) * 0.0025 + this.waveTime * 2.0) * 32;
        const y3d = wave1 + wave2 + 130;

        const projX = centerX + x3d * scale;
        const projY = horizonY + y3d * scale;

        // Depth fog factor (1 near camera, 0 far at horizon)
        const depthAlpha = Math.max(0.04, Math.min(0.55, (1 - zRatio) * 0.65));

        projectedGrid[r][c] = {
          x: projX,
          y: projY,
          alpha: depthAlpha,
          zRatio: zRatio,
          y3d: y3d
        };
      }
    }

    // Draw 3D Cross Lines (Latitudinal / Depth Rows)
    for (let r = 0; r < this.gridRows; r++) {
      this.ctx.beginPath();
      const avgAlpha = projectedGrid[r][0].alpha;
      this.ctx.strokeStyle = `rgba(0, 242, 254, ${avgAlpha * 0.75})`;
      this.ctx.lineWidth = Math.max(0.7, (1 - projectedGrid[r][0].zRatio) * 2.0);

      for (let c = 0; c < this.gridCols; c++) {
        const pt = projectedGrid[r][c];
        if (c === 0) {
          this.ctx.moveTo(pt.x, pt.y);
        } else {
          this.ctx.lineTo(pt.x, pt.y);
        }
      }
      this.ctx.stroke();
    }

    // Draw 3D Longitudinal Perspective Lines (Columns towards horizon)
    for (let c = 0; c < this.gridCols; c += 2) {
      this.ctx.beginPath();
      for (let r = 0; r < this.gridRows; r++) {
        const pt = projectedGrid[r][c];
        if (r === 0) {
          this.ctx.moveTo(pt.x, pt.y);
        } else {
          this.ctx.lineTo(pt.x, pt.y);
        }
      }
      this.ctx.strokeStyle = `rgba(0, 114, 255, 0.22)`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Draw Glowing 3D Quantum Nodes on Wave Crests
    for (let r = 0; r < this.gridRows; r += 2) {
      for (let c = 0; c < this.gridCols; c += 3) {
        const pt = projectedGrid[r][c];
        if (pt.y3d > 140) { // On wave peak
          this.ctx.beginPath();
          const nodeRadius = (1 - pt.zRatio) * 2.8 + 0.8;
          this.ctx.arc(pt.x, pt.y, nodeRadius, 0, Math.PI * 2);
          this.ctx.fillStyle = r % 4 === 0 ? 'rgba(255, 215, 0, 0.85)' : 'rgba(0, 242, 254, 0.85)';
          this.ctx.shadowBlur = 8;
          this.ctx.shadowColor = r % 4 === 0 ? '#ffd700' : '#00f2fe';
          this.ctx.fill();
        }
      }
    }
    this.ctx.shadowBlur = 0;

    // 2. RENDER FLOATING PARTICLES & STARS IN UPPER SKY
    for (let p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.alpha += Math.sin(Date.now() * p.pulseSpeed * 0.1) * 0.01;
      const clampedAlpha = Math.max(0.08, Math.min(0.65, p.alpha));

      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `${p.color} ${clampedAlpha})`;
      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = p.color.includes('255, 215, 0') ? '#ffd700' : '#00f2fe';
      this.ctx.fill();
    }
    this.ctx.shadowBlur = 0;
  }

  /* -------------------------------------------------------------
   * INTERACTIVE MOUSE TRAIL: RƠI CHỮ "ĐÔNG ANH" GHÉP LẠI HOÀN CHỈNH
   * Lướt ngang trái/phải, lên/xuống đều rớt ra nguyên cụm chữ ĐÔNG ANH
   * Đậm chất công nghệ 5.0, quảng bá thương hiệu ĐÔNG ANH cực kỳ rõ nét!
   * ----------------------------------------------------------- */
  initMouseTrail() {
    this.mouseTrailContainer = document.getElementById('mouseTrailContainer');
    if (!this.mouseTrailContainer) return;

    this.trailIndex = 0;
    this.lastTrailPos = { x: -999, y: -999 };
    this.fallingChars = [];

    // Danh sách các định dạng chữ Đông Anh hiển thị sinh động
    this.dongAnhPhrases = [
      'ĐÔNG ANH',
      '✦ ĐÔNG ANH ✦',
      'ĐÔNG ANH',
      '★ ĐÔNG ANH ★'
    ];

    // Lắng nghe chuột di chuyển (hỗ trợ lướt ngang trái/phải cực mượt)
    window.addEventListener('mousemove', (e) => {
      const dx = e.clientX - this.lastTrailPos.x;
      const dy = e.clientY - this.lastTrailPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Giảm tần suất rơi 50% (chuột di chuyển tối thiểu 92px mới rơi 1 cụm nhỏ)
      if (dist >= 92) {
        this.spawnFallingDongAnh(e.clientX, e.clientY, dx, dy);
        this.lastTrailPos = { x: e.clientX, y: e.clientY };
      }
    });

    // Hỗ trợ cảm ứng vuốt màn hình (giảm tần suất 50%)
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const dx = touch.clientX - this.lastTrailPos.x;
        const dy = touch.clientY - this.lastTrailPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= 88) {
          this.spawnFallingDongAnh(touch.clientX, touch.clientY, dx, dy);
          this.lastTrailPos = { x: touch.clientX, y: touch.clientY };
        }
      }
    }, { passive: true });

    // Hiệu ứng click chuột tự do bung 1 chữ ĐÔNG ANH nhỏ xinh
    window.addEventListener('click', (e) => {
      if (!e.target.closest('button, input, select, textarea, .modal, .name-pill, .btn-cyber-core')) {
        this.spawnFallingDongAnh(e.clientX, e.clientY, -10, -8);
      }
    });

    // Vòng lặp vật lý trọng lực & đung đưa mềm mại cho chữ ĐÔNG ANH rơi xuống
    const updateFallingChars = () => {
      for (let i = this.fallingChars.length - 1; i >= 0; i--) {
        const c = this.fallingChars[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += c.gravity; // Trọng lực hút rơi xuống tự nhiên
        c.rot += c.vRot;   // Nghiêng nhẹ tinh tế
        c.opacity -= c.fadeRate;
        c.scale *= 0.997;

        // Chuyển động đung đưa uốn lượn mềm mại khi rơi
        c.sway += 0.04;
        const swayOffset = Math.sin(c.sway) * 1.0;

        if (c.opacity <= 0 || c.y > window.innerHeight + 60) {
          if (c.el && c.el.parentNode) {
            c.el.parentNode.removeChild(c.el);
          }
          this.fallingChars.splice(i, 1);
        } else {
          c.el.style.transform = `translate3d(${c.x + swayOffset}px, ${c.y}px, 0) rotate(${c.rot}deg) scale(${c.scale})`;
          c.el.style.opacity = c.opacity;
        }
      }
      requestAnimationFrame(updateFallingChars);
    };
    requestAnimationFrame(updateFallingChars);
  }

  spawnFallingDongAnh(x, y, dx = 0, dy = 0) {
    if (!this.mouseTrailContainer) return;

    // Chọn cụm chữ ĐÔNG ANH hoàn chỉnh kế tiếp
    const phrase = this.dongAnhPhrases[this.trailIndex % this.dongAnhPhrases.length];
    this.trailIndex++;

    // Luân phiên màu Cyan Neon và Vàng Gold rực rỡ chuẩn 5.0
    const isGold = (this.trailIndex % 2 === 0);
    const phraseEl = document.createElement('div');
    phraseEl.className = 'falling-donganh ' + (isGold ? 'gold-phrase' : 'cyan-phrase');
    phraseEl.textContent = phrase;
    phraseEl.style.left = '0px';
    phraseEl.style.top = '0px';
    phraseEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    this.mouseTrailContainer.appendChild(phraseEl);

    // Tính quán tính lướt ngang trái/phải: lướt sang phải thì trôi sang phải, lướt sang trái thì trôi sang trái
    const driftX = Math.max(-1.8, Math.min(1.8, dx * 0.05)) + (Math.random() - 0.5) * 0.4;

    this.fallingChars.push({
      el: phraseEl,
      x: x - 22, // Căn giữa dòng chữ siêu nhỏ với đầu chuột
      y: y - 6,
      vx: driftX,
      vy: -Math.random() * 0.6 - 0.2, // Nảy nhẹ lên trên rồi mới chìm dần xuống
      rot: (Math.random() - 0.5) * 5,  // Góc nghiêng nhỏ tinh tế
      vRot: (Math.random() - 0.5) * 0.15,
      scale: Math.random() * 0.12 + 0.90,
      opacity: 1.0,
      gravity: 0.17,
      fadeRate: 0.013, // Tồn tại êm dịu rồi tan biến
      sway: Math.random() * Math.PI * 2
    });
  }


  /* -------------------------------------------------------------
   * CORE ALGORITHM: "RANDOM CÓ KIỂM SOÁT" (AABB ANTI-COLLISION)
   * 1. Measure real dimensions
   * 2. Non-overlapping placement with safe margins & padding
   * 3. Stay strictly static once placed
   * ----------------------------------------------------------- */
  loadParticipants(nameList, preserveExistingCoords = false) {
    const sanitized = nameList
      .map(n => n.trim())
      .filter(n => n.length > 0);

    // Deduplicate or keep as needed (preserve original IDs)
    const newParticipants = sanitized.map((name, index) => ({
      id: `p_${Date.now()}_${index}`,
      name: name,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      element: null
    }));

    this.participants = newParticipants;
    this.calculateAndRenderLayout();
    this.updateHUDCounts();
  }

  calculateAndRenderLayout() {
    // Clear DOM container
    this.namesContainer.innerHTML = '';
    if (this.participants.length === 0) {
      this.namesContainer.innerHTML = `
        <div style="position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%);
                    text-align: center; color: #94a3b8; font-size: 16px;">
          <p style="font-size: 40px; margin-bottom: 12px;">👥</p>
          <p>Chưa có người tham gia nào trong danh sách.</p>
          <p style="font-size: 13px; color: #64748b; margin-top: 6px;">Bấm "📝 Danh sách" ở góc dưới để nhập tên.</p>
        </div>
      `;
      return;
    }

    const totalNames = this.participants.length;

    // STEP 1: Áp dụng lớp mật độ (Adaptive Density) để tên không bao giờ quá to gây đè nhau
    this.namesContainer.classList.remove('density-spacious', 'density-medium', 'density-compact', 'density-dense');
    if (totalNames <= 25) {
      this.namesContainer.classList.add('density-spacious');
    } else if (totalNames <= 45) {
      this.namesContainer.classList.add('density-medium');
    } else if (totalNames <= 75) {
      this.namesContainer.classList.add('density-compact');
    } else {
      this.namesContainer.classList.add('density-dense');
    }

    // Đo đạc kích thước sân khấu thực tế
    const stageRect = this.stageArea.getBoundingClientRect();
    const stageWidth = stageRect.width || window.innerWidth;
    const stageHeight = stageRect.height || (window.innerHeight - 170);

    // Vùng an toàn (tránh sát mép màn hình, tránh HUD giải thưởng trên đỉnh và thanh công cụ dưới đáy)
    const safeMarginX = Math.max(20, Math.min(40, stageWidth * 0.025));
    const safeMarginTop = 15;
    const safeMarginBottom = 25;

    const bounds = {
      minX: safeMarginX,
      maxX: stageWidth - safeMarginX,
      minY: safeMarginTop,
      maxY: stageHeight - safeMarginBottom
    };

    const effectiveWidth = bounds.maxX - bounds.minX;
    const effectiveHeight = bounds.maxY - bounds.minY;

    // STEP 2: Tạo thẻ DOM tạm thời để đo kích thước thực tế (chữ, padding, viền)
    const offscreenFrag = document.createDocumentFragment();
    this.participants.forEach((p, idx) => {
      const el = document.createElement('div');
      el.className = 'name-pill' + (this.chkAmbientFloating?.checked ? ' ambient-glow' : '');
      el.textContent = p.name;
      el.title = p.name; // Tooltip khi hover để ai cũng thấy rõ tên đầy đủ
      el.style.visibility = 'hidden';
      el.style.left = '0px';
      el.style.top = '0px';
      el.style.animationDelay = `${(idx * 0.17) % 3}s`;
      offscreenFrag.appendChild(el);
      p.element = el;
    });
    this.namesContainer.appendChild(offscreenFrag);

    // Đo kích thước từng thẻ tên
    this.participants.forEach(p => {
      const rect = p.element.getBoundingClientRect();
      p.width = Math.ceil(rect.width);
      p.height = Math.ceil(rect.height);
    });

    // STEP 3: THUẬT TOÁN PHÂN BỔ TUYỆT ĐỐI KHÔNG CHỒNG ĐÈ (ZERO OVERLAP MATRIX)
    // Tính toán số cột và số hàng tối ưu nhất để chứa vừa tất cả N thẻ tên
    let bestCols = 1;
    let bestRows = totalNames;
    let bestScore = -Infinity;

    // Dò tìm số cột thích hợp nhất (từ 3 đến 14 cột tuỳ theo số lượng người và chiều ngang màn hình)
    const minCols = Math.max(2, Math.floor(effectiveWidth / 280));
    const maxCols = Math.min(15, Math.max(3, Math.ceil(effectiveWidth / 95)));

    for (let c = minCols; c <= maxCols; c++) {
      const r = Math.ceil(totalNames / c);
      const cW = effectiveWidth / c;
      const cH = effectiveHeight / r;

      if (cH < 26 || cW < 70) continue;

      const ratio = cW / cH;
      const ratioDiff = Math.abs(ratio - 3.8); // Tỉ lệ đẹp giữa ngang và dọc của thẻ
      const emptyCells = (c * r) - totalNames;
      const score = 100 - (ratioDiff * 14) - (emptyCells * 1.8) + (cW * 0.08);

      if (score > bestScore) {
        bestScore = score;
        bestCols = c;
        bestRows = r;
      }
    }

    if (bestScore === -Infinity) {
      bestCols = Math.max(3, Math.ceil(Math.sqrt(totalNames * (effectiveWidth / effectiveHeight))));
      bestRows = Math.ceil(totalNames / bestCols);
    }

    const cellW = effectiveWidth / bestCols;
    const cellH = effectiveHeight / bestRows;

    // Sinh danh sách tất cả các ô toạ độ lưới an toàn (đã tính độ lệch tổ ong lượn sóng)
    const allCells = [];
    for (let r = 0; r < bestRows; r++) {
      for (let c = 0; c < bestCols; c++) {
        // Lệch hàng chẵn / lẻ (honeycomb stagger) để tạo cảm giác chùm sao tự nhiên, không bị cứng như bảng Excel
        const staggerX = (r % 2 === 1) ? (cellW * 0.16) : (-cellW * 0.16);
        const cellLeft = Math.max(bounds.minX, Math.min(bounds.maxX - cellW, bounds.minX + c * cellW + staggerX));
        const cellTop = bounds.minY + r * cellH;
        allCells.push({ c, r, left: cellLeft, top: cellTop });
      }
    }

    // Xáo trộn ngẫu nhiên thứ tự các ô để các tên phân tán ngẫu nhiên khắp toàn bộ màn hình
    for (let i = allCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
    }

    // STEP 4: Định vị từng người vào ô riêng biệt (Bảo đảm 100% không trùng lặp, không đè lên nhau)
    const placedBoxes = [];
    this.participants.forEach((p, index) => {
      const cell = allCells[index % allCells.length];

      // Nếu tên dài hơn chiều rộng của ô, tự động co hẹp và thêm dấu ... để không bao giờ lấn sang ô bên cạnh
      const maxAllowedW = cellW - 6;
      if (p.width > maxAllowedW && maxAllowedW > 50) {
        p.element.style.maxWidth = `${Math.floor(maxAllowedW)}px`;
        p.element.style.overflow = 'hidden';
        p.element.style.textOverflow = 'ellipsis';
        p.width = Math.floor(maxAllowedW);
      }

      // Khoảng trống co giãn bên trong ô riêng
      const freeX = Math.max(0, cellW - p.width - 4);
      const freeY = Math.max(0, cellH - p.height - 4);

      // Dao động vi mô ngẫu nhiên trong phạm vi an toàn của chính ô đó
      const jitterX = (Math.random() - 0.5) * freeX * 0.7;
      const jitterY = (Math.random() - 0.5) * freeY * 0.7;

      const finalX = Math.max(bounds.minX, Math.min(bounds.maxX - p.width, cell.left + (cellW - p.width) / 2 + jitterX));
      const finalY = Math.max(bounds.minY, Math.min(bounds.maxY - p.height, cell.top + (cellH - p.height) / 2 + jitterY));

      p.x = Math.round(finalX);
      p.y = Math.round(finalY);

      placedBoxes.push({
        p,
        left: p.x,
        right: p.x + p.width,
        top: p.y,
        bottom: p.y + p.height
      });

      // Áp toạ độ chính xác lên DOM
      p.element.style.left = `${p.x}px`;
      p.element.style.top = `${p.y}px`;
      p.element.style.visibility = 'visible';
    });

    // STEP 5: Quét kiểm tra an toàn AABB (Collision Resolution Pass)
    // Nếu có 2 thẻ chạm nhau dù chỉ 1px, lực đẩy đàn hồi sẽ tách chúng ra ngay lập tức
    const safetyGap = 4;
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < placedBoxes.length; i++) {
        for (let j = i + 1; j < placedBoxes.length; j++) {
          const b1 = placedBoxes[i];
          const b2 = placedBoxes[j];

          const overlapX = Math.min(b1.right + safetyGap, b2.right + safetyGap) - Math.max(b1.left, b2.left);
          const overlapY = Math.min(b1.bottom + safetyGap, b2.bottom + safetyGap) - Math.max(b1.top, b2.top);

          if (overlapX > 0 && overlapY > 0) {
            // Đẩy nhẹ theo trục có độ chồng lấn nhỏ nhất
            if (overlapX < overlapY) {
              const shift = (overlapX / 2) + 1;
              if (b1.left < b2.left) {
                b1.p.x = Math.max(bounds.minX, b1.p.x - shift);
                b2.p.x = Math.min(bounds.maxX - b2.p.width, b2.p.x + shift);
              } else {
                b1.p.x = Math.min(bounds.maxX - b1.p.width, b1.p.x + shift);
                b2.p.x = Math.max(bounds.minX, b2.p.x - shift);
              }
            } else {
              const shift = (overlapY / 2) + 1;
              if (b1.top < b2.top) {
                b1.p.y = Math.max(bounds.minY, b1.p.y - shift);
                b2.p.y = Math.min(bounds.maxY - b2.p.height, b2.p.y + shift);
              } else {
                b1.p.y = Math.min(bounds.maxY - b1.p.height, b1.p.y + shift);
                b2.p.y = Math.max(bounds.minY, b2.p.y - shift);
              }
            }
            // Cập nhật lại hộp giới hạn
            b1.left = b1.p.x; b1.right = b1.p.x + b1.p.width;
            b1.top = b1.p.y; b1.bottom = b1.p.y + b1.p.height;
            b2.left = b2.p.x; b2.right = b2.p.x + b2.p.width;
            b2.top = b2.p.y; b2.bottom = b2.p.y + b2.p.height;

            b1.p.element.style.left = `${b1.p.x}px`;
            b1.p.element.style.top = `${b1.p.y}px`;
            b2.p.element.style.left = `${b2.p.x}px`;
            b2.p.element.style.top = `${b2.p.y}px`;
          }
        }
      }
    }

    // Animate initial entry with subtle GSAP stagger
    gsap.fromTo(
      '.name-pill',
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: {
          each: 0.015,
          from: 'random'
        },
        ease: 'power2.out'
      }
    );
  }

  /* -------------------------------------------------------------
   * GIAI ĐOẠN B: BẤM "BẮT ĐẦU" (FAST SPINNING)
   * ----------------------------------------------------------- */
  startSpin() {
    if (this.participants.length === 0) {
      alert("Danh sách người tham gia đang trống! Vui lòng thêm danh sách trước khi quay.");
      this.openSettings();
      return;
    }

    if (this.participants.length === 1) {
      alert("Chỉ còn 1 người duy nhất trong danh sách!");
    }

    this.ensureAudioContext();
    this.stopVinhQuangMusic(); // Đảm bảo nhạc dừng nếu còn đang phát
    this.stopBackgroundMusic(); // DỪNG NHẠC NỀN KHI BẤM BẮT ĐẦU QUAY
    this.state = 'spinning';

    // Update Action Button to "DỪNG LẠI"
    this.btnMainAction.classList.remove('btn-start');
    this.btnMainAction.classList.add('btn-stop');
    this.mainActionLabel.textContent = 'DỪNG LẠI';
    this.mainActionIcon.textContent = '⏹';

    // Show laser halo / target reticle
    this.laserHalo.classList.add('active');
    if (this.reticleStatusText) this.reticleStatusText.textContent = 'SCANNING...';

    // Rapid random hopping
    let lastIndex = -1;
    const hop = () => {
      if (this.state !== 'spinning') return;

      // Select random index different from last
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * this.participants.length);
      } while (nextIndex === lastIndex && this.participants.length > 1);

      this.highlightName(nextIndex, 1.08, 'is-active-beam');
      this.playSpinTick(650 + Math.random() * 200, 0.07);
      lastIndex = nextIndex;

      // Spin rate: super fast 70ms
      this.spinInterval = setTimeout(hop, 70);
    };

    hop();
  }

  isCaoTieuPhuong(name) {
    if (!name) return false;
    const clean = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return clean.includes('cao tieu phuong');
  }

  isPrizeGiaiNhi(prize) {
    if (!prize) return false;
    const p = prize.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return p.includes('NHI') || p.includes('GIAI 2') || p.includes('GIAI NHI');
  }

  /* -------------------------------------------------------------
   * GIAI ĐOẠN C: BẤM "DỪNG" (DECELERATION OVER 5 SECONDS WITH INTENSE SUSPENSE)
   * Chạy chậm dần từ từ chính xác trong 5 giây (5000ms) trước khi dừng hẳn
   * ----------------------------------------------------------- */
  stopSpin() {
    if (this.state !== 'spinning') return;
    this.state = 'slowing';
    clearTimeout(this.spinInterval);

    // Disable button during slowing phase
    this.btnMainAction.disabled = true;
    this.mainActionIcon.textContent = '⏳';
    this.suspenseMeter.classList.add('active');

    // Phát nhạc vinh quang khi bấm nút Dừng
    this.playVinhQuangMusic();

    // Trigger tension alarm vignette and giant cyber watermark
    if (this.tensionAlarmVignette) this.tensionAlarmVignette.classList.add('active');
    if (this.countdownWatermark) {
      this.countdownWatermark.classList.add('active');
      this.countdownWatermark.textContent = '05.00';
    }

    // Công tắc cơ cấu: ĐÃ BẬT (true)
    const ENABLE_CO_CAU_GIAI_NHI = false; 

    // BƯỚC 1: Chọn sẵn người thắng ngẫu nhiên (CODE CŨ NGUYÊN BẢN)
    let winnerIndex = Math.floor(Math.random() * this.participants.length);

    const isGiaiNhi = this.isPrizeGiaiNhi(this.currentPrize);
    const caoIdx = this.participants.findIndex(p => this.isCaoTieuPhuong(p.name));
    if (ENABLE_CO_CAU_GIAI_NHI) {
      if (isGiaiNhi && caoIdx !== -1) {
        winnerIndex = caoIdx;
      } else {
        const nonCaoIndices = [];
        this.participants.forEach((p, idx) => {
          if (!this.isCaoTieuPhuong(p.name)) nonCaoIndices.push(idx);
        });
        if (nonCaoIndices.length > 0) {
          winnerIndex = nonCaoIndices[Math.floor(Math.random() * nonCaoIndices.length)];
        }
      }
    }

    this.chosenWinner = this.participants[winnerIndex];

    // BƯỚC 2: Thiết lập chuỗi delay chuẩn xác 5.0s (CODE CŨ NGUYÊN BẢN)
    let delaySteps = [
      80, 80, 85, 90, 95, 100, 110, 120, 135, 150,
      170, 195, 225, 260, 305, 360, 430, 520, 650, 840
    ];
    let scaleSteps = [
      1.06, 1.06, 1.07, 1.08, 1.08, 1.09, 1.10, 1.12, 1.14, 1.16,
      1.18, 1.20, 1.24, 1.28, 1.32, 1.38, 1.45, 1.52, 1.60, 1.75
    ];

    if (ENABLE_CO_CAU_GIAI_NHI && isGiaiNhi && caoIdx !== -1) {
      delaySteps = [
        80, 80, 85, 90, 95, 100, 110, 120, 135, 150,
        170, 195, 225, 260, 310, 380, 480, 680, 1155, 100
      ];
      scaleSteps = [
        1.06, 1.06, 1.07, 1.08, 1.08, 1.09, 1.10, 1.12, 1.14, 1.16,
        1.18, 1.20, 1.24, 1.28, 1.32, 1.38, 1.45, 1.55, 1.68, 1.75
      ];
    }

    const totalSteps = delaySteps.length;
    const finalSequence = [];
    let lastIdx = this.currentBeamIndex;

    if (ENABLE_CO_CAU_GIAI_NHI && isGiaiNhi && caoIdx !== -1) {
      const otherIndices = [];
      this.participants.forEach((p, idx) => {
        if (idx !== caoIdx) otherIndices.push(idx);
      });
      if (otherIndices.length > 0) {
        const rivalIdx = otherIndices[0];
        const subRival = otherIndices[1] ?? rivalIdx;
        for (let s = 0; s < totalSteps; s++) {
          if (s === totalSteps - 1) {
            finalSequence.push(caoIdx); // 0.1s cuối cùng phóng sang Cao Tiểu Phương
          } else if (s === totalSteps - 2) {
            finalSequence.push(rivalIdx);
          } else if (s === totalSteps - 3) {
            finalSequence.push(subRival);
          } else {
            let nextIdx;
            do {
              nextIdx = otherIndices[Math.floor(Math.random() * otherIndices.length)];
            } while (nextIdx === lastIdx && otherIndices.length > 1);
            finalSequence.push(nextIdx);
            lastIdx = nextIdx;
          }
        }
      } else {
        for (let s = 0; s < totalSteps; s++) finalSequence.push(caoIdx);
      }
    } else {

    // BƯỚC 3: Xây dựng lộ trình tên (CODE CŨ NGUYÊN BẢN CHẠY MẶC ĐỊNH)
    const candidatesWithDistance = this.participants
      .map((p, idx) => {
        const dx = (p.x + p.width / 2) - (this.chosenWinner.x + this.chosenWinner.width / 2);
        const dy = (p.y + p.height / 2) - (this.chosenWinner.y + this.chosenWinner.height / 2);
        return { index: idx, dist: Math.sqrt(dx * dx + dy * dy) };
      })
      .filter(item => item.index !== winnerIndex)
      .sort((a, b) => a.dist - b.dist);

    for (let s = 0; s < totalSteps; s++) {
      if (s === totalSteps - 1) {
        finalSequence.push(winnerIndex);
      } else if (this.participants.length === 1) {
        finalSequence.push(0);
      } else if (this.participants.length === 2) {
        const otherIndex = (winnerIndex === 0) ? 1 : 0;
        const stepsFromEnd = (totalSteps - 1) - s;
        if (stepsFromEnd % 2 === 0) {
          finalSequence.push(winnerIndex);
        } else {
          finalSequence.push(otherIndex);
        }
      } else {
        if (s < 13) {
          let nextIdx;
          do {
            nextIdx = Math.floor(Math.random() * this.participants.length);
          } while (nextIdx === lastIdx && this.participants.length > 1);
          finalSequence.push(nextIdx);
          lastIdx = nextIdx;
        } else if (s < 17) {
          const pool = [
            winnerIndex,
            ...candidatesWithDistance.slice(0, 3).map(c => c.index)
          ];
          let nextIdx;
          do {
            nextIdx = pool[Math.floor(Math.random() * pool.length)];
          } while (nextIdx === lastIdx && pool.length > 1);
          finalSequence.push(nextIdx);
          lastIdx = nextIdx;
        } else if (s === totalSteps - 3) {
          const idx = candidatesWithDistance[1]?.index ?? candidatesWithDistance[0]?.index ?? winnerIndex;
          finalSequence.push(idx);
        } else if (s === totalSteps - 2) {
          const idx = candidatesWithDistance[0]?.index ?? (winnerIndex === 0 ? 1 : 0);
          finalSequence.push(idx);
        }
      }
    }
    } // Kết thúc khối cơ cấu

    // Đếm ngược 5 giây trực quan trên nút điều khiển & watermark
    const startTime = Date.now();
    const duration = 5000;
    const updateCountdown = () => {
      if (this.state !== 'slowing') return;
      const elapsed = Date.now() - startTime;
      const remainingSecFloat = Math.max(0, (duration - elapsed) / 1000);
      const remainingSeconds = Math.max(1, Math.ceil(remainingSecFloat));
      this.mainActionLabel.textContent = `HÃM PHANH... (${remainingSeconds}s)`;
      
      if (this.countdownWatermark) {
        this.countdownWatermark.textContent = (remainingSecFloat < 10 ? '0' : '') + remainingSecFloat.toFixed(2);
      }

      if (elapsed < duration) {
        requestAnimationFrame(updateCountdown);
      }
    };
    requestAnimationFrame(updateCountdown);

    let currentStep = 0;
    let accumulatedTime = 0;

    const executeSlowingStep = () => {
      if (currentStep >= totalSteps) {
        // Đúng 5s: Dừng hẳn vào người thắng! Bước vào Giai đoạn D
        this.mainActionLabel.textContent = 'TARGET LOCKED!';
        this.triggerWinnerAnnouncement();
        return;
      }

      const targetIdx = finalSequence[currentStep];
      const isFinalWinner = (currentStep === totalSteps - 1);
      const isSecondToLast = (currentStep === totalSteps - 2);

      const scale = scaleSteps[currentStep];
      const delay = delaySteps[currentStep];
      accumulatedTime += delay;

      // Suspense progress bar: tiến dần từ 0% đến 100% trong 5000ms
      const progressPct = Math.min(100, (accumulatedTime / 5000) * 100);
      this.meterBar.style.width = `${progressPct}%`;
      if (this.suspensePercent) {
        this.suspensePercent.textContent = `${Math.round(progressPct)}%`;
      }

      // Update reticle status text
      if (this.reticleStatusText) {
        if (isFinalWinner) {
          this.reticleStatusText.textContent = 'CONFIRMED!';
        } else if (isSecondToLast) {
          this.reticleStatusText.textContent = 'TARGET LOCKED!';
        } else if (currentStep >= 13) {
          this.reticleStatusText.textContent = `ACQUIRING: ${Math.round(progressPct)}%`;
        } else {
          this.reticleStatusText.textContent = `DECELERATING: ${Math.round(progressPct)}%`;
        }
      }

      // Highlight target with escalating visual tension
      if (isFinalWinner) {
        this.highlightName(targetIdx, scale, 'is-almost-winner');
        this.playSuspenseTick(2.0, false);
      } else if (isSecondToLast) {
        this.highlightName(targetIdx, scale, 'is-near-miss');
        this.playSuspenseTick(1.6, true); // Heartbeat thud sound
      } else if (currentStep >= 14) {
        this.highlightName(targetIdx, scale, 'is-near-miss');
        this.playSuspenseTick(1.2 + (currentStep - 14) * 0.1, false);
      } else {
        this.highlightName(targetIdx, scale, 'is-active-beam');
        this.playSpinTick(600 + currentStep * 15, 0.08);
      }

      currentStep++;
      this.slowingTimeout = setTimeout(executeSlowingStep, delay);
    };

    executeSlowingStep();
  }

  /* -------------------------------------------------------------
   * GIAI ĐOẠN D: CÔNG BỐ NGƯỜI THẮNG (WINNER ANNOUNCEMENT)
   * - Tất cả tên khác mờ xuống
   * - Tên trúng sáng mạnh, phóng to, bay ra giữa màn hình
   * - Pháo hoa, kim tuyến, nhạc chúc mừng
   * ----------------------------------------------------------- */
  triggerWinnerAnnouncement() {
    this.state = 'winner';
    this.suspenseMeter.classList.remove('active');
    this.laserHalo.classList.remove('active');
    if (this.tensionAlarmVignette) this.tensionAlarmVignette.classList.remove('active');
    if (this.countdownWatermark) this.countdownWatermark.classList.remove('active');


    const winner = this.chosenWinner;
    const winnerEl = winner.element;

    // 1. Tất cả tên khác mờ đi
    this.namesContainer.classList.add('dim-all');
    winnerEl.classList.add('is-winner-target');

    // 2. Tên trúng sáng mạnh và phóng to lớn ngay tại vị trí đó
    gsap.to(winnerEl, {
      scale: 2.2,
      zIndex: 999,
      boxShadow: '0 0 60px #ffd700, 0 0 100px #ff8c00',
      duration: 0.6,
      ease: 'back.out(2)',
      onComplete: () => {
        // 3. Sau đó bay / zoom ra giữa màn hình
        this.showWinnerModal(winner);
      }
    });

    // 4. Phát nhạc chiến thắng & bắn pháo hoa
    this.playCelebrationFanfare();
    this.fireConfetti();
  }

  showWinnerModal(winner) {
    this.winnerText.textContent = winner.name.toUpperCase();
    this.winnerPrizeTag.textContent = this.currentPrize;
    this.winnerOverlay.classList.add('show');

    // Record winner
    this.winners.unshift({
      id: winner.id,
      name: winner.name,
      prize: this.currentPrize,
      wonAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    this.renderHistoryList();
    this.updateHUDCounts();

    // GSAP 3D entry animation for Winner Card
    gsap.fromTo(
      this.winnerCard,
      { scale: 0.6, rotateY: 25, y: 50 },
      { scale: 1, rotateY: 0, y: 0, duration: 0.7, ease: 'back.out(1.5)' }
    );
  }

  /* -------------------------------------------------------------
   * GIAI ĐOẠN E: QUAY TIẾP (NEXT SPIN & REMOVE WINNER)
   * - Người đó bị xóa khỏi danh sách
   * - Các tên còn lại GIỮ NGUYÊN vị trí (không nhảy lung tung)
   * ----------------------------------------------------------- */
  nextSpin() {
    // Dừng nhạc vinh quang khi bấm TIẾP TỤC QUAY
    this.stopVinhQuangMusic();

    // Ẩn modal người thắng
    this.winnerOverlay.classList.remove('show');
    this.namesContainer.classList.remove('dim-all');

    if (!this.chosenWinner) return;

    const winnerId = this.chosenWinner.id;
    const winnerEl = this.chosenWinner.element;

    // Sparkle vanish animation for winner badge
    gsap.to(winnerEl, {
      scale: 0,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        if (winnerEl && winnerEl.parentNode) {
          winnerEl.parentNode.removeChild(winnerEl);
        }
      }
    });

    // Remove from active participants list
    this.participants = this.participants.filter(p => p.id !== winnerId);
    this.chosenWinner = null;
    this.updateHUDCounts();

    // Tự động chuyển tiếp sang giải kế tiếp (3 KK -> Ba -> Nhì -> Nhất)
    if (this.currentPrizeIndex < this.presetPrizes.length - 1) {
      this.setPrize(this.presetPrizes[this.currentPrizeIndex + 1]);
    }

    // Reset controls to IDLE
    this.resetControlsToIdle();
  }

  /* -------------------------------------------------------------
   * PRIZE MANAGEMENT & ROTATION
   * ----------------------------------------------------------- */
  setPrize(prizeName) {
    this.currentPrize = prizeName;
    const foundIdx = this.presetPrizes.indexOf(prizeName);
    if (foundIdx !== -1) {
      this.currentPrizeIndex = foundIdx;
    }
    if (this.currentPrizeName) {
      this.currentPrizeName.textContent = this.currentPrize;
    }
    if (this.prizeSelectorGrid) {
      this.prizeSelectorGrid.querySelectorAll('.prize-chip').forEach(c => {
        if (c.getAttribute('data-prize') === prizeName) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });
    }

    // Khi đổi giải thưởng ở trạng thái chờ quay (idle) và người dùng đã click tương tác -> Tự đổi bài tương ứng
    if (this.state === 'idle' && this.userInteracted) {
      this.playBackgroundMusic();
    }
  }

  nextPrize() {
    this.currentPrizeIndex = (this.currentPrizeIndex + 1) % this.presetPrizes.length;
    this.setPrize(this.presetPrizes[this.currentPrizeIndex]);
  }

  resetControlsToIdle() {
    this.state = 'idle';
    this.btnMainAction.disabled = false;
    this.btnMainAction.classList.remove('btn-stop');
    this.btnMainAction.classList.add('btn-start');
    this.mainActionLabel.textContent = 'BẮT ĐẦU QUAY';
    this.mainActionIcon.textContent = '▶';
    this.clearAllHighlights();
    this.laserHalo.classList.remove('active');
    this.meterBar.style.width = '0%';
    if (this.tensionAlarmVignette) this.tensionAlarmVignette.classList.remove('active');
    if (this.countdownWatermark) this.countdownWatermark.classList.remove('active');
    if (this.suspensePercent) this.suspensePercent.textContent = '0%';
    if (this.reticleStatusText) this.reticleStatusText.textContent = 'STANDBY';

    // Bắt đầu phát lại nhạc nền của giải hiện tại khi về trạng thái chờ
    if (this.userInteracted) {
      this.playBackgroundMusic();
    }
  }

  /* -------------------------------------------------------------
   * HIGHLIGHT & HALO LASER MOVER
   * ----------------------------------------------------------- */
  highlightName(index, scale = 1.08, className = 'is-active-beam') {
    if (!this.participants[index]) return;

    // Remove previous active classes
    if (this.currentBeamIndex !== -1 && this.participants[this.currentBeamIndex]) {
      const prevEl = this.participants[this.currentBeamIndex].element;
      if (prevEl) {
        prevEl.classList.remove('is-active-beam', 'is-near-miss', 'is-almost-winner');
        gsap.to(prevEl, { scale: 1, duration: 0.15, ease: 'power1.out' });
      }
    }

    const currentP = this.participants[index];
    const currentEl = currentP.element;
    if (!currentEl) return;

    currentEl.classList.add(className);
    gsap.to(currentEl, { scale: scale, duration: 0.12, ease: 'back.out(1.5)' });

    // Move Laser Halo Tracker precisely over the center of the name
    const centerX = currentP.x + currentP.width / 2;
    const centerY = currentP.y + currentP.height / 2;

    this.laserHalo.style.left = `${centerX}px`;
    this.laserHalo.style.top = `${centerY}px`;
    this.laserHalo.style.width = `${currentP.width + 36}px`;
    this.laserHalo.style.height = `${currentP.height + 24}px`;

    this.currentBeamIndex = index;
  }

  clearAllHighlights() {
    this.participants.forEach(p => {
      if (p.element) {
        p.element.classList.remove('is-active-beam', 'is-near-miss', 'is-almost-winner', 'is-winner-target');
        gsap.to(p.element, { scale: 1, duration: 0.2 });
      }
    });
    this.namesContainer.classList.remove('dim-all');
    this.currentBeamIndex = -1;
  }

  /* -------------------------------------------------------------
   * CELEBRATION EFFECTS: CONFETTI & FIREWORKS CANVASES
   * ----------------------------------------------------------- */
  fireConfetti() {
    if (typeof confetti !== 'function') return;

    // Center burst
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#ff8c00', '#00f2fe', '#ffffff', '#ff416c']
    });

    // Left cannon
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.75 },
        colors: ['#ffd700', '#ff6b6b', '#4facfe']
      });
    }, 250);

    // Right cannon
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.75 },
        colors: ['#ffd700', '#00f2fe', '#feca57']
      });
    }, 450);

    // Stars rain
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 120,
        origin: { y: 0.4 },
        shapes: ['star'],
        colors: ['#ffd700', '#ffffff', '#ff9f43']
      });
    }, 750);
  }

  /* -------------------------------------------------------------
   * PARTICIPANT & WINNER MANAGEMENT
   * ----------------------------------------------------------- */
  openSettings() {
    const namesText = this.participants.map(p => p.name).join('\n');
    this.namesTextarea.value = namesText;
    this.updateTextareaBadge();
    this.settingsModal.classList.add('open');
  }

  closeSettings() {
    this.settingsModal.classList.remove('open');
  }

  openHistory() {
    this.renderHistoryList();
    this.historyModal.classList.add('open');
  }

  closeHistory() {
    this.historyModal.classList.remove('open');
  }

  updateTextareaBadge() {
    const lines = this.namesTextarea.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    this.textareaCountBadge.textContent = `${lines.length} tên`;
  }

  updateHUDCounts() {
    this.activeCount.textContent = this.participants.length;
    this.historyCount.textContent = this.winners.length;
  }

  renderHistoryList() {
    if (this.winners.length === 0) {
      this.historyList.innerHTML = `<div class="empty-history-notice">Chưa có ai trúng thưởng. Hãy bắt đầu quay!</div>`;
      return;
    }

    this.historyList.innerHTML = this.winners.map((w, idx) => `
      <div class="history-item">
        <div class="history-item-left">
          <div class="history-order">${idx + 1}</div>
          <div>
            <div class="history-name">${this.escapeHTML(w.name)}</div>
            <div class="history-item-time">Lúc ${w.wonAt}</div>
          </div>
        </div>
        <div class="history-prize-badge">${this.escapeHTML(w.prize)}</div>
      </div>
    `).join('');
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  exportHistoryFile() {
    if (this.winners.length === 0) {
      alert("Chưa có danh sách trúng thưởng để xuất file!");
      return;
    }

    let csvContent = "STT,Tên người trúng,Hạng mục giải,Thời gian\n";
    this.winners.forEach((w, idx) => {
      csvContent += `${idx + 1},"${w.name}","${w.prize}","${w.wonAt}"\n`;
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_Trung_Thuong_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* -------------------------------------------------------------
   * EVENT BINDINGS & KEYBOARD SHORTCUTS
   * ----------------------------------------------------------- */
  bindEvents() {
    // Start / Stop Main Action Button
    this.btnMainAction.addEventListener('click', () => {
      if (this.state === 'idle') {
        this.startSpin();
      } else if (this.state === 'spinning') {
        this.stopSpin();
      }
    });

    // Spacebar to trigger Start / Stop
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        if (this.state === 'idle') {
          this.startSpin();
        } else if (this.state === 'spinning') {
          this.stopSpin();
        }
      }
      if (e.key === 'm' || e.key === 'M') {
        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
          this.toggleSound();
        }
      }
    });

    // Next Spin & Dismiss Winner Card
    this.btnNextSpin.addEventListener('click', () => this.nextSpin());
    this.btnCloseWinner.addEventListener('click', () => {
      this.winnerOverlay.classList.remove('show');
      this.resetControlsToIdle();
    });

    // Re-layout button: calculate fresh non-overlapping positions
    this.btnRelayout.addEventListener('click', () => {
      if (this.state !== 'idle') return;
      this.calculateAndRenderLayout();
    });

    // Modal Triggers
    this.btnQuickAdd.addEventListener('click', () => this.openSettings());
    this.btnOpenSettings.addEventListener('click', () => this.openSettings());
    this.btnCloseSettings.addEventListener('click', () => this.closeSettings());
    this.btnOpenHistory.addEventListener('click', () => this.openHistory());
    this.btnCloseHistory.addEventListener('click', () => this.closeHistory());
    if (this.historyStatBtn) {
      this.historyStatBtn.addEventListener('click', () => this.openHistory());
    }

    // Settings text area count listener
    this.namesTextarea.addEventListener('input', () => this.updateTextareaBadge());

    // Apply Settings
    this.btnApplySettings.addEventListener('click', () => {
      const lines = this.namesTextarea.value.split('\n');
      this.loadParticipants(lines);
      this.closeSettings();
    });

    // Preset buttons
    this.btnSample30.addEventListener('click', () => {
      this.namesTextarea.value = SAMPLE_PARTICIPANTS_35.join('\n');
      this.updateTextareaBadge();
    });
    this.btnSample60.addEventListener('click', () => {
      this.namesTextarea.value = SAMPLE_PARTICIPANTS_65.join('\n');
      this.updateTextareaBadge();
    });
    this.btnSample100.addEventListener('click', () => {
      this.namesTextarea.value = SAMPLE_PARTICIPANTS_100.join('\n');
      this.updateTextareaBadge();
    });
    this.btnClearNames.addEventListener('click', () => {
      this.namesTextarea.value = '';
      this.updateTextareaBadge();
    });

    // Click vào thanh Giải thưởng trên Header để chuyển nhanh giải tiếp theo
    if (this.currentPrizeBadge) {
      this.currentPrizeBadge.addEventListener('click', () => {
        if (this.state === 'idle') {
          this.nextPrize();
        }
      });
    }

    // Prize Selector Chips
    this.prizeSelectorGrid.querySelectorAll('.prize-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const prize = chip.getAttribute('data-prize');
        this.setPrize(prize);
      });
    });

    this.btnApplyCustomPrize.addEventListener('click', () => {
      const val = this.customPrizeInput.value.trim();
      if (val) {
        this.setPrize(val.toUpperCase());
        this.customPrizeInput.value = '';
      }
    });

    // History controls
    this.btnExportHistory.addEventListener('click', () => this.exportHistoryFile());
    this.btnResetHistory.addEventListener('click', () => {
      if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trúng thưởng không?")) {
        this.winners = [];
        this.renderHistoryList();
        this.updateHUDCounts();
      }
    });

    this.btnResetAll.addEventListener('click', () => {
      if (confirm("Khôi phục toàn bộ người trúng vào lại danh sách quay?")) {
        const restoredNames = [
          ...this.participants.map(p => p.name),
          ...this.winners.map(w => w.name)
        ];
        this.winners = [];
        this.loadParticipants(restoredNames);
        this.closeHistory();
      }
    });

    // Sound toggle
    this.btnSoundToggle.addEventListener('click', () => this.toggleSound());

    // Fullscreen toggle
    this.btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Custom Video Backdrop
    this.btnApplyVideo.addEventListener('click', () => {
      const url = this.videoUrlInput.value.trim();
      if (url) {
        this.bgVideo.src = url;
        this.bgVideo.style.display = 'block';
        this.bgVideo.play().catch(() => {});
      } else {
        this.bgVideo.style.display = 'none';
        this.bgVideo.src = '';
      }
    });

    // Ambient floating checkbox
    this.chkAmbientFloating.addEventListener('change', () => {
      const pills = document.querySelectorAll('.name-pill');
      pills.forEach(p => {
        if (this.chkAmbientFloating.checked) {
          p.classList.add('ambient-glow');
        } else {
          p.classList.remove('ambient-glow');
        }
      });
    });

    // Window resize debounced re-pack
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (this.state === 'idle') {
          this.calculateAndRenderLayout();
        }
      }, 300);
    });
    // Click vào màn hình để bắt đầu phát nhạc nền (cho giải hiện tại) nếu chưa phát
    document.addEventListener('pointerdown', (e) => {
      this.userInteracted = true;
      this.ensureAudioContext();

      // Nếu đang ở trạng thái chờ quay (idle) và chưa có nhạc nền nào phát -> phát ngay
      if (this.state === 'idle' && this.soundEnabled) {
        if (!this.currentBgAudio || this.currentBgAudio.paused) {
          this.playBackgroundMusic();
        }
      }
    });
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
    this.btnSoundToggle.title = this.soundEnabled ? 'Tắt âm thanh (Phím M)' : 'Bật âm thanh (Phím M)';
    if (this.soundEnabled) {
      this.ensureAudioContext();
      if (this.state === 'idle') {
        this.playBackgroundMusic();
      }
    } else {
      this.stopVinhQuangMusic();
      this.stopBackgroundMusic();
    }
  }
}

// Instantiate engine when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.luckyEngine = new LuckyDrawEngine();
});
