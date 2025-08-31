from nltk.corpus import stopwords
import spacy
import re
import os

from .strategies import EXTRACTOR_MAPPING


class TextProcessingService:
    def __init__(self, language="portuguese"):
        self._extractors = EXTRACTOR_MAPPING
        self._init_nlp(language)

    def _init_nlp(self, language):
        self.language = language
        self.stop_words = set(stopwords.words(language))
        self.nlp = spacy.load("pt_core_news_sm")

    def extract_text(self, file):
        extension = os.path.splitext(file.filename)[1]
        extractor = self._extractors.get(extension.lower())

        if extractor:
            return extractor.extract(file)
        else:
            return "Formato de arquivo não suportado.", None

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
