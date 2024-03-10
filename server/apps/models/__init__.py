from flask import Blueprint

models_bp = Blueprint('models', __name__)

from . import views


