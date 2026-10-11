/* ============================================================
   MiOS — main script
   The OS itself: windows, desktop, dock and boot screen. Each app
   lives in apps/<app>/ (its .js and .css) and is loaded after this
   file, in the order listed at the end of index.html.
    1. Helpers & storage        5. Window manager
    2. Icons                    6. Desktop icons & dock
    3. App registry             7. Boot screen & startup
    4. Topbar
   ============================================================ */

/* ===========================================================
   1. HELPERS & STORAGE
   =========================================================== */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/* localStorage can throw (private mode, blocked site data), so every access is guarded */
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem("mios." + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("mios." + key, JSON.stringify(value));
    } catch (e) {}
  },
};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const isSmallScreen = () => window.matchMedia("(max-width: 640px)").matches;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===========================================================
   2. ICONS (Lucide, inlined so there are no external requests)
   =========================================================== */
const ICONS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  note: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
  arrowRight:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
};

function icon(name, className = "") {
  return (
    `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`
  );
}

function tile(iconName, color) {
  return `<span class="tile" style="--tile:${color}">${icon(iconName)}</span>`;
}

/* ===========================================================
   3. APP REGISTRY
   Every window app, plus the Notes launcher. Desktop icons and
   the dock are generated from this list.
   =========================================================== */
const APPS = {
  welcome:   { title: "Welcome",   icon: "home",     color: "linear-gradient(135deg,#ffb347,#ff7e5f)", width: 480, height: 460 },
  about:     { title: "About me",  icon: "user",     color: "linear-gradient(135deg,#7f9cff,#5b6ee1)", width: 620, height: 460 },
  projects:  { title: "Projects",  icon: "folder",   color: "linear-gradient(135deg,#4fd1c5,#2b9e8f)", width: 600, height: 480 },
  terminal:  { title: "Terminal",  icon: "terminal", color: "linear-gradient(135deg,#3a3f4b,#16181f)", width: 660, height: 420 },
  vigenere:  { title: "Vigenère",  icon: "lock",     color: "linear-gradient(135deg,#a78bfa,#6d28d9)", width: 680, height: 580 },
  sessionstats: { title: "SessionStats", icon: "activity", color: "linear-gradient(135deg,#ff9a5a,#fc4c02)", width: 780, height: 600 },
  grapheneos: { title: "GrapheneOS Guide", icon: "smartphone", color: "linear-gradient(135deg,#4fd1c5,#2b9e8f)", width: 700, height: 500 },
  contact:   { title: "Contact",   icon: "mail",     color: "linear-gradient(135deg,#7ee0ff,#3a9bff)", width: 380, height: 400 },
  wallpaper: { title: "Wallpaper", icon: "image",    color: "linear-gradient(135deg,#ff8ad8,#b06cff)", width: 470, height: 400 },
};
const WINDOW_IDS = Object.keys(APPS);

const LAUNCHERS = [
  ...["welcome", "about", "projects", "terminal", "vigenere", "sessionstats", "contact"].map((id) => ({ id, ...APPS[id] })),
  { id: "notes", title: "Notes", icon: "note", color: "linear-gradient(135deg,#ffe36e,#f5b800)" },
  { id: "wallpaper", ...APPS.wallpaper },
];

/* ===========================================================
   4. TOPBAR (clock, battery, menu)
   =========================================================== */
