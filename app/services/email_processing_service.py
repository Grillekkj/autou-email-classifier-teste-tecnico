from datetime import datetime
from zoneinfo import ZoneInfo
from typing import List
import zipfile
import io
import os

from app.domain.models import AnalysisResult, ZipAnalysisResult, UserSettings
from app.services.text_processing_service import TextProcessingService
from app.services.email_analysis_service import EmailAnalysisService


class EmailProcessingService:
    def __init__(
        self,
        text_service: TextProcessingService,
        analysis_service: EmailAnalysisService,
    ):
        self.analysis_service = analysis_service
        self.text_service = text_service

    def process_text_email(
        self, email_text: str, settings: UserSettings
    ) -> AnalysisResult:
        processed_text = self.text_service.preprocess(email_text)
        analysis_data = self.analysis_service.analyze_email(processed_text, settings)
        formatted_response = self._format_and_sign_response(analysis_data, settings)

        analysis_data["resposta_sugerida"] = formatted_response

        return AnalysisResult(
            email_original=email_text,
            tipo_arquivo="Texto Colado",
            timestamp=self._get_timestamp(),
            **analysis_data,
        )

    def process_files(self, files: List, settings: UserSettings):
        results = []

        for file in files:
            if not file or not file.filename:
                continue

            file.seek(0)

            if file.filename.lower().endswith(".zip"):
                result = self._process_zip_file(file, settings)

            else:
                result = self._process_single_file(file, settings)

            if result:
                results.append(result)

        return results

    def _process_single_file(self, file, settings: UserSettings) -> AnalysisResult:
        file_extension = os.path.splitext(file.filename.lower())[1]
        extracted_text, extracted_subject = self.text_service.extract_text(file)

        if not extracted_text:
            return None

        processed_text = self.text_service.preprocess(extracted_text)
        analysis_data = self.analysis_service.analyze_email(processed_text, settings)

        if extracted_subject:
            analysis_data["assunto"] = extracted_subject

        formatted_response = self._format_and_sign_response(analysis_data, settings)
        analysis_data["resposta_sugerida"] = formatted_response

        return AnalysisResult(
            email_original=extracted_text,
            tipo_arquivo=file_extension.replace(".", ""),
            timestamp=self._get_timestamp(),
            **analysis_data,
        )

    def _process_zip_file(self, file, settings: UserSettings) -> ZipAnalysisResult:
        zip_result = ZipAnalysisResult(
            assunto=file.filename, timestamp=self._get_timestamp()
        )
        try:
            with zipfile.ZipFile(file, "r") as zip_ref:

                for filename_in_zip in zip_ref.namelist():

                    if filename_in_zip.startswith(
                        "__MACOSX/"
                    ) or filename_in_zip.endswith("/"):
                        continue

                    with zip_ref.open(filename_in_zip) as inner_file:
                        file_like_object = io.BytesIO(inner_file.read())
                        file_like_object.filename = filename_in_zip
                        analysis = self._process_single_file(file_like_object, settings)

                        if analysis:
                            zip_result.arquivos_internos.append(analysis)

        except zipfile.BadZipFile:
            return None

        return zip_result if zip_result.arquivos_internos else None

    def _format_and_sign_response(self, result: dict, settings: UserSettings) -> str:
        response = result.get("resposta_sugerida")
        greeting = settings.greeting.strip()
        signature = settings.signature.strip()

        if isinstance(response, dict):
            saudacao = greeting or response.get("Saudação", "")
            corpo = response.get("Corpo Email", "")
            assinatura = signature or response.get("Assinatura", "")
            return f"{saudacao}\n\n{corpo}\n\n{assinatura}".strip()

        elif isinstance(response, str):
            parts = []

            if greeting:
                parts.append(greeting)
            parts.append(response)

            if signature:
                parts.append(signature)
            return "\n\n".join(parts)

        return ""

    def _get_timestamp(self) -> str:
        now = datetime.now(ZoneInfo("America/Sao_Paulo"))
        days = [
            "Seg",
            "Ter",
            "Qua",
            "Qui",
            "Sex",
            "Sáb",
            "Dom",
        ]
        return f"{days[now.weekday()]}, {now.strftime('%H:%M')}"
