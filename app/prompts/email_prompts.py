def get_subject_prompt(email_text: str) -> str:
    return f"""
    Com base no conteúdo do e-mail abaixo, crie um assunto curto e descritivo de no máximo 5 palavras.

    Retorne APENAS o assunto.

    E-mail: "{email_text}"

    Assunto Sugerido:
    """


def get_classification_prompt(email_text: str) -> str:
    return f"""
    Analise o seguinte e-mail e classifique-o como 'produtivo' ou 'improdutivo'.
    - 'produtivo': se o e-mail requer uma ação, resposta ou atenção.
    - 'improdutivo': se o e-mail é um spam, notificação automática, newsletter ou não requer ação.

    E-mail: "{email_text}"

    Classificação:
    """


def get_response_prompt(email_text: str) -> str:
    return f"""
    Você é um assistente de e-mail profissional.
    Com base no e-mail abaixo, gere uma resposta curta, educada e profissional em português.

    E-mail: "{email_text}"

    Sugestão de Resposta:
    """


def get_simple_response_prompt(email_text: str) -> str:
    return f"""
    O e-mail abaixo foi classificado como algo que não precisa de uma ação complexa (como um aviso ou notificação).
    Gere uma resposta profissional, curta e educada, apenas para confirmar o recebimento.
    Exemplos: "Ciente, obrigado.", "Recebido, agradeço o aviso.", "Ok, obrigado por me manter informado."

    E-mail: "{email_text}"

    Sugestão de Resposta Curta:
    """


def get_summary_prompt(email_text: str) -> str:
    return f"""
    Resuma o seguinte e-mail em, no máximo, 3 linhas, capturando o assunto principal e a necessidade do remetente.

    E-mail: "{email_text}"

    Resumo:
    """
