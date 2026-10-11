/* ===========================================================
   ABOUT ME APP
   =========================================================== */
const ABOUT_SECTIONS = [
  {
    title: "Hello!",
    meta: "intro",
    body: `
      <h2>hey, I'm Ager</h2>
      <p>
        <strong>Ager Pérez</strong> (Er0ga on GitHub). I study cybersecurity
        and spend most of my time messing around with computers — Linux,
        privacy stuff, writing scripts, that kind of thing.
      </p>
      <p>
        most of what I build ends up the same way: small tools that run
        entirely on your own computer. no account, no upload, nothing
        leaving your machine.
      </p>
      <p>
        made MiOS for a Hack Club jam. thought a fake OS
        was more interesting than a normal portfolio page.
      </p>
    `,
  },
  {
    title: "Skills",
    meta: "what I use",
    body: `
      <h2>things I actually use</h2>
      <ul>
        <li><strong>Python</strong> — my main language: scripts, cryptanalysis tools and
          desktop apps (SessionStats is pywebview + PyInstaller)</li>
        <li><strong>cryptography</strong> — classic ciphers, frequency analysis, χ², brute force</li>
        <li><strong>privacy &amp; security</strong> — GrapheneOS, hardening, de-Googling setups</li>
        <li><strong>Linux</strong> — where I spend most of my time</li>
        <li><strong>HTML / CSS / JS</strong> — enough to make this whole thing (apparently),
          plus the canvas drawing in SessionStats</li>
      </ul>
      <p style="opacity:0.7; font-size:13px;">still learning a lot, especially on the web side</p>
    `,
  },
  {
    title: "Right now",
    meta: "current projects",
    body: `
      <h2>right now</h2>
      <p>apart from this jam I've been working on three things:</p>
      <ul>
        <li>
          <strong>Pygenère</strong> — started as a project for my Discrete Mathematics
          class: a Python app that encrypts and decrypts Vigenère and breaks it without
          the key, with statistics or brute force.
        </li>
        <li>
          <strong>SessionStats</strong> — turns a GPX or FIT workout into a stats image
          with a transparent background, ready to put on top of your photos.
        </li>
        <li>
          <strong>GrapheneOS guide</strong> — for people who want more privacy on their
          phone but don't want to spend three hours configuring stuff.
        </li>
      </ul>
      <p>
        all three are in the Projects app if you want to check them out,
        and all three also work right here: Vigenère and SessionStats as
        their own apps, and the guide as a window you can read.
        also — the sticky notes were my own feature for this jam, try them.
        they stay on the desktop even if you reload.
      </p>
    `,
  },
];

function showAboutSection(index) {
  $("#aboutContent").innerHTML = ABOUT_SECTIONS[index].body;
  $("#about-title").textContent = ABOUT_SECTIONS[index].title;
  $$(".sidebar-item", $("#aboutSidebar")).forEach((item, i) => {
    item.classList.toggle("is-active", i === index);
    item.setAttribute("aria-current", String(i === index));
  });
}

function renderAbout() {
  const sidebar = $("#aboutSidebar");
  ABOUT_SECTIONS.forEach((section, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "sidebar-item";
    item.innerHTML =
      `<span class="sidebar-item-title">${section.title}</span>` +
      `<span class="sidebar-item-meta">${section.meta}</span>`;
    item.addEventListener("click", () => showAboutSection(index));
    sidebar.appendChild(item);
  });
  showAboutSection(0);
}
renderAbout();
