# ai-hackathon

開発時のルールは [docs/rules.md](docs/rules.md) を、参考資料は [docs/ref.md](docs/ref.md) を参照すること  

## 技術スタック

- Next.js
- shadcn/ui
- Vercel AI SDK

## 開発サーバー起動

```sh
pnpm i
pnpm dev
```

<http://localhost:3000>  

## Lint/Format

```sh
pnpm check
```

## Test

こっちは起動し続けて、テストを自動的にやってくれる

```sh
pnpm test
```

1回きりのテストの場合は

```sh
pnpm test run
```

## バックエンドサーバーの起動方法

### 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
ACCESS_KEY=your_r2_access_key
SECRET_KEY=your_r2_secret_key
GEMINI_KEY=your_gemini_api_key
```

### サーバーの起動

1. バックエンドディレクトリに移動：
```bash
cd backend
```

2. サーバーを起動：
```bash
uvicorn main:app --reload
```

サーバーは `http://localhost:8000` で起動します。

### APIの使用例

画像をアップロードして分析するには、以下のようにリクエストを送信します：

```bash
curl -X POST "http://localhost:8000/analyze" -F "file=@path/to/image.jpg"
```

レスポンス例：
```json
{
  "name": "商品名",
  "expiration_date": "2025-04-28T00:00:00Z",
  "image_url": "https://pub-7444760b0415482ba8f55298c08a442b.r2.dev/..."
}
```
