// ==========================================================================
// 0. Mobile-Hardened Web Audio Engine
// ==========================================================================

let audioCtx = null;

/**
 * Returns an active AudioContext instance.
 */
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

/**
 * Robust mobile audio unlocker:
 * 1. Resumes context on touch.
 * 2. Fires a silent 1-sample buffer to force iOS WebKit speaker output.
 * 3. Removes listeners once successfully in the 'running' state.
 */
function unlockMobileAudio() {
  const ctx = getAudioContext();

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  // Play a silent 1-sample buffer (standard iOS WebKit hardware wake-up)
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);

  // Once confirmed running, remove the global touch/pointer listeners
  if (ctx.state === 'running') {
    ['touchstart', 'touchend', 'pointerdown', 'keydown'].forEach((eventName) => {
      window.removeEventListener(eventName, unlockMobileAudio);
    });
  }
}

// Attach listeners immediately when the script executes
['touchstart', 'touchend', 'pointerdown', 'keydown'].forEach((eventName) => {
  window.addEventListener(eventName, unlockMobileAudio, { passive: true });
});

/**
 * Short high-frequency tick for hover interactions (Game Boy / P5 reticle snap)
 */
function playHoverSound() {
  try {
    const ctx = getAudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    // Fails silently if user has not interacted with the DOM yet
  }
}

/**
 * Soft, warm tactile blip for internal card buttons, links, and interactive slots
 */
function playCardHoverSound() {
  try {
    const ctx = getAudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  } catch (e) {
    // Fail gracefully if context is suspended
  }
}

/**
 * Snappy 2-tone confirmation chime for external links, repos, and file downloads
 */
function playLinkConfirmSound() {
  try {
    const ctx = getAudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const tones = [783.99, 1046.50];

    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + (idx * 0.05);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.06, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  } catch (e) {
    // Fail gracefully
  }
}

/**
 * Ascending Arpeggio for Starter Confirmation (Selection lock-in)
 */
function playConfirmSound() {
  try {
    const ctx = getAudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + (idx * 0.07);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * Downward pitch drop for modal closing / returning
 */
function playCloseSound() {
  try {
    const ctx = getAudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * Cinematic screen-slash whoosh and impact sound for All-Out Attack transitions
 */
/**
 * Cinematic white-noise rushing whoosh and heavy impact sound for All-Out Attack transitions
 */
function playSlashSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // 1. Cinematic Rushing White-Noise Whoosh (Air displacement)
    const bufferSize = ctx.sampleRate * 0.32; // 320ms duration
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1; // Generate white noise
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Bandpass filter to sculpt the noise into a roaring whoosh sweep
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.16);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.32);
    filter.Q.value = 1.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.22, now + 0.14); // Rushes up
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32); // Fades out

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.32);

    // 2. Heavy Cinematic Impact Thud (Triggered at 350ms when blades slam shut)
    const impactTime = now + 0.35;
    const impactOsc = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impactOsc.type = 'sine';
    impactOsc.frequency.setValueAtTime(140, impactTime);
    impactOsc.frequency.exponentialRampToValueAtTime(35, impactTime + 0.2);

    impactGain.gain.setValueAtTime(0.15, impactTime);
    impactGain.gain.exponentialRampToValueAtTime(0.0001, impactTime + 0.2);

    impactOsc.connect(impactGain);
    impactGain.connect(ctx.destination);
    impactOsc.start(impactTime);
    impactOsc.stop(impactTime + 0.2);
  } catch (e) {}
}

/**
 * Procedural Persona 5 "Phantom Snap" sound for background/empty clicks
 */
function playEmptyClickSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Punchy Comic Impact Thump
    const punchOsc = ctx.createOscillator();
    const punchGain = ctx.createGain();
    punchOsc.type = 'triangle';
    punchOsc.frequency.setValueAtTime(320, now);
    punchOsc.frequency.exponentialRampToValueAtTime(75, now + 0.055);

    punchGain.gain.setValueAtTime(0.05, now);
    punchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    punchOsc.connect(punchGain);
    punchGain.connect(ctx.destination);
    punchOsc.start(now);
    punchOsc.stop(now + 0.055);

    // Crisp Stylus Snap
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'sine';
    snapOsc.frequency.setValueAtTime(1800, now);
    snapOsc.frequency.exponentialRampToValueAtTime(650, now + 0.025);

    snapGain.gain.setValueAtTime(0.025, now);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.025);
  } catch (e) {}
}

// ==========================================================================
// 1. Ransom-Note Cutout Typography Generator
// ==========================================================================

function initRansomTypography() {
  const ransomElements = document.querySelectorAll('[data-ransom]');

  ransomElements.forEach((el) => {
    const rawText = el.getAttribute('data-ransom') || el.textContent;
    el.innerHTML = '';

    const words = rawText.split(' ');
    words.forEach((word) => {
      const wordWrap = document.createElement('span');
      wordWrap.className = 'ransom-word';

      [...word].forEach((char, charIdx) => {
        const charSpan = document.createElement('span');
        const styleVariant = (charIdx + word.length) % 4;
        charSpan.className = `ransom-char style-${styleVariant}`;
        charSpan.textContent = char;
        wordWrap.appendChild(charSpan);
      });

      el.appendChild(wordWrap);
    });
  });
}

initRansomTypography();

// ==========================================================================
// 2. DOM Cache, Custom Module Data & Flying Target Reticle
// ==========================================================================

const dialogueDisplay = document.getElementById('dialogue-text');
const pods = document.querySelectorAll('.starter-pod');
const reticle = document.getElementById('p5-reticle');
const slashOverlay = document.getElementById('slash-overlay');
const slashText = document.getElementById('slash-text');

// Custom idle text when nothing is hovered
const IDLE_PROMPT = "AWAITING INPUT... HOVER OVER A BALL FOR MORE INFO.";

// Custom module data dictionary
const moduleData = {
  projects: {
    title: "PROJECTS",
    description: "Access project library and source code.",
    accentColor: "var(--persona-red)"
  },
  profile: {
    title: "SKILL MEASUREMENT",
    description: "Display my skills and proficiencies as a novice developer.",
    accentColor: "var(--starter-blue)"
  },
  contact: {
    title: "ABOUT ME",
    description: "Direct contact channels and resume download.",
    accentColor: "var(--starter-yellow)"
  }
};

/**
 * Moves the Persona 5 jagged reticle behind the active starter pod
 */
function moveReticleToPod(pod, accentColor) {
  if (!reticle || !pod) return;

  const x = pod.offsetLeft;
  const y = pod.offsetTop;
  const w = pod.offsetWidth;
  const h = pod.offsetHeight;

  reticle.style.width = `${w}px`;
  reticle.style.height = `${h}px`;
  reticle.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  reticle.style.setProperty('--reticle-color', accentColor);
  reticle.classList.add('is-visible');
}

function hideReticle() {
  if (!reticle) return;
  reticle.classList.remove('is-visible');
}

/**
 * Updates the bottom inspection panel with upward Pokémon text roll
 */
function updateDialogue(text, color = "var(--text-main)") {
  if (dialogueDisplay.textContent === text) return;

  dialogueDisplay.classList.remove('scrolling-up');
  void dialogueDisplay.offsetWidth; // trigger reflow

  dialogueDisplay.textContent = text;
  dialogueDisplay.classList.add('scrolling-up');

  const inspectionBox = dialogueDisplay.closest('.inspection-panel');
  if (inspectionBox) {
    inspectionBox.style.borderLeftColor = color;
    inspectionBox.style.boxShadow = `10px 10px 0 ${color}`;
  }
}

// ==========================================================================
// 3. Inspection Event Listeners (Hover & Tab Focus)
// ==========================================================================

