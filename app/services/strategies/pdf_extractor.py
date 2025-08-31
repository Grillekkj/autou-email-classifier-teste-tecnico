import fitz
import re

from .base_extractor import FileExtractor


class PdfExtractor(FileExtractor):
    def extract(self, file):
        try:
            full_text = ""

            with fitz.open(stream=file.read(), filetype="pdf") as doc:

                full_text = "".join(page.get_text() for page in doc)

            if not full_text.strip():

                return "Erro: O PDF parece não conter texto legível.", None

            match = re.search(
                r"^(Assunto|Subject):\s*(.*)", full_text, re.MULTILINE | re.IGNORECASE
            )

            subject = match.group(2).strip() if match else None

            return full_text, subject
        except Exception as e:
            print(f"Erro ao ler o PDF: {e}")
            return "Erro ao processar o arquivo PDF.", None
