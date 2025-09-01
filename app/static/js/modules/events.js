import { showInfoModal } from "./ui/info_modal.js";
import * as dom from "./ui/domElements.js";
import { setLoading } from "./ui/state.js";
import { processEmail } from "./api.js";

async function handleFormSubmit(event, onAnalysisComplete) {
  event.preventDefault();
  const form = event.target;
  const textArea = form.querySelector("textarea");
  const text = textArea.value.trim();

  if (!text) {
    await showInfoModal(
      "Campo Vazio",
      "Por favor, digite ou cole o texto do e-mail para análise."
    );
    return;
  }

  setLoading(true);
  if (dom.textAnalysisModal?.contains(form)) {
    dom.textAnalysisModal.style.display = "none";
  }

  const formData = new FormData();
  formData.append("email_text", text);

  const data = await processEmail(formData, false);
  setLoading(false);

  if (data) {
    form.reset();
    onAnalysisComplete(data);
  }
}

export function initializeFileUploadButton(onAnalysisComplete) {
  if (!dom.uploadFileBtn || !dom.globalFileInput) return;

  const allowedExtensions = [".txt", ".pdf", ".eml", ".msg", ".zip"];

  dom.uploadFileBtn.addEventListener("click", () => {
    dom.globalFileInput.click();
  });

  dom.globalFileInput.addEventListener("change", async function (event) {
    const files = event.target.files;
    if (!files.length) {
      return;
    }

    const invalidFile = Array.from(files).find((file) => {
      const extension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();
      return !allowedExtensions.includes(extension);
    });

    if (invalidFile) {
      dom.globalFileInput.value = "";

      await showInfoModal(
        "Arquivo Inválido",
        `O formato do arquivo "${
          invalidFile.name
        }" não é suportado. Por favor, envie um dos seguintes formatos: ${allowedExtensions.join(
          ", "
        )}.`
      );
      return;
    }

    setLoading(true);

    const formData = new FormData();
    for (const file of files) {
      formData.append("email_file", file);
    }

    const data = await processEmail(formData, true);
    setLoading(false);

    if (data) {
      onAnalysisComplete(data);
    }

    dom.globalFileInput.value = "";
  });
}

export function initializeModal(onAnalysisComplete) {
  if (
    !dom.textAnalysisModal ||
    !dom.openTextModalBtn ||
    !dom.closeModalBtn ||
    !dom.modalEmailForm
  )
    return;

  const openModal = () => (dom.textAnalysisModal.style.display = "flex");
  const closeModal = () => (dom.textAnalysisModal.style.display = "none");

  dom.openTextModalBtn.addEventListener("click", openModal);
  dom.closeModalBtn.addEventListener("click", closeModal);

  dom.modalEmailForm.addEventListener("submit", (event) =>
    handleFormSubmit(event, onAnalysisComplete)
  );
}

export function initializeResponderForm(onAnalysisComplete) {
  if (!dom.emailForm) return;

  dom.emailForm.addEventListener("submit", (event) =>
    handleFormSubmit(event, onAnalysisComplete)
  );
}

export function setupSidebarToggle() {
  if (!dom.menuToggleBtn || !dom.sidebar || !dom.sidebarOverlay) return;

  const closeSidebar = () => {
    dom.sidebar.classList.remove("is-open");
    dom.sidebarOverlay.classList.remove("is-visible");
  };

  dom.menuToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dom.sidebar.classList.toggle("is-open");
    dom.sidebarOverlay.classList.toggle("is-visible");
  });

  dom.sidebarOverlay.addEventListener("click", closeSidebar);
}

export function setupNavigation(loadPageCallback) {
  document.querySelectorAll(".nav-item[data-page]").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      loadPageCallback(this.getAttribute("data-page"));
    });
  });
}

