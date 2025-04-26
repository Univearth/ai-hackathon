import { NextResponse } from "next/server";

export async function GET() {
  try {
    const testData = [
      {
        name: "にんじん",
        expiration_date: "2025-05-10",
        image_url: "https://source.unsplash.com/random/300x200/?carrot",
        amount: 300,
        unit: "g",
        category: "野菜"
      },
      {
        name: "豚肉",
        expiration_date: "2025-04-30",
        image_url: "https://source.unsplash.com/random/300x200/?pork",
        amount: 500,
        unit: "g",
        category: "肉"
      },
      {
        name: "じゃがいも",
        expiration_date: "2025-05-15",
        image_url: "https://source.unsplash.com/random/300x200/?potato",
        amount: 400,
        unit: "g",
        category: "野菜"
      }
    ];

    return NextResponse.json({ 
      success: true, 
      data: testData,
      message: "テストデータを返しました。クライアント側でlocalStorageに保存してください。" 
    });
  } catch (error) {
    console.error("Error in seed API:", error);
    return NextResponse.json(
      { error: "テストデータの生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
