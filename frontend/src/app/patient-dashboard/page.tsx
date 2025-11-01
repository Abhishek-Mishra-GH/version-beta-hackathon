"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Plus,
  Users,
  ExternalLink,
} from "lucide-react";
import { getContract } from "@/utils/contract";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const patientId = "P0001"; // ✅ Fixed dummy patient ID

  // Fetch all records for the dummy patient
  const fetchRecords = async () => {
    try {
      const contract: any = await getContract();
      const res = await contract.getRecords(patientId);
      setRecords(res);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  // Fetch doctors who currently have access
  const fetchAccessGrants = async () => {
    const dummyDoctors = ["D01", "D02", "D03", "D04","D05", "D06", "D07", "D08"];
    try {
      const contract: any = await getContract();
      const grants: any[] = [];

      for (const doctorId of dummyDoctors) {
        const hasAccess = await contract.isAccessGranted(patientId, doctorId);
        if (hasAccess) {
          const expiry: bigint = await contract.getAccessExpiry(patientId, doctorId);
          grants.push({
            doctorId,
            expiresAt: Number(expiry),
          });
        }
      }
      setAccessGrants(grants);
    } catch (error) {
      console.error("Error fetching access grants:", error);
    }
  };

  // Run on tab change
  useEffect(() => {
    if (activeTab === "records") void fetchRecords();
    if (activeTab === "access") void fetchAccessGrants();
  }, [activeTab]);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Only PDF files are allowed");
      return;
    }
    setSelectedFile(file);
    await processDocumentWithAI(file);
  };

  // AI processing simulation
  const processDocumentWithAI = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error("AI processing failed");
      const data = await response.json();
      setProcessedDoc({
        file,
        fhirData: data.fhir_data ?? {},
        status: "preview",
      });
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

  // Grant doctor access
  const handleGrantAccess = async () => {
    if (!newDoctorId.trim()) return setGrantError("Enter a doctor ID");
    setIsGranting(true);
    setGrantError("");
    setGrantSuccess(false);

    try {
      const contract: any = await getContract();
      const durationSeconds = 24 * 60 * 60; // 1 day
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

  // Revoke access
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
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-foreground mb-2 text-3xl font-semibold">
          Patient Dashboard (Dummy ID: 1234)
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Manage your records and doctor access.
        </p>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b">
          {(["records", "upload", "access"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-2 text-sm font-medium ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Records */}
        {activeTab === "records" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Your Records</CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <p>No records found.</p>
              ) : (
                <div className="space-y-3">
                  {records.map((record: any, i: number) => (
                    <div key={i} className="p-3 border rounded-md">
                      <p className="font-medium">{record.metadata}</p>
                      <p className="text-xs text-gray-600 break-all">
                        CID: {record.cid}
                      </p>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${record.cid}`}
                        target="_blank"
                        className="text-blue-600 text-xs inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload */}
        {activeTab === "upload" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" /> Upload PDF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                Select PDF
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              {isProcessing && <p className="mt-3 text-sm">Processing document...</p>}
              {processedDoc && (
                <div className="mt-3">
                  <pre className="text-xs bg-muted p-2 rounded">
                    {JSON.stringify(processedDoc.fhirData, null, 2)}
                  </pre>
                  <Button onClick={handleUploadToBlockchain} className="mt-3">
                    Upload to Blockchain
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Access Control */}
        {activeTab === "access" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>
                  <Plus className="inline h-5 w-5 mr-2" />
                  Grant Doctor Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter doctor ID"
                    value={newDoctorId}
                    onChange={(e) => setNewDoctorId(e.target.value)}
                  />
                  <Button onClick={handleGrantAccess} disabled={isGranting}>
                    {isGranting ? "Granting..." : "Grant"}
                  </Button>
                </div>
                {grantError && <p className="text-red-500 text-sm mt-2">{grantError}</p>}
                {grantSuccess && <p className="text-green-500 text-sm mt-2">Access granted!</p>}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>
                  <Users className="inline h-5 w-5 mr-2" />
                  Active Doctor Access ({accessGrants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {accessGrants.length === 0 ? (
                  <p>No active access found.</p>
                ) : (
                  <div className="space-y-3">
                    {accessGrants.map((g) => (
                      <div
                        key={g.doctorId}
                        className="flex justify-between items-center border p-3 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{g.doctorId}</p>
                          <p className="text-xs text-gray-500">
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
