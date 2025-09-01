import { showConfirmationModal } from "./modules/ui/confirmation_modal.js";
import { initializeSettingsPage } from "./modules/settings.js";
import * as historyUI from "./modules/ui/history.js";
import * as contentUI from "./modules/ui/content.js";
import * as stateUI from "./modules/ui/state.js";
import * as domEvents from "./modules/events.js";
import { appState } from "./modules/appState.js";
import { eventBus } from "./core/eventBus.js";
import * as api from "./modules/api.js";

const itemsAreEqual = (item1, item2) =>
  item1 &&
  item2 &&
  item1.timestamp === item2.timestamp &&
  item1.assunto === item2.assunto;

function findItemInNewHistory(itemData, newHistory) {
  if (!itemData) return null;

  for (let i = 0; i < newHistory.length; i++) {
    const topLevelItem = newHistory[i];

    if (itemsAreEqual(topLevelItem, itemData)) {
      return { historyId: i, subId: null };
    }

    if (topLevelItem.is_zip) {
      const subIndex = topLevelItem.arquivos_internos.findIndex((subItem) =>
        itemsAreEqual(subItem, itemData)
      );

      if (subIndex !== -1) {
        return { historyId: i, subId: subIndex };
      }
    }
  }
  return null;
}

function handleDeletedActiveItem(deletedItemIds, newHistory) {
  if (deletedItemIds.subId !== null) {
    const parentZipIndex = deletedItemIds.historyId;
    const parentZip = newHistory[parentZipIndex];

    if (parentZip?.is_zip && parentZip.arquivos_internos.length > 0) {
      const element = document.querySelector(
        `.history-item-preview[data-history-id="${parentZipIndex}"][data-sub-id="0"]`
      );
      if (element) {
        const zipContainer = element.closest(".history-item-zip-container");
        if (zipContainer && !zipContainer.classList.contains("expanded")) {
          zipContainer.classList.add("expanded");
          zipContainer.querySelector(".zip-file-list").style.display = "flex";
        }
        eventBus.emit("historyItemSelected", {
          historyId: parentZipIndex,
          subId: 0,
          element,
        });
        return;
      }
    }
  }

  loadPage("/landing");
}

function handleRetainActiveItem(previouslyActiveItemData, newHistory) {
  const newIndices = findItemInNewHistory(previouslyActiveItemData, newHistory);

  if (newIndices) {
    const selector =
      `.history-item-preview[data-history-id="${newIndices.historyId}"]` +
      (newIndices.subId !== null ? `[data-sub-id="${newIndices.subId}"]` : "");
    const element = document.querySelector(selector);

    if (element) {
      stateUI.setActiveItem(element);
      appState.setActiveItemId(newIndices.historyId, newIndices.subId);
    } else {
      loadPage("/landing");
    }
  } else {
    loadPage("/landing");
  }
}

function handlePostDeletionUI(
  { wasActive, previouslyActiveItemData },
  deletedItemIds
) {
  requestAnimationFrame(() => {
    const newHistory = appState.getHistory();
    if (wasActive) {
      handleDeletedActiveItem(deletedItemIds, newHistory);
    } else {
      handleRetainActiveItem(previouslyActiveItemData, newHistory);
    }
  });
}

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

async function handleDeleteRequest({ historyId, subId }) {
  const confirmed = await showConfirmationModal(
    "Confirmar Exclusão",
    "Tem certeza de que deseja excluir este item?"
  );
  if (!confirmed) return;

  const deletionState = appState.prepareForDeletion(historyId, subId);

  stateUI.setLoading(true);
  const result = await api.deleteHistoryItem(historyId, subId);
  stateUI.setLoading(false);

  if (result) {
    appState.setHistory(result.historico);
    eventBus.emit("historyUpdated", appState.getHistory());
    handlePostDeletionUI(deletionState, { historyId, subId });
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

