import type { ResponseTypes } from "@/types/response";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const imageBase64 = await req.text();
    console.log(imageBase64);
    const backendRes = await fetch("https://backend.yashikota.com/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_base64: imageBase64,
      }),
    });

    console.log(backendRes);


    if (!backendRes.ok) {
      return NextResponse.json({ error: "Backend error" }, { status: backendRes.status });
    }

    const data: ResponseTypes = await backendRes.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
