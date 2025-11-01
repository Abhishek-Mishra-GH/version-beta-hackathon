import { SiweMessage } from "siwe";

/**
 * Generate a random nonce for SIWE authentication
 */
export function generateNonce(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Verify SIWE message signature
 */
export async function verifySiweMessage(
  message: string,
  signature: string,
): Promise<{ success: boolean; address?: string; error?: string }> {
  try {
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    if (!fields.success) {
      return { success: false, error: "Invalid signature" };
    }

    return {
      success: true,
      address: fields.data.address.toLowerCase(),
    };
  } catch (error) {
    console.error("SIWE verification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

/**
 * Create SIWE message for signing
 */
export function createSiweMessage(
  address: string,
  nonce: string,
  chainId: number,
): string {
  const domain =
    typeof window !== "undefined" ? window.location.host : "localhost:3000";
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  const message = new SiweMessage({
    domain,
    address,
    statement: "Sign in to HealthChain to access your medical records.",
    uri: origin,
    version: "1",
    chainId,
    nonce,
  });

  return message.prepareMessage();
}
