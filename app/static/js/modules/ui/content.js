import { eventBus } from "../../core/eventBus.js";
import { regenerateResponse } from "../api.js";
import { setLoading } from "./state.js";
import * as dom from "./domElements.js";

let currentItem = null;

function renderAnalysisDetails(item) {
  currentItem = item;
  const detailsHtml = `
    <header class="analysis-header">
      <div class="analysis-title-line">
        <h1>${item.assunto}</h1>
        <div class="header-badges">
          <span class="category-badge category-badge-${item.categoria}">${item.categoria}</span>
          <span class="file-type-badge">${item.tipo_arquivo}</span>
        </div>
      </div>
      <p class="analysis-summary">${item.resumo}</p>
    </header>
    <div class="text-view-wrapper">
      <div class="text-view-actions">
          <button id="copy-btn" class="icon-btn" title="Copiar Sugestão">
              <img src="/static/images/copy_suggestion.svg" alt="Copiar" />
          </button>
          <button id="regenerate-btn" class="icon-btn" title="Regerar Resposta">
              <img src="/static/images/regenerate_icon.svg" alt="Regerar" />
          </button>
          <button id="view-toggle-btn" class="icon-btn" title="Ver E-mail Original">
              <img src="/static/images/see_original_email_or_response_suggestion.svg" alt="Alternar Visualização" />
          </button>
      </div>
      <pre id="text-view-content" class="response-text">${item.resposta_sugerida}</pre>
    </div>
    `;
  dom.contentPanel.innerHTML = detailsHtml;
}

function toggleTextView() {
  const regenerateBtn = document.getElementById("regenerate-btn");
  const contentEl = document.getElementById("text-view-content");
  const toggleBtn = document.getElementById("view-toggle-btn");
  const copyBtn = document.getElementById("copy-btn");

  const isShowingResponse = toggleBtn.title === "Ver E-mail Original";

  contentEl.textContent = isShowingResponse
    ? currentItem.email_original
    : currentItem.resposta_sugerida;
  toggleBtn.title = isShowingResponse
    ? "Ver Resposta Sugerida"
    : "Ver E-mail Original";

  const isVisible = !isShowingResponse;
  copyBtn.style.display = isVisible ? "inline-block" : "none";
  regenerateBtn.style.display = isVisible ? "inline-block" : "none";
}

function copySuggestedResponse() {
  const contentEl = document.getElementById("text-view-content");
  const copyBtn = document.getElementById("copy-btn");

  navigator.clipboard.writeText(contentEl.textContent).then(() => {
    const originalTitle = copyBtn.title;
    copyBtn.title = "Copiado!";
    setTimeout(() => {
      copyBtn.title = originalTitle;
    }, 2000);
  });
}

async function handleRegenerateResponse() {
  if (!currentItem) return;

  setLoading(true);
  const result = await regenerateResponse(
    currentItem.historyId,
    currentItem.subId
  );
  setLoading(false);

  if (result?.resposta_sugerida) {
    eventBus.emit("responseRegenerated", {
      newResponse: result.resposta_sugerida,
    });
  }
}

function handleContentClick(e) {
  if (!currentItem) return;

  const target = e.target;
  if (target.closest("#view-toggle-btn")) toggleTextView();
  else if (target.closest("#copy-btn")) copySuggestedResponse();
  else if (target.closest("#regenerate-btn")) handleRegenerateResponse();
}

export function init() {
  eventBus.on("contentUpdated", (html) => {
    currentItem = null;
    dom.contentPanel.innerHTML = html;
  });

  eventBus.on("analysisResultLoaded", renderAnalysisDetails);

  eventBus.on("responseRegenerated", ({ newResponse }) => {
    if (currentItem) {
      currentItem.resposta_sugerida = newResponse;
      const contentEl = document.getElementById("text-view-content");
      if (contentEl) {
        contentEl.textContent = newResponse;
      }
    }
  });

  dom.contentPanel.addEventListener("click", handleContentClick);
}

