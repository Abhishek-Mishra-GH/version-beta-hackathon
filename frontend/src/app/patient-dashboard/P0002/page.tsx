"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Plus,
  Users,
  ExternalLink,
  FileText,
  ShieldCheck,
  Clock,
  RefreshCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import { getContract } from "@/utils/contract";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState<"records" | "upload" | "access">("records");
  const [records, setRecords] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedDoc, setProcessedDoc] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [accessGrants, setAccessGrants] = useState<any[]>([]);
  const [newDoctorId, setNewDoctorId] = useState("");
  const [isGranting, setIsGranting] = useState(false);
  const [grantError, setGrantError] = useState("");
  const [grantSuccess, setGrantSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const patientId = "P0002"; // 👈 Change for P0001 / P0003

  // Fetch records
  const fetchRecords = async () => {
    try {
      const contract: any = await getContract();
      const res = await contract.getRecords(patientId);
      setRecords(res);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  // Fetch doctors with access
  const fetchAccessGrants = async () => {
    const dummyDoctors = ["D01", "D02", "D03", "D04", "D05", "D06"];
    try {
      const contract: any = await getContract();
      const grants: any[] = [];
      for (const doctorId of dummyDoctors) {
        const hasAccess = await contract.isAccessGranted(patientId, doctorId);
        if (hasAccess) {
          const expiry: bigint = await contract.getAccessExpiry(patientId, doctorId);
          grants.push({ doctorId, expiresAt: Number(expiry) });
        }
      }
      setAccessGrants(grants);
    } catch (error) {
      console.error("Error fetching access grants:", error);
    }
  };

  // 🔍 Analyze all health records using AI
const analyzeHealthWithAI = async () => {
  if (records.length === 0) {
    alert("No records found to analyze!");
    return;
  }

  setIsProcessing(true);
  try {
    const cids = records.map((r) => r.cid);
    console.log(cids)
    const response = await fetch("http://127.0.0.1:5001/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient_id: patientId, cids }),
    });
    const data = await response.json();
    if (data.success) {
      console.log(data)
      setProcessedDoc(data.analysis);
    } else {
      alert("AI analysis failed.");
    }
  } catch (error) {
    console.error("AI analysis error:", error);
    alert("Failed to connect to AI service.");
  } finally {
    setIsProcessing(false);
  }
};


  useEffect(() => {
    if (activeTab === "records") void fetchRecords();
    if (activeTab === "access") void fetchAccessGrants();
  }, [activeTab]);

  // useEffect(() => {
  //   if (records.length > 0) {
  //     analyzeHealthWithAI();
  //   }
  // }, [records]);
  

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Only PDF files allowed");
      return;
    }
    setSelectedFile(file);
    await processDocumentWithAI(file);
  };

  // AI processing
  const processDocumentWithAI = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error("AI processing failed");
      const data = await response.json();
      setProcessedDoc({ file, fhirData: data.fhir_data ?? {}, status: "preview" });
    } catch (error) {
      alert("AI processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload record to blockchain
  const handleUploadToBlockchain = async () => {
    if (!selectedFile || !processedDoc) return;
    try {
      const ipfsFormData = new FormData();
      ipfsFormData.append("file", selectedFile);
      const ipfsResponse = await fetch("/api/ipfs", { method: "POST", body: ipfsFormData });
      if (!ipfsResponse.ok) throw new Error("Failed to upload to IPFS");
      const ipfsData = await ipfsResponse.json();
      const ipfsHash = ipfsData.ipfsHash;

      const metadata = {
        fileName: selectedFile.name,
        uploadedAt: new Date().toISOString(),
      };

      const contract: any = await getContract();
      const tx = await contract.addRecord(patientId, ipfsHash, JSON.stringify(metadata));
      await tx.wait();

      alert("✅ Record uploaded successfully!");
      setSelectedFile(null);
      setProcessedDoc(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchRecords();
    } catch (error) {
      alert(`Upload failed: ${(error as Error).message}`);
    }
  };

  // Grant access
  const handleGrantAccess = async () => {
    if (!newDoctorId.trim()) return setGrantError("Enter doctor ID");
    setIsGranting(true);
    setGrantError("");
    setGrantSuccess(false);
    try {
      const contract: any = await getContract();
      const durationSeconds = 24 * 60 * 60;
      const tx = await contract.grantAccess(patientId, newDoctorId, durationSeconds);
      await tx.wait();
      setGrantSuccess(true);
      setNewDoctorId("");
      fetchAccessGrants();
    } catch (err) {
      setGrantError((err as Error).message);
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevokeAccess = async (doctorId: string) => {
    try {
      const contract: any = await getContract();
      const tx = await contract.revokeAccess(patientId, doctorId);
      await tx.wait();
      fetchAccessGrants();
    } catch (err) {
      alert("Failed to revoke access");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0c1220] to-[#1d1630] text-white">
      {/* Header */}
      <section className="py-16 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <h1 className="text-5xl font-bold mb-3">Patient Dashboard</h1>
          <p className="text-sky-300 text-lg font-medium">ID: {patientId}</p>
          <p className="text-white/70 max-w-2xl mx-auto mt-4">
            Manage, upload, and grant access to your medical records securely on the blockchain.
          </p>
        </motion.div>
      </section>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-12">
        {(["records", "upload", "access"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full transition ${
              activeTab === tab
                ? "bg-sky-500 text-white shadow-md"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 pb-20 space-y-10">
        {/* Records */}
        {/* Records */}
{activeTab === "records" && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="space-y-8"
  >

    {/* --- Records Grid --- */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid sm:grid-cols-2 gap-6"
    >
      {records.length === 0 ? (
        <p className="text-center text-white/60 col-span-2">
          No records found.
        </p>
      ) : (
        records.map((record: any, i: number) => (
          <Card key={i} className="bg-white/5 border-white/10 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-sky-400 h-5 w-5" />
              <p className="font-medium text-lg text-white">
                {JSON.parse(record.metadata).fileName}
              </p>
            </div>
            <p className="text-sm text-white/70 mb-2">
              Uploaded:{" "}
              {new Date(
                JSON.parse(record.metadata).uploadedAt
              ).toLocaleString()}
            </p>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${record.cid}`}
              target="_blank"
              className="text-sky-400 text-sm flex items-center gap-1 hover:underline"
            >
              View on IPFS <ExternalLink className="h-4 w-4" />
            </a>
          </Card>
        ))
      )}
    </motion.div>
  </motion.div>
)}


        {/* Upload */}
        {activeTab === "upload" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-sky-500 hover:bg-sky-600"
            >
              <Upload className="mr-2 h-4 w-4" /> Select PDF
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isProcessing && <p className="mt-4 text-sm text-white/60">Processing document...</p>}

            {processedDoc && (
              <div className="mt-6">
                <pre className="bg-black/30 text-left text-xs text-gray-300 p-3 rounded-lg max-h-64 overflow-auto">
                  {JSON.stringify(processedDoc.fhirData, null, 2)}
                </pre>
                <Button onClick={handleUploadToBlockchain} className="mt-4 bg-emerald-500 hover:bg-emerald-600">
                  Upload to Blockchain
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Access */}
        {activeTab === "access" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <Card className="bg-white/5 border-white/10 p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus className="text-sky-400" /> <span className="text-white">Grant Doctor Access</span>
              </h3>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter doctor ID"
                  value={newDoctorId}
                  onChange={(e) => setNewDoctorId(e.target.value)}
                  className="bg-white/10 text-white border-white/20"
                />
                <Button onClick={handleGrantAccess} disabled={isGranting}>
                  {isGranting ? "Granting..." : "Grant"}
                </Button>
              </div>
              {grantError && <p className="text-red-400 mt-2">{grantError}</p>}
              {grantSuccess && <p className="text-green-400 mt-2">Access granted!</p>}
            </Card>

            <Card className="bg-white/5 border-white/10 p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="text-purple-400" /> <span className="text-white">Active Access ({accessGrants.length})</span>
              </h3>
              {accessGrants.length === 0 ? (
                <p className="text-white/60">No active access found.</p>
              ) : (
                <div className="space-y-3">
                  {accessGrants.map((g) => (
                    <div
                      key={g.doctorId}
                      className="flex justify-between items-center border border-white/10 p-3 rounded-lg bg-white/5"
                    >
                      <div>
                        <p className="font-medium text-white">{g.doctorId}</p>
                        <p className="text-xs text-white/60">
                          Expires: {new Date(g.expiresAt * 1000).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeAccess(g.doctorId)}
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#080813] py-8 text-center text-sm text-white/60">
        MediChain © {new Date().getFullYear()} | Powered by Arbitrum + IPFS + AI
      </footer>
    </div>
  );
}
