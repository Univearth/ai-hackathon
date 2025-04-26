"use client";

import { cn } from "@/lib/utils";
import { type ResponseTypes } from "@/types/response";
import dayjs from "dayjs";

const ExpirationGraph = ({ items }: { items: ResponseTypes[] }) => {
  const today = dayjs();

  const maxDays = Math.max(
    ...items.map((item) => dayjs(item.expiration_date).diff(today, "day"))
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

  return (
    <div className="w-full space-y-4">
      {items.map((item) => {
        const daysLeft = dayjs(item.expiration_date).diff(today, "day");
        const percent = maxDays > 0 ? Math.max((daysLeft / maxDays) * 100, 5) : 5;
        const gradient = getGradient(daysLeft);

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
                <span className={cn("text-xs", daysLeft <= 0 ? "text-destructive" : "text-muted-foreground")}>
                  {daysLeft <= 0 ? "期限切れ" : `${daysLeft}日`}
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded">
                <div
                  className={cn(
                    "h-3 rounded transition-all",
                    gradient
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

