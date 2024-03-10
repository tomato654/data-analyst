from . import ai_bp
from flask import request, jsonify
from openai import OpenAI
import os
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson.errors import InvalidId

client = OpenAI()

mongo_uri = "mongodb://localhost:27017/"
mongo_client = MongoClient(mongo_uri)
db = mongo_client['FYP']


@ai_bp.route('/chat_gpt', methods=['GET'])
def hello_chat_gpt():
    return "This is the OpenAi endpoint"


@ai_bp.route('/chat_gpt/chat', methods=['POST'])
def chat_gpt_chat():
    try:
        message_object = request.get_json()
        user_message = message_object["content"]
        models_collection = db.models

        # Assuming setting is a list of dictionaries and we want the first one
        setting = models_collection.find_one({"value": 'openai'}, {"_id": 0, "setting": 1})
        model_setting = setting["setting"]
        chats_collection = db.chats

        chat_id = message_object.get('chat_id')
        chat_history = chats_collection.find_one({'_id': ObjectId(chat_id)})
        max_history = setting.get('max_history', 0)
        if 0 < max_history < len(chat_history):
            chat_history = chat_history[len(chat_history)-1-chat_history:len(chat_history)-1]
        if max_history > 0:
            chat_history = [
                {"role": message["role"], "content": message["content"]}
                for message in chat_history
            ]
        else:
            chat_history = []

        # Make sure we have the settings before making the call
        if model_setting:
            model = model_setting['model']
            # completion = client.chat.completions.create(
            #     model=model_setting['model'][1],
            #     messages=[
            #         # {"role": "system", "content": model_setting['prompt-prefix']},
            #         *chat_history,
            #         {"role": "user", "content": user_message}
            #     ],
            #     frequency_penalty=model_setting['frequency-penalty'],
            #     temperature=model_setting['temperature'],
            #     top_p=model_setting['top-p'],
            #     presence_penalty=model_setting['presence-penalty'],
            #     # max_tokens=model_setting['max-tokens']
            # )
            # print(completion)
            # # Assuming we want to return the completion content
            # return jsonify(completion.choices[0].message.content)
            return jsonify("I'm just a computer program, so I don't have feelings, but I'm here to help you with anything you need. How can I assist you today?")
        else:
            return jsonify({"error": "Model settings not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ai_bp.route('/chat_gpt/upload_files', methods=['POST'])
def upload_files():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    try:
        file = request.files
        file = file['file']
        # If the filename is empty
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        # If the file exists
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join('D:/Github/data-analyst/temp', filename)  # 暂时保存文件到临时目录
            file.save(file_path)
            response = client.files.create(
                file=open(file_path, "rb"),
                purpose='assistants'
            )
            os.remove(file_path)  # Delete file after uploading
            return jsonify({'success': True, 'message': 'New file added to open ai', 'response': response}), 200
    except Exception as e:
        return jsonify({'error': str(e)})


@ai_bp.route('/chat_gpt/file_action', methods=['GET'])
def handle_action():
    # 获取action参数
    action = request.args.get('action', None)
    file_id = request.args.get('file_id', None)
    # 根据action参数值执行相应操作
    try:
        if action == 'list_files':
            files_response = client.files.list()
            # 假设files_response有一个名为files的属性，该属性是一个列表
            files_list = [{"filename": file.filename, "key": file.id, "bytes": file.bytes} for file in files_response.data]
            return jsonify({'success': True, 'message': 'Files listed successfully', 'list': files_list}), 200

        elif action == 'retrieve_file':
            if not file_id:
                return jsonify({'success': False, 'message': 'File ID is required'}), 400
            file_info = client.files.retrieve(file_id)
            return jsonify({'success': True, 'message': 'File retrieved successfully', 'file_info': file_info}), 200

        elif action == 'delete_file':
            if not file_id:
                return jsonify({'success': False, 'message': 'File ID is required'}), 400
            response = client.files.delete(file_id)
            return jsonify({'success': True, 'message': 'File deleted successfully', 'response': response}), 200

        elif action == 'retrieve_file_content':
            if not file_id:
                return jsonify({'success': False, 'message': 'File ID is required'}), 400
            file_content = client.files.retrieve_content(file_id)
            return jsonify({'success': True, 'message': 'File deleted successfully', 'file_content': file_content}), 200

        else:
            # 如果action参数不匹配任何已知操作，则返回错误
            return jsonify({'success': False, 'message': 'Invalid action specified'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': e})




