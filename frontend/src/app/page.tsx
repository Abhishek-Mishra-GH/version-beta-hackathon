"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Fingerprint,
  FileText,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { isWalletConnected, setWalletAddress } from "@/utils/user-ids";

export default function HomePage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(isWalletConnected());
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to continue.");
        setIsConnecting(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts?.[0]) {
        setWalletAddress(accounts[0]);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePatientClick = () => {
    if (!isAuthenticated) {
      void handleConnectWallet();
    } else {
      router.push("/patient-dashboard/P0001");
    }
  };

  const handleDoctorClick = () => {
    if (!isAuthenticated) {
      void handleConnectWallet();
    } else {
      router.push("/doctor-dashboard/D01");
    }
  };

  const featureCards = [
    {
      icon: <ShieldCheck className="h-8 w-8 text-sky-400" />,
      title: "Tamper-Proof Security",
      description:
        "Every medical record is encrypted, hashed, and anchored on-chain for verifiable integrity.",
    },
    {
      icon: <Lock className="h-8 w-8 text-purple-400" />,
      title: "Consent You Control",
      description:
        "Grant temporary access windows to healthcare providers with full transparency and revocation.",
    },
    {
      icon: <Fingerprint className="h-8 w-8 text-emerald-400" />,
      title: "Zero-Trust Architecture",
      description:
        "Wallet-based authentication ensures only verified identities unlock sensitive health data.",
    },
    {
      icon: <FileText className="h-8 w-8 text-amber-400" />,
      title: "FHIR Native Outputs",
      description:
        "AI parses unstructured medical files into interoperable FHIR records within seconds.",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Connect & Verify",
      description:
        "Authenticate with your Web3 wallet and secure your profile with verifiable credentials.",
    },
    {
      step: "02",
      title: "Upload or Request",
      description:
        "Patients upload medical documents while doctors submit access requests with full traceability.",
    },
    {
      step: "03",
      title: "Share & Monitor",
      description:
        "Approve access windows, monitor usage analytics, and revoke in real time from any device.",
    },
  ];

  const testimonials = [
    {
      quote:
        "MediChain transformed follow-up care—sharing imaging results with specialists now happens instantly.",
      name: "Sarah Thompson",
      role: "Patient Advocate",
    },
    {
      quote:
        "Structured FHIR outputs removed hours of paperwork every week. It feels like the future of care.",
      name: "Dr. Rahul Menon",
      role: "Cardiologist, Apollo Clinics",
    },
    {
      quote:
        "Audit trails and blockchain-backed consent finally match our compliance expectations.",
      name: "Emily Garcia",
      role: "Chief Privacy Officer, NorthBridge Health",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#050510] via-[#0c1220] to-[#1d1630] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-sky-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-128 w-lg -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[180px]" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 pt-28 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur"
          >
            <Sparkles className="h-4 w-4 text-sky-300" />
            Healthcare meets Web3 privacy
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="text-4xl leading-tight font-black text-balance sm:text-5xl lg:text-6xl"
          >
            Own, share, and protect your medical records with blockchain-grade
            security.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="max-w-3xl text-lg text-white/70"
          >
            MediChain orchestrates a patient-first data exchange: AI turns scans
            and PDFs into structured insights, while smart contracts manage
            time-bound consent for every clinician.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="flex flex-col items-center gap-4 sm:flex-row"
          >
            {!isAuthenticated ? (
              <Button
                size="lg"
                className="group gap-2 rounded-full bg-sky-500 px-8 py-6 text-lg font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400"
                onClick={handleConnectWallet}
                disabled={isConnecting}
              >
                <Wallet className="h-5 w-5" />
                {isConnecting ? "Connecting wallet..." : "Connect MetaMask"}
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Button>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-pink-500 px-8 py-6 text-lg font-semibold text-white shadow-lg shadow-pink-500/25 transition hover:bg-pink-400"
                  onClick={handlePatientClick}
                >
                  <Users className="h-5 w-5" />
                  Patient dashboard
                </Button>
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-indigo-500 px-8 py-6 text-lg font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400"
                  onClick={handleDoctorClick}
                >
                  <Lock className="h-5 w-5" />
                  Doctor portal
                </Button>
              </div>
            )}

            <div className="text-sm text-white/60">
              No passwords. Ownership secured by your wallet.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.8 }}
            className="grid w-full grid-cols-1 gap-6 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur md:grid-cols-3"
          >
            <div>
              <div className="flex items-center gap-2 text-sm text-sky-300">
                <CheckCircle2 className="h-4 w-4" /> HIPAA-ready architecture
              </div>
              <p className="mt-2 text-2xl font-semibold">
                256-bit encrypted storage
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Interoperable standards
              </div>
              <p className="mt-2 text-2xl font-semibold">
                FHIR compliant exports
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <CheckCircle2 className="h-4 w-4" /> Global coverage
              </div>
              <p className="mt-2 text-2xl font-semibold">
                Arbitrum + IPFS backbone
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white/5 py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm tracking-[0.3em] text-sky-300 uppercase">
              Capabilities
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Everything modern healthcare teams expect—without compromising
              privacy.
            </h2>
            <p className="text-lg text-white/70">
              MediChain unifies patient autonomy, institutional compliance, and
              real-time interoperability into a single platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-linear-to-br from-white/5 via-white/10 to-white/5 p-8 transition hover:border-sky-400/40 hover:shadow-[0_20px_60px_-30px_rgba(56,189,248,0.7)]"
              >
                <div className="mb-6 inline-flex rounded-full bg-white/10 p-3 backdrop-blur">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-base text-white/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="px-4 py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          <div className="grid gap-6 text-center">
            <p className="text-sm tracking-[0.35em] text-purple-300 uppercase">
              How it works
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              From upload to clinical action in minutes.
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-white/70">
              Seamless patient and clinician journeys that translate into
              auditable smart-contract events for administrators.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {workflowSteps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:border-purple-400/40"
              >
                <div className="text-sm font-semibold text-purple-300">
                  {step.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-base text-white/70">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-linear-to-r from-sky-500/10 via-purple-500/10 to-sky-500/10 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-4xl font-bold text-sky-300">2.5x</div>
            <p className="mt-3 text-sm tracking-[0.3em] text-white/60 uppercase">
              Faster data readiness
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-4xl font-bold text-emerald-300">94%</div>
            <p className="mt-3 text-sm tracking-[0.3em] text-white/60 uppercase">
              Patient consent satisfaction
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-4xl font-bold text-purple-300">0</div>
            <p className="mt-3 text-sm tracking-[0.3em] text-white/60 uppercase">
              Breaches since launch
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          <div className="text-center">
            <p className="text-sm tracking-[0.35em] text-emerald-300 uppercase">
              In their words
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Trusted by patients, physicians, and compliance leaders.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="flex h-full flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur"
              >
                <Zap className="h-6 w-6 text-emerald-300" />
                <p className="text-base text-white/80">“{testimonial.quote}”</p>
                <div className="mt-auto">
                  <p className="text-sm font-semibold text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-xs tracking-[0.3em] text-white/60 uppercase">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-linear-to-br from-sky-500/15 via-purple-500/10 to-indigo-500/15 px-4 py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Deploy consent-driven healthcare in weeks, not months.
          </h2>
          <p className="max-w-2xl text-lg text-white/70">
            Whether you operate a hospital network or a specialized clinic,
            MediChain delivers auditable data exchange, AI-assisted triage, and
            wallet-native identity.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="gap-2 rounded-full bg-sky-500 px-8 py-6 text-lg font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
            >
              <Wallet className="h-5 w-5" />
              {isConnecting ? "Connecting wallet..." : "Launch patient profile"}
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-full border-white/30 bg-transparent px-8 py-6 text-lg font-semibold text-white transition hover:border-sky-300 hover:text-sky-200"
              onClick={() => router.push("/doctor-portal")}
            >
              <FileText className="h-5 w-5" />
              Preview doctor workflow
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#080813] px-4 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            © {new Date().getFullYear()} MediChain. Secure health intelligence
            for the decentralized era.
          </div>
          <div className="flex gap-6">
            <span>Arbitrum powered</span>
            <span>IPFS &amp; Pinata storage</span>
            <span>Gemini AI insights</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