function updateTime() {
  $("#timeElement").textContent = new Date().toLocaleString("en-GB", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
updateTime();
setInterval(updateTime, 1000);

function renderBattery(level, charging) {
  const percent = Math.round(level * 100);
  const fillWidth = Math.max(1, Math.round(12 * level));
  const fillColor = level <= 0.2 && !charging ? "#ff6b6b" : "currentColor";
  const shape = charging
    ? '<path d="M15 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><path d="M6 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1"/>' +
      '<path d="m11 7-3 5h4l-3 5"/><line x1="22" x2="22" y1="11" y2="13"/>'
    : '<rect width="16" height="10" x="2" y="7" rx="2"/><line x1="22" x2="22" y1="11" y2="13"/>' +
      `<rect x="4" y="9" width="${fillWidth}" height="6" rx="1" fill="${fillColor}" stroke="none"/>`;
  const element = $("#batteryElement");
  element.innerHTML =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shape}</svg>` +
    `<span>${percent}%</span>`;
  element.setAttribute("aria-label", `Battery ${percent}%${charging ? ", charging" : ""}`);
  element.hidden = false;
}

/* Simulated battery that slowly drains (used when the browser has no Battery API) */
function simulateBattery() {
  let level = 1;
  renderBattery(level, false);
  setInterval(() => {
    level = level <= 0.12 ? 1 : level - 0.01;
    renderBattery(level, false);
  }, 8000);
}

/* Real battery level via the Battery Status API (Chrome, Edge, Opera).
   Firefox and Safari don't expose it, so they get the simulated one. */
if (navigator.getBattery) {
  navigator
    .getBattery()
    .then((battery) => {
      const update = () => renderBattery(battery.level, battery.charging);
      update();
      battery.addEventListener("levelchange", update);
      battery.addEventListener("chargingchange", update);
    })
    .catch(simulateBattery);
} else {
  simulateBattery();
}

/* topbar menu and the Welcome buttons */
$$("[data-open]").forEach((button) => {
  button.addEventListener("click", () => openWindow(button.dataset.open));
});

/* ===========================================================
   5. WINDOW MANAGER
   Open/close/minimize/maximize, dragging, resizing, stacking,
   and remembering where each window was left.
   =========================================================== */
const desktop = $("#desktop");
const layout = store.get("windows", {}) || {};
let topZ = 10;
let cascade = 0;

const topbarHeight = () => $(".topbar").offsetHeight;
const dockSpace = () => window.innerHeight - $("#dock").getBoundingClientRect().top + 8;
const isVisible = (win) => !win.classList.contains("is-closed") && !win.classList.contains("is-minimized");

const CONTROL_LABELS = { close: "Close", minimize: "Minimize", maximize: "Maximize" };

function setupWindow(win, options = {}) {
  const controls = options.controls || ["close", "minimize", "maximize"];
  const header = $(".window-header", win);

  const group = document.createElement("div");
  group.className = "window-controls";
  controls.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wc wc-" + action;
    button.setAttribute("aria-label", CONTROL_LABELS[action]);
    button.addEventListener("click", () => {
      if (action === "close") (options.onClose || closeWindow)(win);
      else if (action === "minimize") minimizeWindow(win);
      else toggleMaximize(win);
    });
    group.appendChild(button);
  });
  header.prepend(group);

  const grip = document.createElement("div");
  grip.className = "resize-handle";
  win.appendChild(grip);

  makeDraggable(win, header);
  makeResizable(win, grip, options.minWidth || 300, options.minHeight || 200);

  if (controls.includes("maximize")) {
    header.addEventListener("dblclick", (e) => {
      if (!e.target.closest(".window-controls")) toggleMaximize(win);
    });
  }
  win.addEventListener("pointerdown", () => focusWindow(win));
}

/* Keeps the title bar reachable: never under the topbar or the dock,
   and at least 96px of the window stays on screen horizontally. */
function placeWindow(win, left, top) {
  const visible = 96;
  const minTop = topbarHeight();
  const maxTop = window.innerHeight - dockSpace() - 38;
  win.style.left = clamp(left, visible - win.offsetWidth, window.innerWidth - visible) + "px";
  win.style.top = clamp(top, minTop, Math.max(minTop, maxTop)) + "px";
}

function setGeometry(win, geometry) {
  const maxWidth = window.innerWidth - 16;
  const maxHeight = window.innerHeight - topbarHeight() - dockSpace() - 16;
  win.style.width = Math.round(Math.min(geometry.width, maxWidth)) + "px";
  win.style.height = Math.round(Math.min(geometry.height, maxHeight)) + "px";
  placeWindow(win, Math.round(geometry.left), Math.round(geometry.top));
}

function defaultGeometry(app) {
  const available = window.innerHeight - topbarHeight() - dockSpace();
  const width = Math.min(app.width, window.innerWidth - 16);
  const height = Math.min(app.height, available - 16);
  const offset = (cascade++ % 6) * 26 - 52;
  return {
    width,
    height,
    left: (window.innerWidth - width) / 2 + offset,
    top: topbarHeight() + (available - height) / 2 + offset,
  };
}

function saveGeometry(win) {
  if (win.classList.contains("sticky-note")) return saveNotes();
  layout[win.id] = {
    left: parseFloat(win.style.left),
    top: parseFloat(win.style.top),
    width: parseFloat(win.style.width),
    height: parseFloat(win.style.height),
  };
  store.set("windows", layout);
}

function makeDraggable(win, handle) {
  let drag = null;

  handle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest(".window-controls") || win.classList.contains("is-maximized")) return;
    drag = {
      x: e.clientX,
      y: e.clientY,
      left: parseFloat(win.style.left) || 0,
      top: parseFloat(win.style.top) || 0,
    };
    handle.setPointerCapture(e.pointerId);
    win.classList.add("is-dragging");
  });

  handle.addEventListener("pointermove", (e) => {
    if (drag) placeWindow(win, drag.left + e.clientX - drag.x, drag.top + e.clientY - drag.y);
  });

  const stop = () => {
    if (!drag) return;
    drag = null;
    win.classList.remove("is-dragging");
    saveGeometry(win);
  };
  handle.addEventListener("pointerup", stop);
  handle.addEventListener("pointercancel", stop);
}

function makeResizable(win, grip, minWidth, minHeight) {
  let resize = null;

  grip.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || win.classList.contains("is-maximized")) return;
    e.preventDefault();
    resize = { x: e.clientX, y: e.clientY, width: win.offsetWidth, height: win.offsetHeight };
    grip.setPointerCapture(e.pointerId);
    win.classList.add("is-resizing");
  });

  grip.addEventListener("pointermove", (e) => {
    if (!resize) return;
    const maxWidth = Math.max(minWidth, window.innerWidth - win.offsetLeft - 4);
    const maxHeight = Math.max(minHeight, window.innerHeight - win.offsetTop - 4);
    win.style.width = clamp(resize.width + e.clientX - resize.x, minWidth, maxWidth) + "px";
    win.style.height = clamp(resize.height + e.clientY - resize.y, minHeight, maxHeight) + "px";
  });

  const stop = () => {
    if (!resize) return;
    resize = null;
    win.classList.remove("is-resizing");
    saveGeometry(win);
  };
  grip.addEventListener("pointerup", stop);
  grip.addEventListener("pointercancel", stop);
}

function focusWindow(win) {
  if (!win.classList.contains("is-active")) {
    $$(".window.is-active").forEach((other) => other.classList.remove("is-active"));
    win.classList.add("is-active");
  }
  if (Number(win.style.zIndex) !== topZ) win.style.zIndex = ++topZ;
  updateDock();
}

function focusTopmost() {
  const next = $$(".window")
    .filter(isVisible)
    .sort((a, b) => b.style.zIndex - a.style.zIndex)[0];
  if (next) focusWindow(next);
}

function openWindow(id) {
  if (id === "notes") return createStickyNote();
  const win = document.getElementById(id);
  if (!win || !APPS[id]) return;

  if (win.classList.contains("is-closed")) {
    setGeometry(win, layout[id] || defaultGeometry(APPS[id]));
    win.classList.toggle("is-maximized", isSmallScreen());
  }
  win.classList.remove("is-closed", "is-minimized");
  win.inert = false;
  focusWindow(win);

  if (id === "terminal") requestAnimationFrame(() => terminalInput.focus({ preventScroll: true }));
  if (id === "sessionstats") startSessionStats();
}

function hideWindow(win) {
  win.classList.remove("is-active");
  win.inert = true;
  focusTopmost();
  updateDock();
}

function closeWindow(win) {
  if (win.classList.contains("is-closed")) return;
  win.classList.add("is-closed");
  hideWindow(win);
}

function minimizeWindow(win) {
  win.classList.add("is-minimized");
  hideWindow(win);
}

function toggleMaximize(win) {
  win.classList.add("is-animating");
  win.classList.toggle("is-maximized");
  clearTimeout(win.animationTimer);
  win.animationTimer = setTimeout(() => win.classList.remove("is-animating"), 300);
}

/* Esc closes the active window (sticky notes just lose focus, closing deletes them) */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const active = $(".window.is-active");
  if (!active) return;
  if (active.classList.contains("sticky-note")) document.activeElement.blur();
  else closeWindow(active);
});

/* keep windows reachable when the browser window gets smaller */
window.addEventListener(
  "resize",
  debounce(() => {
    $$(".window").filter(isVisible).forEach((win) => {
      placeWindow(win, parseFloat(win.style.left), parseFloat(win.style.top));
    });
  }, 120)
);

WINDOW_IDS.forEach((id) => setupWindow(document.getElementById(id)));

/* ===========================================================
   6. DESKTOP ICONS & DOCK
   Desktop: click = select, double click = open (tap on touch).
   Dock: open, focus, or minimize if it's already in front.
   =========================================================== */
let selectedIcon = null;

function selectIcon(element) {
  deselectIcon();
  element.classList.add("is-selected");
  selectedIcon = element;
}

function deselectIcon() {
  if (selectedIcon) selectedIcon.classList.remove("is-selected");
  selectedIcon = null;
}

function renderDesktopIcons() {
  const container = $("#desktopIcons");
  LAUNCHERS.forEach((app) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "appicon";
    button.innerHTML = `${tile(app.icon, app.color)}<span class="appicon-label">${app.title}</span>`;

    let pointerType = "mouse";
    button.addEventListener("pointerdown", (e) => (pointerType = e.pointerType));
    button.addEventListener("click", () => {
      if (pointerType === "touch") {
        deselectIcon();
        openWindow(app.id);
      } else {
        selectIcon(button);
      }
    });
    button.addEventListener("dblclick", () => {
      if (pointerType === "touch") return;
      deselectIcon();
      openWindow(app.id);
    });
    button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openWindow(app.id);
      }
    });
    container.appendChild(button);
  });

  desktop.addEventListener("pointerdown", (e) => {
    if (e.target === desktop || e.target === container) deselectIcon();
  });
}

function renderDock() {
  const dock = $("#dock");
  LAUNCHERS.forEach((app) => {
    if (app.id === "notes") {
      const separator = document.createElement("span");
      separator.className = "dock-separator";
      dock.appendChild(separator);
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "dock-item";
    button.dataset.app = app.id;
    button.dataset.label = app.title;
    button.setAttribute("aria-label", app.title);
    button.innerHTML = tile(app.icon, app.color);
    button.addEventListener("click", () => {
      const win = document.getElementById(app.id);
      if (win && isVisible(win) && win.classList.contains("is-active")) minimizeWindow(win);
      else openWindow(app.id);
    });
    dock.appendChild(button);
  });
}

function updateDock() {
  $$(".dock-item").forEach((item) => {
    let running, active;
    if (item.dataset.app === "notes") {
      running = $$(".sticky-note:not(.is-removing)").length > 0;
      active = Boolean($(".sticky-note.is-active"));
    } else {
      const win = document.getElementById(item.dataset.app);
      running = !win.classList.contains("is-closed");
      active = win.classList.contains("is-active");
    }
    item.classList.toggle("is-running", running);
    item.classList.toggle("is-active", active);
  });
}

renderDesktopIcons();
renderDock();

/* ===========================================================
   7. BOOT SCREEN & STARTUP
   The boot screen plays once per browser session (or after `reboot`).
   =========================================================== */
function boot(onReady) {
  const screen = $("#boot");
  let alreadyBooted = false;
  try {
    alreadyBooted = sessionStorage.getItem("mios.booted") === "1";
  } catch (e) {}
  if (alreadyBooted) {
    screen.remove();
    onReady();
    return;
  }

  let finished = false;
  const timer = setTimeout(finish, reducedMotion() ? 800 : 3200);

  /* fake boot log: "loads" the portfolio, one project at a time */
  const messages = [
    "Booting MiOS…",
    "Loading about me…",
    ...PROJECTS.filter((project) => project.slug !== "mios").map((project) => `Loading ${project.name}…`),
    "Starting the terminal…",
    "Ready.",
  ];
  const status = $("#bootStatus");
  let step = 0;
  status.textContent = messages[0];
  const ticker = setInterval(() => {
    if (++step < messages.length) status.textContent = messages[step];
  }, 400);

  /* a key press or click skips the wait */
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    clearInterval(ticker);
    document.removeEventListener("keydown", finish);
    screen.removeEventListener("pointerdown", finish);
    try {
      sessionStorage.setItem("mios.booted", "1");
    } catch (e) {}
    screen.classList.add("is-done");
    setTimeout(() => screen.remove(), 500);
    onReady();
  }

  document.addEventListener("keydown", finish);
  screen.addEventListener("pointerdown", finish);
}

/* the apps/ scripts load after this file, so start once the whole page has run */
document.addEventListener("DOMContentLoaded", () => boot(() => openWindow("welcome")));
