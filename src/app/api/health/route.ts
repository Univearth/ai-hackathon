import { NextResponse } from "next/server";

// バックエンドのAPIエンドポイント
const API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export const GET = async () => {
  try {
    // バックエンドAPIのヘルスチェックエンドポイントにリクエストを送信
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    // レスポンスが成功しなかった場合エラーを返す
    if (!response.ok) {
      return NextResponse.json(
        { error: 'バックエンドサーバーに接続できません' },
        { status: response.status }
      );
    }

    // 成功した場合はレスポンスデータを返す
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('ヘルスチェックエラー:', error);
    return NextResponse.json(
      { error: 'バックエンドサーバーに接続できません' },
      { status: 500 }
    );
  }
};
