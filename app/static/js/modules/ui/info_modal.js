const modalMessage = document.getElementById("info-modal-message");
const modalTitle = document.getElementById("info-modal-title");
const modalOverlay = document.getElementById("info-modal");
const okBtn = document.getElementById("info-modal-ok-btn");

let currentResolve = null;

function closeModal() {
  modalOverlay.classList.remove("is-visible");
  if (currentResolve) {
    currentResolve();
    currentResolve = null;
  }
}

export function showInfoModal(title, message) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalOverlay.classList.add("is-visible");

  return new Promise((resolve) => {
    currentResolve = resolve;

    okBtn.addEventListener("click", closeModal, { once: true });
    modalOverlay.addEventListener(
      "click",
      (e) => {
        if (e.target === modalOverlay) {
          closeModal();
        }
      },
      { once: true }
    );
  });
}

