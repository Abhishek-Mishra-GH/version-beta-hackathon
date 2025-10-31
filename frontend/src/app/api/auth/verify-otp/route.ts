import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyOTP } from "@/lib/emailService";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: unknown; otp?: unknown };
    const { email, otp } = body;

    console.log("📥 Verify OTP request:", { email, otp });

    if (!email || !otp) {
      console.log("❌ Missing email or OTP");
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 },
      );
    }

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      console.log("❌ Invalid email format:", email);
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 },
      );
    }

    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      console.log("❌ Invalid OTP format:", otp, "Type:", typeof otp);
      return NextResponse.json(
        { success: false, message: "Invalid OTP format" },
        { status: 400 },
      );
    }

    console.log("✅ Validation passed, verifying OTP...");
    const result = await verifyOTP(email, otp);
    console.log("🔍 Verification result:", result);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("Error in verify-otp API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
