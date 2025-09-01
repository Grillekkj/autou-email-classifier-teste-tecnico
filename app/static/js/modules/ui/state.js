import * as dom from "./domElements.js";

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
  if (dom.globalLoadingOverlay) {
    dom.globalLoadingOverlay.style.display = isLoading ? "flex" : "none";
  }

  if (dom.analyzeButtonPage) {
    dom.analyzeButtonPage.disabled = isLoading;
    dom.analyzeButtonPage.textContent = isLoading
      ? "Analisando..."
      : "Analisar";
  }
  if (dom.analyzeButtonModal) {
    dom.analyzeButtonModal.disabled = isLoading;
    dom.analyzeButtonModal.textContent = isLoading
      ? "Analisando..."
      : "Analisar";
  }
}

