import { NextResponse } from "next/server";
import { getTasks, addTask, toggleTask } from "@/lib/kv";

export async function GET() {
  const tasks = await getTasks();
  return NextResponse.json({ tasks });
}

export async function POST(request) {
  const { text, source } = await request.json();
  const task = await addTask(text, source || "text");
  return NextResponse.json({ task });
}

export async function PATCH(request) {
  const { id } = await request.json();
  const tasks = await toggleTask(id);
  return NextResponse.json({ tasks });
}