"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Connect() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (isConnected && address) {
      authenticateWithSIWE();
    }
  }, [isConnected, address]);

  const authenticateWithSIWE = async () => {
    if (!address || isAuthenticating) return;

    setIsAuthenticating(true);
    setAuthError("");

    try {
      // Check if user already has a profile in localStorage
      const storedProfile = localStorage.getItem("user_profile");
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        if (profile.walletAddress?.toLowerCase() === address.toLowerCase()) {
          // User already authenticated, no need to sign again
          setIsAuthenticating(false);
          return;
        }
      }

      // Step 1: Get nonce from server
      const nonceResponse = await fetch("/api/auth/nonce");
      const nonceData = await nonceResponse.json();

      if (!nonceData.success) {
        throw new Error("Failed to get nonce");
      }

      // Step 2: Create SIWE message
      const message = createSiweMessage(address, nonceData.nonce);

      // Step 3: Sign message with wallet
      const signature = await signMessageAsync({ message });

      // Step 4: Verify signature with server
      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error(verifyData.error || "Authentication failed");
      }

      if (verifyData.hasProfile) {
        // User exists, store profile
        localStorage.setItem("user_profile", JSON.stringify(verifyData.user));
      } else {
        // New user, redirect to onboarding
        router.push(`/onboarding?wallet=${address}`);
      }
    } catch (error) {
      console.error("SIWE authentication error:", error);
      setAuthError(
        error instanceof Error ? error.message : "Authentication failed",
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const createSiweMessage = (walletAddress: string, nonce: string): string => {
    const domain = window.location.host;
    const origin = window.location.origin;
    const statement = "Sign in to HealthChain to access your medical records.";

    return `${domain} wants you to sign in with your Ethereum account:
${walletAddress}

${statement}

URI: ${origin}
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <ConnectButton />
      {isConnected && (
        <>
          <div className="text-xs">{address}</div>
          {isAuthenticating && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Authenticating...
            </div>
          )}
          {authError && (
            <div className="rounded bg-red-50 p-2 text-xs text-red-600">
              {authError}
            </div>
          )}
        </>
      )}
    </div>
  );
}
