// ============================================================
// CHARACTER / ASSET LOADING
// CHARACTERS and DEFAULT_CHARACTER come from config.js, which is
// loaded before this file in manifest.json's content_scripts.
// ============================================================

let currentCharacter = DEFAULT_CHARACTER;
let ASSETS = {};

function buildAssets(character) {
  return {
    WAITING: chrome.runtime.getURL(`assets/${character}/waiting_user_input.gif`),
    USER_TYPING: chrome.runtime.getURL(`assets/${character}/user_typing.gif`),
    AI_THINKING: chrome.runtime.getURL(`assets/${character}/ai_thinking.gif`), // Note the typo in the file name
    AI_TYPING: chrome.runtime.getURL(`assets/${character}/ai_typing.gif`),
    AI_COMPLETE: chrome.runtime.getURL(`assets/${character}/ai_complete_answer.gif`)
  };
}

function applyCharacter(character) {
  currentCharacter = character;
  ASSETS = buildAssets(character);
  if (widgetImg) {
    widgetImg.src = ASSETS[currentState] || ASSETS.WAITING;
  }
}

const STATES = {
  WAITING: 'WAITING',
  USER_TYPING: 'USER_TYPING',
  AI_THINKING: 'AI_THINKING',
  AI_TYPING: 'AI_TYPING',
  AI_COMPLETE: 'AI_COMPLETE'
};

let currentState = STATES.WAITING;
let widgetImg;

function createWidget() {
  const container = document.createElement('div');
  container.id = 'gemini-ai-widget-container';

  widgetImg = document.createElement('img');
  widgetImg.src = ASSETS.WAITING;
  widgetImg.alt = 'AI Assistant Status';

  container.appendChild(widgetImg);
  document.body.appendChild(container);

  makeDraggable(container);
}

function makeDraggable(container) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;

    isDragging = true;
    container.classList.add('dragging');

    const rect = container.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    container.style.bottom = 'auto';
    container.style.right = 'auto';
    container.style.left = `${initialLeft}px`;
    container.style.top = `${initialTop}px`;

    startX = e.clientX;
    startY = e.clientY;

    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;

    const containerWidth = container.offsetWidth || 150;
    const containerHeight = container.offsetHeight || 150;
    const maxLeft = window.innerWidth - containerWidth;
    const maxTop = window.innerHeight - containerHeight;

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    container.style.left = `${newLeft}px`;
    container.style.top = `${newTop}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      container.classList.remove('dragging');
    }
  });

  container.addEventListener('dragstart', (e) => e.preventDefault());
}

function setState(newState) {
  if (currentState === newState) return;
  currentState = newState;
  widgetImg.src = ASSETS[newState];
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
                        if (text.trim().length > 0) {
                            isEmpty = false;
                        }
                    } else {
                        const editables = document.querySelectorAll('div[contenteditable="true"], textarea');
                        for (let ed of editables) {
                            const text = ed.textContent || ed.value || "";
                            if (text.trim().length > 0) {
                                isEmpty = false;
                                break;
                            }
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

// ============================================================
// INIT
// ============================================================
function init() {
  chrome.storage.sync.get(['selectedCharacter'], (result) => {
    const character = result.selectedCharacter || DEFAULT_CHARACTER;
    applyCharacter(character);
    createWidget();
    setupUserTypingDetection();
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.selectedCharacter) {
    applyCharacter(changes.selectedCharacter.newValue || DEFAULT_CHARACTER);
  }
});

init();
