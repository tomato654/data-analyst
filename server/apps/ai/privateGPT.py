from . import ai_bp
from flask import request, jsonify
from gradio_client import Client
import requests
import os
from werkzeug.utils import secure_filename
from gradio_client import Client
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
mongo_client = MongoClient(mongo_uri)
db = mongo_client['FYP']


@ai_bp.route('/private-gpt', methods=['GET'])
def hello_private_gpt():
    return "This is the privateGPT endpoint"


@ai_bp.route('/private-gpt/chat', methods=['POST'])
def private_gpt_chat():
    try:
        user_message = request.get_json()
        models_collection = db.models
        setting = models_collection.find_one({"value": "local-ai"}, {"_id": 0, "setting": 1})["setting"]
        # setting = setting
        if not setting['prompt-prefix'] == "":
            system_prompt = setting['prompt-prefix']

        system_prompt = ""
        # client = Client("http://localhost:8001/")
        # response = client.predict(
        #     user_message['content'],
        #     user_message['using_model'],
        #     [],
        #     system_prompt,
        #     api_name="/chat"
        # )
        response="TEST, TEST, TEST"
        print(response)
        return jsonify({"response": response}), 200
    except Exception as e:
        # Log the error and return an error message
        return jsonify({'error': e}), 500


@ai_bp.route('/private-gpt/set_system_prompt', methods=['POST'])
def set_system_prompt():
    update_prompt = request.get_json()
    client = Client("http://localhost:8001/")
    prompt_update_response = client.predict(
        update_prompt['prefix-prompt'],
        api_name="/_set_system_prompt"
    )
    if prompt_update_response:
        return jsonify({"success": True, "message": "System prompt updated successfully."}), 200
    else:
        return jsonify({'error': 'Failed to update system prompt'}), 500


@ai_bp.route('/private-gpt/upload_file', methods=['POST'])
def private_gpt_upload_file():
    # 确保file是请求中的一个部分
    print(request)
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files
    file = file['file']
    # 如果没有文件被选中
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join('D:/Github/data-analyst/temp', filename)  # 暂时保存文件到临时目录
        file.save(file_path)
        print(file_path)

        # 调用你的Gradio函数
        client = Client("http://localhost:8001/")
        result = client.predict(
            [file_path],
            api_name="/_upload_file"
        )

        # 删除文件
        os.remove(file_path)

        return jsonify({'result': result})
    else:
        return jsonify({'error': 'File upload failed'}), 500


@ai_bp.route('/private-gpt/list_ingested_files', methods=['GET'])
def list_ingested_files():
    client = Client("http://localhost:8001/")
    list_ingested_files_res = client.predict(
        api_name="/_list_ingested_files"
    )
    if list_ingested_files_res:
        return jsonify(list_ingested_files_res), 200
    else:
        return jsonify({'error': 'Failed to upload files.'}), 500


