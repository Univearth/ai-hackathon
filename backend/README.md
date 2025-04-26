# バックエンド API

このバックエンドは、画像から商品情報を解析するAPIと、期限が近い食材を使った献立を提案するAPIを提供します。

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
  "expiration_date": "賞味期限または消費期限（ISO 8601形式）",
  "expiration_type": "best_before または use_by",
  "image_url": "アップロードされた画像のURL",
  "amount": 300.0,  // 分量（数値のみ、単位は含まない）
  "unit": "g",  // 単位（g、kg、ml、L、個、枚、本など）
  "category": "分類（肉、野菜、魚、調味料、お菓子、飲料、その他）"
}
```

**expiration_typeの説明**:
- `best_before`: 賞味期限の場合
- `use_by`: 消費期限の場合
- 区別ができない場合は`best_before`として出力されます

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

### 2. 献立提案エンドポイント

**エンドポイント**: `https://backend.yashikota.com/suggest-menu`

**メソッド**: POST

**Content-Type**: `application/json`

**リクエストボディ**:
```json
{
  "products": [
    {
      "name": "商品名",
      "expiration_date": "賞味期限または消費期限（ISO 8601形式）",
      "expiration_type": "best_before または use_by",
      "image_url": "画像URL",
      "amount": 300.0,
      "unit": "g",
      "category": "分類"
    }
  ]
}
```

**レスポンス**:
```json
{
  "menu": "提案する料理名",
  "ingredients": [
    {
      "name": "使用する食材名",
      "expiration_date": "賞味期限または消費期限",
      "expiration_type": "best_before または use_by",
      "image_url": "画像URL",
      "amount": 300.0,
      "unit": "g",
      "category": "分類"
    }
  ],
  "reason": "この料理を提案する理由"
}
```

**使用例**:
```javascript
// JavaScriptでの使用例
const response = await fetch('https://backend.yashikota.com/suggest-menu', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    products: [
      {
        name: "フライドフィッシュ タールタル",
        expiration_date: "2025-04-28T00:00:00Z",
        expiration_type: "best_before",
        image_url: "https://example.com/image.jpg",
        amount: 267.84,
        unit: "ml",
        category: "魚"
      }
    ]
  })
});

const result = await response.json();
console.log(result);
```

**curlでの使用例**:
```bash
curl -X POST https://backend.yashikota.com/suggest-menu \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "name": "フライドフィッシュ タールタル",
        "expiration_date": "2025-04-28T00:00:00Z",
        "expiration_type": "best_before",
        "image_url": "https://example.com/image.jpg",
        "amount": 267.84,
        "unit": "ml",
        "category": "魚"
      }
    ]
  }'
```

### 3. ヘルスチェックエンドポイント

**エンドポイント**: `https://backend.yashikota.com/health`

**メソッド**: GET

**レスポンス**:
```json
{
  "status": "ok"
}
```

## JSONファイル操作API

### JSONファイルのアップロード

JSONデータをR2にアップロードします。

**エンドポイント**: `POST /upload-json`

**リクエストボディ**:
```json
{
  "id": "ファイルのID",
  "data": {
    // 任意のJSONデータ
  }
}
```

**レスポンス**:
```json
{
  "url": "アップロードされたファイルのURL"
}
```

**エラー**:
- 400: 不正なリクエスト
- 500: サーバーエラー

### JSONファイルの取得

指定したIDのJSONファイルを取得します。

**エンドポイント**: `GET /get-json/{id}`

**パラメータ**:
- `id`: 取得したいファイルのID

**レスポンス**:
```json
{
  // アップロードされたJSONデータ
}
```

**エラー**:
- 404: ファイルが見つからない
- 500: サーバーエラー

## テスト

### テストスクリプトの実行

JSONファイル操作APIのテストを行うには、以下のコマンドを実行します：

```bash
python test_upload.py
```

このスクリプトは以下のテストを実行します：
1. JSONデータのアップロード
2. アップロードしたデータの取得

テストデータは以下の形式でアップロードされます：
```json
{
  "name": "テストデータ",
  "value": 123,
  "items": ["item1", "item2", "item3"]
}
```

### 手動テスト

curlを使用して手動でテストすることもできます：

```bash
# アップロード
curl -X POST http://localhost:8000/upload-json \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-id",
    "data": {
      "key": "value"
    }
  }'

# 取得
curl http://localhost:8000/get-json/test-id
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
