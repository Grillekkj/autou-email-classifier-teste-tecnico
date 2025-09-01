import subprocess
import spacy
import nltk
import sys
import os

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
            [sys.executable, "-m", "spacy", "download", "pt_core_news_sm"]
        )
        print("Modelo pt_core_news_sm instalado com sucesso!")

    print("\nSetup concluído! Ambiente pronto para rodar o projeto.")


if __name__ == "__main__":
    if "--setup" in sys.argv:
        setup_downloads()

    if "--prod" in sys.argv:
        port = os.environ.get("PORT", "5000")
        print(f"Iniciando aplicação em produção com Gunicorn na porta {port}...")
        subprocess.run(
            [
                sys.executable,
                "-m",
                "gunicorn",
                "-w",
                "1",
                "-b",
                f"0.0.0.0:{port}",
                "app:create_app()",
            ]
        )
    else:
        print("\nIniciando a aplicação Flask em desenvolvimento...")
        app = create_app()
        app.run(debug=True)
