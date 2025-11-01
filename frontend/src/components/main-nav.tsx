"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import {
  isWalletConnected,
  getWalletAddress,
  clearWalletAddress,
} from "@/utils/user-ids";
import { useEffect, useState } from "react";

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOnHome, setIsOnHome] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    setIsOnHome(pathname === "/");
    setIsAuthenticated(isWalletConnected());
    setWalletAddress(getWalletAddress());
  }, [pathname]);

  const handleLogout = () => {
    clearWalletAddress();
    setIsAuthenticated(false);
    setWalletAddress(null);
    router.push("/");
  };

  // Hide navbar on home page
  // if (isOnHome) {
  //   return null;
  // }

  return (
    <div className="border-b border-slate-700 bg-linear-to-r from-slate-900 to-slate-800">
      <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-black text-transparent"
        >
          SynCure
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <>
              <div className="text-sm text-gray-400">
                {walletAddress &&
                  `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
              </div>
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
