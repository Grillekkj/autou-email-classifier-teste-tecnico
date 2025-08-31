import { eventBus } from "../../core/eventBus.js";

const itemTemplate = document.getElementById("history-item-template");
const zipTemplate = document.getElementById("zip-container-template");
const historySidebar = document.getElementById("history-sidebar");

function createHistoryItemPreview(item, historyIndex, subIndex = null) {
  const clone = itemTemplate.content.cloneNode(true);
  const preview = clone.querySelector(".history-item-preview");

  preview.dataset.historyId = historyIndex;
  if (subIndex !== null) {
    preview.dataset.subId = subIndex;
  }

  preview.querySelector(".history-item-subject").textContent = item.assunto;
  preview.querySelector(".history-item-timestamp").textContent =
    item.timestamp || "";
  preview.querySelector(".history-item-summary").textContent =
    (item.resumo || "").substring(0, 70) +
    ((item.resumo || "").length > 70 ? "..." : "");

  const categoryBadge = preview.querySelector(".category-badge");
  categoryBadge.textContent = item.categoria;
  categoryBadge.className = `category-badge category-badge-${item.categoria}`;

  preview.querySelector(".file-type-badge").textContent = item.tipo_arquivo;

  const deleteBtn = preview.querySelector(".delete-history-btn");
  deleteBtn.dataset.historyId = historyIndex;
  if (subIndex !== null) {
    deleteBtn.dataset.subId = subIndex;
  }

  return preview;
}

function createZipHistoryItem(item, historyIndex) {
  const clone = zipTemplate.content.cloneNode(true);
  const zipContainer = clone.querySelector(".history-item-zip-container");
  const header = zipContainer.querySelector(".history-item-zip-header");
  const subList = zipContainer.querySelector(".zip-file-list");

  header.dataset.historyId = historyIndex;
  zipContainer.querySelector(".history-item-subject").textContent =
    item.assunto;
  zipContainer.querySelector(".history-item-timestamp").textContent =
    item.timestamp;
  zipContainer.querySelector(
    ".history-item-summary"
  ).textContent = `${item.arquivos_internos.length} e-mails no ficheiro.`;

  const deleteBtn = zipContainer.querySelector(".delete-history-btn");
  deleteBtn.dataset.historyId = historyIndex;

  item.arquivos_internos.forEach((subItem, subIndex) => {
    const subElement = createHistoryItemPreview(
      subItem,
      historyIndex,
      subIndex
    );
    subList.appendChild(subElement);
  });

  return zipContainer;
}

function render(history) {
  historySidebar.innerHTML = "";
  if (!history || history.length === 0) {
    historySidebar.innerHTML =
      '<p class="empty-history">Nenhum histórico ainda.</p>';
    return;
  }

  history.forEach((item, index) => {
    const element = item.is_zip
      ? createZipHistoryItem(item, index)
      : createHistoryItemPreview(item, index);
    historySidebar.appendChild(element);
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
    const subList = container.querySelector(".zip-file-list");
    const isExpanded = container.classList.toggle("expanded");
    subList.style.display = isExpanded ? "flex" : "none";

    if (isExpanded) {
      const historyId = parseInt(zipHeader.dataset.historyId, 10);
      const subId = 0;
      const firstItemElement = container.querySelector(
        `.history-item-preview[data-sub-id="0"]`
      );

      if (firstItemElement) {
        eventBus.emit("historyItemSelected", {
          historyId,
          subId,
          element: firstItemElement,
        });
      }
    } else {
      eventBus.emit("historyItemUnselected");
    }
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

export function init(initialHistory) {
  render(initialHistory);
  historySidebar.addEventListener("click", handleSidebarClick);
  eventBus.on("historyUpdated", (newHistory) => {
    render(newHistory);
  });
}

