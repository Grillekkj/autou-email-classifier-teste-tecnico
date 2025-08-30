import re
import spacy
from nltk.corpus import stopwords
import fitz
import email
from email import policy
import extract_msg
import os
import tempfile


class TextProcessingService:
    def __init__(self, language="portuguese"):
        self.language = language
        try:
            self.stop_words = set(stopwords.words(language))
        except LookupError:
            import nltk

            nltk.download("stopwords")
            self.stop_words = set(stopwords.words(language))
        self.nlp = spacy.load("pt_core_news_sm")

    def preprocess(self, text: str) -> str:
        text = self._clean_text(text)
        doc = self.nlp(text)
        processed_tokens = []
        for token in doc:
            if token.is_space or token.is_punct:
                continue
            if token.pos_ == "PROPN":
                processed_tokens.append(token.text)
                continue
            lemma = token.lemma_.lower()
            sub_tokens = lemma.split()
            for sub in sub_tokens:
                if sub not in self.stop_words and len(sub) > 1:
                    processed_tokens.append(sub)
        return " ".join(processed_tokens)

    def _clean_text(self, text: str) -> str:
        text = re.sub(r"[^A-Za-zÁÉÍÓÚÂÊÎÔÛÃÕÇáéíóúâêîôûãõç\s'-]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def extract_text(self, file):
        filename = file.filename

        if filename.endswith(".pdf"):
            return self._extract_from_pdf(file)
        elif filename.endswith(".txt"):
            return self._extract_from_txt(file)
        elif filename.endswith(".eml"):
            return self._extract_from_eml(file)
        elif filename.endswith(".msg"):
            return self._extract_from_msg(file)
        else:
            return "Formato de arquivo não suportado.", None

    def _extract_from_pdf(self, file):
        try:
            full_text = ""
            with fitz.open(stream=file.read(), filetype="pdf") as doc:
                full_text = "".join(page.get_text() for page in doc)

            if not full_text.strip():
                return "Erro ao processar: O PDF parece não conter texto legível.", None

            match = re.search(
                r"^(Assunto|Subject):\s*(.*)",
                full_text,
                re.MULTILINE | re.IGNORECASE,
            )
            subject = match.group(2).strip() if match else None
            return full_text, subject
        except Exception as e:
            print(f"Erro ao ler o PDF com PyMuPDF: {e}")
            return "Erro ao processar o arquivo PDF.", None

    def _extract_from_txt(self, file):
        try:
            full_text = file.read().decode("utf-8")
            match = re.search(
                r"^(Assunto|Subject):\s*(.*)",
                full_text,
                re.MULTILINE | re.IGNORECASE,
            )
            subject = match.group(2).strip() if match else None
            return full_text, subject
        except Exception as e:
            print(f"Erro ao ler o TXT: {e}")
            return "Erro ao processar o arquivo TXT.", None

    def _extract_from_eml(self, file):
        try:
            raw_email = file.read()
            msg = email.message_from_bytes(raw_email, policy=policy.default)
            subject = msg["subject"]
            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    ctype = part.get_content_type()
                    cdispo = str(part.get("Content-Disposition"))
                    if ctype == "text/plain" and "attachment" not in cdispo:
                        payload = part.get_payload(decode=True)
                        if payload:
                            body = payload.decode(errors="ignore")
                        break
            else:
                payload = msg.get_payload(decode=True)
                if payload:
                    body = payload.decode(errors="ignore")
            return body, subject
        except Exception as e:
            print(f"Erro ao ler o EML: {e}")
            return "Erro ao processar o arquivo EML.", None

    def _extract_from_msg(self, file):
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, file.filename)
        try:
            file.seek(0)
            with open(temp_path, "wb") as f:
                f.write(file.read())
            with extract_msg.openMsg(temp_path) as msg:
                subject = msg.subject
                body = msg.body
                return (
                    body.strip() if body else "O arquivo MSG não contém corpo legível."
                ), subject
        except Exception as e:
            print(f"Erro ao ler o MSG: {e}")
            return "Erro ao processar o arquivo MSG.", None
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
