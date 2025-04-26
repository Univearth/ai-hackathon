#!/bin/bash

# テスト用のエンドポイント
API_URL="http://localhost:8000/suggest-menu"

curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "name": "ニラ",
        "expiration_date": "2024-04-30T00:00:00Z",
        "expiration_type": "best_before",
        "image_url": "",
        "amount": 100,
        "unit": "g",
        "category": "野菜"
      }
    ]
  }'
