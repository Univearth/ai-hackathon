#!/bin/bash

# ポート8000を使用しているプロセスを特定して終了
PID=$(lsof -i :8000 -t)
if [ ! -z "$PID" ]; then
  echo "ポート8000を使用しているプロセス（PID: $PID）を終了します..."
  kill -9 $PID
  sleep 1
fi

# アプリケーションを起動
echo "アプリケーションを起動します..."
cd backend
uv run backend/main.py
