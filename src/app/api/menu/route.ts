import type { ResponseTypes } from "@/types/response";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.json();
    console.log("Form data:", formData);
    const backendRes = await fetch("https://backend.yashikota.com/suggest-menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ products: formData }),
    });

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      console.error("Backend error:", errorText);
      return NextResponse.json(
        { error: "Backend error", details: errorText },
        { status: backendRes.status }
      );
    }

    const data: ResponseTypes = await backendRes.json();
    console.log("Backend response:", data);
    return NextResponse.json(data);
  } catch (e) {
    console.error("Error in expiration route:", e);
    return NextResponse.json(
      { error: "Internal server error", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
};


