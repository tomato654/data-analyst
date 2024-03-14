from . import chats_bp
from pymongo import MongoClient
from flask import request, jsonify
from bson.objectid import ObjectId
from bson.errors import InvalidId
import requests
from datetime import datetime
import pytz
from openai import OpenAI
import gridfs
import base64


client = OpenAI()
# 链接mongoDB
mongo_uri = "mongodb://localhost:27017/"
mongo_client = MongoClient(mongo_uri)
db = mongo_client['FYP']
chats_collection = db.chats
fs = gridfs.GridFS(db)


@chats_bp.route('/chats', methods=['GET'])
def index():
    return "this is chats page."


@chats_bp.route('/chats/get_chats', methods=['GET'])
def get_all_chats():
    chat_id = request.args.get('chat_id', None)
    try:
        if chat_id:
            try:
                chat = chats_collection.find_one({'_id': ObjectId(chat_id)})
            except Exception as e:
                return jsonify({'error': str(e)}), 400

            if chat:
                chat['_id'] = str(chat['_id'])
                try:
                    for message in chat['messages']:
                        if message.get("image_id", None):
                            grid_out = fs.get(ObjectId(message['image_id']))
                            image_data = grid_out.read()
                            base64_image = base64.b64encode(image_data).decode('utf-8')
                            message['image'] = base64_image
                except Exception as e:
                    return jsonify({'error': str(e)}), 400
                return jsonify(chat)
            else:
                return jsonify({'error': 'Document not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@chats_bp.route('/chats/update_chats', methods=['POST'])
def update_chats():
    update_chat = request.get_json()
    chat_id = update_chat.get('chat_id')
    new_message = update_chat["message"]
    new_message['timestamp'] = int(datetime.now(tz=pytz.UTC).timestamp() * 1000)
    message_content = new_message.get("content", "")
    files = new_message.get("files", None)
    file_ids = []
    if files:
        for file in files:
            file['file_id'] = file.pop('key')
            file_ids.append(file.file_id)

    if not chat_id:
        title = message_content if len(message_content) < 20 else message_content[:18] + '...'
        new_chat = {
            'title': title,
            'model': update_chat['modelPath'],
            'messages': [new_message]
        }
        thread_id = None
        if not thread_id and update_chat['modelPath'][0] == 'openai-assistant':
            thread_id = client.beta.threads.create(
                messages=[
                    {
                        "role": "user",
                        "content": message_content,
                        "file_ids": file_ids
                    }
                ]
            )
            thread_id = str(thread_id.id)
            new_chat['thread-id'] = thread_id
        result = chats_collection.insert_one(new_chat)
        if result.inserted_id:
            return jsonify({'success': True, 'message': 'New chat created.','chat_id': str(result.inserted_id)}), 201
        else:
            return jsonify({'success': False, 'message': 'Failed to create new chat.'}), 500

    else:
        query = {'_id': ObjectId(chat_id)}
        update = {'$push': {'messages': new_message}}
        result = chats_collection.update_one(query, update)

        thread_id = chats_collection.find_one({'_id': ObjectId(chat_id)}, {'_id': 0, 'thread-id': 1})
        if thread_id:
            thread_id = thread_id['thread-id']
            try:
                client.beta.threads.messages.create(
                    thread_id,
                    role="user",
                    content=message_content,
                    file_ids=file_ids
                )
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        if result.modified_count > 0:
            return jsonify({'success': True, 'message': 'Message added to chat.', 'chat_id': chat_id}), 200
        else:
            return jsonify({'success': False, 'message': 'No chat found with given ID or no update made.'}), 404


@chats_bp.route('/chats/find_chat_id', methods=['GET'])
def find_chat_id():
    chat_id = request.args.get('chat_id', None)
    if chat_id is None:
        return jsonify({'error': 'No chat_id provided'}), 400

    try:
        query = {'_id': ObjectId(chat_id)}
        chat_exists = chats_collection.count_documents(query) > 0
    except InvalidId:
        return jsonify({'error': 'Invalid chat_id'}), 400

    return jsonify({'exists': chat_exists})


@chats_bp.route('/chats/get_all_chat_ids_titles', methods=['GET'])
def get_all_chat_ids_titles():
    try:
        chats = chats_collection.find({}, {'_id': 1, 'title': 1})
        chat_data = [{'key': str(chat['_id']), 'label': chat['title']} for chat in chats]
        return jsonify({'chats': chat_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@chats_bp.route('/chats/delete_chat', methods=['GET'])
def delete_chat():
    print("用户发送要删除的对话", request.args)
    chat_id = request.args.get('chat_id', None)
    print("用户发送要删除的对话", request.args)

    if chat_id is None:
        return jsonify({'error': 'Missing chat_id'}), 400

    try:
        # 删除具有指定_id的文档
        chat_to_delete = chats_collection.find_one({'_id': ObjectId(chat_id)}, {'_id': 0})
        thread_id = None
        if chat_to_delete['thread-id']:
            thread_id = chat_to_delete['thread-id']
            response = client.beta.threads.delete(thread_id)

        result = chats_collection.delete_one({'_id': ObjectId(chat_id)})
        if result.deleted_count == 1:
            return jsonify({'success': True, 'message': 'Chat deleted'}), 200
        else:
            return jsonify({'error': 'Chat not found'}), 404
    except InvalidId:
        return jsonify({'error': 'Invalid chat_id format'}), 400

