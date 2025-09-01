from flask import (
    Blueprint,
    render_template,
    redirect,
    url_for,
)

from app.services.email_processing_service import EmailProcessingService
from app.services.text_processing_service import TextProcessingService
from app.services.email_analysis_service import EmailAnalysisService
from app.controllers.email_controller import EmailController
from app.services.history_service import HistoryService
from app.services.gemini_service import GeminiService


main_bp = Blueprint("main", __name__)

text_processing_service = TextProcessingService()
history_service = HistoryService()
gemini_service = GeminiService()
email_analysis_service = EmailAnalysisService(gemini_service)
email_processing_service = EmailProcessingService(
    text_processing_service, email_analysis_service
)
email_controller = EmailController(
    processing_service=email_processing_service,
    analysis_service=email_analysis_service,
    history_service=history_service,
)


@main_bp.route("/")
def home():
    return render_template("index.html", historico=[])


@main_bp.route("/app")
def app_page():
    return redirect(url_for("main.home"))


@main_bp.route("/write")
def escrever_page():
    return render_template("pages/write.html")


@main_bp.route("/settings")
def settings_page():
    return render_template("pages/settings.html")


@main_bp.route("/landing")
def landing_page_content():
    return render_template("pages/landing.html")


@main_bp.route("/processar-email", methods=["POST"])
def processar_email():
    return email_controller.process_email()


@main_bp.route("/regenerate-response", methods=["POST"])
def regenerate_response():
    return email_controller.regenerate_response()


@main_bp.route("/delete-history-item", methods=["POST"])
def delete_history_item():
    return email_controller.delete_history_item()


@main_bp.route("/get-history", methods=["POST"])
def get_history():
    return email_controller.get_history_for_user()
