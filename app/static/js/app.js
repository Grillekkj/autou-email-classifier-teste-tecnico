import { showConfirmationModal } from "./modules/ui/confirmation_modal.js";
import { initializeSettingsPage } from "./modules/settings.js";
import * as historyUI from "./modules/ui/history.js";
import * as contentUI from "./modules/ui/content.js";
import * as stateUI from "./modules/ui/state.js";
import * as events from "./modules/events.js";
import { eventBus } from "./core/eventBus.js";
import {
  fetchPageContent,
  deleteHistoryItem,
  getHistory,
} from "./modules/api.js";

document.addEventListener("DOMContentLoaded", function () {
  const appState = {
    currentHistory: [],
    activeItemId: { historyId: null, subId: null },
  };

  async function loadInitialHistory() {
    stateUI.setLoading(true);
    const data = await getHistory();
    stateUI.setLoading(false);
    if (data?.historico) {
      appState.currentHistory = data.historico;
      eventBus.emit("historyUpdated", appState.currentHistory);
    }
  }

  async function loadPage(url) {
    stateUI.setActiveItem(null);
    const content = await fetchPageContent(url);
    eventBus.emit("contentUpdated", content);

    if (url.includes("/settings")) {
      initializeSettingsPage();
    }
  }

  function handleAnalysisComplete(data) {
    appState.currentHistory = data.historico;
    eventBus.emit("historyUpdated", appState.currentHistory);

    const newResult = appState.currentHistory[0];
    let itemToSelect = null;

    if (newResult?.is_zip && newResult.arquivos_internos.length > 0) {
      const zipContainer = document.querySelector(
        `.history-item-zip-container .history-item-zip-header[data-history-id="0"]`
      ).parentElement;
      itemToSelect = zipContainer.querySelector(
        `.history-item-preview[data-sub-id="0"]`
      );

      if (zipContainer && !zipContainer.classList.contains("expanded")) {
        zipContainer.classList.add("expanded");
        zipContainer.querySelector(".zip-file-list").style.display = "flex";
      }
    } else if (newResult) {
      itemToSelect = document.querySelector(
        `.history-item-preview[data-history-id="0"]`
      );
    }

    if (itemToSelect) {
      const historyId = parseInt(itemToSelect.dataset.historyId, 10);
      const subId = itemToSelect.dataset.subId
        ? parseInt(itemToSelect.dataset.subId, 10)
        : null;
      eventBus.emit("historyItemSelected", {
        historyId,
        subId,
        element: itemToSelect,
      });
    } else {
      loadPage("/landing");
    }
  }

  eventBus.on("navigate", (url) => {
    loadPage(url);
  });

  eventBus.on("historyItemSelected", ({ historyId, subId, element }) => {
    if (element?.classList.contains("history-item-zip-container")) {
      loadPage("/landing");
      stateUI.setActiveItem(element);
      return;
    }

    appState.activeItemId = { historyId, subId };
    const itemData =
      subId !== null
        ? appState.currentHistory[historyId].arquivos_internos[subId]
        : appState.currentHistory[historyId];

    eventBus.emit("analysisResultLoaded", { ...itemData, historyId, subId });
    stateUI.setActiveItem(element);
  });

  eventBus.on("responseRegenerated", ({ newResponse }) => {
    const { historyId, subId } = appState.activeItemId;

    if (historyId !== null) {
      let itemToUpdate;
      if (subId !== null) {
        itemToUpdate =
          appState.currentHistory[historyId].arquivos_internos[subId];
      } else {
        itemToUpdate = appState.currentHistory[historyId];
      }

      if (itemToUpdate) {
        itemToUpdate.resposta_sugerida = newResponse;
      }
    }
  });

  eventBus.on("historyItemUnselected", () => {
    loadPage("/landing");
    stateUI.setActiveItem(null);
  });

  eventBus.on("deleteHistoryRequested", async ({ historyId, subId }) => {
    const confirmed = await showConfirmationModal(
      "Confirmar Exclusão",
      "Tem certeza de que deseja excluir este item?"
    );
    if (!confirmed) return;

    stateUI.setLoading(true);
    const result = await deleteHistoryItem(historyId, subId);
    stateUI.setLoading(false);

    if (result) {
      const wasActiveItemDeleted =
        appState.activeItemId.historyId === historyId &&
        appState.activeItemId.subId === subId;

      appState.currentHistory = result.historico;
      eventBus.emit("historyUpdated", appState.currentHistory);

      setTimeout(() => {
        if (wasActiveItemDeleted) {
          if (subId !== null) {
            const zipContainer = document.querySelector(
              `.history-item-zip-container .history-item-zip-header[data-history-id="${historyId}"]`
            );

            if (zipContainer) {
              const container = zipContainer.closest(
                ".history-item-zip-container"
              );
              if (!container.classList.contains("expanded")) {
                container.classList.add("expanded");
                container.querySelector(".zip-file-list").style.display =
                  "flex";
              }

              const firstItemElement = container.querySelector(
                `.history-item-preview[data-sub-id="0"]`
              );
              if (firstItemElement) {
                eventBus.emit("historyItemSelected", {
                  historyId: historyId,
                  subId: 0,
                  element: firstItemElement,
                });
              }
            } else {
              loadPage("/landing");
              appState.activeItemId = { historyId: null, subId: null };
            }
          } else {
            loadPage("/landing");
            appState.activeItemId = { historyId: null, subId: null };
          }
        }
      }, 0);
    }
  });

  async function init() {
    historyUI.init(appState.currentHistory);
    contentUI.init();

    events.setupNavigation(loadPage);
    events.initializeModal(handleAnalysisComplete);
    events.initializeFileUploadButton(handleAnalysisComplete);
    events.setupSidebarToggle();

    await loadInitialHistory();
    loadPage("/landing");
  }

  init();
});

