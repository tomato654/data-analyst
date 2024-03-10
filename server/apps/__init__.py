

# Register all of routers
from apps.models import models_bp
from apps.ai import ai_bp
from apps.chat import chats_bp
from apps.webSearch import webSearch_bp
from flask import Flask
from flask_cors import CORS




def create_app():
    app = Flask(__name__)
    app.register_blueprint(blueprint=models_bp)
    app.register_blueprint(blueprint=ai_bp)
    app.register_blueprint(blueprint=chats_bp)
    app.register_blueprint(blueprint=webSearch_bp)
    CORS(app)
    return app

