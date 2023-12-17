# chat-google-gemini

Chat demo developed using Google Gemini AI API. https://ai.google.dev/

![chat-google-gemini](./ui.png)

## Setup

### Create and enable virtual environments

```bash
# create
python -m venv .venv

# enable
# Mac
source .venv/bin/activate
# Windows
.venv\Scripts\activate
```

Terminal log

```
(.venv) (base) username@PC-name folder-name
```

#### VS code

Create or update `.vscode/settings.json`

```json
{
  "python.terminal.activateEnvironment": true
}
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Create `.env` file

- copy `.env.example` and rename `.env`
- or create `.env` file

```
# Google api key
GOOGLE_API_KEY=ai_api_key_xxxxxxx
```

### Start service

```bash
uvicorn main:app --reload
```

### Other

https://vuetifyjs.com/

