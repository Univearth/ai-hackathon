import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";

// 日本語ロケールを設定
dayjs.locale("ja");

type FoodItem = {
  name: string;
  expiration_date: string;
  image_url: string;
};

const Expiration = () => {
  // Sample data
  const foodItems: FoodItem[] = [
    {
      name: "チョコシュー",
      expiration_date: "2025-05-01T00:00:00Z",
      image_url: ""
    },
    {
      name: "チョコシュー",
      expiration_date: "2025-05-01T00:00:00Z",
      image_url: ""
    },
    {
      name: "チョコシュー",
      expiration_date: "2025-05-01T00:00:00Z",
      image_url: ""
    },
    {
      name: "チョコシュー",
      expiration_date: "2025-05-01T00:00:00Z",
      image_url: ""
    },
    {
      name: "チョコシュー",
      expiration_date: "2025-05-01T00:00:00Z",
      image_url: ""
    },
    {
      name: "チョコシュー",
      expiration_date: "2025-05-01T00:00:00Z",
      image_url: ""
    },
    {
      name: "チョコシュー",
      expiration_date: "2025-05-01T00:00:00Z",
      image_url: ""
    },
    {
      name: "チョコシュー",
      expiration_date: "2025-05-01T00:00:00Z",
      image_url: ""
    },
    {
      name: "チョコシュー",
      expiration_date: "2025-05-01T00:00:00Z",
      image_url: ""
    },
    {
      name: "チョコシュー",
      expiration_date: "2025-05-01T00:00:00Z",
      image_url: ""
    },
    {
      name: "チョコシュー",
      expiration_date: "2025-05-01T00:00:00Z",
      image_url: ""
    },
    {
      name: "チョコシュー",
      expiration_date: "2025-05-01T00:00:00Z",
      image_url: ""
    },
  ];

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">食品期限管理</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {foodItems.map((item, index) => {
          const daysRemaining = getDaysRemaining(item.expiration_date);

          return (
            <Card key={index} className="overflow-hidden">
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
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>賞味期限: {formatDate(item.expiration_date)}</span>
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
    </div>
  );
};

export default Expiration;