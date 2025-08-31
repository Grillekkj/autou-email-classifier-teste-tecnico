import subprocess
import spacy
import nltk
import sys

from app import create_app


def setup_downloads():
    print("Iniciando setup do ambiente de NLP...")
    print("\nBaixando pacotes NLTK necessários...")
    nltk_packages = ["punkt", "stopwords"]
    for pkg in nltk_packages:
        nltk.download(pkg)
    print("Pacotes NLTK baixados com sucesso!")

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

if __name__ == "__main__":
    if "--setup" in sys.argv:
        setup_downloads()

    print("\nIniciando a aplicação Flask...")
    app = create_app()
    app.run(debug=True)
