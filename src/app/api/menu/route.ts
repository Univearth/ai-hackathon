import { NextResponse } from "next/server";
import { ResponseTypes } from "@/types/response";

// 献立提案APIのレスポンス型
type MenuResponse = {
  menu: string;
  ingredients: ResponseTypes[];
  reason: string;
};

function suggestMenu(products: ResponseTypes[]): MenuResponse {
  
  const categories = products.map(p => p.category);
  let menu = "";
  let reason = "";
  
  if (categories.includes("肉") && categories.includes("野菜")) {
    menu = "野菜炒め";
    reason = "肉と野菜が揃っているので、シンプルで栄養バランスの良い野菜炒めがおすすめです。";
  } else if (categories.includes("魚") && categories.includes("野菜")) {
    menu = "魚と野菜のホイル焼き";
    reason = "魚と野菜が揃っているので、シンプルで栄養バランスの良いホイル焼きがおすすめです。";
  } else if (categories.includes("肉")) {
    menu = "肉じゃが";
    reason = "肉があるので、ボリュームのある肉じゃががおすすめです。";
  } else if (categories.includes("野菜")) {
    menu = "サラダ";
    reason = "野菜が揃っているので、ヘルシーなサラダがおすすめです。";
  } else if (categories.includes("魚")) {
    menu = "焼き魚定食";
    reason = "魚があるので、シンプルな焼き魚定食がおすすめです。";
  } else {
    menu = "おにぎり";
    reason = "基本的な食材を使った簡単なおにぎりがおすすめです。";
  }
  
  return {
    menu,
    ingredients: products,
    reason,
  };
}

export async function POST(req: Request) {
  try {
    const { products } = await req.json();
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "食材が選択されていません" },
        { status: 400 }
      );
    }
    
    const menuSuggestion = suggestMenu(products);
    
    return NextResponse.json(menuSuggestion);
  } catch (error) {
    console.error("Error in menu suggestion API:", error);
    return NextResponse.json(
      { error: "献立提案の処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
