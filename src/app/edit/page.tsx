"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// 日本語ロケールを設定
dayjs.locale("ja");

type FoodItem = {
  name: string;
  expiration_date: string;
  image_url: string;
};

const Edit = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [formData, setFormData] = useState<FoodItem>({
    name: "",
    expiration_date: "",
    image_url: ""
  });

  useEffect(() => {
    // 実際のアプリケーションではここでAPIからデータをフェッチする
    // サンプルとして、固定データを使用
    if (id) {
      // このサンプルデータは実際の実装では置き換える必要があります
      setFormData({
        name: "チョコシュー",
        expiration_date: dayjs("2025-05-01T00:00:00Z").format("YYYY-MM-DD"),
        image_url: ""
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ここでAPIにデータを送信する処理を実装
    console.log("Saved:", formData);

    // 保存後に元の画面に戻る
    router.push("/expiration");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">食品情報の編集</h1>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>商品情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                商品名
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="expiration_date" className="text-sm font-medium">
                賞味期限
              </label>
              <DatePicker
                id="expiration_date"
                name="expiration_date"
                format="YYYY月M日D"
                showTime={true}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dayjs(formData.expiration_date)}
                onChange={(date) => {
                  setFormData(prev => ({
                    ...prev,
                    expiration_date: date.format("YYYY-MM-DD")
                  }));
                }}
              />
           </div>
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => router.push("/expiration")}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Edit;