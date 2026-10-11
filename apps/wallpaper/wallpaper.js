/* ===========================================================
   WALLPAPER APP
   =========================================================== */
const WALLPAPERS = ["aurora", "sunset", "ocean", "forest", "midnight"];
const currentWallpaper = () => document.documentElement.dataset.wallpaper;

function setWallpaper(name) {
  if (!WALLPAPERS.includes(name)) return false;
  document.documentElement.dataset.wallpaper = name;
  store.set("wallpaper", name);
  $$(".swatch").forEach((swatch) => {
    swatch.setAttribute("aria-pressed", String(swatch.dataset.wallpaper === name));
  });
  return true;
}

function renderWallpapers() {
  const grid = $("#wallpaperGrid");
  WALLPAPERS.forEach((name) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "swatch";
    swatch.dataset.wallpaper = name;
    swatch.innerHTML =
      '<span class="swatch-preview"></span>' +
      `<span>${name.charAt(0).toUpperCase() + name.slice(1)}</span>`;
    swatch.addEventListener("click", () => setWallpaper(name));
    grid.appendChild(swatch);
  });
}
renderWallpapers();
if (!setWallpaper(store.get("wallpaper", "midnight"))) setWallpaper("midnight");
