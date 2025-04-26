# バックエンド API

このバックエンドは、画像から商品情報を解析するAPIを提供します。

## エンドポイント

### 1. 画像解析エンドポイント

**エンドポイント**: `/analyze`

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
  "image_url": "アップロードされた画像のURL"
}
```

**使用例**:
```javascript
// JavaScriptでの使用例
const response = await fetch('http://localhost:8000/analyze', {
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

**エンドポイント**: `/health`

**メソッド**: GET

**レスポンス**:
```json
{
  "status": "ok"
}
```
