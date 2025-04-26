#!/bin/bash

# 画像ファイルのパスを引数から取得
IMAGE_PATH=${1:-"image/sample.jpg"}  # デフォルトは image/sample.jpg

# ヘルスチェック
echo "ヘルスチェックを実行します..."
curl http://localhost:8000/health

echo ""
echo "画像解析を実行します..."
echo "使用する画像: $IMAGE_PATH"

# 画像ファイルの存在確認
if [ ! -f "$IMAGE_PATH" ]; then
    echo "エラー: 画像ファイルが見つかりません: $IMAGE_PATH"
    exit 1
fi

# 画像解析APIを呼び出し
curl -X POST http://localhost:8000/analyze \
  -F "file=@$IMAGE_PATH"
