import queue

from typing import Iterator


class CustomIterator(Iterator):
    """
    Custom iterator that can be used to iterate over a queue.
    """

    def __init__(self):
        self.queue = queue.Queue()

    def __iter__(self):
        return self

    def __next__(self):
        item = self.queue.get()
        if item is StopIteration:
            raise StopIteration
        return item

    def add(self, item):
        self.queue.put(item)

    def close(self):
        self.add(StopIteration)
        