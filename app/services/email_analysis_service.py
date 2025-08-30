from app.services.gemini_service import GeminiService
from app.prompts.email_prompts import (
    get_subject_prompt,
    get_classification_prompt,
    get_response_prompt,
    get_simple_response_prompt,
    get_summary_prompt,
)


class EmailAnalysisService:
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service

    def analyze_email(self, email_text: str):
        classification = self._get_classification(email_text)
        response = self._get_response(email_text, classification)
        summary = self._get_summary(email_text)
        subject = self._get_subject(email_text)

        return {
            "assunto": subject,
            "email_original": email_text,
            "categoria": classification,
            "resumo": summary,
            "resposta_sugerida": response,
        }

    def _get_classification(self, email_text: str) -> str:
        prompt = get_classification_prompt(email_text)
        classification = self.gemini_service.generate_content(prompt).lower()
        if "improdutivo" in classification:
            return "improdutivo"
        return "produtivo"

    def _get_response(self, email_text: str, classification: str) -> str:
        if classification == "improdutivo":
            prompt = get_simple_response_prompt(email_text)
        else:
            prompt = get_response_prompt(email_text)
        return self.gemini_service.generate_content(prompt)

    def _get_summary(self, email_text: str) -> str:
        prompt = get_summary_prompt(email_text)
        return self.gemini_service.generate_content(prompt)

    def _get_subject(self, email_text: str) -> str:
        prompt = get_subject_prompt(email_text)
        return self.gemini_service.generate_content(prompt)
