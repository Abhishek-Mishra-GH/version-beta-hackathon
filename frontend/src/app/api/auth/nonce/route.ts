import { generateNonce } from "@/lib/siwe";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/nonce
 * Generate a nonce for SIWE authentication
 */
export async function GET() {
  try {
    const nonce = generateNonce();

    return NextResponse.json({
      success: true,
      nonce,
    });
  } catch (error) {
    console.error("Nonce generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate nonce",
      },
      { status: 500 },
    );
  }
}
