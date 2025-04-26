from pydantic import BaseModel
from minio import Minio
import os
import uuid
from dotenv import load_dotenv
import json
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import tempfile
import base64
from openai import OpenAI
from typing import List, Optional
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import MessageEvent, TextMessage, TextSendMessage, ImageMessage

# 環境変数の読み込み
load_dotenv()

app = FastAPI()

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # すべてのオリジンを許可
    allow_credentials=True,
    allow_methods=["*"],  # すべてのHTTPメソッドを許可
    allow_headers=["*"],  # すべてのヘッダーを許可
)

client = OpenAI(
    base_url = 'https://ollama.yashikota.com/v1',
    api_key='ollama', # required, but unused
)

# LINE Botの設定
line_bot_api = LineBotApi(os.getenv("CHANNEL_ID"))
handler = WebhookHandler(os.getenv("CHANNEL_SECRET"))

# ユーザーIDとJSONデータを保存する辞書
user_data = {}

class ProductInfo(BaseModel):
    name: str
    expiration_date: str
    expiration_type: str
    image_url: str
    amount: float
    unit: str
    category: str

class MenuRequest(BaseModel):
    products: List[ProductInfo]

class MenuResponse(BaseModel):
    title: str
    ingredients: List[str]
    indication: str

class RecipeRequest(BaseModel):
    menu_name: str
    category: Optional[str] = None

class RecipeResponse(BaseModel):
    title: str
    url: str
    ingredients: List[str]
    instructions: List[str]
    difficulty: str
    cooking_time: str
    servings: int

class UploadJsonRequest(BaseModel):
    id: str
    data: dict

# MinIOクライアントの設定
minio_client = Minio(
    "d0e701f84b51921572cb3d46b9ad038a.r2.cloudflarestorage.com",
    access_key=os.getenv("ACCESS_KEY"),
    secret_key=os.getenv("SECRET_KEY"),
    secure=True
)

def upload_to_r2(file_path: str) -> str:
    # ファイル名を生成
    file_extension = os.path.splitext(file_path)[1]
    object_name = f"{uuid.uuid4()}{file_extension}"

    # R2にアップロード
    minio_client.fput_object(
        "ai-hackathon",
        object_name,
        file_path
    )

    # URLを生成
    url = f"https://pub-7444760b0415482ba8f55298c08a442b.r2.dev/{object_name}"
    return url

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="画像ファイルをアップロードしてください")

    # 一時ファイルを作成
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
        try:
            # アップロードされたファイルの内容を一時ファイルに書き込み
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

            # R2にアップロードしてURLを取得
            image_url = upload_to_r2(temp_file_path)

            # 画像をbase64エンコード
            with open(temp_file_path, 'rb') as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')

            # OpenAIクライアントを使用してリクエストを送信
            try:
                print("Sending request to OpenAI API...")
                response = client.chat.completions.create(
                    model="gemma3:27b",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "この写真から以下の情報をJSON形式で出力してください：\n"
                                    "1. 商品名 (日本語で)\n"
                                    "2. 賞味期限または消費期限（ISO 8601形式で）\n"
                                    "   - 日付の解釈に注意してください。例えば「25.4.28」は「2025年4月28日」と解釈してください\n"
                                    "   - 年が2桁で表記されている場合は、2000年代として解釈してください\n"
                                    "   - 時間が記載されている場合は、その時間も含めて出力してください（例：2025-04-28T14:30:00Z）\n"
                                    "   - 時間が記載されていない場合は、00:00:00として出力してください\n"
                                    "   - 賞味期限と消費期限を区別して認識してください\n"
                                    "   - 賞味期限の場合は「best_before」、消費期限の場合は「use_by」として出力してください\n"
                                    "   - 区別ができない場合は「best_before」として出力してください\n"
                                    "3. 画像URL（空文字列で構いません）\n"
                                    "4. 分量（数値のみ、単位は含めない。例：300、1.5、500など）\n"
                                    "5. 単位（以下のいずれかから選択）：\n"
                                    "   - g\n"
                                    "   - kg\n"
                                    "   - ml\n"
                                    "   - L\n"
                                    "   - 個\n"
                                    "   - 枚\n"
                                    "   - 本\n"
                                    "6. 分類（以下のいずれかから選択）：\n"
                                    "   - 肉\n"
                                    "   - 野菜\n"
                                    "   - 魚\n"
                                    "   - 調味料\n"
                                    "   - お菓子\n"
                                    "   - 飲料\n"
                                    "   - その他\n"
                                    "JSONのキーは以下の通りです：\n"
                                    "- name\n"
                                    "- expiration_date\n"
                                    "- expiration_type\n"
                                    "- image_url\n"
                                    "- amount\n"
                                    "- unit\n"
                                    "- category"
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64_image}"
                                    }
                                }
                            ]
                        }
                    ],
                    response_format={
                        "type": "json_object",
                        "schema": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "expiration_date": {"type": "string"},
                                "expiration_type": {"type": "string", "enum": ["best_before", "use_by"]},
                                "image_url": {"type": "string"},
                                "amount": {"type": "number"},
                                "unit": {"type": "string"},
                                "category": {"type": "string"}
                            },
                            "required": ["name", "expiration_date", "expiration_type", "image_url", "amount", "unit", "category"]
                        }
                    }
                )
                print(f"OpenAI API response: {response}")

                # レスポンスをJSONとしてパース
                result = json.loads(response.choices[0].message.content)
                print(f"Parsed result: {result}")
                # 画像URLを設定
                result["image_url"] = image_url

                return result

            except Exception as e:
                print(f"OpenAI API error: {str(e)}")
                print(f"Error type: {type(e)}")
                print(f"Error args: {e.args}")
                raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

        except Exception as e:
            print(f"Error in image processing: {str(e)}")
            raise HTTPException(status_code=500, detail=f"画像処理エラー: {str(e)}")

        finally:
            # 一時ファイルを削除
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

