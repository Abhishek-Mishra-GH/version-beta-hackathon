"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  Users,
  Plus,
  Clock,
  ExternalLink,
} from "lucide-react";
import { getContract } from "@/utils/contract";
import { getOrCreatePatientId, isWalletConnected } from "@/utils/user-ids";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PatientProfile } from "@/components/patient-profile";

interface FHIRData {
  resourceType?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ProcessedDocument {
  file: File;
  fhirData: FHIRData;
  ipfsHash?: string;
  status: "processing" | "preview" | "uploading" | "success" | "error";
  error?: string;
  metadata?: {
    uploadedAt: string;
    processedWith: string;
    extractedText: string;
  };
}

interface AccessGrant {
  doctorId: string;
  doctorName: string;
  grantedAt: number;
  expiresAt: number;
}

type TabType = "profile" | "records" | "upload" | "access";

export default function PatientDashboard() {
  const router = useRouter();

  // Authentication guard
  useEffect(() => {
    if (!isWalletConnected()) {
      router.push("/");
    }
  }, [router]);
  const [activeTab, setActiveTab] = useState<TabType>("records");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [records, setRecords] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedDoc, setProcessedDoc] = useState<ProcessedDocument | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [accessGrants, setAccessGrants] = useState<AccessGrant[]>([]);
  const [newDoctorId, setNewDoctorId] = useState("");
  const [isGranting, setIsGranting] = useState(false);
  const [grantError, setGrantError] = useState("");
  const [grantSuccess, setGrantSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [patientId, setPatientId] = useState("");

  // Initialize patient ID on client side only
  useEffect(() => {
    setPatientId(getOrCreatePatientId());
  }, []);

  // Fetch records from blockchain
  const fetchRecords = async () => {
    if (!patientId) return; // Don't fetch if patientId not set yet

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contract: any = await getContract();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const res = await contract.getRecords(patientId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setRecords(res);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  // Grant access to a doctor for 24 hours
  const handleGrantAccess = async () => {
    if (!newDoctorId.trim()) {
      setGrantError("Please enter a doctor ID");
      return;
    }

    setIsGranting(true);
    setGrantError("");
    setGrantSuccess(false);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contract: any = await getContract();
      const durationSeconds = 24 * 60 * 60; // 24 hours

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const tx = await contract.grantAccess(
        patientId,
        newDoctorId,
        durationSeconds,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await tx.wait();

      // Add to UI immediately
      const expiryTime = Math.floor(Date.now() / 1000) + durationSeconds;
      setAccessGrants((prev) => [
        ...prev,
        {
          doctorId: newDoctorId,
          doctorName: newDoctorId,
          grantedAt: Math.floor(Date.now() / 1000),
          expiresAt: expiryTime,
        },
      ]);

      setGrantSuccess(true);
      setNewDoctorId("");

      setTimeout(() => setGrantSuccess(false), 3000);
    } catch (error) {
      const err = error as Error;
      setGrantError(err.message || "Failed to grant access");
    } finally {
      setIsGranting(false);
    }
  };

  // Revoke access from a doctor
  const handleRevokeAccess = async (doctorId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contract: any = await getContract();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const tx = await contract.revokeAccess(patientId, doctorId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await tx.wait();

      setAccessGrants((prev) =>
        prev.filter((grant) => grant.doctorId !== doctorId),
      );
    } catch (error) {
      const err = error as Error;
      alert(`Failed to revoke access: ${err.message}`);
    }
  };

  useEffect(() => {
    void fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  // Step 1: Handle file selection
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

  // Step 2: Process document with AI
  const processDocumentWithAI = async (file: File) => {
    setIsProcessing(true);
    setProcessedDoc({
      file,
      fhirData: {},
      status: "processing",
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("AI processing failed");
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await response.json();

      setProcessedDoc({
        file,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        fhirData: data.fhir_data ?? {},
        status: "preview",
        metadata: {
          uploadedAt: new Date().toISOString(),
          processedWith: "gemini-2.5-flash",
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          extractedText: (data.fhir_data?.raw as string) ?? "Processed",
        },
      });
    } catch (error) {
      const err = error as Error;
      setProcessedDoc({
        file,
        fhirData: {},
        status: "error",
        error: err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Upload to IPFS and blockchain
  const handleUploadToBlockchain = async () => {
    if (!processedDoc || !selectedFile) return;

    setProcessedDoc({ ...processedDoc, status: "uploading" });
    setUploadProgress(10);

    try {
      // Prepare metadata
      const metadata = {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        uploadedAt: new Date().toISOString(),
        processedWith: "gemini-2.5-flash",
      };

      setUploadProgress(20);

      // Upload to IPFS via Pinata
      const ipfsFormData = new FormData();
      ipfsFormData.append("file", selectedFile);
      ipfsFormData.append("metadata", JSON.stringify(metadata));

      const ipfsResponse = await fetch("/api/ipfs", {
        method: "POST",
        body: ipfsFormData,
      });

      if (!ipfsResponse.ok) {
        throw new Error("Failed to upload to IPFS");
      }

      const ipfsData = (await ipfsResponse.json()) as {
        ipfsHash: string;
        ipfsUrl: string;
      };
      const ipfsHash = ipfsData.ipfsHash;

      setUploadProgress(60);

      // Record on blockchain
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contract: any = await getContract();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const tx = await contract.addRecord(
        patientId,
        ipfsHash,
        JSON.stringify(metadata),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await tx.wait();

      setUploadProgress(100);

      setProcessedDoc({
        ...processedDoc,
        status: "success",
        ipfsHash,
      });

      // Reset and refresh
      setTimeout(() => {
        setSelectedFile(null);
        setProcessedDoc(null);
        setUploadProgress(0);
        void fetchRecords();
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 2000);
    } catch (error) {
      const err = error as Error;
      setProcessedDoc({
        ...processedDoc,
        status: "error",
        error: err.message,
      });
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setProcessedDoc(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-semibold">
            Patient Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your health records securely on blockchain
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2 border-b">
          {(["profile", "records", "upload", "access"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              {tab === "profile" && "Profile"}
              {tab === "records" && "Records"}
              {tab === "upload" && "Upload"}
              {tab === "access" && "Access Control"}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div>
            <PatientProfile />
          </div>
        )}

        {/* Records Tab */}
        {activeTab === "records" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Your Health Records</CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No records yet. Upload your first document in the Upload tab.
                </p>
              ) : (
                <div className="grid gap-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {records.map((record: any, idx: number) => (
                    <div
                      key={idx}
                      className="hover:bg-muted/50 rounded-lg border p-4 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">
                            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                            {record.metadata ?? `Record ${idx + 1}`}
                          </p>
                          <div className="text-muted-foreground mt-2 space-y-1 text-xs">
                            <p>
                              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */}
                              <strong>CID:</strong> {record.cid?.slice(0, 20)}
                              ...
                            </p>
                            <p>
                              <strong>Date:</strong>{" "}
                              {new Date(
                                /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */
                                Number(record.timestamp ?? 0) * 1000,
                              ).toLocaleDateString()}
                            </p>
                            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                            {record.cid && (
                              <p>
                                <a
                                  /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */
                                  href={`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "gateway.pinata.cloud"}/ipfs/${record.cid}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary inline-flex items-center gap-1 hover:underline"
                                >
                                  <strong>View on IPFS</strong>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs">
                          Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <Card className="mb-8 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Medical Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Upload PDF</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      PDF will be processed with AI and stored on blockchain
                    </p>
                  </div>
                  {!processedDoc && (
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Select PDF
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isProcessing}
                />

                {/* Processing State */}
                {processedDoc?.status === "processing" && (
                  <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-4">
                    <Loader className="h-5 w-5 animate-spin" />
                    <div>
                      <p className="text-sm font-medium">
                        Processing document with AI...
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Extracting and converting to FHIR format
                      </p>
                    </div>
                  </div>
                )}

                {/* Preview State */}
                {processedDoc?.status === "preview" && (
                  <div className="bg-card space-y-4 rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="mb-2 font-medium">
                          Processed FHIR Data
                        </h3>
                        <div className="bg-muted/50 max-h-64 overflow-y-auto rounded p-3 text-xs">
                          <pre>
                            {JSON.stringify(processedDoc.fhirData, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUploadToBlockchain}
                        className="flex-1"
                      >
                        Confirm & Upload
                      </Button>
                    </div>
                  </div>
                )}

                {/* Uploading State */}
                {processedDoc?.status === "uploading" && (
                  <div className="bg-muted/50 space-y-2 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Uploading to IPFS and Blockchain
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {uploadProgress}%
                      </p>
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Success State */}
                {processedDoc?.status === "success" && (
                  <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-950">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Upload successful!
                      </p>
                      <p className="mt-1 text-xs text-green-800 dark:text-green-200">
                        IPFS Hash: {processedDoc.ipfsHash?.slice(0, 20)}...
                      </p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {processedDoc?.status === "error" && (
                  <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        Processing failed
                      </p>
                      <p className="mt-1 text-xs text-red-800 dark:text-red-200">
                        {processedDoc.error}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Access Control Tab */}
        {activeTab === "access" && (
          <div className="space-y-6">
            {/* Grant Access Form */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Grant Doctor Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Enter a doctor ID to grant them 24-hour access to your
                    medical records
                  </p>

                  {grantSuccess && (
                    <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-950">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          Access granted successfully!
                        </p>
                        <p className="mt-1 text-xs text-green-800 dark:text-green-200">
                          Doctor can now view your records for 24 hours
                        </p>
                      </div>
                    </div>
                  )}

                  {grantError && (
                    <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">
                          Error granting access
                        </p>
                        <p className="mt-1 text-xs text-red-800 dark:text-red-200">
                          {grantError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="doctorId" className="mb-2 block text-xs">
                        Doctor ID (e.g., DOC_SMITH)
                      </Label>
                      <Input
                        id="doctorId"
                        value={newDoctorId}
                        onChange={(e) => setNewDoctorId(e.target.value)}
                        placeholder="Enter doctor ID"
                        disabled={isGranting}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleGrantAccess}
                        disabled={isGranting || !newDoctorId.trim()}
                        className="gap-2"
                      >
                        {isGranting ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Granting...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Grant Access
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Access Grants */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Doctor Access ({accessGrants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accessGrants.length === 0 ? (
                    <div className="bg-muted/50 rounded-lg p-4 py-8 text-center">
                      <p className="text-muted-foreground text-sm">
                        No active access grants. Grant a doctor access above to
                        get started.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {accessGrants.map((grant) => {
                        const expiresIn =
                          Number(grant.expiresAt) -
                          Math.floor(Date.now() / 1000);
                        const hoursRemaining = Math.ceil(expiresIn / 3600);
                        const isExpiringSoon = hoursRemaining < 2;

                        return (
                          <div
                            key={grant.doctorId}
                            className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{grant.doctorName}</p>
                              <div className="text-muted-foreground mt-2 space-y-1 text-xs">
                                <p>ID: {grant.doctorId}</p>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {isExpiringSoon ? (
                                    <span className="text-amber-600 dark:text-amber-400">
                                      Expires in {hoursRemaining}h
                                    </span>
                                  ) : (
                                    <span>Expires in {hoursRemaining}h</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokeAccess(grant.doctorId)}
                            >
                              Revoke
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
