import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message } = await req.json();

  try {
    // ✅ Send message to your Flask AI backend
    const res = await fetch("http://127.0.0.1:5001/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: message, patient_id: "test_patient" }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("AI backend error:", text);
      throw new Error(`Flask API returned ${res.status}: ${text}`);
    }

    const data = await res.json();
    console.log("✅ AI response received:", data);
    return NextResponse.json({ reply: data.answer });
  } catch (error: any) {
    console.error("❌ Error in /api/ai-chat route:", error.message);
    return NextResponse.json({
      reply: "⚠️ Error contacting AI backend. Please ensure the Flask server is running on port 5001.",
    });
  }
}
