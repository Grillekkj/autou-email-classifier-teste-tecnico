// src/static/js/script.js
document.addEventListener("DOMContentLoaded", function () {
  const emailForm = document.getElementById("email-form");
  const emailText = document.getElementById("email-text");
  const emailFile = document.getElementById("email-file");
  const fileNameDisplay = document.getElementById("file-name");
  const analyzeButton = document.getElementById("analyze-button");
  const loadingSpinner = document.getElementById("loading");
  const resultsDiv = document.getElementById("results");
  const resultsContent = document.getElementById("results-content");
  const historySection = document.getElementById("history-section");
  const historyList = document.getElementById("history-list");

  emailFile.addEventListener("change", function () {
    if (this.files.length > 1) {
      fileNameDisplay.textContent = `${this.files.length} arquivos selecionados`;
    } else if (this.files.length === 1) {
      fileNameDisplay.textContent = this.files[0].name;
    } else {
      fileNameDisplay.textContent = "Nenhum arquivo selecionado";
    }
    if (this.files.length > 0) emailText.value = "";
  });

  emailText.addEventListener("input", function () {
    if (this.value.trim() !== "") {
      emailFile.value = "";
      fileNameDisplay.textContent = "Nenhum arquivo selecionado";
    }
  });

  emailForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!emailText.value.trim() && emailFile.files.length === 0) {
      alert(
        "Por favor, digite o texto do email ou selecione um ou mais arquivos."
      );
      return;
    }

    analyzeButton.disabled = true;
    analyzeButton.textContent = "Analisando...";
    loadingSpinner.style.display = "block";
    resultsDiv.style.display = "none";
    historySection.style.display = "none";

    const formData = new FormData();
    let requestOptions;

    if (emailFile.files.length > 0) {
      for (const file of emailFile.files) {
        formData.append("email_file", file);
      }
      requestOptions = { method: "POST", body: formData };
    } else {
      requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_text: emailText.value.trim() }),
      };
    }

    try {
      const response = await fetch("/processar-email", requestOptions);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Ocorreu um erro desconhecido.");

      const { analises, historico } = data;

      resultsContent.innerHTML = ""; // Limpa resultados anteriores
      if (analises && analises.length > 0) {
        analises.forEach((item) => {
          const resultItem = document.createElement("div");
          resultItem.className = "results-box";
          resultItem.innerHTML = `
            <div class="results-header">
              <h3>Assunto: ${item.assunto}</h3>
              <span class="file-type-badge">${item.tipo_arquivo}</span>
            </div>
            <p><strong>Categoria:</strong> ${item.categoria}</p>
            <p><strong>Resumo:</strong></p>
            <div class="response-text summary-text">${item.resumo}</div>
            <p><strong>Resposta Sugerida:</strong></p>
            <div class="response-text">${item.resposta_sugerida}</div>
          `;
          resultsContent.appendChild(resultItem);
        });
        resultsDiv.style.display = "block";
      }

      updateHistory(historico);
    } catch (error) {
      alert("Erro ao processar a solicitação: " + error.message);
    } finally {
      analyzeButton.disabled = false;
      analyzeButton.textContent = "Analisar";
      loadingSpinner.style.display = "none";
    }
  });

  function updateHistory(historyData) {
    historyList.innerHTML = "";
    if (historyData && historyData.length > 0) {
      historyData.forEach((item) => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        if (item.is_zip) {
          // Renderização para item de ZIP
          historyItem.classList.add("history-item-zip");
          let filesHtml = "";
          item.arquivos_internos.forEach((subItem) => {
            filesHtml += `
              <div class="history-item-inner">
                <div class="history-item-header-text">
                    <strong>${subItem.assunto} (${subItem.categoria})</strong>
                    <span class="file-type-badge">${subItem.tipo_arquivo}</span>
                </div>
                 <p><strong>Resumo:</strong> ${subItem.resumo}</p>
                 <p><strong>Resposta Sugerida:</strong> ${subItem.resposta_sugerida}</p>
                 <hr>
                 <p><strong>Email Original:</strong></p>
                 <pre>${subItem.email_original}</pre>
              </div>
            `;
          });

          historyItem.innerHTML = `
            <div class="history-item-header">
              <div class="history-item-header-text">
                <strong>${item.assunto}</strong>
                <span class="file-type-badge count-badge">${item.quantidade} arquivos</span>
              </div>
              <button class="toggle-button">Ver Detalhes</button>
            </div>
            <div class="history-item-content" style="display: none;">
              ${filesHtml}
            </div>`;
        } else {
          // Renderização para item normal
          historyItem.innerHTML = `
            <div class="history-item-header">
              <div class="history-item-header-text">
                <strong>${item.assunto} (${item.categoria})</strong>
                <span class="file-type-badge">${item.tipo_arquivo}</span>
              </div>
              <button class="toggle-button">Ver Detalhes</button>
            </div>
            <div class="history-item-content" style="display: none;">
              <p><strong>Resumo:</strong> ${item.resumo}</p>
              <p><strong>Resposta Sugerida:</strong> ${item.resposta_sugerida}</p>
              <hr>
              <p><strong>Email Original:</strong></p>
              <pre>${item.email_original}</pre>
            </div>`;
        }
        historyList.appendChild(historyItem);
      });

      historyList.querySelectorAll(".toggle-button").forEach((button) => {
        button.addEventListener("click", function () {
          const content = this.parentElement.parentElement.querySelector(
            ".history-item-content"
          );
          const isVisible = content.style.display === "block";
          content.style.display = isVisible ? "none" : "block";
          this.textContent = isVisible ? "Ver Detalhes" : "Ocultar Detalhes";
        });
      });
      historySection.style.display = "block";
    }
  }

  if (typeof initialHistory !== "undefined" && initialHistory.length > 0) {
    updateHistory(initialHistory);
  }
});
