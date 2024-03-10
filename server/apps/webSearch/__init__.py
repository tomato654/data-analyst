from flask import Blueprint
from apps.webSearch import search_service
from apps.webSearch import google_search_concurrent

webSearch_bp = Blueprint('webSearch', __name__)

from . import main


