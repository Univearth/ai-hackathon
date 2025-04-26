"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ResponseTypes } from "@/types/response";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import dayjs from "dayjs";
import { useState } from "react";

const ExpirationGraph = ({ items }: { items: ResponseTypes[] }) => {
  const today = dayjs();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  const sortedItems = [...items].sort((a, b) => {
    const daysLeftA = dayjs(a.expiration_date).diff(today, "day");
    const daysLeftB = dayjs(b.expiration_date).diff(today, "day");
    return sortOrder === 'asc' ? daysLeftA - daysLeftB : daysLeftB - daysLeftA;
  });

  return (
    <div className="w-full space-y-6 p-4">
      <div className="flex items-center gap-3 justify-end mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder('asc')}
          className={cn(
            "transition-colors duration-200",
            sortOrder === 'asc' ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
          )}
        >
          <span className="mr-2">期限が近い順</span>
          <ArrowUpIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder('desc')}
          className={cn(
            "transition-colors duration-200",
            sortOrder === 'desc' ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
          )}
        >
          <span className="mr-2">期限が遅い順</span>
          <ArrowDownIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-5">
        {sortedItems.map((item) => {
          const daysLeft = dayjs(item.expiration_date).diff(today, "day");
          const percent = maxDays > 0 ? Math.max((daysLeft / maxDays) * 100, 5) : 5;
          const gradient = getGradient(daysLeft);

          return (
            <div
              key={item.image_url}
              style={{
                backgroundColor: daysLeft <= 0 ? "red" : daysLeft <= 7 ? "#ff9999" : "white"
              }}
              className="flex items-center gap-5 bg-card rounded-lg p-4 shadow-sm border transition-shadow hover:shadow-md"
            >
              <img
                src={item.image_url}
                alt={item.name}
                className="w-14 h-14 object-cover rounded-md border shadow-sm"
              />
              <div className="flex-1 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm tracking-tight">{item.name}</span>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      daysLeft <= 0
                        ? "bg-destructive/10 text-destructive"
                        : daysLeft <= 7
                        ? "bg-red-100 text-red-600"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {daysLeft <= 0 ? "期限切れ" : `${daysLeft}日`}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-out",
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
    </div>
  );
};

export default ExpirationGraph;


