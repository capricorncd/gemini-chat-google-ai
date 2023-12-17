# chat-google-gemini

Chat demo developed using Google Gemini AI API

https://ai.google.dev/

![chat-google-gemini](./ui.png)

## Setup

### 创建和使用虚拟环境

```bash
# 创建
python -m venv .venv

# 启用
# Mac
source .venv/bin/activate
# Windows
.venv\Scripts\activate
```

启用成功Terminal显示如下：

```
(.venv) (base) username@PC-name folder-name
```

#### VS code

创建Json或添加下列配置进`.vscode/settings.json`

```json
{
  "python.terminal.activateEnvironment": true
}
```

> VS Code虚拟环境启用不成功时，可从菜单栏重新新建terminal

### 安装依赖

```bash
pip install -r requirements.txt
```

### 创建`.env`文件

- 复制`.env.example`文件，并重命名为`.env`
- 或在根目录下新建`.env`文件

```
# 需要注册的环境变量，key=value的形式
# 例如：
GOOGLE_API_KEY=ai_api_key_xxxxxxx
```

### 启动服务

```bash
uvicorn main:app --reload
```
