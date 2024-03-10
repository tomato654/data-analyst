from flask import Blueprint

ai_bp = Blueprint('ai', __name__)

from . import views
from . import privateGPT
from . import chatGPT
from . import assistant
