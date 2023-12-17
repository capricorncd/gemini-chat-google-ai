import os
import re

from typing import Dict


def load_env_file(file_path: str = ".env") -> Dict[str, str]:
    """
    Loads the environment variables from a file.
    :param file_path: The path to the file.
    """
    if not os.path.exists(file_path):
        raise ValueError(f"File {file_path} does not exist.")

    result = {}

    with open(file_path, "r") as file:
        for line in file:
            m = re.search(r"^(\w+)\s*=\s*(.+)", line.strip())
            if m:
                key = m.group(1)
                val = m.group(2).strip('"').strip("'")
                if key and val:
                    os.environ[key] = val
                    result[key] = val

    return result
