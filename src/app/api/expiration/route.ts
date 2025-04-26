import type { ResponseTypes } from "@/types/response";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);

    console.log("Sending request to backend...");
    const backendRes = await fetch("https://backend.yashikota.com/analyze", {
      method: "POST",
      body: backendFormData,
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
