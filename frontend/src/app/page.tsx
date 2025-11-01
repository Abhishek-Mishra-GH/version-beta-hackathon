"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import Connect from "@/components/connect";
// import UploadButton from "@/components/UploadButton";


export default function HomePage() {
  const router = useRouter();

  const handlePatientConnect = async () => {
    try {
      // Call your existing wallet connect logic
      await window.ethereum.request({ method: "eth_requestAccounts" });
      router.push("/patient-dashboard");
    } catch (err) {
      console.error("Patient connect failed:", err);
    }
  };

  const handleDoctorConnect = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      router.push("/doctor-dashboard");
    } catch (err) {
      console.error("Doctor connect failed:", err);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container flex flex-col items-center justify-center gap-8 px-4 py-16"
      >
        <h1 className="text-6xl font-extrabold tracking-tight text-gray-800">
          Welcome to <span className="text-pink-600">MediChain</span>
        </h1>
        <p className="text-lg text-gray-600">
          Decentralized Health Data & Consent Management Platform
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-6">
          <Button
            onClick={handlePatientConnect}
            className="px-8 py-6 text-lg font-semibold bg-pink-500 hover:bg-pink-600"
          >
            <Wallet className="mr-2 h-5 w-5" /> I’m a Patient
          </Button>
          <Button
            onClick={handleDoctorConnect}
            className="px-8 py-6 text-lg font-semibold bg-blue-500 hover:bg-blue-600"
          >
            <Wallet className="mr-2 h-5 w-5" /> I’m a Doctor
          </Button>
        </div>

        {/* <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Medical Records DApp</h1>
      <UploadButton />
    </div> */}

        <p className="text-gray-500 mt-8 text-sm">
          Powered by IPFS · Pinata · Ethereum · ABDM
        </p>
      </motion.div>
    </main>
  );
}
