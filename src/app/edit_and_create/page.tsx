"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useStorage from "@/hooks/useStorage";
import { theme } from "@/theme/theme";
import { ResponseTypes } from "@/types/response";
import { CameraIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ConfigProvider, DatePicker, Modal } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
// 日本語ロケールを設定
dayjs.locale("ja");
const { confirm } = Modal;

const units = ["g", "kg", "ml", "L", "個", "枚", "本"];
const categories = ["肉", "野菜", "魚", "調味料", "お菓子", "飲料", "その他"];

const EditAndCreate = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("data");
  const [open, setOpen] = useState(false);
  const { addFoodItem, editFoodItemById, getItemById, deleteItemById } = useStorage();

  const [formData, setFormData] = useState<ResponseTypes>({
    name: "",
    expiration_date: dayjs().format("YYYY-MM-DD"),
    image_url: "",
    amount: 0,
    unit: "",
    category: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const item = JSON.parse(id);
      if (item) {
        setFormData({
          name: item.name || "",
          expiration_date: item.expiration_date || dayjs().format("YYYY-MM-DD"),
          image_url: item.image_url || "",
          amount: item.amount || 0,
          unit: item.unit || "",
          category: item.category || ""
        });
      }
    }
    setLoading(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: any) => {
    setFormData(prev => ({
      ...prev,
      expiration_date: date ? dayjs(date).format("YYYY-MM-DD") : ""
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      editFoodItemById(formData.image_url, formData);
    } else {
      addFoodItem(formData);
    }
    router.push("/");
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <ConfigProvider theme={theme}>

    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{id ? "食品情報の編集" : "食品を追加"}</h1>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>商品情報</CardTitle>
          {id && (
            <Button variant="default" className="bg-red-500 hover:bg-red-600" onClick={() => setOpen(true)}>
              <TrashIcon className="w-4 h-4 mr-2" />
              削除
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formData.image_url && (
              <img src={formData.image_url} alt="商品画像" className="w-full h-60 object-cover" />
            )}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                商品名
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                format="YYYY年M月D日"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.expiration_date ? dayjs(formData.expiration_date) : undefined}
                onChange={handleDateChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="image_url" className="text-sm font-medium">
                画像URL (オプション)
              </label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                分量
              </label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
                <Select
                  value={formData.unit}
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      unit: value
                    }));
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="単位" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                分類
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    category: value
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="分類を選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between items-center space-x-2 pt-4">
              {!formData.image_url && (
                <Button
                  type="button"
                  variant="default"
                  onClick={() => router.push("/photo")}
                >
                  <CameraIcon className="w-4 h-4 mr-2" />
                  写真を撮る
                </Button>
              )}
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                >
                  キャンセル
                </Button>
                <Button type="submit" variant="default">
                  {id ? "保存" : "追加"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <Modal
        open={open}
        onOk={() => {
          deleteItemById(formData.image_url);
          router.push("/");
        }}
        onCancel={() => {
          setOpen(false);
        }}
        maskClosable

        okText="削除"
        cancelText="キャンセル"
      >
        <p>この商品を削除しますか？</p>
        <p>この操作は元に戻すことができません。</p>
      </Modal>
    </div>
    </ConfigProvider>
  );
};

export default EditAndCreate;
