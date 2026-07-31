// =============================================================
// Grok adapter — grok.com
// =============================================================

let aiObserver = null;
let typingTimeout = null;
let isObserving = false;

function isGrokGenerating() {
  return !!(
    document.querySelector('button[aria-label*="Stop" i]') ||
    document.querySelector('button[aria-label*="Cancel" i]') ||
    document.querySelector('[data-testid="stop-button"]') ||
    document.querySelector('[data-is-streaming="true"]')
  );
}

// Returns 'thinking', 'response', or false
function inspectGrokState(el) {
  if (!el) return false;

  const inThinking = el.closest(
    '[data-testid="reasoning-block"], .reasoning-block, [data-is-thinking="true"], details'
  );
  if (inThinking) return 'thinking';

  const inResponse = el.closest(
    '[data-message-author-role="assistant"], .markdown, .prose, [data-is-streaming="true"], article, [role="article"]'
  );
  if (inResponse) return 'response';

  return false;
}

function getMutationTargetElement(mutation) {
  if (mutation.type === 'characterData') {
    return mutation.target.parentElement || mutation.target;
  }
  if (mutation.type === 'childList') {
    return mutation.target;
  }
  return null;
}

function startAIObserver() {
  if (isObserving) return;
  isObserving = true;

  const root = document.querySelector('main') ||
               document.querySelector('[role="main"]') ||
               document.body;

  aiObserver = new MutationObserver((mutations) => {
    let hasReasoning = false;
    let hasResponseText = false;

    for (const m of mutations) {
      const el = getMutationTargetElement(m);
      if (!el) continue;

      const stateType = inspectGrokState(el);
      if (stateType === 'thinking') {
        hasReasoning = true;
      } else if (stateType === 'response') {
        const txt = (el.textContent || '').trim();
        if (txt.length > 0) hasResponseText = true;
      }
    }

    if (hasResponseText) {
      if (currentState !== STATES.AI_TYPING) setState(STATES.AI_TYPING);
    } else if (hasReasoning && currentState !== STATES.AI_TYPING) {
      if (currentState !== STATES.AI_THINKING) setState(STATES.AI_THINKING);
    }

    if (currentState === STATES.AI_TYPING || currentState === STATES.AI_THINKING) {
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        if (!isGrokGenerating()) {
          setState(STATES.AI_COMPLETE);
          stopAIObserver();
          scheduleReset();
        }
      }, 1200);
    }
  });

  aiObserver.observe(root, { childList: true, characterData: true, subtree: true });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    if (currentState === STATES.AI_THINKING || currentState === STATES.AI_TYPING) {
      if (!isGrokGenerating()) {
        setState(STATES.AI_COMPLETE);
        stopAIObserver();
        scheduleReset();
      }
    }
  }, 120_000);
}

function stopAIObserver() {
  if (aiObserver) {
    aiObserver.disconnect();
    aiObserver = null;
  }
  isObserving = false;
  clearTimeout(typingTimeout);
}

function scheduleReset() {
  setTimeout(() => {
    if (currentState === STATES.AI_COMPLETE) setState(STATES.WAITING);
  }, 3000);
}

function handleInputEvent(target) {
  if (!target) return;
  if (!target.isContentEditable && target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') return;

  const text = (target.textContent || target.value || '').trim();
  const aiActive = currentState === STATES.AI_THINKING || currentState === STATES.AI_TYPING;
  if (aiActive) return;

  setState(text.length > 0 ? STATES.USER_TYPING : STATES.WAITING);
}

function onSubmit() {
  setState(STATES.AI_THINKING);
  startAIObserver();
}

function setupUserDetection() {
  document.addEventListener('input', (e) => handleInputEvent(e.target), true);
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') handleInputEvent(e.target);
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    const t = e.target;
    if (!t.isContentEditable && t.tagName !== 'TEXTAREA') return;
    const text = (t.textContent || t.value || '').trim();
    if (text.length > 0) onSubmit();
  }, true);

  document.addEventListener('click', (e) => {
    let el = e.target;
    while (el && el !== document.body) {
      const label = (el.getAttribute('aria-label') || '').toLowerCase();
      const isBtn = el.tagName === 'BUTTON' || el.getAttribute('role') === 'button';

      if (isBtn && (label.includes('send') || el.type === 'submit')) {
        onSubmit();
        break;
      }
      el = el.parentElement;
    }
  }, true);

  // Polling safety net — catches state changes missed by events above
  setInterval(() => {
    const generating = isGrokGenerating();

    if (generating) {
      if (currentState === STATES.WAITING || currentState === STATES.USER_TYPING) {
        onSubmit();
      }
    } else if (currentState === STATES.AI_TYPING || currentState === STATES.AI_THINKING) {
      setTimeout(() => {
        if (!isGrokGenerating() && (currentState === STATES.AI_TYPING || currentState === STATES.AI_THINKING)) {
          setState(STATES.AI_COMPLETE);
          stopAIObserver();
          scheduleReset();
        }
      }, 400);
    }
  }, 500);
}

// SPA navigation safety net (Grok likely switches chats without a reload, like the others)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    stopAIObserver();
    setState(STATES.WAITING);
  }
}).observe(document, { subtree: true, childList: true });

bootWidget(setupUserDetection);
