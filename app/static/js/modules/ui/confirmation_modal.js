import * as dom from "./domElements.js";

let currentResolve = null;

export function showConfirmationModal(title, message) {
  dom.confirmationModalTitle.textContent = title;
  dom.confirmationModalMessage.textContent = message;
  dom.confirmationModalOverlay.classList.add("is-visible");

  return new Promise((resolve) => {
    currentResolve = resolve;

    const handleConfirm = () => {
      closeModal(true);
    };
    const handleCancel = () => {
      closeModal(false);
    };

    dom.confirmationModalConfirmBtn.addEventListener("click", handleConfirm, {
      once: true,
    });
    dom.confirmationModalCancelBtn.addEventListener("click", handleCancel, {
      once: true,
    });
    dom.confirmationModalOverlay.addEventListener(
      "click",
      (e) => {
        if (e.target === dom.confirmationModalOverlay) {
          closeModal(false);
        }
      },
      { once: true }
    );
  });
}

function closeModal(result) {
  dom.confirmationModalOverlay.classList.remove("is-visible");
  if (currentResolve) {
    currentResolve(result);
    currentResolve = null;
  }
}

