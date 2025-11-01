"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle } from "lucide-react";

interface DoctorData {
  name: string;
  specialization: string;
  licenseNumber: string;
  registrationNumber: string;
  hospital: string;
}

const STORAGE_KEY = "doctor_profile";
const DEFAULT_DOCTOR: DoctorData = {
  name: "",
  specialization: "",
  licenseNumber: "",
  registrationNumber: "",
  hospital: "",
};

const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Practice",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Rheumatology",
  "Surgery",
  "Urology",
  "Other",
];

export function DoctorRegistration() {
  const [doctor, setDoctor] = useState<DoctorData>(DEFAULT_DOCTOR);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DoctorData;
        setDoctor(parsed);
        setIsEditing(false);
      } catch {
        setDoctor(DEFAULT_DOCTOR);
      }
    } else {
      setIsEditing(true); // Auto-open edit mode if no profile exists
    }
    setIsLoading(false);
  }, []);

  const handleChange = (field: keyof DoctorData, value: string) => {
    setDoctor((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!doctor.name || !doctor.specialization || !doctor.licenseNumber) {
      alert("Please fill in all required fields");
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(doctor));
    setIsEditing(false);
    setIsSaved(true);

    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCancel = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DoctorData;
        setDoctor(parsed);
      } catch {
        setDoctor(DEFAULT_DOCTOR);
      }
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading doctor profile...</div>;
  }

  const isComplete =
    doctor.name && doctor.specialization && doctor.licenseNumber;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Doctor Profile</span>
          {isComplete && !isEditing && (
            <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
              Verified
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
                Name, specialization, and license are required
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
                  {doctor.name || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Specialization
                </p>
                <p className="mt-1 text-sm font-medium">
                  {doctor.specialization || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  License Number
                </p>
                <p className="mt-1 font-mono text-sm font-medium">
                  {doctor.licenseNumber || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Registration
                </p>
                <p className="mt-1 text-sm font-medium">
                  {doctor.registrationNumber || "Not set"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Hospital/Clinic
                </p>
                <p className="mt-1 text-sm font-medium">
                  {doctor.hospital || "Not set"}
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
                  value={doctor.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Dr. John Smith"
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="specialization">
                  Specialization <span className="text-red-500">*</span>
                </Label>
                <select
                  id="specialization"
                  value={doctor.specialization}
                  onChange={(e) =>
                    handleChange("specialization", e.target.value)
                  }
                  className="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">Select a specialization</option>
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="license">
                  License Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="license"
                  value={doctor.licenseNumber}
                  onChange={(e) =>
                    handleChange("licenseNumber", e.target.value)
                  }
                  placeholder="LIC-2024-000123"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="registration">Registration Number</Label>
                <Input
                  id="registration"
                  value={doctor.registrationNumber}
                  onChange={(e) =>
                    handleChange("registrationNumber", e.target.value)
                  }
                  placeholder="REG-2024-000123"
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="hospital">Hospital/Clinic Name</Label>
                <Input
                  id="hospital"
                  value={doctor.hospital}
                  onChange={(e) => handleChange("hospital", e.target.value)}
                  placeholder="City Medical Center"
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
