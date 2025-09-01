import { showInfoModal } from "./ui/info_modal.js";
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
  const modal = document.getElementById("text-analysis-modal");
  if (modal?.contains(form)) {
    modal.style.display = "none";
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
  const uploadButton = document.getElementById("upload-file-btn");
  const fileInput = document.getElementById("global-file-input");

  if (!uploadButton || !fileInput) return;

  const allowedExtensions = [".txt", ".pdf", ".eml", ".msg", ".zip"];

  uploadButton.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async function (event) {
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
      fileInput.value = "";

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

    fileInput.value = "";
  });
}

export function initializeModal(onAnalysisComplete) {
  const modal = document.getElementById("text-analysis-modal");
  const openBtn = document.getElementById("open-text-modal-btn");
  const closeBtn = document.getElementById("close-modal-btn");
  const modalForm = document.getElementById("modal-email-form");

  if (!modal || !openBtn || !closeBtn || !modalForm) return;

  const openModal = () => (modal.style.display = "flex");
  const closeModal = () => (modal.style.display = "none");

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  modalForm.addEventListener("submit", (event) =>
    handleFormSubmit(event, onAnalysisComplete)
  );
}

export function initializeResponderForm(onAnalysisComplete) {
  const emailForm = document.getElementById("email-form");
  if (!emailForm) return;

  emailForm.addEventListener("submit", (event) =>
    handleFormSubmit(event, onAnalysisComplete)
  );
}

export function setupSidebarToggle() {
  const toggleBtn = document.getElementById("menu-toggle-btn");
  const sidebar = document.getElementById("history-sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  if (!toggleBtn || !sidebar || !overlay) return;

  const closeSidebar = () => {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-visible");
  };

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("is-open");
    overlay.classList.toggle("is-visible");
  });

  overlay.addEventListener("click", closeSidebar);
}

export function setupNavigation(loadPageCallback) {
  document.querySelectorAll(".nav-item[data-page]").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      loadPageCallback(this.getAttribute("data-page"));
    });
  });
}

