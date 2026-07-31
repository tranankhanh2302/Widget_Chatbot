// =============================================================
// Gemini adapter — gemini.google.com
// Site-specific detection only. Widget UI, character loading,
// dragging, resize, and click effects all live in shared.js.
// =============================================================

let typingTimeout;
let aiObserver;
let checkingAITyping = false;

function isActualAnswerTextMutation(mutation) {
  let targetEl = null;

  if (mutation.type === 'characterData') {
    targetEl = mutation.target.parentElement;
  } else if (mutation.type === 'childList') {
    for (let node of mutation.addedNodes) {
      let el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      if (el) {
        targetEl = el;
        break;
      }
    }
  }

  if (!targetEl) return false;

  const isInsideAnswerContainer = targetEl.closest('message-content, .message-content, .markdown, model-response .markdown');
  if (!isInsideAnswerContainer) return false;

  const isInsideThinkingOrSearch = targetEl.closest('gdm-thought-viewer, thought-viewer, .thought-container, gdm-grounding-drawer, grounding-chips, .grounding-container, search-entry-point');
  if (isInsideThinkingOrSearch) return false;

  const text = (targetEl.textContent || '').trim();
  return text.length > 0;
}

function startAITypingDetection() {
  if (checkingAITyping) return;
  checkingAITyping = true;

  const targetContainer = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;

  aiObserver = new MutationObserver((mutations) => {
    let hasTextGeneration = false;

    for (let mutation of mutations) {
      if (isActualAnswerTextMutation(mutation)) {
        hasTextGeneration = true;
        break;
      }
    }

    if (hasTextGeneration) {
      if (currentState === STATES.AI_THINKING) {
        setState(STATES.AI_TYPING);
      }

      if (currentState === STATES.AI_TYPING) {
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          setState(STATES.AI_COMPLETE);
          stopAITypingDetection();
          scheduleReset();
        }, 800);
      }
    }
  });

  aiObserver.observe(targetContainer, { childList: true, characterData: true, subtree: true });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    if (currentState === STATES.AI_THINKING) {
      setState(STATES.WAITING);
      stopAITypingDetection();
    }
  }, 60000);
}

function stopAITypingDetection() {
  if (aiObserver) {
    aiObserver.disconnect();
    aiObserver = null;
  }
  checkingAITyping = false;
}

function scheduleReset() {
  setTimeout(() => {
    if (currentState === STATES.AI_COMPLETE) setState(STATES.WAITING);
  }, 3000);
}

function setupUserTypingDetection() {
  const handleInputChange = (target) => {
    if (!target) return;
    if (target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      const text = target.textContent || target.value || '';
      if (text.trim().length > 0) {
        if (currentState !== STATES.AI_THINKING && currentState !== STATES.AI_TYPING) {
          setState(STATES.USER_TYPING);
        }
      } else {
        if (currentState !== STATES.AI_THINKING && currentState !== STATES.AI_TYPING) {
          setState(STATES.WAITING);
        }
      }
    }
  };

  document.body.addEventListener('input', (e) => handleInputChange(e.target));
  document.body.addEventListener('keyup', (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      handleInputChange(e.target);
    }
  });

  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.target.isContentEditable || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        const text = e.target.textContent || e.target.value || '';
        if (text.trim().length > 0) {
          setState(STATES.AI_THINKING);
          startAITypingDetection();
        }
      }
    }
  }, true);

  document.body.addEventListener('click', (e) => {
    let target = e.target;
    while (target != null && target !== document.body) {
      if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
        if (currentState === STATES.USER_TYPING) {
          setTimeout(() => {
            let activeInput = document.querySelector('p[data-placeholder="Enter a prompt here"], div[contenteditable="true"], textarea');
            let isEmpty = true;
            if (activeInput) {
              const text = activeInput.textContent || activeInput.value || "";
              if (text.trim().length > 0) isEmpty = false;
            } else {
              const editables = document.querySelectorAll('div[contenteditable="true"], textarea');
              for (let ed of editables) {
                const text = ed.textContent || ed.value || "";
                if (text.trim().length > 0) { isEmpty = false; break; }
              }
            }

            if (isEmpty) {
              setState(STATES.AI_THINKING);
              startAITypingDetection();
            }
          }, 200);
        }
        break;
      }
      target = target.parentElement;
    }
  });
}

let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    stopAITypingDetection();
    setState(STATES.WAITING);
  }
}).observe(document, { subtree: true, childList: true });

bootWidget(setupUserTypingDetection);
