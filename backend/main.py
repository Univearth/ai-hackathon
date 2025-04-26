from pydantic import BaseModel
from google import genai
from google.genai import types
from minio import Minio
import os
import uuid
from dotenv import load_dotenv
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import tempfile

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
    amount: float  # 分量（例：300.0）
    unit: str  # 単位（例：g、kg、ml、Lなど）
    category: str  # 分類（例：肉、野菜、魚、調味料、お菓子など）

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

            # Gemini APIに画像データを送信
            try:
                response = client.models.generate_content(
                    model='gemini-2.5-pro-exp-03-25',
                    contents=[
                        types.Part.from_bytes(
                            data=content,
                            mime_type=file.content_type,
                        ),
                        'この写真から以下の情報をJSON形式で出力してください：\n'
                        '1. 商品名 (日本語で)\n'
                        '2. 賞味期限または消費期限（ISO 8601形式で）\n'
                        '   - 日付の解釈に注意してください。例えば「25.4.28」は「2025年4月28日」と解釈してください\n'
                        '   - 年が2桁で表記されている場合は、2000年代として解釈してください\n'
                        '   - 時間が記載されている場合は、その時間も含めて出力してください（例：2025-04-28T14:30:00Z）\n'
                        '   - 時間が記載されていない場合は、00:00:00として出力してください\n'
                        '3. 画像URL（空文字列で構いません）\n'
                        '4. 分量（数値のみ、単位は含めない。例：300、1.5、500など）\n'
                        '5. 単位（以下のいずれかから選択）：\n'
                        '   - g\n'
                        '   - kg\n'
                        '   - ml\n'
                        '   - L\n'
                        '   - 個\n'
                        '   - 枚\n'
                        '   - 本\n'
                        '6. 分類（以下のいずれかから選択）：\n'
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
                        '- unit\n'
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
                print(f"Gemini APIエラー: {str(e)}")
                raise HTTPException(status_code=500, detail="画像解析に失敗しました")

        except Exception as e:
            print(f"ファイル処理エラー: {str(e)}")
            raise HTTPException(status_code=500, detail="ファイル処理に失敗しました")

        finally:
            # 一時ファイルを削除
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
