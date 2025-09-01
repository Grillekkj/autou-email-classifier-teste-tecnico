import { eventBus } from "../../core/eventBus.js";

const itemTemplate = document.getElementById("history-item-template");
const zipTemplate = document.getElementById("zip-container-template");
const fileTypeFilter = document.getElementById("file-type-filter");
const historyList = document.getElementById("history-list");

const state = {
  fullHistory: [],
  searchQuery: "",
  filters: {
    category: null,
    fileType: null,
  },
};

function populateFileTypeFilter() {
  const fileTypes = new Set();
  state.fullHistory.forEach((item) => {
    if (item.is_zip) {
      item.arquivos_internos.forEach((sub) => fileTypes.add(sub.tipo_arquivo));
    } else {
      fileTypes.add(item.tipo_arquivo);
    }
  });

  while (fileTypeFilter.options.length > 1) {
    fileTypeFilter.remove(1);
  }

  [...fileTypes].sort().forEach((type) => {
    const option = new Option(type.toUpperCase(), type);
    fileTypeFilter.add(option);
  });
}

function applyFiltersAndRender() {
  const query = state.searchQuery.toLowerCase().trim();
  const { category, fileType } = state.filters;

  const itemMatchesFilters = (item) => {
    const categoryMatch = !category || item.categoria === category;
    const fileTypeMatch = !fileType || item.tipo_arquivo === fileType;
    const textMatch =
      !query ||
      item.assunto.toLowerCase().includes(query) ||
      (item.resumo || "").toLowerCase().includes(query);
    return categoryMatch && fileTypeMatch && textMatch;
  };

  const filteredHistory = state.fullHistory
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((item) => {
      if (item.is_zip) {
        const matchingChildren =
          item.arquivos_internos.filter(itemMatchesFilters);
        if (matchingChildren.length > 0) {
          item.arquivos_internos_filtrados = matchingChildren;
          return true;
        }
        return false;
      }
      return itemMatchesFilters(item);
    });

  render(filteredHistory);
  updateFilterButtonsUI();
}

function updateFilterButtonsUI() {
  const container = document.querySelector(".filter-container");
  const buttons = container.querySelectorAll(".filter-btn:not(.clear-filters)");
  const clearBtn = document.getElementById("clear-filters-btn");

  buttons.forEach((btn) => {
    btn.classList.toggle(
      "active",
      state.filters.category === btn.dataset.filterValue
    );
  });

  fileTypeFilter.classList.toggle("active", !!state.filters.fileType);

  const hasActiveFilter =
    state.filters.category || state.filters.fileType || state.searchQuery;
  clearBtn.style.display = hasActiveFilter ? "inline-block" : "none";
}

function createHistoryItemPreview(item, historyIndex, subIndex = null) {
  const clone = itemTemplate.content.cloneNode(true);
  const preview = clone.querySelector(".history-item-preview");
  preview.dataset.historyId = historyIndex;
  if (subIndex !== null) preview.dataset.subId = subIndex;

  preview.querySelector(".history-item-subject").textContent = item.assunto;
  preview.querySelector(".history-item-timestamp").textContent =
    item.timestamp || "";
  preview.querySelector(".history-item-summary").textContent =
    (item.resumo || "").substring(0, 70) + "...";
  const categoryBadge = preview.querySelector(".category-badge");
  categoryBadge.textContent = item.categoria;
  categoryBadge.className = `category-badge category-badge-${item.categoria}`;
  preview.querySelector(".file-type-badge").textContent = item.tipo_arquivo;

  const deleteBtn = preview.querySelector(".delete-history-btn");
  deleteBtn.dataset.historyId = historyIndex;
  if (subIndex !== null) deleteBtn.dataset.subId = subIndex;

  return preview;
}

