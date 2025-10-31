"use client";

import { useState, useRef } from "react";
import { Search, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HealthRecordCard from "@/components/HealthRecordCard";
import ConsentCard from "@/components/ConsentCard";
import AuditTrail from "@/components/AuditTrail";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PatientDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO: Remove mock data - replace with actual API calls
  const mockHealthRecords = [
    {
      id: "rec001",
      type: "lab" as const,
      title: "Complete Blood Count (CBC)",
      date: "Oct 15, 2025",
      hospital: "Apollo Hospital, Mumbai",
      summary:
        "All parameters within normal range. Hemoglobin: 14.2 g/dL, WBC: 7,200/μL",
      details:
        "Complete blood count analysis shows normal red blood cell count, white blood cell count, and platelet levels. No abnormalities detected.",
    },
    {
      id: "rec002",
      type: "prescription" as const,
      title: "Hypertension Medication",
      date: "Oct 10, 2025",
      hospital: "AIIMS, Delhi",
      summary:
        "Amlodipine 5mg once daily, Atenolol 50mg once daily for 3 months",
    },
    {
      id: "rec003",
      type: "scan" as const,
      title: "Chest X-Ray",
      date: "Oct 5, 2025",
      hospital: "Fortis Healthcare, Bangalore",
      summary: "No abnormalities detected. Lungs clear, heart size normal.",
      details:
        "Posteroanterior and lateral views of the chest were obtained. The lungs are clear without infiltrate or effusion. The cardiac silhouette is normal in size.",
    },
  ];

  const mockConsents = [
    {
      id: "consent001",
      doctorName: "Dr. Rajesh Kumar",
      doctorId: "HPR-2025-MH-12345",
      hospital: "Apollo Hospital, Mumbai",
      purpose: "Routine Consultation",
      dataTypes: ["Lab Reports", "Prescriptions", "Medical History"],
      grantedDate: "Oct 20, 2025",
      expiryDate: "Nov 20, 2025",
      status: "active" as const,
    },
    {
      id: "consent002",
      doctorName: "Dr. Priya Sharma",
      doctorId: "HPR-2025-DL-67890",
      hospital: "AIIMS, Delhi",
      purpose: "Specialist Consultation",
      dataTypes: ["Diagnostic Scans", "Lab Reports"],
      grantedDate: "Sep 15, 2025",
      expiryDate: "Oct 15, 2025",
      status: "expired" as const,
    },
  ];

  const mockAuditEvents = [
    {
      id: "evt001",
      timestamp: "Oct 25, 2025 at 2:30 PM",
      action: "accessed" as const,
      actor: "Dr. Rajesh Kumar",
      actorId: "HPR-2025-MH-12345",
      dataAccessed: ["Lab Reports", "Prescriptions"],
      blockchainHash: "0x7a9f3c2e8b1d4f6a5c7e9b2d8f1a3c5e",
    },
    {
      id: "evt002",
      timestamp: "Oct 20, 2025 at 10:15 AM",
      action: "granted" as const,
      actor: "You",
      actorId: "ABHA-1234-5678-9012",
      blockchainHash: "0x3b8e1f4a7c9d2e5b8a1f4c7e9b2d5a8f",
    },
    {
      id: "evt003",
      timestamp: "Sep 28, 2025 at 4:45 PM",
      action: "revoked" as const,
      actor: "You",
      actorId: "ABHA-1234-5678-9012",
      blockchainHash: "0x2c7d9a4f1e8b5c3a7f9e2b8d1a4c7f3e",
    },
  ];

  const handleRevokeConsent = (consentId: string) => {
    console.log("Revoking consent:", consentId);
    // TODO: ABDM Integration Point - Implement consent revocation
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsUploadDialogOpen(true);
    }
  };

  const handleUploadToIPFS = async () => {
    if (!selectedFile) return;

    setUploadProgress(10);
    // TODO: IPFS Integration - Upload file to IPFS
    console.log("Uploading to IPFS:", selectedFile.name);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // TODO: Replace with actual IPFS upload
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      console.log("File uploaded successfully");
      // Reset state
      setTimeout(() => {
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        setUploadProgress(0);
      }, 1000);
    }, 2000);
  };

  const handleCancelUpload = () => {
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Minimal Header */}
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-semibold">
            Health Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your medical records securely
          </p>
        </div>

        {/* Minimal Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="mb-1 text-2xl font-semibold">
                {mockHealthRecords.length}
              </div>
              <p className="text-muted-foreground text-xs">Records</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="mb-1 text-2xl font-semibold">
                {mockConsents.filter((c) => c.status === "active").length}
              </div>
              <p className="text-muted-foreground text-xs">Active Consents</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="mb-1 text-2xl font-semibold">
                {mockAuditEvents.length}
              </div>
              <p className="text-muted-foreground text-xs">Activities</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="records" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted/30">
              <TabsTrigger
                value="records"
                data-testid="tab-records"
                className="text-sm"
              >
                Records
              </TabsTrigger>
              <TabsTrigger
                value="consents"
                data-testid="tab-consents"
                className="text-sm"
              >
                Consents
                {mockConsents.filter((c) => c.status === "active").length >
                  0 && (
                  <Badge variant="secondary" className="ml-2 h-5 text-xs">
                    {mockConsents.filter((c) => c.status === "active").length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                data-testid="tab-audit"
                className="text-sm"
              >
                Audit
              </TabsTrigger>
            </TabsList>

            {/* Upload Button */}
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
          <TabsContent value="records" className="mt-4 space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-10"
                  data-testid="input-search-records"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger
                  className="h-10 w-40"
                  data-testid="select-filter-type"
                >
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lab">Lab Reports</SelectItem>
                  <SelectItem value="prescription">Prescriptions</SelectItem>
                  <SelectItem value="scan">Scans</SelectItem>
                  <SelectItem value="consultation">Consultations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Records List */}
            <div className="space-y-3">
              {mockHealthRecords.map((record) => (
                <HealthRecordCard key={record.id} {...record} />
              ))}
            </div>
          </TabsContent>

          {/* Consents Tab */}
          <TabsContent value="consents" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {mockConsents.map((consent) => (
                <ConsentCard
                  key={consent.id}
                  {...consent}
                  onRevoke={() => handleRevokeConsent(consent.id)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit" className="mt-4 space-y-4">
            <AuditTrail events={mockAuditEvents} />
          </TabsContent>
        </Tabs>

        {/* Upload Dialog Modal */}
        {isUploadDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Upload Document</h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        This will be stored on IPFS
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
                        <div className="bg-primary/10 rounded p-2">
                          <Upload className="text-primary h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {selectedFile.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>

                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-3">
                          <div className="bg-muted h-2 overflow-hidden rounded-full">
                            <div
                              className="bg-primary h-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Uploading to IPFS... {uploadProgress}%
                          </p>
                        </div>
                      )}

                      {uploadProgress === 100 && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                          ✓ Upload successful!
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
                        : "Upload to IPFS"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
