import { NextRequest, NextResponse } from "next/server";
import { saveMessage } from "@/lib/messages";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, message } = body as { name: string; email: string; message: string };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  const entry = await saveMessage({ name: name.trim(), email: email.trim(), message: message.trim() });
  return NextResponse.json({ message: entry }, { status: 201 });
}
