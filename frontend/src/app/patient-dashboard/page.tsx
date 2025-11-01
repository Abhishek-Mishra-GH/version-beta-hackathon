"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, ShieldCheck, ShieldOff } from "lucide-react";
import { ethers } from "ethers";
import { getContract } from "@/utils/contract";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function PatientDashboard() {
  const [records, setRecords] = useState<any[]>([]);
  const [consents, setConsents] = useState<{ doctorId: string; expiry: number }[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingConsents, setLoadingConsents] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [doctorId, setDoctorId] = useState("");
  const [duration, setDuration] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const patientId = "PAT1234";

  // ✅ Fetch all records
  const fetchRecords = async () => {
    try {
      setLoadingRecords(true);
      const contract: any = await getContract();
      const res = await contract.getRecords(patientId);
      setRecords(res);
    } catch (err) {
      console.error("❌ Fetch records failed:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  // ✅ Fetch all consents
  const fetchConsents = async () => {
    try {
      setLoadingConsents(true);
      const contract: any = await getContract();
      const doctorIds = ["DOC001", "DOC002", "DOC003", "1234"];
      const results: any[] = [];

      for (const id of doctorIds) {
        const expiry = await contract.getAccessExpiry(patientId, id);
        if (Number(expiry) > 0) {
          results.push({ doctorId: id, expiry: Number(expiry) });
        }
      }
      setConsents(results);
    } catch (err) {
      console.error("❌ Fetch consents failed:", err);
    } finally {
      setLoadingConsents(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchConsents();
  }, []);

  // ✅ Upload record
  const handleUploadToIPFS = async () => {
    if (!selectedFile) return alert("Please select a file!");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("IPFS upload failed");
      const data = await res.json();
      const cid = data.IpfsHash;

      const contract: any = await getContract();
      const tx = await contract.addRecord(patientId, cid, selectedFile.name);
      await tx.wait();

      alert(`✅ File uploaded successfully! CID: ${cid}`);
      fetchRecords();
      setSelectedFile(null);
    } catch (err) {
      console.error("❌ Upload failed:", err);
    }
  };

  // ✅ Grant access
  const handleGrantAccess = async () => {
    if (!doctorId || !duration) return alert("Enter doctorId and duration!");
    try {
      const contract: any = await getContract();
      const tx = await contract.grantAccess(patientId, doctorId, Number(duration));
      await tx.wait();
      alert(`✅ Access granted to ${doctorId}`);
      fetchConsents();
    } catch (err) {
      console.error("❌ Grant access failed:", err);
    }
  };

  // ✅ Revoke access
  const handleRevokeAccess = async (id: string) => {
    try {
      const contract: any = await getContract();
      const tx = await contract.revokeAccess(patientId, id);
      await tx.wait();
      alert(`❌ Access revoked for ${id}`);
      fetchConsents();
    } catch (err) {
      console.error("❌ Revoke access failed:", err);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-semibold mb-2">Patient Dashboard</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Manage your medical records and consent for doctors.
        </p>

        <Tabs defaultValue="records" className="space-y-4">
          <TabsList>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="consents">Consents</TabsTrigger>
          </TabsList>

          {/* Records Tab */}
          <TabsContent value="records">
            <div className="flex justify-end mb-4">
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.docx"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedFile(e.target.files?.[0] ?? null)
                }
              />
              {selectedFile && (
                <Button className="ml-2" onClick={handleUploadToIPFS}>
                  Upload to IPFS
                </Button>
              )}
            </div>

            {loadingRecords ? (
              <p>Loading records...</p>
            ) : records.length === 0 ? (
              <p>No records yet.</p>
            ) : (
              <div className="space-y-3">
                {records.map((r, i) => (
                  <Card key={i}>
                    <CardContent className="p-3">
                      <p className="font-medium text-sm">
                        CID:{" "}
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${r.cid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          {r.cid}
                        </a>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Metadata: {r.metadata}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Consents Tab */}
          <TabsContent value="consents">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Doctor ID"
                  value={doctorId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDoctorId(e.target.value)
                  }
                />
                <Input
                  placeholder="Duration (seconds)"
                  value={duration}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDuration(e.target.value)
                  }
                />
                <Button onClick={handleGrantAccess}>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Grant
                </Button>
              </div>

              <h3 className="text-lg font-medium mt-4">Active Consents</h3>
              {loadingConsents ? (
                <p>Loading consents...</p>
              ) : consents.length === 0 ? (
                <p>No active consents.</p>
              ) : (
                consents.map((c) => (
                  <Card key={c.doctorId}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{c.doctorId}</p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(c.expiry * 1000).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeAccess(c.doctorId)}
                      >
                        <ShieldOff className="h-4 w-4 mr-1" /> Revoke
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
