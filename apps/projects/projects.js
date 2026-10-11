/* ===========================================================
   PROJECTS APP
   =========================================================== */
const PROJECTS = [
  {
    slug: "sessionstats",
    icon: "activity",
    color: APPS.sessionstats.color,
    name: "SessionStats",
    desc: "turns a GPX or FIT workout into a stats image with a transparent background, ready to put on top of your photos. it also runs right here, as a MiOS app.",
    tags: ["Python", "JS", "canvas"],
    link: "https://github.com/Er0ga/SessionStats",
    app: "sessionstats",
  },
  {
    slug: "vigenere",
    icon: "lock",
    color: APPS.vigenere.color,
    name: "Pygenère",
    desc: "a Python app that encrypts and decrypts Vigenère ciphers and cracks them with frequency analysis or brute force. it also runs right here, as a MiOS app.",
    tags: ["Python", "cryptography"],
    link: "https://github.com/Ager90/Cifrado-Vigenere-Proyecto",
    app: "vigenere",
  },
  {
    slug: "grapheneos",
    icon: "smartphone",
    color: "linear-gradient(135deg,#4fd1c5,#2b9e8f)",
    name: "GrapheneOS Guide",
    desc: "setup guide for GrapheneOS focused on everyday use — not for people who live in a bunker. you can read it right here, as a MiOS app.",
    tags: ["privacy", "Android", "Linux"],
    link: "https://github.com/Er0ga/GrapheneOS-for-normal-usage_privacy-without-paranoia",
    app: "grapheneos",
  },
  {
    slug: "mios",
    icon: "monitor",
    color: "linear-gradient(135deg,#6a5cff,#ff7eb3)",
    name: "MiOS",
    desc: "my portfolio, but it's a fake OS. made it for a Hack Club jam.",
    tags: ["HTML", "CSS", "JS"],
    link: "https://github.com/Er0ga/MiOS",
  },
];

function renderProjects() {
  const grid = $("#projectGrid");
  PROJECTS.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    const tags = project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join("");
    const label = project.link && project.link.includes("github.com") ? "View on GitHub" : "Visit site";
    const link = project.link
      ? `<a class="project-link" href="${project.link}" target="_blank" rel="noopener">${label} ${icon("arrowRight")}</a>`
      : `<span class="project-link is-disabled">Coming soon</span>`;
    const appButton = project.app
      ? `<button type="button" class="project-link" data-open-app="${project.app}">Open in MiOS ${icon("arrowRight")}</button>`
      : "";
    card.innerHTML = `
      ${tile(project.icon, project.color)}
      <h3>${project.name}</h3>
      <p>${project.desc}</p>
      <div class="project-tags">${tags}</div>
      <div class="project-links">${appButton}${link}</div>
    `;
    const button = $("[data-open-app]", card);
    if (button) button.addEventListener("click", () => openWindow(project.app));
    grid.appendChild(card);
  });
}
renderProjects();
