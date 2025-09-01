import { showConfirmationModal } from "./ui/confirmation_modal.js";

const defaultPrompts = {
  subject: `Você é um assistente de e-mails profissionais.\nCom base no conteúdo do e-mail abaixo, gere um assunto curto e descritivo.\n\nMODO DE SAÍDA (estrito):\n- O assunto deve ter no máximo 5 palavras.\n- Retorne APENAS o texto do assunto.\n- Não adicione explicações, comentários, aspas, markdown ou qualquer outro elemento.\n\nE-mail recebido: "{email_text}"\n\nAssunto sugerido:`,

  classification: `Você é um assistente de e-mails profissionais.\nAnalise o e-mail abaixo e classifique-o como 'produtivo' ou 'improdutivo'.\n\nDefinições:\n- 'produtivo': o e-mail requer ação, resposta ou atenção do destinatário.\n- 'improdutivo': o e-mail é spam, notificação automática, newsletter ou não requer ação.\n\nMODO DE SAÍDA (estrito):\n- Retorne APENAS uma das palavras: 'produtivo' ou 'improdutivo'.\n- Não adicione explicações, comentários ou qualquer outro texto.\n\nE-mail recebido: "{email_text}"\n\nClassificação:`,

  response: `Você é um assistente de e-mails profissionais.\nSua tarefa é gerar uma resposta curta, educada e profissional em português brasileiro, com base no e-mail fornecido.\n\nMODO DE SAÍDA (estrito):\n- Retorne SOMENTE um objeto JSON válido.\n- Não use blocos de código, crases/markdown, tags, prefixos ou sufixos.\n- A primeira linha da resposta deve começar com '{{' e a última linha deve terminar com '}}'.\n- Não inclua linhas em branco antes ou depois do JSON.\n\nEstrutura do JSON a ser preenchida:\n{\n  "Saudação": "[SAUDAÇÃO GERADA]",\n  "Corpo Email": "[CORPO GERADO]",\n  "Assinatura": "[ASSINATURA GERADA]"\n}\n\nRegras de conteúdo:\n- A saudação deve ser apropriada ao contexto (ex.: "Olá" ou "Prezado").\n- O corpo deve ser objetivo, cordial e com tom profissional.\n- A assinatura deve ser um encerramento formal simples (ex.: "Atenciosamente," ou "Cordialmente,").\n\nE-mail recebido: "{email_text}"\n\nSugestão de resposta:`,

  simple_response: `Você é um assistente de e-mails profissionais.\nO e-mail abaixo foi classificado como algo que não precisa de uma ação complexa (ex.: aviso ou notificação).\nGere uma resposta curta, educada e profissional em português brasileiro apenas para confirmar o recebimento e/ou pedir esclarecimento.\n\nMODO DE SAÍDA (estrito):\n- Retorne SOMENTE um objeto JSON válido.\n- Não use blocos de código, crases/markdown, tags, prefixos ou sufixos.\n- A primeira linha da resposta deve começar com '{{' e a última linha deve terminar com '}}'.\n- Não inclua linhas em branco antes ou depois do JSON.\n\nEstrutura do JSON a ser preenchida:\n{\n  "Saudação": "[SAUDAÇÃO GERADA]",\n  "Corpo Email": "[CORPO GERADO]",\n  "Assinatura": "[ASSINATURA GERADA]"\n}\n\nRegras de conteúdo:\n- A saudação deve ser apropriada ao contexto (ex.: "Olá" ou "Prezado").\n- O corpo deve ser curto, confirmando recebimento e/ou solicitando esclarecimento de forma cordial.\n- A assinatura deve ser um encerramento formal simples (ex.: "Atenciosamente," ou "Cordialmente,").\n\nE-mail recebido: "{email_text}"\n\nSugestão de resposta:`,

  summary: `Você é um assistente de e-mails profissionais.\nSua tarefa é gerar um resumo curto e objetivo do e-mail abaixo.\n\nMODO DE SAÍDA (estrito):\n- O resumo deve ter no máximo 3 linhas.\n- Capture apenas o assunto principal e a necessidade do remetente.\n- Não adicione comentários, explicações ou formatações extras.\n- Retorne somente o texto do resumo, nada além.\n\nE-mail recebido: "{email_text}"\n\nResumo:`,
};

const SETTINGS_KEY = "inboxFlowUserSettings";

export function getSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    const settings = JSON.parse(saved);
    if (!settings.hasOwnProperty("greeting")) {
      settings.greeting = "";
    }
    return settings;
  }

  return {
    greeting: "",
    signature: "",
    models: {
      classification: "gemini-1.5-flash",
      summary: "gemini-1.5-flash",
      subject: "gemini-1.5-flash",
      response: "gemini-1.5-flash",
    },
    prompts: {
      summary: "",
      classification: "",
      response: "",
      simple_response: "",
      subject: "",
    },
  };
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function populateForm() {
  const settings = getSettings();

  document.getElementById("setting-greeting").value = settings.greeting;
  document.getElementById("setting-signature").value = settings.signature;

  for (const key in settings.models) {
    const select = document.getElementById(`setting-model-${key}`);
    if (select) select.value = settings.models[key];
  }

  for (const key in settings.prompts) {
    const textarea = document.getElementById(
      `setting-prompt-${key.replace("_", "-")}`
    );
    if (textarea) {
      textarea.value = settings.prompts[key];
      textarea.placeholder = defaultPrompts[key];
    }
  }
}

export function initializeSettingsPage() {
  const form = document.getElementById("settings-form");
  if (!form) return;

  populateForm();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const settings = getSettings();

    settings.greeting = document.getElementById("setting-greeting").value;
    settings.signature = document.getElementById("setting-signature").value;

    for (const key in settings.models) {
      settings.models[key] = document.getElementById(
        `setting-model-${key}`
      ).value;
    }

    for (const key in settings.prompts) {
      settings.prompts[key] = document.getElementById(
        `setting-prompt-${key.replace("_", "-")}`
      ).value;
    }

    saveSettings(settings);

    const confirmation = document.getElementById("save-confirmation");
    confirmation.textContent = "Configurações salvas!";
    confirmation.style.opacity = "1";
    setTimeout(() => {
      confirmation.style.opacity = "0";
    }, 3000);
  });

  const resetButton = document.getElementById("reset-settings-btn");
  resetButton.addEventListener("click", async () => {
    const confirmed = await showConfirmationModal(
      "Restaurar Padrões",
      "Tem certeza que deseja restaurar todas as configurações para o padrão?"
    );

    if (confirmed) {
      localStorage.removeItem(SETTINGS_KEY);
      populateForm();
    }
  });
}

