// ============================================================
// SHARED WIDGET CORE
// Used by every site adapter (adapter-gemini.js, adapter-chatgpt.js,
// adapter-claude.js). Handles everything that is NOT site-specific:
// character/asset loading, widget creation, dragging, scroll-to-resize,
// the click "sakura burst" effect, and state switching.
//
// CHARACTERS / DEFAULT_CHARACTER come from config.js (loaded before
// this file). Each adapter file loads after this one and only needs
// to define its own detection logic, then call bootWidget(...).
// ============================================================

const STATES = {
  WAITING: 'WAITING',
  USER_TYPING: 'USER_TYPING',
  AI_THINKING: 'AI_THINKING',
  AI_TYPING: 'AI_TYPING',
  AI_COMPLETE: 'AI_COMPLETE'
};

// --- Widget size (scroll to resize, persisted per-browser) ---
const SIZE_KEY = 'remielle-widget-size';
const SIZE_MIN = 60;
const SIZE_MAX = 220;
const SIZE_STEP = 12;
let widgetSize = Math.min(SIZE_MAX, Math.max(SIZE_MIN,
  parseInt(localStorage.getItem(SIZE_KEY) || '150', 10)
));

let currentCharacter = DEFAULT_CHARACTER;
let ASSETS = {};
let currentState = STATES.WAITING;
let widgetImg = null;
let dragMoved = false; // distinguishes a click from the end of a drag

// ============================================================
// Character / asset loading
// ============================================================
function buildAssets(character) {
  return {
    WAITING: chrome.runtime.getURL(`assets/${character}/waiting_user_input.gif`),
    USER_TYPING: chrome.runtime.getURL(`assets/${character}/user_typing.gif`),
    AI_THINKING: chrome.runtime.getURL(`assets/${character}/ai_thinking.gif`), 
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

function setState(newState) {
  if (currentState === newState) return;
  currentState = newState;
  if (widgetImg) widgetImg.src = ASSETS[newState];
}

// Live-update when the character is changed from the popup while a
// chat tab is already open — no page refresh needed.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.selectedCharacter) {
    applyCharacter(changes.selectedCharacter.newValue || DEFAULT_CHARACTER);
  }
});

// ============================================================
// Widget UI
// ============================================================
function createWidget() {
  if (document.getElementById('remielle-widget-container')) return;

  const container = document.createElement('div');
  container.id = 'remielle-widget-container';

  widgetImg = document.createElement('img');
  widgetImg.src = ASSETS.WAITING;
  widgetImg.alt = 'AI Assistant Status';
  widgetImg.draggable = false;

  container.appendChild(widgetImg);
  document.body.appendChild(container);

  applySize(container);
  makeDraggable(container);
  setupScrollResize(container);
  setupClickInteraction(container);
}

function applySize(container) {
  container.style.width = `${widgetSize}px`;
  container.style.height = `${widgetSize}px`;
}

// ── Scroll-to-resize ─────────────────────────────────────────
function setupScrollResize(container) {
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    e.stopPropagation();
    widgetSize += e.deltaY < 0 ? SIZE_STEP : -SIZE_STEP;
    widgetSize = Math.max(SIZE_MIN, Math.min(SIZE_MAX, widgetSize));
    applySize(container);
    localStorage.setItem(SIZE_KEY, widgetSize);
  }, { passive: false });
}

// ── Click: zoom burst + cherry blossoms ──────────────────────
function setupClickInteraction(container) {
  container.addEventListener('click', () => {
    if (dragMoved) return; // ignore accidental click right after a drag

    container.style.transition = 'transform 0.12s ease-out';
    container.style.transform = 'scale(1.22)';
    setTimeout(() => {
      container.style.transition = 'transform 0.18s ease-in';
      container.style.transform = 'scale(1)';
    }, 130);

    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const count = 14;
    for (let i = 0; i < count; i++) {
      setTimeout(() => spawnPetal(cx, cy), i * 25);
    }
  });
}

function spawnPetal(cx, cy) {
  const el = document.createElement('div');

  const angle = Math.random() * Math.PI * 2;
  const radius = widgetSize * 0.35 + Math.random() * widgetSize * 0.25;
  const x0 = cx + Math.cos(angle) * radius;
  const y0 = cy + Math.sin(angle) * radius;

  const driftX = (Math.random() - 0.5) * 90;
  const driftY = 55 + Math.random() * 80;
  const rotate = (Math.random() - 0.5) * 600;
  const size = 7 + Math.random() * 9;
  const duration = 1100 + Math.random() * 900;
  const hue = 335 + Math.random() * 25;
  const sat = 65 + Math.random() * 20;
  const lit = 78 + Math.random() * 14;

  Object.assign(el.style, {
    position: 'fixed',
    left: `${x0}px`,
    top: `${y0}px`,
    width: `${size}px`,
    height: `${size * 0.72}px`,
    borderRadius: '60% 40% 60% 40% / 50% 50% 50% 50%',
    background: `hsl(${hue}deg ${sat}% ${lit}%)`,
    boxShadow: `0 0 ${size * 0.4}px hsl(${hue}deg ${sat}% ${lit}% / 0.5)`,
    opacity: '0.95',
    zIndex: '2147483647',
    pointerEvents: 'none',
    transform: 'translate(-50%,-50%)',
    willChange: 'transform, opacity',
    transition: `transform ${duration}ms cubic-bezier(0.2,0,0.4,1),
                 left ${duration}ms cubic-bezier(0.2,0,0.4,1),
                 top ${duration}ms cubic-bezier(0.2,0,0.4,1),
                 opacity ${duration * 0.6}ms ease ${duration * 0.4}ms`
  });

  document.body.appendChild(el);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.style.left = `${x0 + driftX}px`;
    el.style.top = `${y0 + driftY}px`;
    el.style.opacity = '0';
    el.style.transform = `translate(-50%,-50%) rotate(${rotate}deg) scale(0.4)`;
  }));

  setTimeout(() => el.remove(), duration + 50);
}

function makeDraggable(container) {
  let isDragging = false;
  let startX = 0, startY = 0;
  let initLeft = 0, initTop = 0;

  container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    dragMoved = false;
    container.classList.add('dragging');

    const rect = container.getBoundingClientRect();
    initLeft = rect.left;
    initTop = rect.top;

    container.style.bottom = 'auto';
    container.style.right = 'auto';
    container.style.left = `${initLeft}px`;
    container.style.top = `${initTop}px`;

    startX = e.clientX;
    startY = e.clientY;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    dragMoved = true;
    const newLeft = Math.max(0, Math.min(initLeft + (e.clientX - startX), window.innerWidth - container.offsetWidth));
    const newTop = Math.max(0, Math.min(initTop + (e.clientY - startY), window.innerHeight - container.offsetHeight));
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

// ============================================================
// Boot helper — every adapter file calls this once, passing its
// own site-specific "start listening for user input" function.
// ============================================================
function bootWidget(setupSiteDetection) {
  const start = () => {
    chrome.storage.sync.get(['selectedCharacter'], (result) => {
      const character = result.selectedCharacter || DEFAULT_CHARACTER;
      applyCharacter(character);
      createWidget();
      setupSiteDetection();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}
