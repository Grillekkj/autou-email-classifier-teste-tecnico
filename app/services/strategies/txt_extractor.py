import re

from .base_extractor import FileExtractor


class TxtExtractor(FileExtractor):
    def extract(self, file):
        try:
            full_text = file.read().decode("utf-8")
            match = re.search(
                r"^(Assunto|Subject):\s*(.*)", full_text, re.MULTILINE | re.IGNORECASE
            )
            subject = match.group(2).strip() if match else None
            return full_text, subject
        except Exception as e:
            print(f"Erro ao ler o TXT: {e}")
            return "Erro ao processar o arquivo TXT.", None
