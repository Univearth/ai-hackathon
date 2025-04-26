"use client";

import { Button } from "@/components/ui/button";
import { ProductFilter } from "@/components/ui/ProductFilter";
import useStorage from "@/hooks/useStorage";
import useSelectedItems from "@/hooks/useSelectedItems";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import Link from "next/link";
import React, { useState } from "react";
import SelectableFoodCard from "@/components/SelectableFoodCard";

dayjs.locale("ja");

const SelectFoodsPage = () => {
  const { responses: foodItems } = useStorage();
  const { selectedItems, clearSelectedItems } = useSelectedItems();
  const [filters, setFilters] = useState<{
    amount?: number;
    amountType?: "greater" | "less";
    unit?: string;
    category?: string;
  }>({});
  const [sortType, setSortType] = useState<'exp_asc' | 'exp_desc' | 'added'>('exp_asc');

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("YYYY年MM月DD日");
  };

  const getDaysRemaining = (dateString: string) => {
    const today = dayjs().startOf("day");
    const expirationDate = dayjs(dateString).startOf("day");
    return expirationDate.diff(today, "day");
  };

  const filteredItems = foodItems.filter((item) => {
    if (filters.amount !== undefined) {
      if (filters.amountType === "greater" && item.amount < filters.amount) return false;
      if (filters.amountType === "less" && item.amount > filters.amount) return false;
    }
    if (filters.unit && item.unit !== filters.unit) return false;
    if (filters.category && item.category !== filters.category) return false;
    return true;
  });

  const maxDays = Math.max(
    ...filteredItems.map((item) => getDaysRemaining(item.expiration_date)),
    0 // 全て期限切れの場合のデフォルト
  );

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

  const sortedItems = (() => {
    if (sortType === 'exp_asc') {
      return [...filteredItems].sort((a, b) => getDaysRemaining(a.expiration_date) - getDaysRemaining(b.expiration_date));
    } else if (sortType === 'exp_desc') {
      return [...filteredItems].sort((a, b) => getDaysRemaining(b.expiration_date) - getDaysRemaining(a.expiration_date));
    } else {
      return filteredItems; // 追加順はそのまま
    }
  })();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">食材を選択</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelectedItems}
          >
            選択をクリア
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={selectedItems.length === 0}
            asChild
          >
            <Link href="/recipe">
              献立を提案してもらう ({selectedItems.length}件選択中)
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <ProductFilter onFilterChange={setFilters} />
      </div>

      {/* 並び替えボタン */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={sortType === 'exp_asc' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortType('exp_asc')}
        >
          賞味期限が近い順
        </Button>
        <Button
          variant={sortType === 'exp_desc' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortType('exp_desc')}
        >
          賞味期限が遠い順
        </Button>
        <Button
          variant={sortType === 'added' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortType('added')}
        >
          追加順
        </Button>
      </div>

      {/* 選択中の食材表示 */}
      {selectedItems.length > 0 && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">選択中の食材 ({selectedItems.length}件)</h2>
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <div key={item.image_url} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm">
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {sortedItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">データがありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedItems.map((item) => (
            <SelectableFoodCard
              key={item.image_url}
              item={item}
              maxDays={maxDays}
              getGradient={getGradient}
              getDaysRemaining={getDaysRemaining}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectFoodsPage;
