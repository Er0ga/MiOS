/* ===========================================================
   STICKY NOTES (custom feature)
   Editable, draggable, resizable notes saved in localStorage.
   =========================================================== */
const NOTE_COLORS = [
  { bg: "#fff59d", header: "#f6dd5c", text: "#3a3000" },
  { bg: "#c8f0c8", header: "#9bd99b", text: "#0a3000" },
  { bg: "#cfe0ff", header: "#a3c2f5", text: "#001a40" },
  { bg: "#ffd3d3", header: "#f5a8a8", text: "#400000" },
];
let noteCount = 0;

function noteData(note) {
  return {
    id: note.id,
    color: Number(note.dataset.color),
    text: $("textarea", note).value,
    left: parseFloat(note.style.left),
    top: parseFloat(note.style.top),
    width: parseFloat(note.style.width),
    height: parseFloat(note.style.height),
  };
}

function currentNotes() {
  return $$(".sticky-note:not(.is-removing)").map(noteData);
}

function saveNotes() {
  store.set("notes", currentNotes());
}
const saveNotesSoon = debounce(saveNotes, 300);

function createStickyNote(data) {
  const restoring = Boolean(data);
  data = data || {};
  const colorIndex = Number.isInteger(data.color) ? data.color % NOTE_COLORS.length : noteCount % NOTE_COLORS.length;
  const color = NOTE_COLORS[colorIndex];
  noteCount++;

  const note = document.createElement("section");
  note.className = "window sticky-note is-closed";
  note.id = data.id || "note-" + Date.now().toString(36) + "-" + noteCount;
  note.dataset.color = colorIndex;
  note.setAttribute("role", "dialog");
  note.setAttribute("aria-label", "Sticky note");
  note.style.setProperty("--note-bg", color.bg);
  note.style.setProperty("--note-header", color.header);
  note.style.setProperty("--note-text", color.text);
  note.innerHTML =
    '<header class="window-header"><h2 class="window-title">Note</h2></header>' +
    '<textarea class="sticky-textarea" placeholder="Write here…" aria-label="Note text"></textarea>';

  const textarea = $("textarea", note);
  textarea.value = data.text || "";
  textarea.addEventListener("input", saveNotesSoon);
  desktop.appendChild(note);

  setupWindow(note, { controls: ["close"], minWidth: 170, minHeight: 140, onClose: removeStickyNote });

  const usableHeight = window.innerHeight - topbarHeight() - dockSpace();
  setGeometry(note, {
    width: data.width || 220,
    height: data.height || 200,
    left: Number.isFinite(data.left) ? data.left : 120 + Math.random() * Math.max(60, window.innerWidth - 420),
    top: Number.isFinite(data.top)
      ? data.top
      : topbarHeight() + 30 + Math.random() * Math.max(40, usableHeight - 280),
  });

  void note.offsetWidth; // flush styles so the opening animation plays
  note.classList.remove("is-closed");
  focusWindow(note);

  if (!restoring) {
    textarea.focus({ preventScroll: true });
    saveNotes();
  }
  return note;
}

function removeStickyNote(note) {
  note.classList.add("is-closed", "is-removing");
  note.inert = true;
  saveNotes();
  hideWindow(note);
  setTimeout(() => {
    note.remove();
    updateDock();
  }, 220);
}

const savedNotes = store.get("notes", []);
if (Array.isArray(savedNotes)) savedNotes.forEach((note) => createStickyNote(note));
