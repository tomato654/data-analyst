from . import models_bp
from pymongo import MongoClient
from flask import request, jsonify
import requests

# 链接mongoDB
mongo_uri = "mongodb://localhost:27017/"
client = MongoClient(mongo_uri)
db = client['FYP']


@models_bp.route('/models', methods=['GET', 'POST'])
def setting():
    return 'This is the models'


@models_bp.route('/models/get_companies', methods=['GET'])
def get_companies():
    models_collection = db.models
    models = list(models_collection.find({}, {"_id": 0, "value": 1, "label": 1}))
    return jsonify(models)


@models_bp.route('/models/get_setting_children', methods=['GET'])
def get_setting():
    model_name = request.args.get('model', None)
    models_collection = db.models
    if model_name:
        models = list(models_collection.find({"value": model_name}, {"_id": 0, "setting": 1, "children": 1, "label": 1}))
    else:
        models = list(models_collection.find({}, {"_id": 0}))
    return jsonify(models)


@models_bp.route('/models/update_setting', methods=['POST'])
def update_setting():
    user_update_setting = request.get_json()
    print(user_update_setting)
    models_collection = db.models

    model_name = user_update_setting['model']
    new_setting = user_update_setting["setting"]

    query = {"value": model_name}
    update = {"$set": {"setting": new_setting}}
    result = models_collection.update_one(query, update)

    if result.matched_count > 0:
        # 如果找到并更新了文档
        #    则继续更新相应的模型的参数
        if new_setting['model'][0] == "private-gpt":
            update_prompt = requests.post('http://localhost:8000/private-gpt/set_system_prompt', json={
                'prompt-prefix': new_setting['prompt-prefix'],
            })
            if update_prompt.ok:
                return jsonify({"success": True, "message": "Settings updated successfully."}), 200

        return jsonify({"success": True, "message": "Settings updated successfully."}), 200
    elif result.upserted_id is not None:
        # 如果插入了新文档
        return jsonify({"success": True, "message": "New model and settings added."}), 201
    else:
        # 如果没有找到文档也没有插入新文档（这种情况实际上不太可能发生，因为设置了upsert=True）
        return jsonify({"success": False, "message": "No changes applied."}), 400














