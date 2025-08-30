from flask import Blueprint, render_template
from app.controllers.email_controller import EmailController
from app.services.email_analysis_service import EmailAnalysisService
from app.services.text_processing_service import TextProcessingService
from app.services.gemini_service import GeminiService

main_bp = Blueprint("main", __name__)

gemini_service = GeminiService()
text_processing_service = TextProcessingService()
email_analysis_service = EmailAnalysisService(gemini_service)
email_controller = EmailController(email_analysis_service, text_processing_service)


@main_bp.route("/")
def home():
    return render_template("index.html", historico=email_controller.analysis_history)


@main_bp.route("/processar-email", methods=["POST"])
def processar_email():
    return email_controller.process_email()
