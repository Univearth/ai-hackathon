"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductFilter } from "@/components/ui/ProductFilter";
import { toast } from "@/components/ui/use-toast";
import useStorage from "@/hooks/useStorage";
import { Modal } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import {
  BarChart2,
  CalendarIcon,
  CameraIcon,
  Check,
  ClockIcon,
  PencilIcon,
  PlusCircle,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

// 日本語ロケールを設定
dayjs.locale("ja");

// メニューデータの型定義
type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
};

// レシピデータの型定義
type RecipeData = {
  title: string;
  ingredients: string[];
  indication: string;
};

const Expiration = () => {
  const router = useRouter();
  const {
    responses: foodItems,
    addFoodItem,
    deleteItem,
    deleteItemById,
  } = useStorage();
  const [filters, setFilters] = useState<{
    amount?: number;
    amountType?: "greater" | "less";
    unit?: string;
    category?: string;
  }>({});
  const [sortType, setSortType] = useState<"exp_asc" | "exp_desc" | "added">(
    "exp_asc"
  );
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null);

  // // メニューデータを取得する
  // useEffect(() => {
  //   const fetchMenu = async () => {
  //     setIsMenuLoading(true);
  //     setMenuError(null);
  //     try {
  //       const response = await fetch('/menu');
  //       if (!response.ok) {
  //         throw new Error(`APIエラー: ${response.status}`);
  //       }
  //       const data = await response.json();
  //       setMenuItems(data);
  //     } catch (error) {
  //       console.error('メニューの取得に失敗しました:', error);
  //       setMenuError(error instanceof Error ? error.message : '不明なエラー');
  //       toast({
  //         title: "エラー",
  //         description: "メニューデータの取得に失敗しました",
  //         variant: "destructive"
  //       });
  //     } finally {
  //       setIsMenuLoading(false);
  //     }
  //   };

  //   fetchMenu();
  // }, []);

  // dayjsを使用した日付フォーマット
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("YYYY年MM月DD日");
  };

  // expiration_typeに基づいてラベルを取得
  const getExpirationLabel = (expirationType?: string) => {
    return expirationType === "use_by" ? "消費期限" : "賞味期限";
  };

  // dayjsを使用した残り日数計算
  const getDaysRemaining = (dateString: string) => {
    const today = dayjs().startOf("day");
    const expirationDate = dayjs(dateString).startOf("day");
    const days = expirationDate.diff(today, "day");
    return days < 0 ? 0 : days;
  };

  // フィルタリングされた商品リスト
  const filteredItems = foodItems.filter((item) => {
    if (filters.amount !== undefined) {
      if (filters.amountType === "greater" && item.amount < filters.amount)
        return false;
      if (filters.amountType === "less" && item.amount > filters.amount)
        return false;
    }
    if (filters.unit && item.unit !== filters.unit) return false;
    if (filters.category && item.category !== filters.category) return false;
    return true;
  });

  // 最大日数を取得（スケール用）
  const maxDays = Math.max(
    ...filteredItems.map((item) => getDaysRemaining(item.expiration_date)),
    0 // 全て期限切れの場合のデフォルト
  );

  // グラデーションスタイルを動的に生成
  const getGradient = (daysLeft: number) => {
    if (daysLeft <= 0) {
      return "bg-gradient-to-r from-red-500 to-red-700";
    }
    const ratio = daysLeft / maxDays;
    if (ratio > 0.66) {
      return "bg-gradient-to-r from-blue-400 to-blue-600";
    } else if (ratio > 0.33) {
      return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    } else {
      return "bg-gradient-to-r from-red-400 to-red-600";
    }
  };

  // 並び替えロジック
  const sortedItems = (() => {
    if (sortType === "exp_asc") {
      return [...filteredItems].sort(
        (a, b) =>
          getDaysRemaining(a.expiration_date) -
          getDaysRemaining(b.expiration_date)
      );
    } else if (sortType === "exp_desc") {
      return [...filteredItems].sort(
        (a, b) =>
          getDaysRemaining(b.expiration_date) -
          getDaysRemaining(a.expiration_date)
      );
    } else {
      return filteredItems; // 追加順はそのまま
    }
  })();

  // JSONエクスポート処理
  const handleExportJson = () => {
    const json = JSON.stringify(foodItems, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "foods.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSONインポート処理
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string);
        if (!Array.isArray(imported)) throw new Error("不正なJSON形式です");
        imported.forEach((item) => {
          // 必須フィールドの簡易チェック
          if (
            item.name &&
            item.expiration_date &&
            item.image_url &&
            typeof item.amount === "number" &&
            item.unit &&
            item.category
          ) {
            addFoodItem(item);
          }
        });
        alert("インポートが完了しました");
      } catch (err) {
        alert(
          "インポートに失敗しました: " +
          (err instanceof Error ? err.message : "不明なエラー")
        );
      }
    };
    reader.readAsText(file);
    // inputの値をリセットして同じファイルを連続で選択できるように
    e.target.value = "";
  };
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 選択モードの切り替え
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedItems({});
    }
  };

  // アイテムの選択・選択解除
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // 全選択・全選択解除
  const toggleSelectAll = () => {
    if (Object.keys(selectedItems).length === sortedItems.length) {
      setSelectedItems({});
    } else {
      const newSelectedItems: Record<string, boolean> = {};
      sortedItems.forEach((item) => {
        newSelectedItems[item.image_url] = true;
      });
      setSelectedItems(newSelectedItems);
    }
  };

  // 選択されたアイテムの処理
  const handleSubmit = async () => {
    const selectedData = sortedItems.filter(
      (item) => selectedItems[item.image_url]
    );

    if (selectedData.length === 0) {
      toast({
        title: "選択エラー",
        description: "アイテムが選択されていません",
        variant: "destructive",
      });
      return;
    }

    // 選択したデータを処理する
    console.log("選択されたアイテム:", selectedData);

    try {
      const menuResponse = await fetch("/api/menu", {
        method: "POST",
        body: JSON.stringify(selectedData),
      });

      if (!menuResponse.ok) {
        throw new Error(`APIエラー: ${menuResponse.status}`);
      }

      const recipeData = await menuResponse.json();
      console.log("レシピデータ:", recipeData);

      // 取得したレシピデータをステートにセット
      setSelectedRecipe(recipeData);

      // モーダルを開く
      setIsModalOpen(true);
    } catch (error) {
      console.error("レシピの取得に失敗しました:", error);
      toast({
        title: "エラー",
        description: "レシピデータの取得に失敗しました",
        variant: "destructive",
      });
    }
  };

  // モーダルのキャンセル処理
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // モーダルのOK処理
  const handleOk = () => {
    setIsModalOpen(false);

    // レシピデータをlocalStorageに保存
    if (selectedRecipe) {
      try {
        // 既存のレシピ一覧を取得
        const savedRecipes = JSON.parse(
          localStorage.getItem("savedRecipes") || "[]"
        );

        // 現在のレシピに一意のIDと日時を追加
        const recipeToSave = {
          ...selectedRecipe,
          id: `recipe-${Date.now()}`,
          savedAt: new Date().toISOString(),
        };

        // 先頭に追加して保存
        localStorage.setItem(
          "savedRecipes",
          JSON.stringify([recipeToSave, ...savedRecipes])
        );

        toast({
          title: "レシピを保存しました",
          description: "レシピページに移動します",
        });
      } catch (error) {
        console.error("レシピの保存に失敗しました:", error);
        toast({
          title: "エラー",
          description: "レシピの保存に失敗しました",
          variant: "destructive",
        });
      }
    }

    // 選択をリセット
    setSelectedItems({});
    setIsSelectionMode(false);

    // /menuページに遷移
    router.push("/menu");
  };

  const handleDelete = async () => {
    const selectedData = sortedItems.filter(
      (item) => selectedItems[item.image_url]
    );
    console.log("選択されたアイテム:", selectedData);
    selectedData.forEach((item) => {
      deleteItemById(item.image_url);
    });

    // 削除後に選択をリセット
    setSelectedItems({});

    toast({
      title: "削除完了",
      description: `${selectedData.length}個のアイテムが削除されました`,
    });
  };

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {!isSelectionMode ? (
            <>
              <Button asChild variant="default" size="sm">
                <Link href="/edit_and_create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  食品を追加
                </Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link href="/photo">
                  <CameraIcon className="mr-2 h-4 w-4" />
                  写真を撮る
                </Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link href="/graph">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  グラフを見る
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="default" size="sm" onClick={toggleSelectAll}>
                {Object.keys(selectedItems).length === sortedItems.length
                  ? "全選択解除"
                  : "全選択"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={selectedCount === 0}
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                選択削除
              </Button>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {!isSelectionMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportJson}
              >
                JSONエクスポート
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                JSONインポート
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleSelectionMode}
              >
                献立を作る
              </Button>
              <input
                type="file"
                accept="application/json"
                ref={fileInputRef}
                onChange={handleImportJson}
                className="hidden"
              />
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={toggleSelectionMode}>
                キャンセル
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmit}
                disabled={selectedCount === 0}
              >
                <Check className="mr-2 h-4 w-4" />
                AIに献立を聞く ({selectedCount})
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-6">
        <ProductFilter onFilterChange={setFilters} />
      </div>

      {/* 並び替えボタン */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={sortType === "exp_asc" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortType("exp_asc")}
        >
          期限が近い順
        </Button>
        <Button
          variant={sortType === "exp_desc" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortType("exp_desc")}
        >
          期限が遠い順
        </Button>
        <Button
          variant={sortType === "added" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortType("added")}
        >
          追加順
        </Button>
      </div>

      {sortedItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">データがありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedItems.map((item) => {
            const daysRemaining = getDaysRemaining(item.expiration_date);
            const percent =
              maxDays > 0 ? Math.max((daysRemaining / maxDays) * 100, 5) : 5;
            const gradient = getGradient(daysRemaining);

            return (
              <Card
                key={item.image_url}
                className={`overflow-hidden relative ${isSelectionMode && selectedItems[item.image_url]
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                  }`}
              >
                {isSelectionMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={!!selectedItems[item.image_url]}
                      onCheckedChange={() =>
                        toggleItemSelection(item.image_url)
                      }
                      className="h-5 w-5 bg-white border-gray-300"
                    />
                  </div>
                )}
                <div
                  className="relative aspect-video bg-muted"
                  onClick={() =>
                    isSelectionMode && toggleItemSelection(item.image_url)
                  }
                >
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                      <span className="text-muted-foreground">画像なし</span>
                    </div>
                  )}
                  {!isSelectionMode && (
                    <Link
                      href={`/edit_and_create?data=${encodeURIComponent(
                        JSON.stringify(item)
                      )}`}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-600" />
                    </Link>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {getExpirationLabel(item.expiration_type)}:{" "}
                      <span
                        className={`${daysRemaining <= 7 ? "text-red-500" : ""
                          }`}
                      >
                        {formatDate(item.expiration_date)}
                      </span>
                    </span>
                  </div>
                  {/* グラデーションバー追加 */}
                  <div className="w-full h-3 bg-muted rounded my-2">
                    <div
                      className={`h-3 rounded ${gradient}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span>
                      分量: {item.amount}
                      {item.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span>分類: {item.category}</span>
                  </div>

                  <div
                    className={`
                    mt-2 py-1 px-3 rounded-full text-sm font-medium inline-block
                    ${daysRemaining <= 0
                        ? "bg-destructive/15 text-destructive"
                        : daysRemaining <= 7
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }
                  `}
                  >
                    {daysRemaining <= 0 ? "期限切れ" : `あと${daysRemaining}日`}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <Modal
        title="おすすめレシピ"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleOk}
      >
        {selectedRecipe ? (
          <div className="py-4">
            <h2 className="text-xl font-semibold mb-4">
              {selectedRecipe.title}
            </h2>

            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">材料</h3>
              <ul className="list-disc pl-5 space-y-1">
                {selectedRecipe.ingredients &&
                  selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-700">
                      {ingredient}
                    </li>
                  ))}
              </ul>
            </div>

            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>調理時間: {selectedRecipe.indication}</span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p>データを読み込み中...</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Expiration;
