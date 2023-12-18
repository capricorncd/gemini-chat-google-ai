from fastapi import FastAPI
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from modules.stream import run_stream
from modules.gemini import get_model_list

from modules.utils import load_env_file

load_env_file()


app = FastAPI()

app.mount('/static', StaticFiles(directory='static'), name='static')


@app.get('/')
def get_home():
    return FileResponse('static/index.html')


@app.post('/api/stream')
def post_api_stream(data: dict):
    return StreamingResponse(run_stream(data), media_type='text/event-stream')


@app.get('/api/model-list')
def get_api_model_list():
    return get_model_list()
