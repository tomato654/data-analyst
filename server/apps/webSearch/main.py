
from . import webSearch_bp
import json
from apps.webSearch import search_service
from apps.webSearch import image_search
import flask
from flask import request, jsonify
from apps.webSearch import google_search_concurrent as gs
import requests
import traceback
# app = quart_cors.cors(quart.Quart(__name__), allow_origin="*")

# This key can be anything, though you will likely want a randomly generated sequence.
_SERVICE_AUTH_KEY = "0123456788abcdef"

# def assert_auth_header(req):
#    assert req.headers.get(
#        "Authorization", None) == f"Bearer {_SERVICE_AUTH_KEY}"


@webSearch_bp.get("/search/quick")
def get_quicksearch():
    level = "quick"
    search_result = ""
    try:
        query = request.args.get("query")
        print(f"level: {level}, query: {query}")
        search_result = search_service.run_chat(query, level)
        # search_result = '[{"source": "timeanddate.com", "url": "https://www.timeanddate.com/weather/ireland/dublin/ext", "credibility": "Third-Party Source", "text": "\\n \\u2022 Currently, the weather in Dublin is 7\\u00b0C with broken clouds.. \\n \\u2022 The hourly forecast shows a temperature of 3\\u00b0C with sprinkles and morning clouds.. \\n \\u2022 The forecast for the next 7 days in Dublin includes temperatures ranging from 6\\u00b0C to 4\\u00b0C with some precipitation..\\n"}]'
        # search_result = json.loads(search_result)
    except:

        traceback.print_exc()
    return jsonify({"result": search_result}), 200


@webSearch_bp.get("/search/full")
def get_fullsearch():
    level = "moderate"
    search_result = ""
    try:
        query = request.args.get("query")
        print(f"level: {level}, query: {query}")
        search_result = search_service.run_chat(query, level)
    except Exception as e:
        traceback.print_exc()
    return jsonify({"result": search_result}), 200


@webSearch_bp.get("/search/image")
def get_image():
    level = "moderate"
    search_result = ""
    try:
        query = request.args.get("query")
        print(f"level: {level}, query: {query}")
        search_result = image_search.image_search(query)
    except Exception as e:
        traceback.print_exc()
    return jsonify({"result": search_result}), 200


#
# @webSearch_bp.get("/openapi.yaml")
# def openapi_spec():
#     # host = request.headers['Host']
#     with open("openapi.yaml") as f:
#         text = f.read()
#         return quart.Response(text, mimetype="text/yaml")


