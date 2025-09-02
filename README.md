# InboxFlow - Classificador de E-mails com IA

![Versão do Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![Flask](https://img.shields.io/badge/flask-3.0-green.svg)

O **InboxFlow** é uma aplicação web inteligente desenvolvida pela **AutoU** para otimizar a gestão da sua caixa de entrada. Utilizando o poder da IA generativa do Google Gemini, a ferramenta analisa o conteúdo de e-mails, classifica-os, gera resumos concisos e sugere respostas profissionais, permitindo que se concentre no que realmente importa.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Demonstração em Vídeo](#demonstração-em-vídeo)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Como Começar](#como-começar)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
- [Como Usar](#como-usar)
  - [Desenvolvimento](#desenvolvimento)
  - [Produção](#produção)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Autor](#autor)

## Sobre o Projeto

Este projeto foi desenhado para ser um assistente de e-mail poderoso e intuitivo. Ele aborda a sobrecarga de e-mails ao automatizar tarefas de rotina, como a triagem e a elaboração de respostas. Seja a colar o texto de um e-mail ou a fazer o upload de ficheiros, o InboxFlow processa a informação e apresenta uma análise completa em segundos.

## Demonstração em Vídeo

👉 Assista ao vídeo de demonstração no link abaixo:

[![Demo do InboxFlow](https://img.youtube.com/vi/LGKF7KLpoJc/maxresdefault.jpg)](https://www.youtube.com/watch?v=LGKF7KLpoJc)

## Tecnologias Utilizadas

A aplicação foi construída com um conjunto de tecnologias modernas e robustas:

- **Backend:**
  - **Python 3.10+**
  - **Flask:** Microframework web para construir a API e servir a aplicação.
  - **Gunicorn:** Servidor WSGI para implantação em produção.
- **Inteligência Artificial e NLP:**
  - **Google Gemini:** API para classificação, resumo e geração de respostas.
  - **spaCy & NLTK:** Bibliotecas para pré-processamento de texto em português.
- **Frontend:**
  - **HTML5**
  - **CSS3:** Estilização moderna com variáveis para temas (claro/escuro).
  - **JavaScript (Vanilla):** Para interatividade dinâmica da interface sem a necessidade de frameworks pesados.

## Principais Funcionalidades

- **Análise de E-mails:** Envie o conteúdo de um e-mail através de texto colado ou upload de ficheiros.
- **Suporte a Múltiplos Formatos:** Compatível com `.txt`, `.pdf`, `.eml`, `.msg` e até ficheiros `.zip` contendo múltiplos e-mails.
- **Classificação Inteligente:** Cada e-mail é automaticamente categorizado como `produtivo` (requer ação) ou `improdutivo` (spam, notificação, etc.).
- **Resumos e Respostas Automáticas:** A IA gera um resumo objetivo e sugere uma resposta profissional e contextualizada.
- **Histórico de Análises:** Todas as análises são guardadas localmente no navegador e apresentadas numa barra lateral, com funcionalidades de busca e filtro.
- **Personalização Avançada:**
  - Configure saudações e assinaturas padrão.
  - Escolha modelos de IA específicos para cada tarefa (classificação, resumo, etc.).
  - Edite os "prompts" enviados à IA para ajustar o tom e o estilo das respostas.
- **Tema Claro e Escuro:** Alterne facilmente entre os modos de visualização para maior conforto visual.

## Como Começar

Siga os passos abaixo para configurar e executar o projeto no seu ambiente local.

### Pré-requisitos

Certifique-se de que tem o Python e o pip instalados no seu sistema.

- **Python 3.10 ou superior**
- **pip** (geralmente vem com o Python)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Grillekkj/autou-email-classifier-teste-tecnico.git
    cd autou-email-classifier-teste-tecnico
    ```

2.  **Crie e ative um ambiente virtual (recomendado):**
    Um ambiente virtual isola as dependências do projeto.
    ```bash
    # Criar o ambiente
    python -m venv venv

    # Ativar no Windows
    .\venv\Scripts\activate

    # Ativar no macOS/Linux
    source venv/bin/activate
    ```

3.  **Instale as dependências:**
    O ficheiro `requirements.txt` contém todas as bibliotecas Python necessárias.
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure a sua chave de API:**
    A aplicação utiliza a API do Google Gemini.
    - Renomeie o ficheiro `.env.example` para `.env`.
    - Abra o ficheiro `.env` e insira a sua chave da API do Google Gemini.
    ```env
    GOOGLE_API_KEY="SUA_CHAVE_DE_API_AQUI"
    ```

5.  **Faça o download dos modelos de NLP:**
    O projeto utiliza NLTK e spaCy para processar o texto antes de o enviar para a IA. Execute o comando de setup para descarregar os pacotes necessários.
    ```bash
    python run.py --setup
    ```
    Este comando irá descarregar os pacotes `punkt` e `stopwords` do NLTK e o modelo `pt_core_news_sm` do spaCy.

## Como Usar

Depois da instalação, pode executar a aplicação de duas formas:

### Desenvolvimento

Para iniciar o servidor de desenvolvimento do Flask, que recarrega automaticamente após alterações no código:
```bash
python run.py
```

A aplicação estará disponível em `http://127.0.0.1:5000`.

### Produção

Para iniciar a aplicação com o Gunicorn, um servidor mais robusto e adequado para produção:

```bash
# Apenas linux
python run.py --prod
```

Este comando utiliza as configurações definidas para um ambiente de produção.

## Estrutura do Projeto

O projeto segue uma organização modular para facilitar a manutenção e escalabilidade:

```
autou-email-classifier-teste-tecnico/
├── app/
│   ├── controllers/    # Controladores que lidam com a lógica das rotas.
│   ├── domain/         # Definições das estruturas de dados (dataclasses).
│   ├── prompts/        # Módulo com os prompts enviados para a IA.
│   ├── routes/         # Definição das rotas (endpoints) da aplicação.
│   ├── services/       # Lógica de negócio (processamento, análise, histórico).
│   │   └── strategies/ # Padrão de projeto Strategy para extrair texto de diferentes tipos de ficheiro.
│   ├── static/         # Ficheiros estáticos (CSS, JS, imagens).
│   └── templates/      # Ficheiros HTML com Jinja2.
├── venv/               # Ambiente virtual (ignorado pelo .gitignore).
├── .env                # Ficheiro para variáveis de ambiente (chave de API).
├── .gitignore          # Ficheiros e pastas a serem ignorados pelo Git.
├── README.md           # Este ficheiro.
├── requirements.txt    # Dependências Python do projeto.
└── run.py              # Ponto de entrada para executar a aplicação.
```

## Autor

**João Victor Grille Santiago** - [grillejv@gmail.com](mailto:grillejv@gmail.com)

🔗 Live Demo: [https://autou-email-classifier-teste-tecnico.onrender.com/](https://autou-email-classifier-teste-tecnico.onrender.com/)  
⚠️ *Nota: pode ser necessário esperar entre **1-2 minutos** para o serviço no Render iniciar, caso esteja inativo por muito tempo.*
