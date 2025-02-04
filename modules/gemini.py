import os, io, base64
import google.generativeai as gen_ai
from PIL import Image
from typing import List, Dict
from modules.CustomIterator import CustomIterator
from dotenv import load_dotenv

load_dotenv()

gen_ai.configure(api_key=os.environ["GOOGLE_API_KEY"])

MODEL_VISION = 'gemini-pro-vision'

# 存储每个会话的历史记录
chat_histories: Dict[str, list] = {}

def get_model_list() -> List[str]:
    l = []
    for m in gen_ai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            l.append(m.name.replace('models/', ''))
    return l


def chat_gemini(ci: CustomIterator, data: dict):
    # Print data without imgData for cleaner logs
    chat_data = {k: v for k, v in data.items() if k != 'imgData'}
    print('Chat data:', chat_data)

    # imgData有值时，打印有上传图片文件
    if data.get('imgData') is not None:
        print('有上传图片文件')
    

    try:
        input = data.get('input')
        model_name = data.get('model')
        session_id = data.get('session_id', 'default')  # 使用session_id来区分不同会话
        base64_str = data.get('imgData')
        model = gen_ai.GenerativeModel(model_name)
        response = None

        # 获取或创建会话历史
        if session_id not in chat_histories:
            chat_histories[session_id] = []
            chat = model.start_chat(history=[])
        else:
            chat = model.start_chat(history=chat_histories[session_id])

        if base64_str is not None:
            img = Image.open(io.BytesIO(base64.decodebytes(bytes(base64_str, "utf-8"))))
            if input is not None:
                response = model.generate_content([input, img], stream=True)
                response.resolve()
            else:
                response = model.generate_content(img, stream=True)
        else:
            response = chat.send_message(input, stream=True)

        # 收集完整响应
        full_response = ""
        for chunk in response:
            text = chunk.text
            full_response += text
            ci.add(text)

        # 保存对话历史
        chat_histories[session_id].append({
            "role": "user",
            "parts": [input]
        })
        chat_histories[session_id].append({
            "role": "model",
            "parts": [full_response]
        })

    except Exception as e:
        ci.add('Error: ' + str(e))
        print(e)
    finally:
        ci.close()