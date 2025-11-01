"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { ethers } from "ethers";
import { getContract } from "@/utils/contract";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function PatientDashboard() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [records, setRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const patientId = "PAT123"; // Replace with actual connected ID

  // ✅ Fetch records from blockchain
  const fetchRecords = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not found!");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract();

      setLoadingRecords(true);
      const res = await (contract as any).getRecords(patientId);

      setRecords(res);
      setLoadingRecords(false);
      console.log("📦 Blockchain Records:", res);
    } catch (err) {
      console.error("❌ Failed to fetch records:", err);
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // ✅ File selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsUploadDialogOpen(true);
    }
  };

  // ✅ Upload file → IPFS → Add to contract
  const handleUploadToIPFS = async () => {
    if (!selectedFile) return;

    try {
      setUploadProgress(10);
      console.log("📤 Uploading to IPFS:", selectedFile.name);

      const formData = new FormData();
      formData.append("file", selectedFile);

      // ✅ Upload to Pinata
      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);

      const data = await res.json();
      const cid = data.IpfsHash;
      console.log("✅ IPFS Upload successful! CID:", cid);

      // Simulate upload progress
      setUploadProgress(70);

      // ✅ Connect MetaMask
      if (!window.ethereum) throw new Error("MetaMask not found!");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // ✅ Load Smart Contract
      const contract = getContract();

      const metadata = selectedFile.name;

      console.log("📦 Adding record to smart contract...");
      const tx = await (contract as any).addRecord(patientId, cid, metadata);
      await tx.wait();
      console.log("✅ Record added to blockchain!");

      // // ✅ Verify by fetching all records
      // const records = await (contract as any).getRecords(patientId);
      // console.log("🧾 Blockchain Records:", records);
      // setRecords(records);

      setUploadProgress(100);
      alert(`✅ File uploaded and recorded!\nCID: ${cid}`);

      // Reset after success
      setTimeout(() => {
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        setUploadProgress(0);
      }, 1500);
    } catch (err) {
      console.error("❌ Upload or blockchain transaction failed:", err);
      alert("Upload or blockchain transaction failed! Check console for details.");
      setUploadProgress(0);
    }
  };

  // Cancel upload
  const handleCancelUpload = () => {
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-semibold mb-2 text-foreground">
          Health Dashboard
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Manage your health records securely on IPFS & Blockchain
        </p>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-2xl font-semibold">{records.length || 0}</div>
              <p className="text-xs text-muted-foreground">Records Stored</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="records" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted/30">
              <TabsTrigger value="records">Records</TabsTrigger>
            </TabsList>

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
              size="sm"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileSelect}
            />
          </div>

          {/* Records Tab */}
          <TabsContent value="records" className="mt-4">
            {loadingRecords ? (
              <p>⏳ Loading blockchain records...</p>
            ) : records.length === 0 ? (
              <p>No records found.</p>
            ) : (
              <div className="space-y-3">
                {records.map((r, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-3 bg-muted/20 hover:bg-muted/40 transition"
                  >
                    <p className="text-sm font-semibold">
                      CID:{" "}
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${r.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {r.cid}
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Metadata: {r.metadata}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Upload Modal */}
        {isUploadDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Upload Document</h3>
                    <p className="text-sm text-muted-foreground">
                      This will be stored on IPFS & Blockchain
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelUpload}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {selectedFile && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded">
                        <Upload className="text-primary h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>

                    {uploadProgress > 0 && (
                      <div className="mt-3">
                        <div className="bg-muted h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelUpload}
                    className="flex-1"
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadToIPFS}
                    className="flex-1"
                    disabled={!selectedFile || uploadProgress > 0}
                  >
                    {uploadProgress > 0 && uploadProgress < 100
                      ? "Uploading..."
                      : "Upload & Save"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