pods.forEach((pod) => {
  const moduleKey = pod.dataset.module;
  const config = moduleData[moduleKey];

  if (!config) return;

  const handleInspect = () => {
    if (document.body.classList.contains('locked-in')) return;
    playHoverSound();
    moveReticleToPod(pod, config.accentColor);
    updateDialogue(`[${config.title}] - ${config.description}`, config.accentColor);
  };

  const handleReset = () => {
    if (document.body.classList.contains('locked-in')) return;
    hideReticle();
    updateDialogue(IDLE_PROMPT, "var(--text-main)");
  };

  pod.addEventListener('mouseenter', handleInspect);
  pod.addEventListener('mouseleave', handleReset);
  pod.addEventListener('focus', handleInspect);
  pod.addEventListener('blur', handleReset);
});

// ==========================================================================
// 4. Confirmation, "All-Out Attack" Screen-Slash & Selection Animation
// ==========================================================================

const projectsModal = document.getElementById('modal-projects');
const profileModal = document.getElementById('modal-profile');
const contactModal = document.getElementById('modal-contact');
const allModals = document.querySelectorAll('.module-overlay');

pods.forEach((pod) => {
  pod.addEventListener('click', () => {
    if (document.body.classList.contains('locked-in')) return;

    playConfirmSound();

    const moduleKey = pod.dataset.module;
    const impactCallout = pod.dataset.impact || "EXECUTE!";
    const config = moduleData[moduleKey];

    document.body.classList.add('locked-in');

    pod.classList.add('is-selected');
    pods.forEach((otherPod) => {
      if (otherPod !== pod) {
        otherPod.classList.add('is-dimmed');
      }
    });

    updateDialogue(`COMMITTING TO ${config.title}... INITIALIZING LINK.`, config.accentColor);

    // Stage 1: Trigger All-Out Attack Diagonal Screen Slash at 380ms
    setTimeout(() => {
      if (slashText) slashText.textContent = impactCallout;
      if (slashOverlay) slashOverlay.classList.add('is-slashing');
      playSlashSound();
    }, 380);

    // Stage 2: Open target modal behind the slash & retract blades at 780ms
    setTimeout(() => {
      console.log(`Navigation sequence completed for: ${moduleKey}`);

      if (moduleKey === 'projects') {
        openModal(projectsModal);
      } else if (moduleKey === 'profile') {
        openModal(profileModal);
      } else if (moduleKey === 'contact') {
        openModal(contactModal);
      }

      if (slashOverlay) slashOverlay.classList.remove('is-slashing');
    }, 780);
  });
});

// ==========================================================================
// 5. Generalized Modal Management Engine
// ==========================================================================

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('is-active');
  modal.setAttribute('aria-hidden', 'false');

  const closeBtn = modal.querySelector('.sheet-close-btn');
  if (closeBtn) closeBtn.focus();
}

function closeModal(modal) {
  if (!modal) return;
  playCloseSound();
  modal.classList.remove('is-active');
  modal.setAttribute('aria-hidden', 'true');

  if (document.activeElement && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  document.body.classList.remove('locked-in');
  hideReticle();
  pods.forEach((pod) => {
    pod.classList.remove('is-selected', 'is-dimmed');
    pod.blur();
  });

  updateDialogue(IDLE_PROMPT, "var(--text-main)");
}

allModals.forEach((modal) => {
  const closeBtn = modal.querySelector('.sheet-close-btn');
  const backdrop = modal.querySelector('.overlay-backdrop');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeModal(modal));
  }
  if (backdrop) {
    backdrop.addEventListener('click', () => closeModal(modal));
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const activeModal = document.querySelector('.module-overlay.is-active');
    if (activeModal) {
      closeModal(activeModal);

      setTimeout(() => {
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, 10);
    }
  }
});

// ==========================================================================
// 6. Sub-Menu Interactive Audio Listeners
// ==========================================================================

const cardInteractives = document.querySelectorAll(
  '.sheet-close-btn, .btn-action, .comm-channel, .project-card, .item-slot'
);

