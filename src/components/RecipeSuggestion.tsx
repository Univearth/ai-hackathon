"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStorage } from "@/hooks/useStorage";
import { useState } from "react";

type Menu = {
  menu: string;
  ingredients: Array<{
    name: string;
    expiration_date: string;
    expiration_type: string;
    image_url: string;
    amount: number;
    unit: string;
    category: string;
  }>;
  reason: string;
};

type Recipe = {
  title: string;
  url: string;
  ingredients: string[];
  instructions: string[];
  difficulty: string;
  cooking_time: string;
  servings: number;
};

const RecipeSuggestion = () => {
  const { responses: foodItems } = useStorage();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetMenu = async () => {
    try {
      setLoading(true);
      setMenu(null);
      setRecipe(null);

      const response = await fetch("/api/suggest-menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: foodItems,
        }),
      });

      if (!response.ok) {
        throw new Error("献立の取得に失敗しました");
      }

      const data = await response.json();
      setMenu(data);
    } catch (error) {
      console.error("Error getting menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecipe = async () => {
    if (!menu) return;

    try {
      setLoading(true);
      setRecipe(null);

      const response = await fetch("/api/get-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menu_name: menu.menu,
        }),
      });

      if (!response.ok) {
        throw new Error("レシピの取得に失敗しました");
      }

      const data = await response.json();
      setRecipe(data);
    } catch (error) {
      console.error("Error getting recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>献立・レシピ提案</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={handleGetMenu}
              disabled={loading || foodItems.length === 0}
            >
              {loading ? "献立を生成中..." : "献立を提案してもらう"}
            </Button>

            {menu && (
              <div className="mt-6 space-y-4">
                <h2 className="text-xl font-bold">{menu.menu}</h2>
                <p className="text-gray-600">{menu.reason}</p>

                <div>
                  <h3 className="font-semibold mb-2">使用する食材</h3>
                  <ul className="list-disc list-inside">
                    {menu.ingredients.map((ingredient, index) => (
                      <li key={index}>
                        {ingredient.name} ({ingredient.amount}
                        {ingredient.unit})
                      </li>
                    ))}
                  </ul>
                </div>

                <Button onClick={handleGetRecipe} disabled={loading}>
                  {loading ? "レシピを取得中..." : "レシピを表示する"}
                </Button>
              </div>
            )}

            {recipe && (
              <div className="mt-6 space-y-4">
                <h2 className="text-xl font-bold">{recipe.title}</h2>

                <div>
                  <h3 className="font-semibold mb-2">
                    材料（{recipe.servings}人前）
                  </h3>
                  <ul className="list-disc list-inside">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">調理手順</h3>
                  <ol className="list-decimal list-inside">
                    {recipe.instructions.map((step, index) => (
                      <li key={index} className="mb-2">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex gap-4 text-sm text-gray-600">
                  <span>難易度: {recipe.difficulty}</span>
                  <span>調理時間: {recipe.cooking_time}</span>
                </div>

                <div className="mt-4">
                  <a
                    href={recipe.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    レシピの詳細を見る
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipeSuggestion;
