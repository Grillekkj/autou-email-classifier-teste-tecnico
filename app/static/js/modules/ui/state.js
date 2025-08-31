export function setActiveItem(element) {
  document
    .querySelectorAll(
      ".history-item-preview.active, .history-item-zip-container.active"
    )
    .forEach((i) => i.classList.remove("active"));
  if (element) {
    element.classList.add("active");
  }
}

export function setLoading(isLoading) {
  const overlay = document.getElementById("global-loading-overlay");
  if (overlay) {
    overlay.style.display = isLoading ? "flex" : "none";
  }

  const analyzeButtonPage = document.getElementById("analyze-button");
  const analyzeButtonModal = document.getElementById("modal-analyze-button");

  if (analyzeButtonPage) {
    analyzeButtonPage.disabled = isLoading;
    analyzeButtonPage.textContent = isLoading ? "Analisando..." : "Analisar";
  }
  if (analyzeButtonModal) {
    analyzeButtonModal.disabled = isLoading;
    analyzeButtonModal.textContent = isLoading ? "Analisando..." : "Analisar";
  }
}

