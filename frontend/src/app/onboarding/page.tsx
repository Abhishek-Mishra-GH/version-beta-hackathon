"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import OnboardingPage from "@/components/onboarding";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const walletAddress = searchParams.get("wallet");

  if (!walletAddress) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground mt-2">
            Wallet address not provided
          </p>
        </div>
      </div>
    );
  }

  return <OnboardingPage walletAddress={walletAddress} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
