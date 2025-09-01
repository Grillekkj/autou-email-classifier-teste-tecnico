import { showInfoModal } from "./ui/info_modal.js";
import { getSettings } from "./settings.js";
import { getUserId } from "./user.js";

async function makeRequest(url, body) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error || "Ocorreu um erro na comunicação com a API."
      );
    }
    return data;
  } catch (error) {
    console.error(`Erro em ${url}:`, error);
    await showInfoModal(
      "Erro de Comunicação",
      "Não foi possível processar a solicitação: " + error.message
    );
    return null;
  }
}

export async function processEmail(formData, isFile) {
  const url = "/processar-email";
  const settings = getSettings();
  const userId = getUserId();

  if (isFile) {
    formData.append("settings", JSON.stringify(settings));
    formData.append("userId", userId);
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Ocorreu um erro na comunicação com a API."
        );
      }
      return data;
    } catch (error) {
      console.error("Erro ao processar email (arquivo):", error);
      await showInfoModal(
        "Erro de Comunicação",
        "Não foi possível processar a solicitação: " + error.message
      );
      return null;
    }
  } else {
    const payload = {
      email_text: formData.get("email_text"),
      settings: settings,
      userId: userId,
    };
    return makeRequest(url, payload);
  }
}

export async function regenerateResponse(historyId, subId) {
  const payload = {
    settings: getSettings(),
    userId: getUserId(),
    historyId,
    subId,
  };
  return makeRequest("/regenerate-response", payload);
}

export async function deleteHistoryItem(historyId, subId) {
  const payload = {
    userId: getUserId(),
    historyId,
    subId,
  };
  return makeRequest("/delete-history-item", payload);
}

export async function getHistory() {
  return makeRequest("/get-history", { userId: getUserId() });
}

export async function fetchPageContent(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error("Não foi possível carregar o conteúdo: ", error);
    return "<p>Erro ao carregar. Tente novamente.</p>";
  }
}