function createZipHistoryItem(item, historyIndex) {
  const clone = zipTemplate.content.cloneNode(true);
  const zipContainer = clone.querySelector(".history-item-zip-container");
  const header = zipContainer.querySelector(".history-item-zip-header");
  const subList = zipContainer.querySelector(".zip-file-list");
  const summaryEl = zipContainer.querySelector(".history-item-summary");

  zipContainer.dataset.historyId = historyIndex;
  header.dataset.historyId = historyIndex;

  zipContainer.querySelector(".history-item-subject").textContent =
    item.assunto;
  zipContainer.querySelector(".history-item-timestamp").textContent =
    item.timestamp;

  const children = item.arquivos_internos_filtrados || item.arquivos_internos;
  const isFilterActive =
    state.searchQuery || state.filters.category || state.filters.fileType;

  if (isFilterActive) {
    summaryEl.textContent = `${children.length} de ${item.arquivos_internos.length} e-mails correspondentes.`;
  } else {
    summaryEl.textContent = `${item.arquivos_internos.length} e-mails no ficheiro.`;
  }

  const deleteBtn = zipContainer.querySelector(".delete-history-btn");
  deleteBtn.dataset.historyId = historyIndex;

  children.forEach((subItem) => {
    const originalSubIndex = item.arquivos_internos.findIndex(
      (original) => original === subItem
    );
    const subElement = createHistoryItemPreview(
      subItem,
      historyIndex,
      originalSubIndex
    );
    subList.appendChild(subElement);
  });

  if (isFilterActive) {
    zipContainer.classList.add("expanded");
    subList.style.display = "flex";
  }

  return zipContainer;
}

function render(historyToRender) {
  historyList.innerHTML =
    !historyToRender || historyToRender.length === 0
      ? '<p class="empty-history">Nenhum item encontrado.</p>'
      : "";

  historyToRender.forEach((item) => {
    const element = item.is_zip
      ? createZipHistoryItem(item, item.originalIndex)
      : createHistoryItemPreview(item, item.originalIndex);
    historyList.appendChild(element);
  });
}

function handleSidebarClick(e) {
  const target = e.target;
  const deleteBtn = target.closest(".delete-history-btn");
  if (deleteBtn) {
    e.stopPropagation();
    const historyId = parseInt(deleteBtn.dataset.historyId, 10);
    const subId = deleteBtn.dataset.subId
      ? parseInt(deleteBtn.dataset.subId, 10)
      : null;
    eventBus.emit("deleteHistoryRequested", { historyId, subId });
    return;
  }

  const zipHeader = target.closest(".history-item-zip-header");
  if (zipHeader) {
    e.stopPropagation();
    const container = zipHeader.closest(".history-item-zip-container");
    container.classList.toggle("expanded");
    container.querySelector(".zip-file-list").style.display =
      container.classList.contains("expanded") ? "flex" : "none";
    return;
  }

  const historyItem = target.closest(".history-item-preview");
  if (historyItem) {
    e.stopPropagation();
    const historyId = parseInt(historyItem.dataset.historyId, 10);
    const subId = historyItem.dataset.subId
      ? parseInt(historyItem.dataset.subId, 10)
      : null;
    eventBus.emit("historyItemSelected", {
      historyId,
      subId,
      element: historyItem,
    });
  }
}

function clearAllFilters() {
  state.filters.category = null;
  state.filters.fileType = null;
  state.searchQuery = "";

  document.getElementById("history-search-input").value = "";
  fileTypeFilter.value = "";

  applyFiltersAndRender();
}

export function init() {
  const searchInput = document.getElementById("history-search-input");
  const filterContainer = document.querySelector(".filter-container");

  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    applyFiltersAndRender();
  });

  filterContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    if (btn.id === "clear-filters-btn") {
      clearAllFilters();
    } else {
      const value = btn.dataset.filterValue;
      state.filters.category = state.filters.category === value ? null : value;
      applyFiltersAndRender();
    }
  });

  fileTypeFilter.addEventListener("change", (e) => {
    state.filters.fileType = e.target.value || null;
    applyFiltersAndRender();
  });

  historyList.addEventListener("click", handleSidebarClick);

  eventBus.on("historyUpdated", (newHistory) => {
    state.fullHistory = newHistory;
    populateFileTypeFilter();
    applyFiltersAndRender();
  });
}

