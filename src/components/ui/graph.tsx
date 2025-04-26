"use client";

import { cn } from "@/lib/utils";
import { type ResponseTypes } from "@/types/response";
import dayjs from "dayjs";

// 賞味期限グラフ: 左から右に伸びるバーで可視化
// 各アイテムの残り日数をバーの長さで表現

const ExpirationGraph = ({ items }: { items: ResponseTypes[] }) => {
  // 今日の日付
  const today = dayjs();

  // 最大の残り日数を計算（グラフのスケール用）
  const maxDays = Math.max(
    ...items.map((item) => dayjs(item.expiration_date).diff(today, "day"))
  );

  return (
    <div className="w-full space-y-4">
      {items.map((item) => {
        const daysLeft = dayjs(item.expiration_date).diff(today, "day");
        // 0日以下は最小幅
        const percent = maxDays > 0 ? Math.max((daysLeft / maxDays) * 100, 5) : 5;
        return (
          <div
            key={item.name}
            className="flex items-center gap-4 bg-card rounded-lg p-3 shadow border"
          >
            <img
              src={item.image_url}
              alt={item.name}
              className="w-12 h-12 object-cover rounded-md border"
            />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-sm">{item.name}</span>
                <span className={cn("text-xs", daysLeft <= 0 ? "text-destructive" : "text-muted-foreground")}>{daysLeft <= 0 ? "期限切れ" : `${daysLeft}日`}</span>
              </div>
              <div className="w-full h-3 bg-muted rounded">
                <div
                  className={cn(
                    "h-3 rounded transition-all",
                    daysLeft <= 0 ? "bg-destructive" : daysLeft <= 3 ? "bg-yellow-400" : "bg-primary"
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpirationGraph;
