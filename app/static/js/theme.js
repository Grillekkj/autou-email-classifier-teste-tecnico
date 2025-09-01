import * as dom from "./modules/ui/domElements.js";

if (dom.themeToggle && dom.themeText && dom.body) {
  const applyTheme = (theme) => {
    dom.body.setAttribute("data-theme", theme);
    dom.themeText.textContent = theme === "dark" ? "Modo Claro" : "Modo Escuro";
  };

  dom.themeToggle.addEventListener("click", () => {
    const currentTheme = dom.body.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  });

  const savedTheme = localStorage.getItem("theme");
  const preferredTheme =
    savedTheme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  applyTheme(preferredTheme);
}

