import threading
import time

from typing import Iterator

from modules.CustomIterator import CustomIterator
from modules.gemini import chat_gemini


def test_fn(ci, input):
    try:
        for i in input:
            ci.add(i)
            time.sleep(0.05)
    finally:
        ci.close()


def run_stream(data) -> Iterator:
    ci = CustomIterator()
    threading.Thread(target=chat_gemini, args=(ci, data)).start()
    return ci
