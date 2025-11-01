"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DoctorRegistration } from "@/components/doctor-registration";
import { getOrCreateDoctorId, isWalletConnected } from "@/utils/user-ids";
import { FHIRDisplay } from "@/components/fhir-display";
import {
  Search,
  Lock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getContract } from "@/utils/contract";

interface PatientRecord {
  id: string;
  name: string;
  cid: string;
  timestamp: number;
  metadata?: string;
}

export default function DoctorPortal() {
  const router = useRouter();

  // Authentication guard
  useEffect(() => {
    if (!isWalletConnected()) {
      router.push("/");
    }
  }, [router]);

  const [searchPatientId, setSearchPatientId] = useState("");
  const [foundRecords, setFoundRecords] = useState<PatientRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accessError, setAccessError] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [expandedRecordIdx, setExpandedRecordIdx] = useState<number | null>(
    null,
  );

  const [doctorId, setDoctorId] = useState("");

  // Initialize doctor ID on client side only
  useEffect(() => {
    setDoctorId(getOrCreateDoctorId());
  }, []);

  const handleSearch = async () => {
    if (!searchPatientId.trim()) {
      setErrorMessage("Please enter a patient ID");
      return;
    }

    setIsSearching(true);
    setErrorMessage("");
    setAccessError("");
    setHasAccess(false);
    setRequestSent(false);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contract: any = await getContract();

      // Check if doctor has access to this patient's records
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const hasPermission = await contract.isAccessGranted(
        searchPatientId,
        doctorId,
      );

      if (!hasPermission) {
        setAccessError(
          "Access denied. Patient has not granted you permission to view their records.",
        );
        setFoundRecords([]);
        setIsSearching(false);
        return;
      }

      // Get records for this patient
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const records = await contract.getRecords(searchPatientId);

      if (records && Array.isArray(records) && records.length > 0) {
        setFoundRecords(records as PatientRecord[]);
        setHasAccess(true);
      } else {
        setFoundRecords([]);
        setErrorMessage("No records found for this patient");
      }
    } catch (error) {
      const err = error as Error;
      setAccessError(err.message || "Failed to search records");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!searchPatientId.trim()) {
      setErrorMessage("Please enter a patient ID");
      return;
    }

    setIsRequesting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contract: any = await getContract();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const tx = await contract.requestAccess(searchPatientId, doctorId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await tx.wait();
      setRequestSent(true);
      setTimeout(() => setRequestSent(false), 3000);
    } catch (error) {
      const err = error as Error;
      setAccessError(err.message || "Failed to request access");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      void handleSearch();
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-semibold">
            Doctor Portal
          </h1>
          <p className="text-muted-foreground text-sm">
            View patient medical records with proper authorization
          </p>
        </div>

        {/* Doctor Registration */}
        <div className="mb-8">
          <DoctorRegistration />
        </div>

        {/* Patient Search Section */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Patient Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patientId">Patient ID</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="patientId"
                    value={searchPatientId}
                    onChange={(e) => setSearchPatientId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter patient ID (e.g., PAT1234)"
                    disabled={isSearching}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-6"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              {accessError && (
                <div className="flex items-start gap-3 rounded bg-red-50 p-4 dark:bg-red-950">
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-200" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      Access Denied
                    </p>
                    <p className="mt-1 text-xs text-red-800 dark:text-red-200">
                      {accessError}
                    </p>
                    {requestSent && (
                      <p className="mt-2 text-xs font-medium text-green-700 dark:text-green-200">
                        ✓ Access request sent to patient
                      </p>
                    )}
                  </div>
                  {!requestSent && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRequestAccess}
                      disabled={isRequesting}
                      className="shrink-0 gap-2"
                    >
                      {isRequesting ? (
                        <>
                          <span className="inline-block h-3 w-3 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        "Request Access"
                      )}
                    </Button>
                  )}
                </div>
              )}

              {hasAccess && foundRecords.length === 0 && (
                <div className="flex items-center gap-2 rounded bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Patient has no records yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Records Display */}
        {hasAccess && foundRecords.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Patient Records (Access Granted)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {foundRecords.map((record: any, idx: number) => {
                  const isExpanded = expandedRecordIdx === idx;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  let fhirData: any = {};
                  try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
                    fhirData = record.metadata
                      ? JSON.parse(record.metadata)
                      : {};
                  } catch {
                    // Continue with empty object
                  }

                  return (
                    <div
                      key={idx}
                      className="rounded-lg border transition-colors"
                    >
                      <button
                        onClick={() =>
                          setExpandedRecordIdx(isExpanded ? null : idx)
                        }
                        className="hover:bg-muted/50 flex w-full items-start justify-between p-4 text-left"
                      >
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
                          </div>
                        </div>
                        <div className="ml-2 shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="text-muted-foreground h-5 w-5" />
                          ) : (
                            <ChevronDown className="text-muted-foreground h-5 w-5" />
                          )}
                        </div>
                      </button>

                      {/* Expandable FHIR Details */}
                      {isExpanded && (
                        <div className="bg-muted/30 border-t px-4 py-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="mb-3 text-sm font-medium">
                                Medical Information
                              </h4>
                              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                              <FHIRDisplay fhirData={fhirData} showRaw={true} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Box */}
        <Card className="mt-8 border-0 bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>How it works:</strong> Patients grant you access to their
              records through the patient portal. Once access is granted, you
              can search for and view their medical records here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
