"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getContract } from "@/utils/contract";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCcw,
  FileText,
  User,
  ShieldCheck,
  HeartPulse,
  Activity,
  ArrowLeft,
} from "lucide-react";

export default function DoctorDashboard() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const doctorId = "D03";
  const patientIds = ["P0001", "P0002", "P0003"];

  const fetchAuthorizedRecords = async () => {
    try {
      setLoading(true);
      setStatus("🔍 Checking access...");
      const contract: any = await getContract();
      const visiblePatients: any[] = [];

      for (const id of patientIds) {
        const hasAccess = await contract.isAccessGranted(id, doctorId);
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
    <div className="min-h-screen bg-linear-to-br from-[#050510] via-[#0c1220] to-[#1d1630] text-white">
      {/* Header */}
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-linear-to-r from-sky-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-black sm:text-5xl"
          >
            Doctor Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-3 text-lg text-white/70"
          >
            Access AI-processed patient records securely and instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="mt-8 flex justify-center gap-4"
          >
            <Button
              onClick={fetchAuthorizedRecords}
              disabled={loading}
              className="gap-2 rounded-full bg-sky-500 px-8 py-6 text-lg font-semibold shadow-lg shadow-sky-500/25 hover:bg-sky-400"
            >
              <RefreshCcw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Fetching..." : "Fetch Records"}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="gap-2 rounded-full border-white/30 bg-transparent px-8 py-6 text-lg font-semibold text-white hover:border-sky-300 hover:text-sky-200"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Button>
          </motion.div>

          {status && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-sm text-white/70"
            >
              {status}
            </motion.div>
          )}
        </div>
      </section>

      {/* Records Section */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        {loading ? (
          <div className="text-center py-20 text-white/60 text-lg">
            Fetching authorized records...
          </div>
        ) : records.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-lg font-semibold text-white/80">
              No authorized records available.
            </p>
            <p className="text-sm text-white/50">
              Ask patients to grant consent before accessing records.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
          >
            {records.map((patient) => (
              <Card
                key={patient.patientId}
                className="group border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-sky-400/40 hover:shadow-[0_20px_60px_-30px_rgba(56,189,248,0.6)]"
              >
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-sky-300" />
                      <h2 className="text-xl font-semibold text-white">
                        {patient.patientId}
                      </h2>
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-sky-500/10 text-sky-300 border-sky-500/30"
                    >
                      {patient.records.length} Records
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {patient.records.map((r: any, i: number) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        className="cursor-pointer rounded-lg border border-white/10 bg-white/10 p-3 transition hover:bg-sky-500/10"
                        onClick={() => handleViewRecord(r.cid)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-sky-400" />
                          <span className="text-sm text-sky-200 font-medium break-all">
                            CID: {r.cid}
                          </span>
                        </div>
                        <p className="text-xs text-white/70">
                          Metadata:{" "}
                          <span className="text-white/90">{r.metadata}</span>
                        </p>
                        <p className="text-xs text-white/50">
                          Uploaded:{" "}
                          {new Date(Number(r.timestamp) * 1000).toLocaleString()}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </section>

      {/* Highlights */}
      <section className="bg-linear-to-r from-sky-500/10 via-purple-500/10 to-sky-500/10 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-3 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <HeartPulse className="mx-auto h-8 w-8 text-sky-300" />
            <p className="mt-3 text-2xl font-semibold">Faster Diagnoses</p>
            <p className="mt-2 text-sm text-white/60">
              AI-assisted parsing of patient data.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <ShieldCheck className="mx-auto h-8 w-8 text-emerald-300" />
            <p className="mt-3 text-2xl font-semibold">Blockchain Trust</p>
            <p className="mt-2 text-sm text-white/60">
              Immutable audit trail of consent.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <Activity className="mx-auto h-8 w-8 text-purple-300" />
            <p className="mt-3 text-2xl font-semibold">Live Monitoring</p>
            <p className="mt-2 text-sm text-white/60">
              View usage analytics and activity logs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#080813] px-4 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            © {new Date().getFullYear()} MediChain. Secure data access for doctors.
          </div>
          <div className="flex gap-6">
            <span>Arbitrum powered</span>
            <span>IPFS &amp; Pinata storage</span>
            <span>Smart Consent Protocol</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
