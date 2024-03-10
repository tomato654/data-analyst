from . import ai_bp
from flask import request, jsonify
from gradio_client import Client
import requests
from bson.objectid import ObjectId
from bson.errors import InvalidId
from pymongo import MongoClient
from httpx import AsyncClient
import requests

# 链接mongoDB
mongo_uri = "mongodb://localhost:27017/"
client = MongoClient(mongo_uri)
db = client['FYP']
chats_collection = db.chats


@ai_bp.route('/ai', methods=['GET'])
def hello_ai():
    return "This is the ai endpoint"


@ai_bp.route('/v1/completions', methods=['POST'])
def process_data():
    try:
        user_message = request.get_json()
        print("获取到的client发送来的数据：", user_message)

        # 先获取该聊天使用的模型
        chat_id = user_message['chat_id']
        using_model = None
        if chat_id:
            try:
                chat = chats_collection.find_one({'_id': ObjectId(chat_id)})
            except Exception as e:
                return jsonify({'error': str(e)}), 400

            if chat:
                using_model = chat['model']
            else:
                return jsonify({'error': 'Document not found'}), 404

        ai_response = None
        new_message = user_message['message']

        if using_model[1] == 'private-gpt':
            ai_response = requests.post('http://localhost:8000/private-gpt/chat', json={
                'using_model': using_model[2],
                'content': new_message['content']
            }).json()
            ai_response = ai_response['response']
        elif using_model[0] == 'openai':
            ai_response = requests.post('http://localhost:8000/chat_gpt/chat', json={
                'using_model': using_model[2],
                'content': new_message['content'],
                'chat_id': chat_id
            }).json()
            print(ai_response)
        elif using_model[0] == 'openai-assistant':
            ai_response = requests.post('http://localhost:8000/gpt_assistant/chat', json={
                'content': new_message['content'],
                'chat_id': chat_id
            }).json()
            print(ai_response)
        else:
            ai_response = "TEST"
            # return jsonify({'error': 'Failed to find this model'}), 500
        # 如果ai只回了一条字符串消息，就直接添加这个字符串
        if isinstance(ai_response, str):
            new_message = ai_response
            update_response = requests.post('http://localhost:8000/chats/update_chats', json={
                'chat_id': chat_id,
                'message': {
                    'content': new_message,
                    'role': "assistant"
                }
            })
            if update_response.status_code == 200:
                # 成功将新消息添加到聊天中
                return jsonify({'success': True, 'chat_id': chat_id, 'message': new_message}), 200
            else:
                return jsonify({'error': 'Failed to add new message to chat'}), 500
        else:
            return jsonify({'error': 'Failed to get reply from AI service'}), 500
    except Exception as e:
        return jsonify({'error': str(e)})


def private_gpt_chat(my_request):
    try:
        user_message = my_request.get_json()
        models_collection = db.models
        setting = models_collection.find_one({"value": "local-ai"}, {"_id": 0, "setting": 1})["setting"]
        # setting = setting
        if not setting['prompt-prefix'] == "":
            system_prompt = setting['prompt-prefix']

        system_prompt = ""
        client = Client("http://localhost:8001/")
        response = client.predict(
            user_message['content'],
            user_message['using_model'],
            [],
            system_prompt,
            api_name="/chat"
        )
        return jsonify(response)
    except Exception as e:
        # Log the error and return an error message
        return jsonify({'error': e}), 500