@app.post("/suggest-menu")
async def suggest_menu(request: MenuRequest):
    try:
        # 期限が近い順にソート
        sorted_products = sorted(
            request.products,
            key=lambda x: x.expiration_date
        )

        if not sorted_products:
            raise HTTPException(status_code=400, detail="食材が登録されていません")

        # 期限が近い3つの商品を選択
        ingredients = sorted_products[:3]

        # OpenAI APIにリクエストを送信（最大3回までリトライ）
        max_retries = 5
        retry_count = 0
        last_error = None

        while retry_count < max_retries:
            try:
                response = client.chat.completions.create(
                    model="gemma3:27b",
                    messages=[
                        {
                            "role": "user",
                            "content": f"以下の食材を使って、簡単に作れる料理を提案してください：\n"
                            f"{', '.join([f'{p.name} ({p.amount}{p.unit})' for p in ingredients])}\n\n"
                            f"以下の形式でJSONで出力してください：\n"
                            f"- title: 料理名\n"
                            f"- ingredients: 必要な材料のリスト\n"
                            f"- indication: 調理時間（例：約10分）"
                        }
                    ],
                    response_format={
                        "type": "json_object",
                        "schema": {
                            "type": "object",
                            "properties": {
                                "title": {"type": "string"},
                                "ingredients": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                },
                                "indication": {"type": "string"}
                            },
                            "required": ["title", "ingredients", "indication"]
                        }
                    }
                )

                result = json.loads(response.choices[0].message.content)
                return result

            except Exception as e:
                last_error = e
                retry_count += 1
                print(f"OpenAI API error (attempt {retry_count}/{max_retries}): {str(e)}")
                if retry_count < max_retries:
                    # 1秒待ってからリトライ
                    import time
                    time.sleep(1)
                    continue

        # すべてのリトライが失敗した場合
        print(f"All retries failed. Last error: {str(last_error)}")
        raise HTTPException(status_code=500, detail=f"献立提案エラー: {str(last_error)}")

    except Exception as e:
        print(f"Menu suggestion error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"献立提案エラー: {str(e)}")

@app.post("/upload-json")
async def upload_json(request: UploadJsonRequest):
    try:
        # 一時ファイルを作成してJSONを書き込む
        with tempfile.NamedTemporaryFile(suffix='.json', delete=False, mode='wb') as temp_file:
            json_data = json.dumps(request.data, ensure_ascii=False)
            temp_file.write(json_data.encode('utf-8'))
            temp_file.flush()  # バッファをフラッシュ
            temp_file_path = temp_file.name

        try:
            # R2にアップロード
            object_name = f"{request.id}.json"
            minio_client.fput_object(
                "ai-hackathon",
                object_name,
                temp_file_path
            )

            # URLを生成
            url = f"https://pub-7444760b0415482ba8f55298c08a442b.r2.dev/{object_name}"
            return {"url": url}

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"アップロードエラー: {str(e)}")

        finally:
            # 一時ファイルを削除
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"サーバーエラー: {str(e)}")


