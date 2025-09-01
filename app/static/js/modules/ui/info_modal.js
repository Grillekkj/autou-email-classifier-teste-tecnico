import * as dom from "./domElements.js";

let currentResolve = null;

function closeModal() {
  dom.infoModalOverlay.classList.remove("is-visible");
  if (currentResolve) {
    currentResolve();
    currentResolve = null;
  }
}

export function showInfoModal(title, message) {
  dom.infoModalTitle.textContent = title;
  dom.infoModalMessage.textContent = message;
  dom.infoModalOverlay.classList.add("is-visible");

  return new Promise((resolve) => {
    currentResolve = resolve;

    dom.infoModalOkBtn.addEventListener("click", closeModal, { once: true });
    dom.infoModalOverlay.addEventListener(
      "click",
      (e) => {
        if (e.target === dom.infoModalOverlay) {
          closeModal();
        }
      },
      { once: true }
    );
  });
}

