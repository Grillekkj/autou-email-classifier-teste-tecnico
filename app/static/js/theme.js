document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("theme-toggle");
  const themeText = document.getElementById("theme-text");

  if (!themeToggle || !themeText) return;

  const body = document.body;

  const applyTheme = (theme) => {
    body.setAttribute("data-theme", theme);
    themeText.textContent = theme === "dark" ? "Modo Claro" : "Modo Escuro";
  };

  themeToggle.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-theme") || "light";
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
});

