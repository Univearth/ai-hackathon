import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import { X } from "lucide-react";
import { useState } from "react";

interface ProductFilterProps {
  onFilterChange: (filters: {
    amount?: number;
    amountType?: "greater" | "less";
    unit?: string;
    category?: string;
  }) => void;
}

export function ProductFilter({ onFilterChange }: ProductFilterProps) {
  const units = ["g", "kg", "ml", "L", "個", "枚", "本"];
  const categories = ["肉", "野菜", "魚", "調味料", "お菓子", "飲料", "その他"];

  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [amountType, setAmountType] = useState<"greater" | "less">("greater");

  const handleReset = () => {
    onFilterChange({});
    // 入力フィールドの値をリセット
    const amountInput = document.getElementById("amount") as HTMLInputElement;
    if (amountInput) amountInput.value = "";
    // Selectの値をリセット
    setSelectedUnit("");
    setSelectedCategory("");
    setAmountType("greater");
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">フィルター</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-2 bg-red-300 hover:bg-red-400 text-black border-red-300 hover:border-red-400"
        >
          <X className="h-4 w-4" />
          リセット
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">分量</Label>
          <div className="flex gap-2">
            <Input
              id="amount"
              type="number"
              placeholder="分量を入力"
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : undefined;
                onFilterChange({
                  amount: value,
                  amountType: value ? amountType : undefined,
                });
              }}
            />
            <Select
              value={amountType}
              onValueChange={(value: "greater" | "less") => {
                setAmountType(value);
                const amountInput = document.getElementById("amount") as HTMLInputElement;
                if (amountInput.value) {
                  onFilterChange({
                    amount: Number(amountInput.value),
                    amountType: value,
                  });
                }
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="greater">以上</SelectItem>
                <SelectItem value="less">以下</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">単位</Label>
          <Select
            value={selectedUnit}
            onValueChange={(value) => {
              setSelectedUnit(value);
              onFilterChange({ unit: value });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="単位を選択" />
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

        <div className="space-y-2">
          <Label htmlFor="category">分類</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              onFilterChange({ category: value });
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
      </div>
    </div>
  );
}
