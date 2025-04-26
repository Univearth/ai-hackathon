from pydantic import BaseModel
import ollama
from minio import Minio
import os
import uuid
from dotenv import load_dotenv
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import tempfile
import base64
import requests

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

            # OllamaのAPIにリクエストを送信
            try:
                response = requests.post(
                    "https://ollama.yashikota.com/api/chat",
                    json={
                        "model": "gemma3:27b",
                        "messages": [
                            {
                                "role": "user",
                                "content": "この写真から以下の情報をJSON形式で出力してください：\n"
                                "1. 商品名 (日本語で)\n"
                                "2. 賞味期限または消費期限（ISO 8601形式で）\n"
                                "   - 日付の解釈に注意してください。例えば「25.4.28」は「2025年4月28日」と解釈してください\n"
                                "   - 年が2桁で表記されている場合は、2000年代として解釈してください\n"
                                "   - 時間が記載されている場合は、その時間も含めて出力してください（例：2025-04-28T14:30:00Z）\n"
                                "   - 時間が記載されていない場合は、00:00:00として出力してください\n"
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
                                "- image_url\n"
                                "- amount\n"
                                "- unit\n"
                                "- category",
                                "images": [base64_image]
                            }
                        ],
                        "format": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "expiration_date": {"type": "string"},
                                "image_url": {"type": "string"},
                                "amount": {"type": "number"},
                                "unit": {"type": "string"},
                                "category": {"type": "string"}
                            },
                            "required": ["name", "expiration_date", "image_url", "amount", "unit", "category"]
                        }
                    }
                )

                if response.status_code != 200:
                    print(f"Ollama API error: {response.status_code} - {response.text}")
                    raise HTTPException(status_code=500, detail=f"Ollama API error: {response.text}")

                # レスポンスをJSONとしてパース
                result = json.loads(response.json()['message']['content'])
                # 画像URLを設定
                result["image_url"] = image_url

                return result

            except requests.exceptions.RequestException as e:
                print(f"Request error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"APIリクエストエラー: {str(e)}")
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"JSONデコードエラー: {str(e)}")
            except Exception as e:
                print(f"Unexpected error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"予期せぬエラー: {str(e)}")

        except Exception as e:
            print(f"Error in image processing: {str(e)}")
            raise HTTPException(status_code=500, detail=f"画像処理エラー: {str(e)}")

        finally:
            # 一時ファイルを削除
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
