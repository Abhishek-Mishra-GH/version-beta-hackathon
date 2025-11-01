"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";

interface PatientData {
  name: string;
  phone: string;
  email: string;
  age: number;
  gender: "male" | "female" | "other";
  emergencyContact: string;
  emergencyPhone: string;
}

const STORAGE_KEY = "patient_profile";
const DEFAULT_PATIENT: PatientData = {
  name: "",
  phone: "",
  email: "",
  age: 0,
  gender: "other",
  emergencyContact: "",
  emergencyPhone: "",
};

export function PatientProfile() {
  const [patient, setPatient] = useState<PatientData>(DEFAULT_PATIENT);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PatientData;
        setPatient(parsed);
      } catch {
        setPatient(DEFAULT_PATIENT);
      }
    }
    setIsLoading(false);
  }, []);

  const handleChange = (field: keyof PatientData, value: string | number) => {
    setPatient((prev) => ({
      ...prev,
      [field]: field === "age" ? Number(value) : value,
    }));
  };

  const handleSave = () => {
    if (!patient.name || !patient.phone || !patient.email) {
      alert("Please fill in all required fields");
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(patient));
    setIsEditing(false);
    setIsSaved(true);

    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCancel = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PatientData;
        setPatient(parsed);
      } catch {
        setPatient(DEFAULT_PATIENT);
      }
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading profile...</div>;
  }

  const isComplete = patient.name && patient.phone && patient.email;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Patient Profile</span>
          {isComplete && !isEditing && (
            <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
              Complete
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isSaved && (
          <div className="mb-4 flex items-center gap-2 rounded bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            Profile saved successfully
          </div>
        )}

        {!isComplete && !isEditing && (
          <div className="mb-4 flex items-start gap-2 rounded bg-amber-50 p-3 dark:bg-amber-950">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-200" />
            <div className="text-sm text-amber-700 dark:text-amber-200">
              <p className="font-medium">Complete your profile</p>
              <p className="mt-1 text-xs">
                Name, phone, and email are required to upload medical records
              </p>
            </div>
          </div>
        )}

        {!isEditing ? (
          <div className="space-y-4">
            {/* Display Mode */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Name
                </p>
                <p className="mt-1 text-sm font-medium">
                  {patient.name || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Age
                </p>
                <p className="mt-1 text-sm font-medium">
                  {patient.age || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Phone
                </p>
                <p className="mt-1 text-sm font-medium">
                  {patient.phone || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Gender
                </p>
                <p className="mt-1 text-sm font-medium capitalize">
                  {patient.gender || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Email
                </p>
                <p className="mt-1 text-sm font-medium">
                  {patient.email || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Emergency Phone
                </p>
                <p className="mt-1 text-sm font-medium">
                  {patient.emergencyPhone || "Not set"}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(true)}
              className="w-full"
              variant="outline"
            >
              Edit Profile
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Edit Mode */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={patient.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={patient.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="30"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={patient.gender}
                  onChange={(e) => {
                    const value = e.target.value as "male" | "female" | "other";
                    handleChange("gender", value);
                  }}
                  className="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={patient.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={patient.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="john@example.com"
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="emergency">Emergency Contact Name</Label>
                <Input
                  id="emergency"
                  value={patient.emergencyContact}
                  onChange={(e) =>
                    handleChange("emergencyContact", e.target.value)
                  }
                  placeholder="Jane Doe"
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={patient.emergencyPhone}
                  onChange={(e) =>
                    handleChange("emergencyPhone", e.target.value)
                  }
                  placeholder="+1 (555) 111-1111"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                Save Profile
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
