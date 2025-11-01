"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Stethoscope, ArrowRight, Loader2 } from "lucide-react";

interface OnboardingProps {
  walletAddress: string;
}

export default function OnboardingPage({ walletAddress }: OnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "profile">("role");
  const [userType, setUserType] = useState<"PATIENT" | "DOCTOR" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Patient form state
  const [patientData, setPatientData] = useState({
    fullName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    emergencyContact: "",
    bloodType: "",
    allergies: [] as string[],
    chronicConditions: [] as string[],
    bio: "",
  });

  // Doctor form state
  const [doctorData, setDoctorData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialty: "",
    licenseNumber: "",
    hospital: "",
    yearsOfExperience: 0,
    credentials: [] as string[],
    bio: "",
  });

  const handleRoleSelect = (role: "PATIENT" | "DOCTOR") => {
    setUserType(role);
    setStep("profile");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const profileData = userType === "PATIENT" ? patientData : doctorData;

      const response = await fetch("/api/profile/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          userType,
          profileData,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Registration failed");
      }

      // Store user info in localStorage
      localStorage.setItem("user_profile", JSON.stringify(data.user));

      // Redirect to appropriate dashboard
      if (userType === "PATIENT") {
        router.push("/patient-dashboard");
      } else {
        router.push("/doctor-portal");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  const handleArrayInput = (
    value: string,
    field: "allergies" | "chronicConditions" | "credentials",
  ) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (userType === "PATIENT") {
      setPatientData({ ...patientData, [field]: items });
    } else {
      setDoctorData({ ...doctorData, [field]: items });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to HealthChain</CardTitle>
          <CardDescription>
            Connected with:{" "}
            <Badge variant="secondary" className="ml-2">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "role" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-semibold">Select your role</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-32 flex-col space-y-4 hover:border-blue-500 hover:bg-blue-50"
                    onClick={() => handleRoleSelect("PATIENT")}
                  >
                    <UserCircle className="h-12 w-12 text-blue-600" />
                    <div>
                      <div className="font-semibold">Patient</div>
                      <div className="text-muted-foreground text-xs">
                        Manage your medical records
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-32 flex-col space-y-4 hover:border-green-500 hover:bg-green-50"
                    onClick={() => handleRoleSelect("DOCTOR")}
                  >
                    <Stethoscope className="h-12 w-12 text-green-600" />
                    <div>
                      <div className="font-semibold">Doctor</div>
                      <div className="text-muted-foreground text-xs">
                        Access patient records
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === "profile" && userType === "PATIENT" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4 flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Patient Profile</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    required
                    value={patientData.fullName}
                    onChange={(e) =>
                      setPatientData({
                        ...patientData,
                        fullName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={patientData.dateOfBirth}
                    onChange={(e) =>
                      setPatientData({
                        ...patientData,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Input
                    id="bloodType"
                    placeholder="e.g., A+"
                    value={patientData.bloodType}
                    onChange={(e) =>
                      setPatientData({
                        ...patientData,
                        bloodType: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={patientData.email}
                    onChange={(e) =>
                      setPatientData({ ...patientData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={patientData.phone}
                    onChange={(e) =>
                      setPatientData({ ...patientData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    placeholder="Name and phone number"
                    value={patientData.emergencyContact}
                    onChange={(e) =>
                      setPatientData({
                        ...patientData,
                        emergencyContact: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                  <Input
                    id="allergies"
                    placeholder="e.g., Penicillin, Peanuts"
                    onBlur={(e) =>
                      handleArrayInput(e.target.value, "allergies")
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="chronicConditions">
                    Chronic Conditions (comma-separated)
                  </Label>
                  <Input
                    id="chronicConditions"
                    placeholder="e.g., Diabetes, Hypertension"
                    onBlur={(e) =>
                      handleArrayInput(e.target.value, "chronicConditions")
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Input
                    id="bio"
                    placeholder="Brief description"
                    value={patientData.bio}
                    onChange={(e) =>
                      setPatientData({ ...patientData, bio: e.target.value })
                    }
                  />
                </div>
              </div>

              {error && (
                <div className="rounded bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("role")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {step === "profile" && userType === "DOCTOR" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4 flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold">Doctor Profile</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    required
                    value={doctorData.fullName}
                    onChange={(e) =>
                      setDoctorData({ ...doctorData, fullName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="specialty">Specialty *</Label>
                  <Input
                    id="specialty"
                    required
                    placeholder="e.g., Cardiology"
                    value={doctorData.specialty}
                    onChange={(e) =>
                      setDoctorData({
                        ...doctorData,
                        specialty: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    required
                    value={doctorData.licenseNumber}
                    onChange={(e) =>
                      setDoctorData({
                        ...doctorData,
                        licenseNumber: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="hospital">Hospital/Clinic</Label>
                  <Input
                    id="hospital"
                    value={doctorData.hospital}
                    onChange={(e) =>
                      setDoctorData({ ...doctorData, hospital: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    value={doctorData.yearsOfExperience || ""}
                    onChange={(e) =>
                      setDoctorData({
                        ...doctorData,
                        yearsOfExperience: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={doctorData.email}
                    onChange={(e) =>
                      setDoctorData({ ...doctorData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={doctorData.phone}
                    onChange={(e) =>
                      setDoctorData({ ...doctorData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="credentials">
                    Credentials (comma-separated)
                  </Label>
                  <Input
                    id="credentials"
                    placeholder="e.g., MD, FACC, PhD"
                    onBlur={(e) =>
                      handleArrayInput(e.target.value, "credentials")
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Input
                    id="bio"
                    placeholder="Brief professional summary"
                    value={doctorData.bio}
                    onChange={(e) =>
                      setDoctorData({ ...doctorData, bio: e.target.value })
                    }
                  />
                </div>
              </div>

              {error && (
                <div className="rounded bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("role")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
