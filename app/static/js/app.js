import { showConfirmationModal } from "./modules/ui/confirmation_modal.js";
import { initializeSettingsPage } from "./modules/settings.js";
import * as historyUI from "./modules/ui/history.js";
import * as contentUI from "./modules/ui/content.js";
import * as stateUI from "./modules/ui/state.js";
import * as domEvents from "./modules/events.js";
import { appState } from "./modules/appState.js";
import { eventBus } from "./core/eventBus.js";
import * as api from "./modules/api.js";

async function loadPage(url) {
  stateUI.setActiveItem(null);
  appState.clearActiveItem();

  const content = await api.fetchPageContent(url);
  eventBus.emit("contentUpdated", content);

  if (url.includes("/settings")) {
    initializeSettingsPage();
  }
}

async function loadInitialHistory() {
  stateUI.setLoading(true);
  const data = await api.getHistory();
  stateUI.setLoading(false);

  if (data?.historico) {
    appState.setHistory(data.historico);
    eventBus.emit("historyUpdated", appState.getHistory());
  }
}

function handleHistorySelection({ historyId, subId, element }) {
  if (element?.classList.contains("history-item-zip-container")) {
    loadPage("/landing");
    stateUI.setActiveItem(element);
    return;
  }

  appState.setActiveItemId(historyId, subId);
  const itemData = appState.findItem(historyId, subId);

  if (itemData) {
    eventBus.emit("analysisResultLoaded", { ...itemData, historyId, subId });
    stateUI.setActiveItem(element);
  }
}

function selectFirstHistoryItem(newHistory) {
  const newResult = newHistory[0];
  if (!newResult) {
    loadPage("/landing");
    return;
  }

  let itemToSelect;
  let historyId = 0;
  let subId = null;

  if (newResult.is_zip && newResult.arquivos_internos.length > 0) {
    const zipContainer = document.querySelector(
      `.history-item-zip-container[data-history-id="0"]`
    );
    if (zipContainer && !zipContainer.classList.contains("expanded")) {
      zipContainer.classList.add("expanded");
      zipContainer.querySelector(".zip-file-list").style.display = "flex";
    }
    itemToSelect = zipContainer?.querySelector(
      `.history-item-preview[data-sub-id="0"]`
    );
    subId = 0;
  } else {
    itemToSelect = document.querySelector(
      `.history-item-preview[data-history-id="0"]`
    );
  }

  if (itemToSelect) {
    eventBus.emit("historyItemSelected", {
      historyId,
      subId,
      element: itemToSelect,
    });
  } else {
    loadPage("/landing");
  }
}

function handleAnalysisComplete(data) {
  appState.setHistory(data.historico);
  eventBus.emit("historyUpdated", appState.getHistory());

  requestAnimationFrame(() => {
    selectFirstHistoryItem(data.historico);
  });
}

function handlePostDeletionUI(oldHistoryId, oldSubId) {
  if (oldSubId === null) {
    loadPage("/landing");
    return;
  }

  requestAnimationFrame(() => {
    const zipContainer = document.querySelector(
      `.history-item-zip-container[data-history-id="${oldHistoryId}"]`
    );

    if (zipContainer) {
      const firstItem = zipContainer.querySelector(
        '.history-item-preview[data-sub-id="0"]'
      );
      if (firstItem) {
        if (!zipContainer.classList.contains("expanded")) {
          zipContainer.classList.add("expanded");
          zipContainer.querySelector(".zip-file-list").style.display = "flex";
        }
        eventBus.emit("historyItemSelected", {
          historyId: parseInt(firstItem.dataset.historyId, 10),
          subId: parseInt(firstItem.dataset.subId, 10),
          element: firstItem,
        });
      }
    } else {
      loadPage("/landing");
    }
  });
}

async function handleDeleteRequest({ historyId, subId }) {
  const confirmed = await showConfirmationModal(
    "Confirmar Exclusão",
    "Tem certeza de que deseja excluir este item?"
  );
  if (!confirmed) return;

  stateUI.setLoading(true);
  const result = await api.deleteHistoryItem(historyId, subId);
  stateUI.setLoading(false);

  if (result) {
    const wasActive =
      appState.getActiveItemId().historyId === historyId &&
      appState.getActiveItemId().subId === subId;

    appState.setHistory(result.historico);
    eventBus.emit("historyUpdated", appState.getHistory());

    if (wasActive) {
      handlePostDeletionUI(historyId, subId);
    }
  }
}

function registerEventListeners() {
  eventBus.on("navigate", loadPage);
  eventBus.on("historyItemSelected", handleHistorySelection);
  eventBus.on("historyItemUnselected", () => loadPage("/landing"));
  eventBus.on("responseRegenerated", ({ newResponse }) =>
    appState.updateItemResponse(newResponse)
  );
  eventBus.on("deleteHistoryRequested", handleDeleteRequest);
}

async function init() {
  historyUI.init();
  contentUI.init();

  domEvents.setupNavigation((url) => eventBus.emit("navigate", url));
  domEvents.initializeModal(handleAnalysisComplete);
  domEvents.initializeFileUploadButton(handleAnalysisComplete);
  domEvents.setupSidebarToggle();

  registerEventListeners();

  await loadInitialHistory();
  loadPage("/landing");
}

document.addEventListener("DOMContentLoaded", init);

