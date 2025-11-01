"use client";

import { useState } from "react";
import { Search, ShieldCheck, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DoctorDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [consents, setConsents] = useState([
    {
      id: "consent001",
      patientName: "Nishant Mishra",
      abhaId: "ABHA-1234-5678-9012",
      status: "approved",
      expiry: "Nov 20, 2025",
      purpose: "Follow-up Consultation",
    },
    {
      id: "consent002",
      patientName: "Zoya Siddiqui",
      abhaId: "ABHA-9876-5432-1011",
      status: "pending",
      expiry: "Nov 02, 2025",
      purpose: "Lab Report Access",
    },
  ]);

  const handleSearch = () => {
    console.log("Searching for patient:", searchQuery);
    // TODO: Integrate ABDM API to find patient by ABHA ID
  };

  const handleRequestConsent = (abhaId: string) => {
    console.log("Requesting consent for patient:", abhaId);
    // TODO: Call createConsent() or ABDM API
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d4f1f9] to-[#fef6e4]">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Manage patient consents and view authorized records
          </p>
        </div>

        {/* Search Section */}
        <div className="flex items-center gap-3 mb-8">
          <Input
            placeholder="Enter Patient ABHA ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 flex-1"
          />
          <Button onClick={handleSearch} size="lg" className="bg-blue-500 hover:bg-blue-600">
            <Search className="h-5 w-5 mr-2" /> Search
          </Button>
        </div>

        {/* Consents Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {consents.map((consent) => (
            <Card key={consent.id} className="shadow-md border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{consent.patientName}</h2>
                  <Badge
                    // variant={
                    //   consent.status === "approved" ? "success" : "secondary"
                    // }
                  >
                    {consent.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  ABHA ID: {consent.abhaId}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Purpose: {consent.purpose}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Expiry: {consent.expiry}
                </p>

                {consent.status === "pending" && (
                  <Button
                    onClick={() => handleRequestConsent(consent.abhaId)}
                    className="mt-4 w-full bg-green-500 hover:bg-green-600"
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" /> Request Consent
                  </Button>
                )}
                {consent.status === "approved" && (
                  <Button
                    className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600"
                    onClick={() => alert("Fetching data from IPFS...")}
                  >
                    <Clock className="h-4 w-4 mr-2" /> View Patient Data
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
