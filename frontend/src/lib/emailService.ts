// Email OTP Service (Server-side)
// EmailJS sending is handled on client side

type OTPStore = Record<
  string,
  {
    otp: string;
    expiresAt: number;
  }
>;

// In-memory store for development (replace with Redis/Database in production)
// Using globalThis to persist across hot reloads in development
const globalForOTP = globalThis as unknown as {
  otpStore: OTPStore | undefined;
};

const otpStore: OTPStore = globalForOTP.otpStore ?? {};
globalForOTP.otpStore = otpStore;

/**
 * Generates a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Creates and stores OTP for the given email
 * Returns the OTP to be sent by the client
 */
export async function sendOTP(
  email: string,
): Promise<{ success: boolean; message: string; otp?: string }> {
  try {
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP (in production, use Redis or Database)
    otpStore[email] = { otp, expiresAt };

    console.log(`📧 OTP for ${email}: ${otp} (expires in 10 minutes)`);
    console.log(`💾 Stored OTP for email: "${email}"`);
    console.log(`📋 Current OTP store keys:`, Object.keys(otpStore));

    return {
      success: true,
      message: "OTP generated successfully",
      otp, // Return OTP to be sent via EmailJS on client
    };
  } catch (error) {
    console.error("Error generating OTP:", error);
    return {
      success: false,
      message: "Failed to generate OTP",
    };
  }
}

/**
 * Verifies the OTP for the given email
 */
export async function verifyOTP(
  email: string,
  otp: string,
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`🔍 Verifying OTP for email: "${email}"`);
    console.log(`📝 Received OTP: "${otp}" (length: ${otp.length})`);
    console.log(`📋 Available emails in store:`, Object.keys(otpStore));
    console.log(`🔍 Looking for key: "${email}"`);

    const storedData = otpStore[email];
    console.log(
      `💾 Stored data:`,
      storedData
        ? `OTP: "${storedData.otp}", Expires: ${new Date(storedData.expiresAt).toISOString()}`
        : "Not found",
    );

    if (!storedData) {
      console.log("❌ No OTP found for this email");
      console.log("🔍 Email match check:");
      Object.keys(otpStore).forEach((key) => {
        console.log(
          `  - Stored: "${key}" vs Looking for: "${email}" → Match: ${key === email}`,
        );
      });
      return {
        success: false,
        message: "OTP not found. Please request a new one.",
      };
    }

    if (Date.now() > storedData.expiresAt) {
      console.log("❌ OTP expired");
      delete otpStore[email];
      return {
        success: false,
        message: "OTP has expired. Please request a new one.",
      };
    }

    console.log(
      `🔐 Comparing: received="${otp}" vs stored="${storedData.otp}"`,
    );
    if (storedData.otp !== otp) {
      console.log("❌ OTP mismatch");
      return {
        success: false,
        message: "Invalid OTP. Please try again.",
      };
    }

    // OTP is valid, remove it from store
    delete otpStore[email];
    console.log("✅ OTP verified successfully!");

    return {
      success: true,
      message: "OTP verified successfully",
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      success: false,
      message: "Failed to verify OTP",
    };
  }
}

/**
 * Resends OTP to the provided email
 */
export async function resendOTP(
  email: string,
): Promise<{ success: boolean; message: string }> {
  // Delete existing OTP if any
  delete otpStore[email];

  // Send new OTP
  return sendOTP(email);
}
