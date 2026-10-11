/* ===========================================================
   CONTACT APP
   =========================================================== */
const CONTACT_LINKS = [
  {
    label: "GitHub",
    handle: "@Er0ga",
    url: "https://github.com/Er0ga",
    icon: "github",
    color: "linear-gradient(135deg,#4a4f5a,#16181f)",
  },
  {
    label: "GitHub",
    handle: "@Ager90",
    url: "https://github.com/Ager90/",
    icon: "github",
    color: "linear-gradient(135deg,#4a4f5a,#16181f)",
  },
  {
    label: "LinkedIn",
    handle: "Ager Pérez",
    url: "https://www.linkedin.com/in/ager-p%C3%A9rez-6813b93a0/",
    icon: "linkedin",
    color: "linear-gradient(135deg,#2f8fe0,#0a66c2)",
  },
];

function renderContact() {
  $("#contactList").innerHTML = CONTACT_LINKS.map(
    (link) => `
      <a class="contact-link" href="${link.url}" target="_blank" rel="noopener">
        ${tile(link.icon, link.color)}
        <span><strong>${link.label}</strong><small>${link.handle}</small></span>
        ${icon("external", "arrow")}
      </a>`
  ).join("");
}
renderContact();
