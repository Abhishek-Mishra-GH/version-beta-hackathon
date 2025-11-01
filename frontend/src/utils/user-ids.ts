/**
 * Utility to manage user IDs (patient or doctor) from localStorage
 * Uses natural, user-friendly identifiers
 */

interface UserProfile {
  name?: string;
  email?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Check if user is connected to MetaMask wallet
 */
export function isWalletConnected(): boolean {
  const walletAddress = localStorage.getItem("wallet_address");
  return !!walletAddress && walletAddress.length > 0;
}

/**
 * Get the connected wallet address
 */
export function getWalletAddress(): string | null {
  return localStorage.getItem("wallet_address");
}

/**
 * Store wallet address (called after MetaMask connection)
 */
export function setWalletAddress(address: string): void {
  localStorage.setItem("wallet_address", address.toLowerCase());
}

/**
 * Clear wallet address (logout)
 */
export function clearWalletAddress(): void {
  localStorage.removeItem("wallet_address");
  localStorage.removeItem("patient_id");
  localStorage.removeItem("doctor_id");
  localStorage.removeItem("patient_profile");
  localStorage.removeItem("doctor_profile");
}

export function getOrCreatePatientId(): string {
  // Check if we're in browser environment
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return ""; // Return empty string during SSR
  }

  const stored = localStorage.getItem("patient_id");
  if (stored) return stored;

  // Create from email if available, otherwise generate
  const profileStr = localStorage.getItem("patient_profile");
  if (profileStr) {
    try {
      const profile = JSON.parse(profileStr) as UserProfile;
      if (profile.email && typeof profile.email === "string") {
        const namePart = profile.email.split("@")[0];
        if (namePart) {
          const id = `PAT_${namePart.toUpperCase()}`;
          localStorage.setItem("patient_id", id);
          return id;
        }
      }
    } catch {
      // Continue to default generation
    }
  }

  // Fallback: generate random ID
  const id = `PAT_${Date.now().toString(36).toUpperCase()}`;
  localStorage.setItem("patient_id", id);
  return id;
}

export function getOrCreateDoctorId(): string {
  // Check if we're in browser environment
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return ""; // Return empty string during SSR
  }

  const stored = localStorage.getItem("doctor_id");
  if (stored) return stored;

  // Create from name if available, otherwise generate
  const profileStr = localStorage.getItem("doctor_profile");
  if (profileStr) {
    try {
      const profile = JSON.parse(profileStr) as UserProfile;
      if (profile.name && typeof profile.name === "string") {
        const id = `DOC_${profile.name.toUpperCase().replace(/\s+/g, "_")}`;
        localStorage.setItem("doctor_id", id);
        return id;
      }
    } catch {
      // Continue to default generation
    }
  }

  // Fallback: generate random ID
  const id = `DOC_${Date.now().toString(36).toUpperCase()}`;
  localStorage.setItem("doctor_id", id);
  return id;
}

export function setPatientId(id: string): void {
  localStorage.setItem("patient_id", id);
}

export function setDoctorId(id: string): void {
  localStorage.setItem("doctor_id", id);
}

export function getPatientName(): string {
  try {
    const profileStr = localStorage.getItem("patient_profile");
    if (profileStr) {
      const profile = JSON.parse(profileStr) as UserProfile;
      return (
        (typeof profile.name === "string" ? profile.name : undefined) ??
        "Unknown Patient"
      );
    }
  } catch {
    // Continue
  }
  return "Unknown Patient";
}

export function getDoctorName(): string {
  try {
    const profileStr = localStorage.getItem("doctor_profile");
    if (profileStr) {
      const profile = JSON.parse(profileStr) as UserProfile;
      return (
        (typeof profile.name === "string" ? profile.name : undefined) ??
        "Unknown Doctor"
      );
    }
  } catch {
    // Continue
  }
  return "Unknown Doctor";
}
