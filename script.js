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
  modal.classList.remove('is-active');
  modal.setAttribute('aria-hidden', 'true');

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
    }
  }
});
