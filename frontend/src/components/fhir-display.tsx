"use client";

import {
  AlertCircle,
  CheckCircle,
  Pill,
  AlertTriangle,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FHIRData {
  resourceType?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ParsedFHIRFields {
  medications: string[];
  allergies: string[];
  conditions: string[];
  observations: Array<{ code: string; value: string }>;
  hasData: boolean;
}

export function parseFHIRFields(fhirData: FHIRData): ParsedFHIRFields {
  const result: ParsedFHIRFields = {
    medications: [],
    allergies: [],
    conditions: [],
    observations: [],
    hasData: false,
  };

  if (!fhirData || typeof fhirData !== "object") {
    return result;
  }

  // Parse medications
  const medications = (fhirData as Record<string, unknown>).medications;
  if (Array.isArray(medications)) {
    result.medications = medications
      .map((med: unknown) => {
        if (typeof med === "string") return med;
        if (med && typeof med === "object" && "name" in med)
          return (med as { name: string }).name;
        return null;
      })
      .filter((m): m is string => m !== null);
  }

  // Parse allergies
  const allergies = (fhirData as Record<string, unknown>).allergies;
  if (Array.isArray(allergies)) {
    result.allergies = allergies
      .map((allergy: unknown) => {
        if (typeof allergy === "string") return allergy;
        if (allergy && typeof allergy === "object" && "reaction" in allergy)
          return (allergy as { reaction: string }).reaction;
        return null;
      })
      .filter((a): a is string => a !== null);
  }

  // Parse conditions
  const conditions = (fhirData as Record<string, unknown>).conditions;
  if (Array.isArray(conditions)) {
    result.conditions = conditions
      .map((condition: unknown) => {
        if (typeof condition === "string") return condition;
        if (condition && typeof condition === "object" && "code" in condition)
          return (condition as { code: string }).code;
        return null;
      })
      .filter((c): c is string => c !== null);
  }

  // Parse observations (vital signs, lab results)
  const observations = (fhirData as Record<string, unknown>).observations;
  if (Array.isArray(observations)) {
    result.observations = observations
      .map((obs: unknown) => {
        if (obs && typeof obs === "object" && "code" in obs && "value" in obs) {
          return {
            code: String((obs as { code: string }).code),
            value: String((obs as { value: string }).value),
          };
        }
        return null;
      })
      .filter((o) => o !== null) as Array<{ code: string; value: string }>;
  }

  result.hasData =
    result.medications.length > 0 ||
    result.allergies.length > 0 ||
    result.conditions.length > 0 ||
    result.observations.length > 0;

  return result;
}

interface FHIRDisplayProps {
  fhirData: FHIRData;
  showRaw?: boolean;
}

export function FHIRDisplay({ fhirData, showRaw = false }: FHIRDisplayProps) {
  const parsed = parseFHIRFields(fhirData);

  if (!parsed.hasData) {
    return (
      <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-950">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-200" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            No FHIR data found
          </p>
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
            The document may not contain structured health information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Medications */}
      {parsed.medications.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-4 w-4 text-blue-600" />
              Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {parsed.medications.map((med, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 text-blue-600 dark:text-blue-400">
                    •
                  </span>
                  <span>{med}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Allergies */}
      {parsed.allergies.length > 0 && (
        <Card className="border-0 border-red-200 bg-red-50/50 shadow-sm dark:border-red-800 dark:bg-red-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {parsed.allergies.map((allergy, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 text-red-600 dark:text-red-400">
                    ⚠
                  </span>
                  <span className="text-red-900 dark:text-red-100">
                    {allergy}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Conditions */}
      {parsed.conditions.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4 text-green-600" />
              Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {parsed.conditions.map((condition, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 text-green-600 dark:text-green-400">
                    •
                  </span>
                  <span>{condition}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Observations */}
      {parsed.observations.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              Lab Results & Observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {parsed.observations.map((obs, idx) => (
                <div
                  key={idx}
                  className="bg-muted/50 flex items-center justify-between rounded px-3 py-2 text-sm"
                >
                  <span className="text-foreground font-medium">
                    {obs.code}
                  </span>
                  <span className="text-muted-foreground">{obs.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw FHIR Data */}
      {showRaw && (
        <details className="group">
          <summary className="text-muted-foreground hover:text-foreground cursor-pointer py-2 text-sm font-medium">
            View Raw FHIR Data
          </summary>
          <div className="bg-muted/50 mt-2 max-h-64 overflow-auto rounded p-3 text-xs">
            <pre>{JSON.stringify(fhirData, null, 2)}</pre>
          </div>
        </details>
      )}
    </div>
  );
}
