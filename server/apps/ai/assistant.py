from . import ai_bp
from flask import request, jsonify
from openai import OpenAI
import os
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from bson.objectid import ObjectId
from time import sleep

client = OpenAI()

mongo_uri = "mongodb://localhost:27017/"
mongo_client = MongoClient(mongo_uri)
db = mongo_client['FYP']


@ai_bp.route('/gpt_assistant', methods=['GET'])
def hello_gpt_assistant():
    return "This is the GPT assistant endpoint"


# @ai_bp.route('/gpt_assistant/create_assistant', methods=['POST'])
# def create_assistant():
#     data = request.get_json()
#     assistant_name = data['name']
#     assistant_instructions = data['instructions']
#     assistant_tools = [{"type": "code_interpreter"}]
#     assistant_file_ids = data['file_ids']


@ai_bp.route('/gpt_assistant/retrieve_assistant', methods=['GET'])
def retrieve_assistant():
    assistant_id = request.args.get('assistant_id')
    if not assistant_id:
        return jsonify({'error': 'No assistant'}), 500
    else:
        my_assistant = client.beta.assistants.retrieve(assistant_id)
        if my_assistant:
            name = my_assistant.name
            assistant_id = my_assistant.id
            model = [my_assistant.model]
            instructions = my_assistant.instructions
            file_ids = my_assistant.file_ids

            new_setting = update_database(assistant_id, name, model, instructions, file_ids)
            models_collection = db.models
            query = {"value": "openai-assistant"}
            children = models_collection.find_one(query, {"children": 1, "_id": 0})
            return jsonify({"setting": new_setting, "children": children['children']}), 200
        else:
            return jsonify({'error': 'No Such Assistant'}), 404


@ai_bp.route('/gpt_assistant/reset_assistant', methods=['GET'])
def reset_assistant():
    new_setting = update_database("", "", [], "", [])
    models_collection = db.models
    query = {"value": "openai-assistant"}
    children = models_collection.find_one(query, {"children": 1, "_id": 0})
    return jsonify({"setting": new_setting, "children": children['children']}), 200


@ai_bp.route('/gpt_assistant/modify_assistant', methods=['POST'])
def modify_assistant():
    # 获取用户传来的数据
    try:
        data = request.get_json()
        assistant_id = data.get('id', '')
        name = data.get('name', '')
        model = data.get('model', [])
        instructions = data.get('prompt-prefix', '')
        file_ids = data.get('file-ids', '')

        if len(name) == 0:
            return jsonify({'error': "Name cannot be empty"}), 400
        if len(model) == 0:
            return jsonify({'error': "Model cannot be empty"}), 400
        if len(instructions) == 0:
            return jsonify({'error': "Instructions cannot be empty"}), 400

        # 如果用户没有输入assistant id，就新创建一个assistant
        if len(assistant_id) == 0:
            my_assistant = client.beta.assistants.create(
                instructions=instructions,
                name=name,
                tools=[{"type": "code_interpreter"}],
                model=model[1],
                file_ids=file_ids
            )
            name = my_assistant.name
            assistant_id = my_assistant.id
            model = my_assistant.model
            instructions = my_assistant.instructions
            file_ids = my_assistant.file_ids

            update_database(assistant_id, model, instructions, file_ids, name)
            return jsonify({"success": True, "message": "New Assistant Created."}), 200

        # 如果用户输入了这个id，并且这个id有存在的助手实例，就update这个助手
        existing_assistant = client.beta.assistants.retrieve(assistant_id)
        if existing_assistant:
            my_updated_assistant = client.beta.assistants.update(
                assistant_id,
                instructions=instructions,
                name=name,
                tools=[{"type": "code_interpreter"}],
                model=model[1],
                file_ids=file_ids,
            )
            name = my_updated_assistant.name
            assistant_id = my_updated_assistant.id
            model = my_updated_assistant.model
            instructions = my_updated_assistant.instructions
            file_ids = my_updated_assistant.file_ids

            update_database(assistant_id, name, model, instructions, file_ids)
            return jsonify({"success": True, "message": "Settings updated successfully."}), 200
        # 该ID不存在
        else:
            return jsonify({"error": "No Assistant Found"}), 400
    except Exception as e:
        return jsonify({"Error": e}), 400


