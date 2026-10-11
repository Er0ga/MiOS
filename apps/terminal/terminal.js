/* ===========================================================
   TERMINAL
   A tiny shell with a fake file system, history (↑/↓),
   Tab completion and a working Vigenère cipher.
   =========================================================== */
const terminalBody = $("#terminalBody");
const terminalOutput = $("#terminalOutput");
const terminalInput = $("#terminalInput");
const commandHistory = [];
let historyIndex = 0;
let cwd = []; // path segments below ~

const accent = (html) => `<span class="term-accent">${html}</span>`;
const muted = (html) => `<span class="term-muted">${html}</span>`;
const warn = (html) => `<span class="term-warn">${html}</span>`;

const LOGO = [
  " __  __  _   ___   ____  ",
  "|  \\/  |(_) / _ \\ / ___| ",
  "| |\\/| || || | | |\\___ \\ ",
  "| |  | || || |_| | ___) |",
  "|_|  |_||_| \\___/ |____/ ",
];

const ABOUT_TEXT =
  "hey, I'm Ager Pérez — eroga online.\n" +
  "I study cybersecurity and spend most of my time messing around\n" +
  "with computers — Linux, privacy stuff, writing scripts, that kind of thing.\n\n" +
  "made MiOS for a Hack Club jam: a fake OS felt more interesting\n" +
  "than a normal portfolio page.";

const SKILLS_TEXT =
  "Python ▓▓▓▓▓▓▓░░░\n" +
  "Linux  ▓▓▓▓▓▓░░░░\n" +
  "Crypto ▓▓▓▓▓░░░░░\n" +
  "Web    ▓▓▓▓░░░░░░\n" +
  "(the web bar went down while making this)";

