import os
import google.generativeai as genai

from typing import List
from modules.CustomIterator import CustomIterator


def get_model_list() -> List[str]:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
    l = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            l.append(m.name.replace('models/', ''))
    return l


def chat_gemini(ci: CustomIterator, input):
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(input, stream=True)
    try:
        for chunk in response:
            ci.add(chunk.text)
    except Exception as e:
        print(e)
    finally:
        ci.close()