import { getSettings } from "./settings.js";

export async function processEmail(formData, isFile) {
  const url = "/processar-email";
  const settings = getSettings();
  let requestOptions;

  if (isFile) {
    formData.append("settings", JSON.stringify(settings));
    requestOptions = {
      method: "POST",
      body: formData,
    };
  } else {
    const payload = {
      email_text: formData.get("email_text"),
      settings: settings,
    };
    requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };
  }

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error || "Ocorreu um erro na comunicação com a API."
      );
    }
    return data;
  } catch (error) {
    console.error("Erro ao processar email:", error);
    alert("Erro ao processar a solicitação: " + error.message);
    return null;
  }
}

export async function regenerateResponse(itemData, historyId, subId) {
  const url = "/regenerate-response";
  const settings = getSettings();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings,
        historyId,
        subId,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Ocorreu um erro ao regenerar a resposta.");
    }
    return data;
  } catch (error) {
    console.error("Erro ao regenerar resposta:", error);
    alert("Erro: " + error.message);
    return null;
  }
}

export async function deleteHistoryItem(historyId, subId) {
  const url = "/delete-history-item";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ historyId, subId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Ocorreu um erro ao excluir o item.");
    }
    return data;
  } catch (error) {
    console.error("Erro ao excluir item do histórico:", error);
    alert("Erro: " + error.message);
    return null;
  }
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

