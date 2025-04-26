# バックエンド API

このバックエンドは、画像から商品情報を解析するAPIを提供します。

## エンドポイント

### 1. 画像解析エンドポイント

**エンドポイント**: `https://backend.yashikota.com/analyze`

**メソッド**: POST

**リクエストボディ**:
```json
{
  "image_base64": "Base64でエンコードされた画像データ",
  "content_type": "image/jpeg"  // オプション、デフォルトは "image/jpeg"
}
```

**レスポンス**:
```json
{
  "name": "商品名（日本語）",
  "expiration_date": "賞味期限（ISO 8601形式）",
  "image_url": "アップロードされた画像のURL",
  "amount": "分量（例：300g、1kg、500mlなど）",
  "category": "分類（肉、野菜、魚、調味料、お菓子、飲料、その他）"
}
```

**使用例**:
```javascript
// JavaScriptでの使用例
const response = await fetch('https://backend.yashikota.com/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image_base64: 'Base64でエンコードされた画像データ',
    content_type: 'image/jpeg'
  })
});

const result = await response.json();
console.log(result);
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
