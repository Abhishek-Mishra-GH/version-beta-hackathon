"use client";

import { useState } from "react";
import { Shield, ArrowRight, CheckCircle } from "lucide-react";
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
import { sendEmailWithEmailJS } from "@/lib/emailClient";

interface AuthPageProps {
  onAuthenticated: (role: "patient" | "doctor") => void;
}

interface ApiResponse {
  success: boolean;
  message: string;
  otp?: string;
}

export default function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    console.log(`📤 Sending OTP request for email: "${email}"`);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as ApiResponse;

      if (data.success && data.otp) {
        console.log(`✅ OTP generated for email: "${email}"`);
        console.log(`📧 OTP Code: ${data.otp}`);

        // Send email via EmailJS on client side
        const emailResult = await sendEmailWithEmailJS(email, data.otp);

        if (emailResult.success) {
          setStep(2);
          console.log("✅ OTP sent to:", email);
        } else {
          // Even if email fails, continue (OTP is in console)
          setStep(2);
          console.log("⚠️ Email sending failed, but OTP generated:", data.otp);
        }
      } else {
        setError(data.message ?? "Failed to send OTP");
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      console.error("Error sending OTP:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");
    console.log(`🔐 Attempting to verify OTP: "${otpValue}"`);
    console.log(`📧 For email: "${email}"`);

    if (otpValue.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log(`📤 Sending verification request for email: "${email}"`);
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = (await response.json()) as ApiResponse;
      console.log("📥 Verification response:", data);

      if (data.success) {
        setStep(3);
        console.log("✅ OTP verified successfully");
        setTimeout(() => {
          onAuthenticated(role);
        }, 1500);
      } else {
        console.log("❌ Verification failed:", data.message);
        setError(data.message ?? "Invalid OTP");
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (err) {
      console.error("❌ Error verifying OTP:", err);
      setError("Failed to verify OTP. Please try again.");
      console.error("Error verifying OTP:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp(["", "", "", "", "", ""]);
    await handleSubmitEmail();
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <div className="from-primary/5 via-background to-accent/5 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3 text-center">
          <div className="bg-primary text-primary-foreground inline-flex h-16 w-16 items-center justify-center rounded-2xl">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-3xl font-bold">
            ABDM Health Platform
          </h1>
          <p className="text-muted-foreground">
            Secure email authentication with blockchain-verified health data
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-px w-12 ${step > s ? "bg-primary" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Enter Your Email"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "Authentication Successful"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Login with your email linked to ABHA account"}
              {step === 2 && "Enter the 6-digit OTP sent to your email"}
              {step === 3 && "Redirecting to your dashboard..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="role">Select Role</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={role === "patient" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setRole("patient")}
                      data-testid="button-select-patient"
                    >
                      Patient
                    </Button>
                    <Button
                      variant={role === "doctor" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setRole("doctor")}
                      data-testid="button-select-doctor"
                    >
                      Doctor
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    className="text-lg"
                    data-testid="input-email"
                  />
                  <p className="text-muted-foreground text-xs">
                    Enter your email linked to ABHA account
                  </p>
                  {error && step === 1 && (
                    <p className="text-destructive text-xs">{error}</p>
                  )}
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleSubmitEmail}
                  disabled={
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || isLoading
                  }
                  data-testid="button-submit-email"
                >
                  {isLoading ? "Sending OTP..." : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Secured by ABDM Gateway</span>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-4">
                  <Label>Enter 6-Digit OTP</Label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleOTPChange(index, e.target.value)
                        }
                        className="h-12 w-12 text-center font-mono text-lg"
                        data-testid={`input-otp-${index}`}
                      />
                    ))}
                  </div>
                  {error && step === 2 && (
                    <p className="text-destructive text-center text-xs">
                      {error}
                    </p>
                  )}
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      data-testid="button-resend-otp"
                    >
                      Resend OTP
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleVerifyOTP}
                  disabled={otp.some((d) => !d) || isLoading}
                  data-testid="button-verify-otp"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {step === 3 && (
              <div className="space-y-4 py-8 text-center">
                <div className="bg-accent text-accent-foreground inline-flex h-16 w-16 items-center justify-center rounded-full">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-medium">Authentication Successful!</p>
                  <p className="text-muted-foreground text-sm">
                    Welcome to ABDM Health Platform
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-accent-border bg-accent/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Badge className="mt-0.5">NEW</Badge>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Blockchain-Verified Consents</p>
                <p className="text-muted-foreground">
                  Every data access is cryptographically secured and immutable
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