cardInteractives.forEach((element) => {
  element.addEventListener('mouseenter', () => playCardHoverSound());
  element.addEventListener('focus', () => playCardHoverSound());
});

const cardLinks = document.querySelectorAll('.module-overlay a');

cardLinks.forEach((link) => {
  link.addEventListener('click', () => {
    playLinkConfirmSound();
  });
});

// ==========================================================================
// 7. Persona 5 Star Burst Click FX, Cursor Trail & Smart Audio Guard
// ==========================================================================

const particleLayer = document.createElement('div');
particleLayer.className = 'p5-particle-container';
particleLayer.setAttribute('aria-hidden', 'true');
document.body.appendChild(particleLayer);

function createStarSVG(fillColor, strokeColor, size) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.style.overflow = 'visible';

  const polygon = document.createElementNS(svgNS, 'polygon');
  polygon.setAttribute('points', '50,2 64,36 98,36 70,57 81,95 50,73 19,95 30,57 2,36 36,36');
  polygon.setAttribute('fill', fillColor);
  polygon.setAttribute('stroke', strokeColor);
  polygon.setAttribute('stroke-width', '8');

  svg.appendChild(polygon);
  return svg;
}

function spawnClickStarBurst(x, y) {
  const ring = document.createElement('div');
  ring.className = 'p5-click-ring';
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  particleLayer.appendChild(ring);
  setTimeout(() => ring.remove(), 400);

  const palette = [
    { fill: '#e60012', stroke: '#ffffff' },
    { fill: '#ffffff', stroke: '#000000' },
    { fill: '#000000', stroke: '#e60012' }
  ];

  const starCount = 6;
  for (let i = 0; i < starCount; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'p5-star-particle';
    wrapper.style.left = `${x}px`;
    wrapper.style.top = `${y}px`;

    const angle = ((Math.PI * 2) / starCount) * i + (Math.random() * 0.5 - 0.25);
    const distance = 38 + Math.random() * 48;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const rot = (Math.random() > 0.5 ? 1 : -1) * (90 + Math.random() * 140);
    const scale = 0.65 + Math.random() * 0.65;

    wrapper.style.setProperty('--tx', `${tx}px`);
    wrapper.style.setProperty('--ty', `${ty}px`);
    wrapper.style.setProperty('--rot', `${rot}deg`);
    wrapper.style.setProperty('--s', scale);

    const colorScheme = palette[i % palette.length];
    const size = 18 + Math.floor(Math.random() * 10);
    wrapper.appendChild(createStarSVG(colorScheme.fill, colorScheme.stroke, size));

    particleLayer.appendChild(wrapper);
    setTimeout(() => wrapper.remove(), 500);
  }
}

let lastTrailX = 0;
let lastTrailY = 0;

window.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;

  const dx = e.clientX - lastTrailX;
  const dy = e.clientY - lastTrailY;
  const dist = Math.hypot(dx, dy);

  if (dist < 36) return;

  lastTrailX = e.clientX;
  lastTrailY = e.clientY;

  const trailStar = document.createElement('div');
  trailStar.className = 'p5-trail-star';
  trailStar.style.left = `${e.clientX}px`;
  trailStar.style.top = `${e.clientY}px`;
  trailStar.style.setProperty('--rot', `${Math.floor(Math.random() * 360)}deg`);

  const isRed = Math.random() > 0.5;
  trailStar.appendChild(
    createStarSVG(isRed ? '#e60012' : '#ffffff', '#000000', 14)
  );

  particleLayer.appendChild(trailStar);
  setTimeout(() => trailStar.remove(), 360);
});

window.addEventListener('click', (e) => {
  spawnClickStarBurst(e.clientX, e.clientY);

  const hasOwnAudio = e.target.closest(
    '.starter-pod, .sheet-close-btn, .overlay-backdrop, .module-overlay a, button, a'
  );

  if (!hasOwnAudio) {
    playEmptyClickSound();
  }
});