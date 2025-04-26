import { ResponseTypes } from "@/types/response";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, PencilIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import useSelectedItems from "@/hooks/useSelectedItems";
import React from "react";

interface SelectableFoodCardProps {
  item: ResponseTypes;
  maxDays: number;
  getGradient: (daysLeft: number) => string;
  getDaysRemaining: (dateString: string) => number;
  formatDate: (dateString: string) => string;
}

const SelectableFoodCard = ({
  item,
  maxDays,
  getGradient,
  getDaysRemaining,
  formatDate,
}: SelectableFoodCardProps) => {
  const { isSelected, toggleItemSelection } = useSelectedItems();
  const daysRemaining = getDaysRemaining(item.expiration_date);
  const percent = maxDays > 0 ? Math.max((daysRemaining / maxDays) * 100, 5) : 5;
  const gradient = getGradient(daysRemaining);
  const selected = isSelected(item);

  return (
    <Card 
      key={item.image_url} 
      className={`overflow-hidden cursor-pointer ${
        selected ? "ring-2 ring-primary bg-primary/10" : ""
      }`}
      onClick={() => toggleItemSelection(item)}
    >
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
          href={`/edit_and_create?data=${encodeURIComponent(JSON.stringify(item))}`}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
          onClick={(e) => e.stopPropagation()} // カードの選択イベントを伝播させない
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
          <span>賞味期限: <span className={`${daysRemaining <= 7 ? 'text-red-500' : ''}`}>
            {formatDate(item.expiration_date)}
          </span></span>
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
            daysRemaining <= 7 ? 'bg-orange-100 text-orange-800' :
              'bg-green-100 text-green-800'}
        `}>
          {daysRemaining <= 0
            ? '期限切れ'
            : `あと${daysRemaining}日`}
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectableFoodCard;
