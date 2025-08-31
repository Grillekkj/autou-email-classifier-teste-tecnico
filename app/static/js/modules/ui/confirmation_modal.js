const modalConfirmBtn = document.getElementById("modal-confirm-btn");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const modalOverlay = document.getElementById("confirmation-modal");
const modalMessage = document.getElementById("modal-message");
const modalTitle = document.getElementById("modal-title");

let currentResolve = null;

export function showConfirmationModal(title, message) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalOverlay.classList.add("is-visible");

  return new Promise((resolve) => {
    currentResolve = resolve;

    const handleConfirm = () => {
      closeModal(true);
    };
    const handleCancel = () => {
      closeModal(false);
    };

    modalConfirmBtn.addEventListener("click", handleConfirm, { once: true });
    modalCancelBtn.addEventListener("click", handleCancel, { once: true });
    modalOverlay.addEventListener(
      "click",
      (e) => {
        if (e.target === modalOverlay) {
          closeModal(false);
        }
      },
      { once: true }
    );
  });
}

function closeModal(result) {
  modalOverlay.classList.remove("is-visible");
  if (currentResolve) {
    currentResolve(result);
    currentResolve = null;
  }

  modalConfirmBtn.removeEventListener("click", () => closeModal(true));
  modalCancelBtn.removeEventListener("click", () => closeModal(false));
  modalOverlay.removeEventListener("click", () => closeModal(false));
}

