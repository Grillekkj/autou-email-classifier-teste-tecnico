const state = {
  currentHistory: [],
  activeItemId: { historyId: null, subId: null },
};

export const appState = {
  getHistory: () => state.currentHistory,

  setHistory: (newHistory) => {
    state.currentHistory = newHistory;
  },

  getActiveItemId: () => state.activeItemId,

  setActiveItemId: (historyId, subId) => {
    state.activeItemId = { historyId, subId };
  },

  clearActiveItem: () => {
    state.activeItemId = { historyId: null, subId: null };
  },

  findItem: (historyId, subId) => {
    if (historyId === null || !state.currentHistory[historyId]) {
      return null;
    }
    if (subId !== null) {
      return state.currentHistory[historyId].arquivos_internos[subId] || null;
    }
    return state.currentHistory[historyId];
  },

  updateItemResponse: (newResponse) => {
    const { historyId, subId } = state.activeItemId;
    const itemToUpdate = appState.findItem(historyId, subId);

    if (itemToUpdate) {
      itemToUpdate.resposta_sugerida = newResponse;
    }
  },
};