function termPrint(html) {
  const line = document.createElement("div");
  line.className = "terminal-line";
  line.innerHTML = html;
  terminalOutput.appendChild(line);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

/* ---------- fake file system ---------- */
function buildFileSystem() {
  const file = (content) => ({ type: "file", content });
  const dir = (children) => ({ type: "dir", children });
  const projectText = (p) =>
    `# ${p.name}\n${p.desc}\n\ntags: ${p.tags.join(", ")}\nlink: ${p.link || "coming soon"}`;

  return dir({
    "about.txt": file(ABOUT_TEXT),
    "skills.txt": file(SKILLS_TEXT),
    "contact.txt": file(CONTACT_LINKS.map((link) => `${link.label}: ${link.url}`).join("\n")),
    projects: dir(Object.fromEntries(PROJECTS.map((p) => [p.slug + ".md", file(projectText(p))]))),
    notes: dir(
      Object.fromEntries(
        currentNotes().map((note, i) => [`note-${i + 1}.txt`, file(note.text.trim() || "(empty note)")])
      )
    ),
  });
}

function resolvePath(path) {
  const parts = /^[~/]/.test(path) ? [] : cwd.slice();
  path
    .replace(/^~/, "")
    .split("/")
    .forEach((segment) => {
      if (!segment || segment === ".") return;
      if (segment === "..") parts.pop();
      else parts.push(segment);
    });
  return parts;
}

function getNode(parts) {
  let node = buildFileSystem();
  for (const part of parts) {
    if (node.type !== "dir" || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

const pathLabel = (parts) => "~" + parts.map((part) => "/" + part).join("");
const promptText = () => `eroga@MiOS:${pathLabel(cwd)}$`;

function updatePrompt() {
  $("#terminalPrompt").textContent = promptText();
  $("#terminal-title").textContent = "eroga@MiOS: " + pathLabel(cwd);
}

/* ---------- helpers for commands ---------- */
function vigenere(text, key, decrypt) {
  const cleanKey = key.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleanKey) return null;
  let k = 0;
  return text.replace(/[a-z]/gi, (char) => {
    const base = char <= "Z" ? 65 : 97;
    const shift = (cleanKey.charCodeAt(k++ % cleanKey.length) - 97) * (decrypt ? -1 : 1);
    return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
  });
}

function browserName() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "a browser";
}

function formatUptime() {
  const seconds = Math.floor(performance.now() / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes === 0) return `${seconds} secs`;
  return `${minutes} min${minutes === 1 ? "" : "s"}`;
}

/* ---------- commands ---------- */
const COMMANDS = {
  help: {
    usage: "help",
    desc: "this list",
    run: () => {
      const rows = Object.values(COMMANDS)
        .filter((command) => !command.hidden)
        .map((command) => {
          const [name, ...rest] = command.usage.split(" ");
          const usage = accent(name) + escapeHtml(rest.length ? " " + rest.join(" ") : "");
          const padding = " ".repeat(Math.max(1, 31 - command.usage.length));
          return "  " + usage + padding + muted(command.desc);
        });
      return "Available commands:\n" + rows.join("\n") + "\n\n" + muted("Tab autocompletes · ↑/↓ history · Ctrl+L clears");
    },
  },
  about: {
    usage: "about",
    desc: "who I am",
    run: () =>
      "Ager Pérez, aka eroga. cybersecurity student, computer nerd.\n" +
      "made MiOS for the Hack Club WebOS jam.\n" +
      `more info: ${accent("open about")} or ${accent("cat about.txt")}`,
  },
  whoami: {
    usage: "whoami",
    desc: "short version",
    run: () => "eroga (Ager Pérez) — probably should be sleeping",
  },
  projects: {
    usage: "projects",
    desc: "my projects",
    run: () =>
      "Projects:\n" +
      PROJECTS.map((p) => `  ${accent(escapeHtml(p.name))} — ${escapeHtml(p.desc)}`).join("\n") +
      `\n\nOpen in a window with ${accent("open projects")}, or ${accent("ls projects")}.`,
  },
  skills: {
    usage: "skills",
    desc: "my skills",
    run: () => SKILLS_TEXT,
  },
  contact: {
    usage: "contact",
    desc: "where to find me",
    run: () =>
      CONTACT_LINKS.map(
        (link) =>
          `  ${link.label.padEnd(10)} <a class="term-link" href="${link.url}" target="_blank" rel="noopener">${link.url}</a>`
      ).join("\n"),
  },
  neofetch: {
    usage: "neofetch",
    desc: "system info",
    run: () => {
      const noteCount = $$(".sticky-note:not(.is-removing)").length;
      const info = [
        accent("eroga") + "@" + accent("MiOS"),
        "----------",
        `${accent("OS")}: MiOS 2.0 (web)`,
        `${accent("Host")}: ${browserName()}`,
        `${accent("Shell")}: mios-sh`,
        `${accent("WM")}: MiOS window manager`,
        `${accent("Uptime")}: ${formatUptime()}`,
        `${accent("Apps")}: ${LAUNCHERS.length}`,
        `${accent("Wallpaper")}: ${currentWallpaper()}`,
        `${accent("Notes")}: ${noteCount}`,
        `${accent("Built with")}: HTML + CSS + JS ❤️`,
      ];
      if (isSmallScreen()) return LOGO.map(accent).join("\n") + "\n\n" + info.join("\n");
      const rows = Math.max(LOGO.length, info.length);
      const lines = [];
      for (let i = 0; i < rows; i++) {
        lines.push(accent((LOGO[i] || "").padEnd(28)) + (info[i] || ""));
      }
      return lines.join("\n");
    },
  },
  ls: {
    usage: "ls [dir]",
    desc: "list files",
    run: (args) => {
      const parts = resolvePath(args[0] || ".");
      const node = getNode(parts);
      if (!node) return warn(`ls: ${escapeHtml(args[0])}: No such file or directory`);
      if (node.type === "file") return escapeHtml(parts[parts.length - 1]);
      const names = Object.keys(node.children);
      if (!names.length) return muted("(empty)");
      return names
        .map((name) =>
          node.children[name].type === "dir" ? `<span class="term-dir">${escapeHtml(name)}/</span>` : escapeHtml(name)
        )
        .join("  ");
    },
  },
  cd: {
    usage: "cd <dir>",
    desc: "change directory",
    run: (args) => {
      const parts = resolvePath(args[0] || "~");
      const node = getNode(parts);
      if (!node) return warn(`cd: ${escapeHtml(args[0])}: No such directory`);
      if (node.type !== "dir") return warn(`cd: ${escapeHtml(args[0])}: Not a directory`);
      cwd = parts;
      updatePrompt();
      return "";
    },
  },
  pwd: {
    usage: "pwd",
    desc: "current directory",
    run: () => "/home/eroga" + cwd.map((part) => "/" + escapeHtml(part)).join(""),
  },
  cat: {
    usage: "cat <file>",
    desc: "show a file",
    run: (args) => {
      if (!args[0]) return warn("usage: cat <file>") + " — try " + accent("cat about.txt");
      const node = getNode(resolvePath(args[0]));
      if (!node) return warn(`cat: ${escapeHtml(args[0])}: No such file or directory`);
      if (node.type === "dir") return warn(`cat: ${escapeHtml(args[0])}: Is a directory`);
      return escapeHtml(node.content);
    },
  },
  open: {
    usage: "open <app>",
    desc: "open a window",
    run: (args) => {
      const app = (args[0] || "").toLowerCase();
      if (app === "notes" || app === "note") {
        createStickyNote();
        return accent("New note created on the desktop.");
      }
      if (APPS[app]) {
        openWindow(app);
        return `Opening ${APPS[app].title}…`;
      }
      return warn("Unknown app.") + " Try: " + [...WINDOW_IDS, "notes"].join(", ");
    },
  },
  wallpaper: {
    usage: "wallpaper [name]",
    desc: "change the wallpaper",
    run: (args) => {
      if (!args[0]) {
        return (
          `Current: ${accent(currentWallpaper())}\n` +
          `Available: ${WALLPAPERS.join(", ")}\n` +
          `Usage: ${accent("wallpaper ocean")}`
        );
      }
      const name = args[0].toLowerCase();
      if (setWallpaper(name)) return `Wallpaper set to ${accent(name)}.`;
      return warn(`wallpaper: unknown wallpaper "${escapeHtml(args[0])}".`) + " Try: " + WALLPAPERS.join(", ");
    },
  },
  vigenere: {
    usage: "vigenere enc|dec|crack …",
    desc: "Vigenère cipher",
    run: (args) => {
      const mode = (args[0] || "").toLowerCase();
      const decrypt = mode === "dec" || mode === "decrypt";
      const encrypt = mode === "enc" || mode === "encrypt";
      if (mode === "example") {
        return (
          `Key: ${accent(VIGENERE_EXAMPLE_KEY)} (${VIGENERE_LANGUAGES[attackLanguage].name} text)\n${exampleCiphertext()}\n\n` +
          muted("Try: vigenere crack &lt;paste it here&gt;")
        );
      }
      if (mode === "crack") {
        const ciphertext = args.slice(1).join(" ");
        const codes = toCodes(ciphertext);
        if (codes.length < 20) return warn("vigenere crack: give me at least 20 letters of ciphertext.");
        const { best } = statisticalAttack(codes, 20);
        return (
          `Most likely key: ${accent(escapeHtml(best.key))} (length ${best.key.length}, ` +
          `${VIGENERE_LANGUAGES[attackLanguage].name} frequencies)\n` +
          escapeHtml(decryptPreview(ciphertext, best.key)) +
          "\n" +
          muted("Full ranking, brute force and benchmark: open vigenere")
        );
      }
      if ((!encrypt && !decrypt) || args.length < 3) {
        return (
          "usage:\n" +
          "  vigenere enc &lt;key&gt; &lt;text&gt;\n" +
          "  vigenere dec &lt;key&gt; &lt;text&gt;\n" +
          "  vigenere crack &lt;ciphertext&gt;   statistical attack\n" +
          "  vigenere example              a ciphertext to practice on\n" +
          `example: ${accent("vigenere enc lemon attack at dawn")}\n` +
          muted("(the full app: open vigenere)")
        );
      }
      const result = vigenere(args.slice(2).join(" "), args[1], decrypt);
      if (result === null) return warn("vigenere: the key needs at least one letter");
      return accent(escapeHtml(result));
    },
  },
  note: {
    usage: "note",
    desc: "create a sticky note",
    run: () => {
      createStickyNote();
      return accent("New note created on the desktop.");
    },
  },
  history: {
    usage: "history",
    desc: "previous commands",
    run: () =>
      commandHistory.map((cmd, i) => muted(String(i + 1).padStart(4)) + "  " + escapeHtml(cmd)).join("\n"),
  },
  date: {
    usage: "date",
    desc: "current date and time",
    run: () => new Date().toLocaleString("en-GB"),
  },
  echo: {
    usage: "echo <text>",
    desc: "repeat text",
    run: (args) => escapeHtml(args.join(" ")),
  },
  clear: {
    usage: "clear",
    desc: "clear the screen",
    run: () => {
      terminalOutput.innerHTML = "";
      return "";
    },
  },
  reboot: {
    usage: "reboot",
    desc: "restart MiOS",
    run: () => {
      try {
        sessionStorage.removeItem("mios.booted");
      } catch (e) {}
      setTimeout(() => location.reload(), 400);
      return muted("Rebooting…");
    },
  },
  sudo: {
    hidden: true,
    run: () => warn("Nice try 😏 — no root here."),
  },
};

function printPromptLine(text) {
  termPrint(`<span class="term-prompt-echo">${escapeHtml(promptText())}</span> ${escapeHtml(text)}`);
}

function runCommand(raw) {
  const input = raw.trim();
  printPromptLine(input);
  if (!input) return;

  commandHistory.push(input);
  historyIndex = commandHistory.length;

  const [name, ...args] = input.split(/\s+/);
  const command = COMMANDS[name.toLowerCase()];
  if (!command) {
    termPrint(warn(`command not found: ${escapeHtml(name)}`) + " — type " + accent("help"));
    return;
  }
  const output = command.run(args);
  if (output) termPrint(output);
}

/* ---------- Tab completion ---------- */
function completionOptions(words) {
  if (words.length === 1) return Object.keys(COMMANDS).filter((name) => !COMMANDS[name].hidden);
  const command = words[0].toLowerCase();
  if (command === "open") return [...WINDOW_IDS, "notes"];
  if (command === "wallpaper") return WALLPAPERS;
  if (command === "vigenere" && words.length === 2) return ["enc", "dec", "crack", "example"];
  if (command === "ls" || command === "cd" || command === "cat") {
    return pathOptions(words[words.length - 1], command === "cd");
  }
  return [];
}

function pathOptions(word, dirsOnly) {
  const dirPart = word.slice(0, word.lastIndexOf("/") + 1);
  const dir = getNode(resolvePath(dirPart || "."));
  if (!dir || dir.type !== "dir") return [];
  return Object.entries(dir.children)
    .filter(([, node]) => !dirsOnly || node.type === "dir")
    .map(([name, node]) => dirPart + name + (node.type === "dir" ? "/" : ""));
}

function commonPrefix(list) {
  return list.reduce((prefix, item) => {
    let i = 0;
    while (i < prefix.length && prefix[i] === item[i]) i++;
    return prefix.slice(0, i);
  });
}

function autocomplete() {
  const value = terminalInput.value;
  const words = value.split(" ");
  const current = words[words.length - 1];
  const matches = completionOptions(words).filter((option) => option.startsWith(current));
  if (!matches.length) return;

  if (matches.length === 1) {
    words[words.length - 1] = matches[0] + (matches[0].endsWith("/") ? "" : " ");
    terminalInput.value = words.join(" ");
    return;
  }
  const prefix = commonPrefix(matches);
  if (prefix.length > current.length) {
    words[words.length - 1] = prefix;
    terminalInput.value = words.join(" ");
  } else {
    printPromptLine(value);
    termPrint(matches.map(escapeHtml).join("  "));
  }
}

terminalInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    runCommand(terminalInput.value);
    terminalInput.value = "";
  } else if (e.key === "Tab") {
    e.preventDefault();
    autocomplete();
  } else if (e.key === "l" && e.ctrlKey) {
    e.preventDefault();
    terminalOutput.innerHTML = "";
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      terminalInput.value = commandHistory[historyIndex];
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      terminalInput.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      terminalInput.value = "";
    }
  }
});

/* clicking anywhere in the terminal focuses the input, unless you're selecting text */
terminalBody.addEventListener("click", () => {
  if (!window.getSelection().toString()) terminalInput.focus({ preventScroll: true });
});

termPrint(accent(LOGO.join("\n")));
termPrint(`Welcome to MiOS. Type ${accent("help")} to get started.`);
termPrint(muted("Tip: Tab autocompletes, ↑ / ↓ repeat commands."));
