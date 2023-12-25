import os, io, base64
import google.generativeai as genai
from PIL import Image

from typing import List
from modules.CustomIterator import CustomIterator

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

MODEL_VISION = 'gemini-pro-vision'

def get_model_list() -> List[str]:
    l = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            l.append(m.name.replace('models/', ''))
    return l


def chat_gemini(ci: CustomIterator, data: dict):
    print(data)
    
    try:
        input = data.get('input')
        model_name = data.get('model')
        base64_str = data.get('imgData')
        model = genai.GenerativeModel(model_name)
        response = None
        if model_name == MODEL_VISION and base64_str is not None:
            img = Image.open(io.BytesIO(base64.decodebytes(bytes(base64_str, "utf-8"))))
            if input is not None:
                response = model.generate_content([input, img], stream=True)
                response.resolve()
            else:
                response = model.generate_content(img, stream=True)
        else:
            chat = model.start_chat(history=[])
            response = chat.send_message(input, stream=True)

        for chunk in response:
            ci.add(chunk.text)
    except Exception as e:
        ci.add('Error: ' + e.message)
        print(e)
    finally:
        ci.close()