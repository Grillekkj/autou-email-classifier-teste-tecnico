from flask import request, jsonify
from app.services.email_analysis_service import EmailAnalysisService
from app.services.text_processing_service import TextProcessingService
import zipfile
import io
import os


class EmailController:
    def __init__(
        self,
        email_analysis_service: EmailAnalysisService,
        text_processing_service: TextProcessingService,
    ):
        self.email_analysis_service = email_analysis_service
        self.text_processing_service = text_processing_service
        self.analysis_history = []

    def process_email(self):
        immediate_results = []
        history_results = []

        if (
            "email_file" in request.files
            and request.files.getlist("email_file")[0].filename
        ):
            files = request.files.getlist("email_file")
            for file in files:
                if not file or file.filename == "":
                    continue
                file.seek(0)
                filename_lower = file.filename.lower()
                if filename_lower.endswith(".zip"):
                    zip_analysis = self._process_zip(file)
                    if zip_analysis:
                        immediate_results.extend(zip_analysis["arquivos_internos"])
                        history_results.append(zip_analysis)
                else:
                    analysis = self._process_single_file(file)
                    if analysis:
                        immediate_results.append(analysis)
                        history_results.append(analysis)
        else:
            data = request.get_json(silent=True)
            if data and "email_text" in data:
                email_text = data.get("email_text", "").strip()
                if email_text:
                    processed_text = self.text_processing_service.preprocess(email_text)
                    analysis = self.email_analysis_service.analyze_email(processed_text)
                    analysis["tipo_arquivo"] = "Texto Colado"
                    immediate_results.append(analysis)
                    history_results.append(analysis)

        if not immediate_results:
            return (
                jsonify(
                    {"error": "Nenhum conteúdo válido para análise foi encontrado."}
                ),
                400,
            )

        for analysis in reversed(history_results):
            self.analysis_history.insert(0, analysis)

        return jsonify(
            {"analises": immediate_results, "historico": self.analysis_history}
        )

    def _process_single_file(self, file):
        file_extension = os.path.splitext(file.filename.lower())[1].replace(".", "")
        try:
            extracted_text, extracted_subject = (
                self.text_processing_service.extract_text(file)
            )
        except ValueError:
            print(f"Error unpacking result from extract_text for {file.filename}")
            return None
        if (
            extracted_text
            and "Erro" not in extracted_text
            and "não suportado" not in extracted_text
        ):
            processed_text = self.text_processing_service.preprocess(extracted_text)
            analysis = self.email_analysis_service.analyze_email(processed_text)
            analysis["tipo_arquivo"] = file_extension
            if extracted_subject:
                analysis["assunto"] = extracted_subject
            return analysis
        return None

    def _process_zip(self, file):
        zip_analysis_list = []
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
                        analysis = self._process_single_file(file_like_object)
                        if analysis:
                            zip_analysis_list.append(analysis)
        except zipfile.BadZipFile:
            pass
        if zip_analysis_list:
            return {
                "is_zip": True,
                "assunto": file.filename,
                "tipo_arquivo": "zip",
                "arquivos_internos": zip_analysis_list,
                "quantidade": len(zip_analysis_list),
            }
        return None
