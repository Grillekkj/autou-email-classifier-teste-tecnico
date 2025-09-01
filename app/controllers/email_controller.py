from flask import request, jsonify
from dataclasses import asdict
import json

from app.services.email_processing_service import EmailProcessingService
from app.services.email_analysis_service import EmailAnalysisService
from app.services.history_service import HistoryService
from app.domain.models import UserSettings


class EmailController:
    def __init__(
        self,
        processing_service: EmailProcessingService,
        analysis_service: EmailAnalysisService,
        history_service: HistoryService,
    ):
        self.processing_service = processing_service
        self.analysis_service = analysis_service
        self.history_service = history_service

    def get_history(self, user_id: str):
        return [asdict(item) for item in self.history_service.get_full_history(user_id)]

    def get_history_for_user(self):
        user_id = self._get_request_json().get("userId")
        if not user_id:
            return jsonify({"historico": []})
        history = self.get_history(user_id)
        return jsonify({"historico": history})

    def process_email(self):
        data = self._get_request_json()
        user_id = data.get("userId")
        settings = self._extract_settings_from_request()
        results = []

        if not user_id:
            return jsonify({"error": "ID de usuário não fornecido!"}), 400

        files = request.files.getlist("email_file")

        if self._has_files(files):
            results = self._process_files(files, settings)
        else:
            email_text = data.get("email_text", "").strip()
            if email_text:
                results = self._process_text_email(email_text, settings)

        if not results:
            return (
                jsonify(
                    {"error": "Nenhum conteúdo válido para análise foi encontrado."}
                ),
                400,
            )

        self.history_service.add_to_history(user_id, results)
        return jsonify(
            {
                "analises": [asdict(r) for r in results],
                "historico": self.get_history(user_id),
            }
        )

    def regenerate_response(self):
        data = self._get_request_json()
        user_id = data.get("userId")
        settings = self._extract_settings_from_request()

        if not user_id:
            return jsonify({"error": "ID de usuário não fornecido!!"}), 400

        history_id = self._parse_int(data.get("historyId"))
        sub_id = self._parse_int(data.get("subId"))

        if history_id is None:
            return jsonify({"error": "Dados inválidos ou item não encontrado."}), 400

        try:
            item = self.history_service.find_item(user_id, history_id, sub_id)
        except IndexError:
            return jsonify({"error": "Item de histórico não encontrado."}), 404

        new_response = self.analysis_service.regenerate_response_only(
            item.email_original, item.categoria, settings
        )
        formatted_response = self.processing_service._format_and_sign_response(
            {"resposta_sugerida": new_response}, settings
        )
        item.resposta_sugerida = formatted_response

        return jsonify({"resposta_sugerida": formatted_response})

    def delete_history_item(self):
        data = self._get_request_json()
        user_id = data.get("userId")

        if not user_id:
            return jsonify({"error": "ID de usuário não fornecido!!!"}), 400

        history_id = self._parse_int(data.get("historyId"))
        sub_id = self._parse_int(data.get("subId"))

        if history_id is None:
            return jsonify({"error": "Os IDs devem ser números inteiros."}), 400

        try:
            self.history_service.delete_history_item(user_id, history_id, sub_id)
        except IndexError:
            return jsonify({"error": "Item de histórico não encontrado."}), 404

        return jsonify({"historico": self.get_history(user_id)})

    def _extract_settings_from_request(self) -> UserSettings:
        settings_data = {}
        source = {}

        if request.is_json:
            source = self._get_request_json()
        elif request.form:
            source = request.form

        settings_json = source.get("settings")
        if settings_json:
            try:
                if isinstance(settings_json, str):
                    settings_data = json.loads(settings_json)
                elif isinstance(settings_json, dict):
                    settings_data = settings_json
            except (json.JSONDecodeError, TypeError):
                pass

        return UserSettings(**settings_data)

    def _get_request_json(self) -> dict:
        if request.is_json:
            return request.get_json(silent=True) or {}
        if request.form:
            form_data = {}
            for key, value in request.form.items():
                if key != "settings":
                    form_data[key] = value
            return form_data
        return {}

    def _has_files(self, files) -> bool:
        return bool(files and files[0].filename)

    def _process_files(self, files, settings):
        return self.processing_service.process_files(files, settings)

    def _process_text_email(self, text, settings):
        return [self.processing_service.process_text_email(text, settings)]

    def _parse_int(self, value):
        try:
            return int(value)
        except (ValueError, TypeError):
            return None