@ai_bp.route('/gpt_assistant/file_action', methods=['GET'])
def handle_file_actions():
    # 获取action参数
    action = request.args.get('action', None)
    file_id = request.args.get('file_id', None)
    assistant_id = request.args.get('assistant_id', None)
    # 根据action参数值执行相应操作
    try:
        if action == 'list_files' and assistant_id:
            assistant_files = client.beta.assistants.files.list(
                assistant_id=assistant_id
            )
            # 假设files_response有一个名为files的属性，该属性是一个列表
            assistant_files = [{"key": file.id} for file in assistant_files.data]
            return jsonify({'success': True, 'message': 'Files listed successfully', 'list': assistant_files}), 200

        elif action == 'delete_file' and assistant_id:
            if not file_id:
                return jsonify({'success': False, 'message': 'File ID is required'}), 400
            deleted_assistant_file = client.beta.assistants.files.delete(
                assistant_id=assistant_id,
                file_id=file_id
            )
            deleted = deleted_assistant_file.deleted
            if deleted:
                return jsonify({'success': True, 'message': 'File deleted successfully', 'response': deleted}), 200
            else:
                return jsonify({'success': False, 'message': 'File deleted failed', 'response': deleted}), 400

        else:
            # 如果action参数不匹配任何已知操作，则返回错误
            return jsonify({'success': False, 'message': 'Invalid action specified'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': e})


def update_database(assistant_id, name, model, instructions, file_ids):
    models_collection = db.models
    new_setting = {
        "id": assistant_id,
        "model": model,
        "prompt-prefix": instructions,
        "file-ids": file_ids,
        "name": name
    }
    query = {"value": "openai-assistant"}
    new_setting['model'] = ["gpt-3.5-turbo-16k-0613"]
    current_collection = models_collection.find_one(query, {"setting": 1, "children": 1, "_id": 0})
    # current_setting = current_collection["setting"]
    children = current_collection["children"]
    print(type(children))
    for item in children:
        for child in item["children"]:
            if child["value"] == new_setting['model'][0]:
                new_setting['model'].insert(0, item["value"])
                break
    current_setting = current_collection["setting"]
    for key, value in current_setting.items():
        if key not in new_setting:
            new_setting[key] = value

    update = {"$set": {"setting": new_setting}}
    update_label = {"$set": {"label": name}}
    models_collection.update_one(query, update)
    models_collection.update_one(query, update_label)
    return new_setting


@ai_bp.route('/gpt_assistant/chat', methods=['POST'])
def assistant_chat():
    # 先获取assistant id
    models_collection = db.models
    query = {"value": "openai-assistant"}
    current_collection = models_collection.find_one(query, {"setting": 1, "_id": 0})
    assistant_id = current_collection["setting"]["id"]
    # 获取用户的消息
    data = request.get_json()
    chat_id = data.get("chat_id", None)
    user_content = data.get("content", None)

    # 获取thread_id
    chats_collection = db.chats
    thread_id = None
    if chat_id:
        query = {'_id': ObjectId(chat_id)}
        chats_collection = db.chats
        thread_id = chats_collection.update_one(query, {'_id': 0, 'thread_id': 1})
        thread_id = thread_id['thread_id']

    # 运行thread with assistant
    if thread_id and assistant_id:
        run = client.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=assistant_id,
        )
        # 检查run的状态？ 请帮我修改一下
        run_id = run.id
        run_status = "not_started"
        # 检查run的状态并每隔半秒检查一次
        while run_status != "completed":
            run = client.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run_id
            )
            run_status = run.status
            if run_status == "completed":
                break
            sleep(0.5)
        if run.status == "completed":
            messages = client.beta.threads.messages.list(
                thread_id=thread_id
            )
            messages = messages.data
            return jsonify(messages), 200
