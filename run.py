import subprocess
import sys
import nltk
import spacy
from app import create_app


def setup_downloads():
    print("Iniciando setup do ambiente de NLP...")

    # ===============================
    # NLTK
    # ===============================
    print("\nBaixando pacotes NLTK necessários...")
    nltk_packages = ["punkt", "stopwords"]
    for pkg in nltk_packages:
        nltk.download(pkg)
    print("Pacotes NLTK baixados com sucesso!")

    # ===============================
    # spaCy PT-BR
    # ===============================
    print("\nVerificando modelo spaCy pt_core_news_sm...")
    try:
        spacy.load("pt_core_news_sm")
        print("Modelo pt_core_news_sm já está instalado!")
    except OSError:
        print("Modelo pt_core_news_sm não encontrado. Instalando...")
        subprocess.check_call(
            [
                sys.executable,
                "-m",
                "spacy",
                "download",
                "pt_core_news_sm",
            ]
        )
        print("Modelo pt_core_news_sm instalado com sucesso!")

    print("\nSetup concluído! Ambiente pronto para rodar o projeto.")


# --- Ponto de Entrada da Aplicação ---
if __name__ == "__main__":
    # 1. Garante que os modelos de linguagem estão prontos
    setup_downloads()

    # 2. Cria e executa a aplicação Flask
    print("\nIniciando a aplicação Flask...")
    app = create_app()
    app.run(debug=True)
