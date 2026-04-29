import os
import sys
from pathlib import Path

from flask import Flask, jsonify
from flask_jwt_extended import JWTManager

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.controller.account_controller import account_controller
from app.controller.gara_controller import gara_controller
from app.controller.squadra_controller import squadra_controller
from app.controller.torneo_controller import torneo_controller
from app.utils.db import create_tables, db


def create_app():
    app = Flask(__name__)

    app.config["JWT_SECRET_KEY"] = os.getenv(
        "JWT_SECRET_KEY",
        "root",
    )
    JWTManager(app)

    @app.route("/")
    def home():
        return jsonify({"message": "API Nuoto è online!", "status": "OK"}), 200

    @app.teardown_appcontext
    def close_db_connection(_exception):
        db.close()

    app.register_blueprint(account_controller, url_prefix="/account")
    app.register_blueprint(squadra_controller, url_prefix="/squadra")
    app.register_blueprint(torneo_controller, url_prefix="/torneo")
    app.register_blueprint(gara_controller, url_prefix="/gara")

    create_tables()
    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        debug=os.getenv("FLASK_DEBUG", "true").lower() == "true",
        host=os.getenv("FLASK_HOST", "localhost"),
        port=int(os.getenv("FLASK_PORT", "5000")),
    )
