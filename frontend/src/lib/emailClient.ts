// Client-side EmailJS utility
import emailjs from "@emailjs/browser";

// EmailJS configuration from environment variables
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";

/**
 * Sends OTP email using EmailJS (client-side only)
 */
export async function sendEmailWithEmailJS(
  email: string,
  otp: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if EmailJS is configured
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.warn("⚠️ EmailJS not configured. Add credentials to .env.local");
      return {
        success: true,
        message: "OTP ready (EmailJS not configured - check console)",
      };
    }

    const templateParams = {
      to_email: email,
      to_name: email, // Some templates use this
      reply_to: email, // Fallback
      user_email: email, // Additional fallback
      otp_code: otp,
      expiry_time: "10 minutes",
    };

    console.log("📧 Sending email to:", email, "with OTP:", otp);

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY,
    );

    console.log("✅ Email sent successfully via EmailJS");
    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error("Error sending email via EmailJS:", error);
    return {
      success: false,
      message: "Failed to send email",
    };
  }
}

/**
 * Check if EmailJS is configured
 */
export function isEmailJSConfigured(): boolean {
  return !!(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
}
