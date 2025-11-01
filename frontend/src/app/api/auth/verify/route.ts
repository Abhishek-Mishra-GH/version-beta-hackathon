import { verifySiweMessage } from "@/lib/siwe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/verify
 * Verify SIWE signature and create/retrieve user session
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, signature } = body;

    if (!message || !signature) {
      return NextResponse.json(
        { success: false, error: "Missing message or signature" },
        { status: 400 },
      );
    }

    // Verify SIWE signature
    const verificationResult = await verifySiweMessage(message, signature);

    if (!verificationResult.success || !verificationResult.address) {
      return NextResponse.json(
        {
          success: false,
          error: verificationResult.error || "Invalid signature",
        },
        { status: 401 },
      );
    }

    const walletAddress = verificationResult.address;

    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (existingUser) {
      // User exists - return profile
      return NextResponse.json({
        success: true,
        authenticated: true,
        hasProfile: true,
        user: {
          walletAddress: existingUser.walletAddress,
          userType: existingUser.userType,
          profile: existingUser.patientProfile || existingUser.doctorProfile,
        },
      });
    }

    // New user - needs to complete onboarding
    return NextResponse.json({
      success: true,
      authenticated: true,
      hasProfile: false,
      walletAddress,
    });
  } catch (error) {
    console.error("SIWE verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
      },
      { status: 500 },
    );
  }
}
