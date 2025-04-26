"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductFilter } from "@/components/ui/ProductFilter";
import useStorage from "@/hooks/useStorage";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { BarChart2, CalendarIcon, CameraIcon, PencilIcon, PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// 日本語ロケールを設定
dayjs.locale("ja");

const Expiration = () => {
  const { responses: foodItems } = useStorage();
  const [filters, setFilters] = useState<{
    amount?: number;
    amountType?: "greater" | "less";
    unit?: string;
    category?: string;
  }>({});

  // dayjsを使用した日付フォーマット
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("YYYY年MM月DD日");
  };

  // dayjsを使用した残り日数計算
  const getDaysRemaining = (dateString: string) => {
    const today = dayjs().startOf("day");
    const expirationDate = dayjs(dateString).startOf("day");
    return expirationDate.diff(today, "day");
  };

  // フィルタリングされた商品リスト
  const filteredItems = foodItems.filter((item) => {
    if (filters.amount !== undefined) {
      if (filters.amountType === "greater" && item.amount < filters.amount) return false;
      if (filters.amountType === "less" && item.amount > filters.amount) return false;
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
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
        </div>
      </div>

      <div className="mb-6">
        <ProductFilter onFilterChange={setFilters} />
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">データがありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const daysRemaining = getDaysRemaining(item.expiration_date);
            const percent = maxDays > 0 ? Math.max((daysRemaining / maxDays) * 100, 5) : 5;
            const gradient = getGradient(daysRemaining);

            return (
              <Card key={item.image_url} className="overflow-hidden">
                <div className="relative aspect-video bg-muted">
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
                  <Link
                    href={`/edit_and_create?data=${JSON.stringify(item)}`}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <PencilIcon className="h-4 w-4 text-gray-600" />
                  </Link>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>賞味期限: {formatDate(item.expiration_date)}</span>
                  </div>
                  {/* グラデーションバー追加 */}
                  <div className="w-full h-3 bg-muted rounded my-2">
                    <div
                      className={`h-3 rounded ${gradient}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span>分量: {item.amount}{item.unit}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span>分類: {item.category}</span>
                  </div>

                  <div className={`
                    mt-2 py-1 px-3 rounded-full text-sm font-medium inline-block
                    ${daysRemaining <= 0 ? 'bg-destructive/15 text-destructive' :
                      daysRemaining <= 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'}
                  `}>
                    {daysRemaining <= 0
                      ? '期限切れ'
                      : `あと${daysRemaining}日`}
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Expiration;
