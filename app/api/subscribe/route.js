import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/storage";

export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { email, tab = "finance" } = body;
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  try {
    await addSubscriber(email.toLowerCase().trim(), tab);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Could not save subscription" }, { status: 500 });
  }
}
