"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useStorage from "@/hooks/useStorage";
import { ResponseTypes } from "@/types/response";
import React from "react";

const SeedPage = () => {
  const router = useRouter();
  const { addFoodItem, deleteAllItems, responses } = useStorage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeedData = async () => {
    try {
      setLoading(true);
      setMessage("テストデータを取得中...");
      
      const response = await fetch("/api/seed");
      const result = await response.json();
      
      if (result.success) {
        deleteAllItems();
        
        result.data.forEach((item: ResponseTypes) => {
          addFoodItem(item);
        });
        
        setMessage(`${result.data.length}件のテストデータを追加しました！`);
        
        setTimeout(() => {
          router.push("/select-foods");
        }, 3000);
      } else {
        setMessage("エラー: " + (result.error || "不明なエラー"));
      }
    } catch (error) {
      console.error("Error seeding data:", error);
      setMessage("エラーが発生しました。コンソールを確認してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">テストデータ生成</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          テスト用の食材データを生成します。現在のデータはすべて削除されます。
        </p>
        <p className="mb-4">
          現在のデータ数: <strong>{responses.length}</strong>件
        </p>
        
        <Button 
          onClick={handleSeedData} 
          disabled={loading}
          className="mr-2"
        >
          {loading ? "処理中..." : "テストデータを生成"}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => router.push("/")}
          disabled={loading}
        >
          キャンセル
        </Button>
      </div>
      
      {message && (
        <div className="p-4 border rounded-lg bg-primary/10">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default SeedPage;
