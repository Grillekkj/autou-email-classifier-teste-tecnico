from dotenv import load_dotenv
from flask import Flask


def create_app():
    load_dotenv()
    app = Flask(__name__, template_folder="./templates", static_folder="./static")

    from .routes.main import main_bp

    app.register_blueprint(main_bp)

    return app
