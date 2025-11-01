"use client";

import { useState } from "react";
import { RefreshCcw, FileText } from "lucide-react";
import { getContract } from "@/utils/contract";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function DoctorDashboard() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();

  const doctorId = "12345";
  const patientIds = ["1234"];

  // ✅ Fetch authorized records
  const fetchAuthorizedRecords = async () => {
    try {
      setLoading(true);
      setStatus("🔍 Checking access...");
      const contract: any = await getContract();
      const visiblePatients: any[] = [];

      for (const id of patientIds) {
        console.log(id, doctorId)
        const hasAccess = await contract.isAccessGranted(id, doctorId);
        console.log(hasAccess)
        if (hasAccess) {
          const recs = await contract.getRecords(id);
          visiblePatients.push({ patientId: id, records: recs });
        }
      }

      setRecords(visiblePatients);
      setStatus("✅ Records fetched successfully!");
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      setStatus("❌ Error fetching records.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = (cid: string) => {
    router.push(`/record/${cid}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7fa] to-[#fef6e4]">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
            <p className="text-gray-500 text-sm">
              View patient records with valid consent.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchAuthorizedRecords}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {status && (
          <p className="mb-4 text-sm bg-gray-100 px-3 py-2 rounded text-gray-700">
            {status}
          </p>
        )}

        {loading ? (
          <p>Loading records...</p>
        ) : records.length === 0 ? (
          <p>No authorized patient records found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {records.map((patient) => (
              <Card key={patient.patientId}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Patient ID: {patient.patientId}
                    </h2>
                    <Badge variant="secondary">
                      {patient.records.length} Records
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {patient.records.map((r: any, i: number) => (
                      <div
                        key={i}
                        className="border rounded-lg p-3 bg-muted/20 hover:bg-muted/40 transition cursor-pointer"
                        onClick={() => handleViewRecord(r.cid)}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-blue-600 underline text-sm break-all">
                            {r.cid}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Metadata: {r.metadata}</p>
                        <p className="text-xs text-gray-400">
                          Uploaded:{" "}
                          {new Date(Number(r.timestamp) * 1000).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
