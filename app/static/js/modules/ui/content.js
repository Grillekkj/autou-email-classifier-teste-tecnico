import { eventBus } from "../../core/eventBus.js";
import { regenerateResponse } from "../api.js";
import { setLoading } from "./state.js";

const contentPanel = document.getElementById("content-panel");
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
  contentPanel.innerHTML = detailsHtml;
}

function renderPage(htmlContent) {
  currentItem = null;
  contentPanel.innerHTML = htmlContent;
}

async function setupContentInteractions(e) {
  if (!currentItem) return;

  const target = e.target;

  const toggleBtn = target.closest("#view-toggle-btn");
  if (toggleBtn) {
    const contentEl = document.getElementById("text-view-content");
    const isShowingSuggested = toggleBtn.title === "Ver E-mail Original";
    const copyBtn = document.getElementById("copy-btn");
    const regenerateBtn = document.getElementById("regenerate-btn");

    if (isShowingSuggested) {
      contentEl.textContent = currentItem.email_original;
      toggleBtn.title = "Ver Resposta Sugerida";
      if (copyBtn) copyBtn.style.display = "none";
      if (regenerateBtn) regenerateBtn.style.display = "none";
    } else {
      contentEl.textContent = currentItem.resposta_sugerida;
      toggleBtn.title = "Ver E-mail Original";
      if (copyBtn) copyBtn.style.display = "inline-block";
      if (regenerateBtn) regenerateBtn.style.display = "inline-block";
    }
    return;
  }

  const copyBtn = target.closest("#copy-btn");
  if (copyBtn) {
    const contentEl = document.getElementById("text-view-content");
    navigator.clipboard.writeText(contentEl.textContent).then(() => {
      const originalTitle = copyBtn.title;
      copyBtn.title = "Copiado!";
      setTimeout(() => {
        copyBtn.title = originalTitle;
      }, 2000);
    });
    return;
  }

  const regenerateBtn = target.closest("#regenerate-btn");
  if (regenerateBtn) {
    setLoading(true);
    const result = await regenerateResponse(
      currentItem,
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
}

export function init() {
  eventBus.on("contentUpdated", (html) => {
    renderPage(html);
  });

  eventBus.on("analysisResultLoaded", (item) => {
    renderAnalysisDetails(item);
  });

  eventBus.on("responseRegenerated", ({ newResponse }) => {
    if (currentItem) {
      currentItem.resposta_sugerida = newResponse;
      document.getElementById("text-view-content").textContent = newResponse;
    }
  });

  contentPanel.addEventListener("click", setupContentInteractions);
}

