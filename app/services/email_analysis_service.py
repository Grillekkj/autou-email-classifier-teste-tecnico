import json

from app.services.gemini_service import GeminiService
from app.domain.models import UserSettings
from app.prompts import email_prompts


class EmailAnalysisService:
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service

    def analyze_email(self, email_text: str, settings: UserSettings) -> dict:
        classification = self._get_classification(email_text, settings)
        response = self._get_response(email_text, classification, settings)
        summary = self._get_summary(email_text, settings)
        subject = self._get_subject(email_text, settings)

        return {
            "assunto": subject,
            "categoria": classification,
            "resumo": summary,
            "resposta_sugerida": response,
        }

    def regenerate_response_only(
        self, email_text: str, classification: str, settings: UserSettings
    ) -> str:
        return self._get_response(email_text, classification, settings)

    def _get_classification(self, email_text: str, settings: UserSettings) -> str:
        prompt_template = (
            settings.prompts.get("classification")
            or email_prompts.get_classification_prompt
        )

        model = settings.models.get("classification")

        prompt = (
            prompt_template(email_text)
            if callable(prompt_template)
            else prompt_template.format(email_text=email_text)
        )

        if model:
            classification = self.gemini_service.generate_content(prompt, model).lower()
        else:
            classification = self.gemini_service.generate_content(prompt).lower()

        return "improdutivo" if "improdutivo" in classification else "produtivo"

    def _get_response(
        self, email_text: str, classification: str, settings: UserSettings
    ) -> str | dict:
        model = settings.models.get("response")

        if classification == "improdutivo":
            prompt_template = (
                settings.prompts.get("simple_response")
                or email_prompts.get_simple_response_prompt
            )
        else:
            prompt_template = (
                settings.prompts.get("response") or email_prompts.get_response_prompt
            )

        prompt = (
            prompt_template(email_text)
            if callable(prompt_template)
            else prompt_template.format(email_text=email_text)
        )

        if model:
            response_str = self.gemini_service.generate_content(prompt, model)
        else:
            response_str = self.gemini_service.generate_content(prompt)

        cleaned_response = response_str.strip()

        if cleaned_response.startswith("```json"):
            cleaned_response = cleaned_response[7:].strip()
        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3].strip()

        try:
            return json.loads(cleaned_response)
        except json.JSONDecodeError:
            return response_str

    def _get_summary(self, email_text: str, settings: UserSettings) -> str:
        prompt_template = (
            settings.prompts.get("summary") or email_prompts.get_summary_prompt
        )

        model = settings.models.get("summary")

        prompt = (
            prompt_template(email_text)
            if callable(prompt_template)
            else prompt_template.format(email_text=email_text)
        )

        if model:
            return self.gemini_service.generate_content(prompt, model)
        else:
            return self.gemini_service.generate_content(prompt)

    def _get_subject(self, email_text: str, settings: UserSettings) -> str:
        prompt_template = (
            settings.prompts.get("subject") or email_prompts.get_subject_prompt
        )

        model = settings.models.get("subject")

        prompt = (
            prompt_template(email_text)
            if callable(prompt_template)
            else prompt_template.format(email_text=email_text)
        )

        if model:
            return self.gemini_service.generate_content(prompt, model)
        else:
            return self.gemini_service.generate_content(prompt)
