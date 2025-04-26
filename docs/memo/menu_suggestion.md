# AI献立提案機能の実装手順

## 1. 概要
ローカルストレージに保存されている食材情報を活用して、AIが献立を提案する機能を実装します。OllamaのOpenAI互換APIを使用して、効率的なストリーミング処理を実現します。

## 2. 必要な情報
現在のローカルストレージには以下の情報が保存されています：
- 商品名（name）
- 賞味期限（expiration_date）
- 画像URL（image_url）
- 数量（amount）
- 単位（unit）

## 3. 実装手順

### 3.1 新しい型定義の追加
`src/types/menu.ts`に以下の型を追加：

```typescript
export type MenuSuggestion = {
  title: string;          // 献立名
  ingredients: string[];  // 必要な材料
  instructions: string[]; // 調理手順
  difficulty: string;     // 難易度
  cookingTime: number;    // 調理時間（分）
  servings: number;       // 何人前
};
```

### 3.2 APIエンドポイントの作成
`src/app/api/menu/route.ts`を作成：

```typescript
import { OpenAI } from 'openai';
import { StreamingTextResponse, Message } from 'ai';

const client = new OpenAI({
  baseURL: 'https://ollama.yashikota.com/v1/',
  apiKey: 'ollama', // required but ignored
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const ingredients = messages[messages.length - 1].data?.ingredients || [];

  // システムプロンプトとユーザープロンプトの作成
  const systemPrompt = {
    role: 'system',
    content: 'あなたは料理の専門家です。与えられた食材を使って作れる料理を提案してください。必ずJSONフォーマットで返答してください。'
  };

  const userPrompt = {
    role: 'user',
    content: `
以下の食材を使用して作れる料理を提案してください：
${ingredients.map((item: ResponseTypes) => 
  `- ${item.name} (${item.amount}${item.unit})`
).join('\n')}

以下の形式でJSONを返してください：
{
  "title": "料理名",
  "ingredients": ["必要な材料のリスト"],
  "instructions": ["調理手順を箇条書きで"],
  "difficulty": "簡単/普通/難しい",
  "cookingTime": 調理時間（分）,
  "servings": 何人前
}
`
  };

  const response = await client.chat.completions.create({
    model: 'gemma:7b',
    messages: [systemPrompt, userPrompt],
    stream: true,
    temperature: 0.7,
    max_tokens: 1000,
  });

  // Vercel AI SDKを使用してストリーミングレスポンスを返す
  return new StreamingTextResponse(response.body);
}
```

### 3.3 フロントエンドコンポーネントの作成
`src/components/MenuSuggestion.tsx`を作成：

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useStorage from "@/hooks/useStorage";
import { MenuSuggestion } from "@/types/menu";
import { useChat } from 'ai/react';
import { useState } from "react";

const MenuSuggestionComponent = () => {
  const { getItems } = useStorage();
  const [suggestion, setSuggestion] = useState<MenuSuggestion | null>(null);
  const { messages, handleSubmit, isLoading } = useChat({
    api: '/api/menu',
  });

  const handleGetSuggestion = async () => {
    try {
      const ingredients = getItems();
      const formData = new FormData();
      
      // useChat hookにデータを渡す
      await handleSubmit(formData, {
        data: { ingredients }
      });

      // 最新のメッセージからJSONを抽出
      const latestMessage = messages[messages.length - 1];
      if (latestMessage?.content) {
        try {
          const jsonStr = latestMessage.content.trim();
          const data = JSON.parse(jsonStr);
          setSuggestion(data);
        } catch (e) {
          console.error("Failed to parse JSON response:", e);
        }
      }
    } catch (error) {
      console.error("Error getting menu suggestion:", error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AI献立提案</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGetSuggestion}
            disabled={isLoading}
          >
            {isLoading ? "提案を生成中..." : "献立を提案してもらう"}
          </Button>

          {suggestion && (
            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-bold">{suggestion.title}</h2>
              
              <div>
                <h3 className="font-semibold mb-2">材料（{suggestion.servings}人前）</h3>
                <ul className="list-disc list-inside">
                  {suggestion.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">調理手順</h3>
                <ol className="list-decimal list-inside">
                  {suggestion.instructions.map((step, index) => (
                    <li key={index} className="mb-2">{step}</li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-4 text-sm text-gray-600">
                <span>難易度: {suggestion.difficulty}</span>
                <span>調理時間: 約{suggestion.cookingTime}分</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuSuggestionComponent;
```

### 3.4 依存関係の追加
`package.json`に以下の依存関係を追加：

```json
{
  "dependencies": {
    "ai": "^2.2.0",
    "openai": "^4.0.0"
  }
}
```

### 3.5 新しいページの作成
`src/app/menu/page.tsx`を作成：

```typescript
import MenuSuggestion from "@/components/MenuSuggestion";

export default function MenuPage() {
  return <MenuSuggestion />;
}
```

### 3.6 ナビゲーションの追加
既存のナビゲーションメニューに「AI献立提案」のリンクを追加します。

## 4. 注意点
- Ollamaサーバー（ollama.yashikota.com）が必要です
- ストリーミングレスポンスの処理に注意が必要です
- JSONパースのエラーハンドリングを適切に行う必要があります
- 食材の情報が不足している場合は、適切な代替案を提案するようにAIに指示を出します
- 賞味期限が近い食材を優先的に使用する提案を行うように考慮します

## 5. 将来の拡張案
- 複数の献立の提案
- カロリー計算機能の追加
- 食材の相性を考慮した提案
- ユーザーの好みや制限（アレルギーなど）を考慮した提案
- 調理器具の有無を考慮した提案

## 6. 実装の流れ
1. 型定義の追加
2. APIエンドポイントの実装
3. フロントエンドコンポーネントの作成
4. 依存関係の追加
5. ページの作成とルーティングの設定
6. テストの実施
7. デプロイ

## 7. テスト項目
- APIエンドポイントの動作確認
- フロントエンドの表示確認
- エラーハンドリングの確認
- レスポンシブデザインの確認
- パフォーマンスの確認

## 8. 参考資料
- [Ollama OpenAI Compatibility Documentation](https://github.com/ollama/ollama/blob/main/docs/openai.md)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs) 
