import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/profile/[wallet]
 * Get user profile by wallet address
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ wallet: string }> },
) {
  try {
    const { wallet } = await params;

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: wallet.toLowerCase() },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        userType: user.userType,
        profile: user.patientProfile || user.doctorProfile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/profile/[wallet]
 * Update user profile
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ wallet: string }> },
) {
  try {
    const { wallet } = await params;
    const body = await request.json();
    const { profileData } = body;

    if (!wallet || !profileData) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: wallet.toLowerCase() },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Update based on user type
    if (user.userType === "PATIENT" && user.patientProfile) {
      const updatedProfile = await prisma.patientProfile.update({
        where: { userId: user.id },
        data: {
          fullName: profileData.fullName,
          dateOfBirth: profileData.dateOfBirth
            ? new Date(profileData.dateOfBirth)
            : undefined,
          email: profileData.email,
          phone: profileData.phone,
          emergencyContact: profileData.emergencyContact,
          bloodType: profileData.bloodType,
          allergies: profileData.allergies,
          chronicConditions: profileData.chronicConditions,
          profilePicture: profileData.profilePicture,
          bio: profileData.bio,
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          walletAddress: user.walletAddress,
          userType: user.userType,
          profile: updatedProfile,
        },
      });
    } else if (user.userType === "DOCTOR" && user.doctorProfile) {
      const updatedProfile = await prisma.doctorProfile.update({
        where: { userId: user.id },
        data: {
          fullName: profileData.fullName,
          email: profileData.email,
          phone: profileData.phone,
          specialty: profileData.specialty,
          hospital: profileData.hospital,
          yearsOfExperience: profileData.yearsOfExperience,
          credentials: profileData.credentials,
          profilePicture: profileData.profilePicture,
          bio: profileData.bio,
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          walletAddress: user.walletAddress,
          userType: user.userType,
          profile: updatedProfile,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid user type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
