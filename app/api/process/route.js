import { NextResponse } from "next/server";
import { extractTodos } from "@/lib/gemini";

export async function POST(request) {
  try {
    const { text } = await request.json();
    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }
    const todos = await extractTodos(text);
    return NextResponse.json({ todos });
  } catch (err) {
    console.error("Process error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}