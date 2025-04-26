# バックエンド API

このバックエンドは、画像から商品情報を解析するAPIを提供します。

## エンドポイント

### 1. 画像解析エンドポイント

**エンドポイント**: `https://backend.yashikota.com/analyze`

**メソッド**: POST

**Content-Type**: `multipart/form-data`

**リクエストボディ**:
- `file`: 画像ファイル（必須）

**レスポンス**:
```json
{
  "name": "商品名（日本語）",
  "expiration_date": "賞味期限（ISO 8601形式）",
  "image_url": "アップロードされた画像のURL",
  "amount": 300.0,  // 分量（数値のみ、単位は含まない）
  "unit": "g",  // 単位（g、kg、ml、L、個、枚、本など）
  "category": "分類（肉、野菜、魚、調味料、お菓子、飲料、その他）"
}
```

**使用例**:
```javascript
// JavaScriptでの使用例
const formData = new FormData();
formData.append('file', imageFile);  // imageFileはFileオブジェクト

const response = await fetch('https://backend.yashikota.com/analyze', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

**curlでの使用例**:
```bash
curl -X POST https://backend.yashikota.com/analyze \
  -F "file=@/path/to/image.jpg"
```

### 2. ヘルスチェックエンドポイント

**エンドポイント**: `https://backend.yashikota.com/health`

**メソッド**: GET

**レスポンス**:
```json
{
  "status": "ok"
}
```

## 環境変数

以下の環境変数が必要です：

- `ACCESS_KEY`: MinIOのアクセスキー
- `SECRET_KEY`: MinIOのシークレットキー
- `GEMINI_KEY`: Google Gemini APIのキー

## 実行方法

1. 必要なパッケージをインストール:
```bash
pip install -r requirements.txt
```

2. 環境変数を設定:
```bash
export ACCESS_KEY=your_access_key
export SECRET_KEY=your_secret_key
export GEMINI_KEY=your_gemini_key
```

3. サーバーを起動:
```bash
python main.py
```

デフォルトでは`http://localhost:8000`でサーバーが起動します。
