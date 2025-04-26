from pydantic import BaseModel
from google import genai
from google.genai import types
from minio import Minio
import os
import uuid
from dotenv import load_dotenv
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import base64
from typing import Optional

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

class ProductInfo(BaseModel):
    name: str
    expiration_date: str
    image_url: str
    amount: str  # 分量（例：300g）
    category: str  # 分類（例：肉、野菜、魚、調味料、お菓子など）

class ImageRequest(BaseModel):
    image_base64: str
    content_type: Optional[str] = "image/jpeg"

# MinIOクライアントの設定
minio_client = Minio(
    "d0e701f84b51921572cb3d46b9ad038a.r2.cloudflarestorage.com",
    access_key=os.getenv("ACCESS_KEY"),
    secret_key=os.getenv("SECRET_KEY"),
    secure=True
)

client = genai.Client(api_key=os.getenv("GEMINI_KEY"))

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
async def analyze_image(request: ImageRequest):
    try:
        # Base64をデコード
        image_data = base64.b64decode(request.image_base64.encode('utf-8'))

        # 一時ファイルとして保存
        temp_file_path = f"temp_{uuid.uuid4()}.jpg"
        with open(temp_file_path, "wb") as buffer:
            buffer.write(image_data)

        # R2にアップロードしてURLを取得
        image_url = upload_to_r2(temp_file_path)

        response = client.models.generate_content(
            model='gemini-2.5-pro-exp-03-25',
            contents=[
                types.Part.from_bytes(
                    data=image_data,
                    mime_type=request.content_type,
                ),
                'この写真から以下の情報をJSON形式で出力してください：\n'
                '1. 商品名 (日本語で)\n'
                '2. 賞味期限または消費期限（ISO 8601形式で）\n'
                '   - 日付の解釈に注意してください。例えば「25.4.28」は「2025年4月28日」と解釈してください\n'
                '   - 年が2桁で表記されている場合は、2000年代として解釈してください\n'
                '   - 時間が記載されている場合は、その時間も含めて出力してください（例：2025-04-28T14:30:00Z）\n'
                '   - 時間が記載されていない場合は、00:00:00として出力してください\n'
                '3. 画像URL（空文字列で構いません）\n'
                '4. 分量（例：300g、1kg、500mlなど）\n'
                '5. 分類（以下のいずれかから選択）：\n'
                '   - 肉\n'
                '   - 野菜\n'
                '   - 魚\n'
                '   - 調味料\n'
                '   - お菓子\n'
                '   - 飲料\n'
                '   - その他\n'
                'JSONのキーは以下の通りです：\n'
                '- name\n'
                '- expiration_date\n'
                '- image_url\n'
                '- amount\n'
                '- category'
            ],
            config={
                "response_mime_type": "application/json",
                "response_schema": ProductInfo
            }
        )

        # レスポンスをJSONとしてパース
        result = json.loads(response.text)
        # 画像URLを設定
        result["image_url"] = image_url

        return result

    except Exception as e:
        print(f"エラーが発生しました: {str(e)}")
        raise

    finally:
        # 一時ファイルを削除
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