@app.get("/get-json/{id}")
async def get_json(id: str):
    try:
        # 一時ファイルを作成
        with tempfile.NamedTemporaryFile(suffix='.json', delete=False, mode='wb') as temp_file:
            temp_file_path = temp_file.name

            try:
                # R2からファイルをダウンロード
                object_name = f"{id}.json"
                minio_client.fget_object(
                    "ai-hackathon",
                    object_name,
                    temp_file_path
                )

                # JSONファイルを読み込む
                with open(temp_file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                return data

            except Exception as e:
                if "NoSuchKey" in str(e):
                    raise HTTPException(status_code=404, detail="指定されたIDのファイルが見つかりません")
                raise HTTPException(status_code=500, detail=f"ダウンロードエラー: {str(e)}")

            finally:
                # 一時ファイルを削除
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"サーバーエラー: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/callback")
async def callback(request: Request):
    # get X-Line-Signature header value
    signature = request.headers.get("X-Line-Signature")
    if signature is None:
        raise HTTPException(status_code=400, detail="X-Line-Signature header missing")

    # get request body as text
    body = await request.body()
    body = body.decode("utf-8")

    # handle webhook body
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        raise HTTPException(
            status_code=400,
            detail="Invalid signature. Please check your channel access token/channel secret.",
        )

    return "OK"

@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    user_id = event.source.user_id
    text = event.message.text

    if text == "開始":
        user_data[user_id] = {"products": []}
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text="ユーザーIDを登録しました。画像を送信してください。")
        )
    else:
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text="「開始」と送信して、ユーザーIDを登録してください。")
        )

@handler.add(MessageEvent, message=ImageMessage)
def handle_image(event):
    user_id = event.source.user_id

    if user_id not in user_data:
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text="まず「開始」と送信して、ユーザーIDを登録してください。")
        )
        return

    try:
        # 画像を一時ファイルとして保存
        message_content = line_bot_api.get_message_content(event.message.id)
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
            for chunk in message_content.iter_content():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        # 画像をR2にアップロード
        image_url = upload_to_r2(temp_file_path)

        # 画像をbase64エンコード
        with open(temp_file_path, 'rb') as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')

        # OpenAI APIを使用して画像分析
        response = client.chat.completions.create(
            model="gemma3:27b",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "この写真から以下の情報をJSON形式で出力してください：\n"
                            "1. 商品名 (日本語で)\n"
                            "2. 賞味期限または消費期限（ISO 8601形式で）\n"
                            "3. 画像URL（空文字列で構いません）\n"
                            "4. 分量（数値のみ、単位は含めない）\n"
                            "5. 単位（g, kg, ml, L, 個, 枚, 本）\n"
                            "6. 分類（肉, 野菜, 魚, 調味料, お菓子, 飲料, その他）"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            response_format={
                "type": "json_object",
                "schema": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "expiration_date": {"type": "string"},
                        "expiration_type": {"type": "string", "enum": ["best_before", "use_by"]},
                        "image_url": {"type": "string"},
                        "amount": {"type": "number"},
                        "unit": {"type": "string"},
                        "category": {"type": "string"}
                    },
                    "required": ["name", "expiration_date", "expiration_type", "image_url", "amount", "unit", "category"]
                }
            }
        )

        result = json.loads(response.choices[0].message.content)
        result["image_url"] = image_url

        # ユーザーのデータに商品を追加
        user_data[user_id]["products"].append(result)

        # JSONを保存
        with tempfile.NamedTemporaryFile(suffix='.json', delete=False, mode='w') as temp_file:
            json.dump(user_data[user_id], temp_file, ensure_ascii=False)
            temp_file_path = temp_file.name

        # R2にアップロード
        object_name = f"{user_id}.json"
        minio_client.fput_object(
            "ai-hackathon",
            object_name,
            temp_file_path
        )

        # レスポンスメッセージを作成
        message = f"商品を登録しました：\n"
        message += f"商品名：{result['name']}\n"
        message += f"期限：{result['expiration_date']}\n"
        message += f"分量：{result['amount']}{result['unit']}\n"
        message += f"分類：{result['category']}"

        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text=message)
        )

    except Exception as e:
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text=f"エラーが発生しました：{str(e)}")
        )

    finally:
        # 一時ファイルを削除
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
