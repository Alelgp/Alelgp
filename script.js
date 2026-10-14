// ==========================================================================
// 0. Native Web Audio Engine (Procedural 8-Bit & UI FX)
// ==========================================================================

let audioCtx = null;

/**
 * Returns an active AudioContext instance, resuming suspended context on first user interaction.
 */
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Short high-frequency tick for hover interactions (Game Boy style blip)
 */
function playHoverSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle'; // Warmer, rounder tone than harsh square waves
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Pitch: A5 note
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.04); // Fast upward chirp

    // Volume envelope: brief pulse, decay to 0 within 40ms
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
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Pure sine wave gives a mellow, rounded tone without harsh overtones
    osc.type = 'sine';
    
    // Quick micro-dip in frequency creates a subtle physical "tap" effect
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.035);

    // Kept at a soft volume (0.025) so rapid menu browsing remains gentle
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
    // Notes: G5 (783.99 Hz) to high C6 (1046.50 Hz)
    const tones = [783.99, 1046.50];

    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + (idx * 0.05); // 50ms stagger between tones

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      // Volume envelope: rapid attack with a crisp 100ms decay
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
 * 3-Note Ascending Arpeggio for Starter Confirmation (Selection lock-in)
 */
function playConfirmSound() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major triad fanfare)

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

// cache html so browser doesnt keep searching for them
const dialogueDisplay = document.getElementById('dialogue-text');
const pods = document.querySelectorAll('.starter-pod');

// idle text when nothing is hovered
const IDLE_PROMPT = "AWAITING INPUT.. HOVER OVER A DRIVE FOR SPECIFICATION."

// mod data dict
const moduleData = {
    projects: {
        title: "MODULE A",
        description: "Access deployment registry: full-stack applications, engine builds, and source code.",
        accentColor: "var(--persona-red)"
    },
    profile: {
        title: "MODULE B",
        description: "Display operator dossier: base stats, engineering core disciplines, and skill proficiencies.",
        accentColor: "var(--starter-blue)"
    },
    contact: {
        title: "MODULE C",
        description: "Initialize transmission relay: direct contact channels and cryptographic resume retrieval.",
        accentColor: "var(--starter-yellow)"
    }
};

// dynamic display
function updateDialogue(text, color = "var(--text-main)") {
    //doesn't reroll on same text
    if (dialogueDisplay.textContent === text) return;

    //remove animation class
    dialogueDisplay.classList.remove('scrolling-up');

    void dialogueDisplay.offsetWidth; // trigger reflow

    //update text and reattach animation class
    dialogueDisplay.textContent = text;
    dialogueDisplay.classList.add('scrolling-up');

    //update border color on inspection box wrapper
    const inspectionBox = dialogueDisplay.closest('.inspection-panel');
    if (inspectionBox) {
        inspectionBox.style.borderLeftColor = color;
    } 
}

//inspection event listeners
pods.forEach((pod) => {
    const moduleKey = pod.dataset.module;
    const config = moduleData[moduleKey];

    if (!config) return;

    //handler for mouse hover and tab nav
    const handleInspect = () => {
        if (document.body.classList.contains('locked-in')) return;
        playHoverSound();
        updateDialogue(`[${config.title}] - ${config.description}`, config.accentColor);
    };

    //reset function when cursor leaves
    const handleReset = () => {
        if (document.body.classList.contains('locked-in')) return;
        updateDialogue(IDLE_PROMPT, "var(--text-main)");
    };

    //mouse listeners
    pod.addEventListener('mouseenter', handleInspect);
    pod.addEventListener('mouseleave', handleReset);

    //accesibility listeners (for Tab)
    pod.addEventListener('focus', handleInspect);
    pod.addEventListener('blur', handleReset);
});

//confirmation and selection animation

pods.forEach((pod) => {
    pod.addEventListener('click', () => {
        //prevent clicks if sequence has already started
        if (document.body.classList.contains('locked-in')) return;

        playConfirmSound();

        const moduleKey = pod.dataset.module;
        const config = moduleData[moduleKey];

        //lock interaction across the viewport
        document.body.classList.add('locked-in');

        //visual state adjustments
        pod.classList.add('is-selected');
        pods.forEach((otherPod) => {
            if (otherPod !== pod) {
                otherPod.classList.add('is-dimmed');
            }
        });

        //confirmation readout
        updateDialogue(`COMMITTING TO ${config.title}... INITIALIZING LINK.`);

        //delay for transition 
        setTimeout(() => {
            console.log(`Navigation sequence completed for: ${moduleKey}`);

            //rout to projects modal if ball 01 was selected
            if (moduleKey === 'projects') {
                openModal(projectsModal);
            } else if (moduleKey === 'profile') {
                openModal(profileModal);
            } else if (moduleKey === 'contact') {
                openModal(contactModal);
            }
        }, 800); // Adjust the delay time as needed
    });
});

// ==========================================================================
// 5. Generalized Modal Management Engine
// ==========================================================================

const projectsModal = document.getElementById('modal-projects');
const profileModal = document.getElementById('modal-profile');
const contactModal = document.getElementById('modal-contact');
const allModals = document.querySelectorAll('.module-overlay');

/**
 * Opens any requested modal and focuses its return button
 */
function openModal(modal) {
  if (!modal) return;
  modal.classList.add('is-active');
  modal.setAttribute('aria-hidden', 'false');

  const closeBtn = modal.querySelector('.sheet-close-btn');
  if (closeBtn) closeBtn.focus();
}

/**
 * Closes an open modal and resets the home stage Poké Balls
 */
function closeModal(modal) {
  if (!modal) return;
  playCloseSound();
  modal.classList.remove('is-active');
  modal.setAttribute('aria-hidden', 'true');

  //strip browser focuse so selected pods don't stay highlighted
  if(document.activeElement && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  // Reset starter pod states and unlock home screen interactions
  document.body.classList.remove('locked-in');
  pods.forEach((pod) => {
    pod.classList.remove('is-selected', 'is-dimmed');
  });

  // Reset dialogue back to idle status
  updateDialogue(IDLE_PROMPT, "var(--text-main)");
}

// Attach close listener to every modal's backdrop and return button
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

// Global Escape Key Listener: closes whichever modal is currently active
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const activeModal = document.querySelector('.module-overlay.is-active');
    if (activeModal) {
      closeModal(activeModal);

      setTimeout(() => {
        if(document.activeElement && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
      }, 10);
    }
  }
});

// ==========================================================================
// 6. Sub-Menu Interactive Audio Listeners
// ==========================================================================

// Existing hover listeners
const cardInteractives = document.querySelectorAll(
  '.sheet-close-btn, .btn-action, .comm-channel, .project-card, .item-slot'
);

cardInteractives.forEach((element) => {
  element.addEventListener('mouseenter', () => playCardHoverSound());
  element.addEventListener('focus', () => playCardHoverSound());
});

// Click confirm listeners for all links across every modal
const cardLinks = document.querySelectorAll('.module-overlay a');

cardLinks.forEach((link) => {
  link.addEventListener('click', () => {
    playLinkConfirmSound();
  });
});
