import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * POST /api/profile/register
 * Create a new user profile (patient or doctor)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletAddress, userType, profileData } = body;

    if (!walletAddress || !userType || !profileData) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address format" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 409 },
      );
    }

    // Create user with profile based on type
    if (userType === "PATIENT") {
      const user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          userType: "PATIENT",
          patientProfile: {
            create: {
              fullName: profileData.fullName,
              dateOfBirth: profileData.dateOfBirth
                ? new Date(profileData.dateOfBirth)
                : null,
              email: profileData.email,
              phone: profileData.phone,
              emergencyContact: profileData.emergencyContact,
              bloodType: profileData.bloodType,
              allergies: profileData.allergies || [],
              chronicConditions: profileData.chronicConditions || [],
              profilePicture: profileData.profilePicture,
              bio: profileData.bio,
            },
          },
        },
        include: {
          patientProfile: true,
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          walletAddress: user.walletAddress,
          userType: user.userType,
          profile: user.patientProfile,
        },
      });
    } else if (userType === "DOCTOR") {
      // Validate required doctor fields
      if (!profileData.licenseNumber || !profileData.specialty) {
        return NextResponse.json(
          {
            success: false,
            error: "License number and specialty are required for doctors",
          },
          { status: 400 },
        );
      }

      const user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          userType: "DOCTOR",
          doctorProfile: {
            create: {
              fullName: profileData.fullName,
              email: profileData.email,
              phone: profileData.phone,
              specialty: profileData.specialty,
              licenseNumber: profileData.licenseNumber,
              hospital: profileData.hospital,
              yearsOfExperience: profileData.yearsOfExperience,
              credentials: profileData.credentials || [],
              verificationStatus: "VERIFIED", // Auto-approved for demo
              verificationDocuments: profileData.verificationDocuments || [],
              profilePicture: profileData.profilePicture,
              bio: profileData.bio,
            },
          },
        },
        include: {
          doctorProfile: true,
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          walletAddress: user.walletAddress,
          userType: user.userType,
          profile: user.doctorProfile,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid user type" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Profile registration error:", error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { success: false, error: "License number already registered" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create profile" },
      { status: 500 },
    );
  }
}
