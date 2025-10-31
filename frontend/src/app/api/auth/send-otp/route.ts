import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sendOTP } from "@/lib/emailService";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: unknown };
    const { email } = body;

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 },
      );
    }

    const result = await sendOTP(email);

    if (result.success && result.otp) {
      // Return OTP to client so it can send email via EmailJS
      return NextResponse.json(
        {
          success: true,
          message: result.message,
          otp: result.otp, // Client will use this to send email
        },
        { status: 200 },
      );
    }

    return NextResponse.json(result, { status: 500 });
  } catch (error) {
    console.error("Error in send-otp API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
