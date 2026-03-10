"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, Leaf, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Step = "credentials" | "otp";

// Mock admin credentials — nanti ganti dengan Supabase auth
const MOCK_EMAIL = "admin@tumbuzz.com";
const MOCK_PASSWORD = "admin123";
const MOCK_OTP = "123456";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // ── Step 1: Credentials ─────────────────────────────────────────────────
  const handleCredentials = async () => {
    setError("");
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    if (email !== MOCK_EMAIL || password !== MOCK_PASSWORD) {
      setError("Email atau password salah.");
      triggerShake();
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("otp");
  };

  // ── Step 2: OTP ─────────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    const otpString = otp.join("");
    if (otpString.length < 6) {
      setError("Masukkan 6 digit kode OTP.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    if (otpString !== MOCK_OTP) {
      setError("Kode OTP salah atau sudah expired.");
      triggerShake();
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#d4edda_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_#1a2e1a_0%,_transparent_60%)] opacity-40" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #000000 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div
        className={cn(
          "relative w-full max-w-[400px] transition-all duration-200",
          shake && "animate-shake"
        )}
        style={shake ? { animation: "shake 0.4s ease-in-out" } : {}}
      >
        {/* Card */}
        <div className="bg-white dark:bg-[#0f0f0f] border border-black/[0.08] dark:border-white/8 rounded-3xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/60">

          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-[#2d6a2d] via-brand to-[#2d6a2d]" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/15 flex items-center justify-center">
                <Leaf size={24} className="text-brand" />
              </div>
              <div className="text-center">
                <h1
                  className="text-xl font-bold text-gray-900 dark:text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Tumbuzz Admin
                </h1>
                <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
                  {step === "credentials"
                    ? "Masuk ke panel administrasi"
                    : "Verifikasi identitas kamu"}
                </p>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-8">
              {(["credentials", "otp"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "w-full h-1 rounded-full transition-all duration-500",
                      step === "credentials" && i === 0
                        ? "bg-brand"
                        : step === "otp"
                        ? "bg-brand"
                        : "bg-black/10 dark:bg-white/10"
                    )}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-semibold -mt-6 mb-6">
              <span className={step === "credentials" ? "text-brand" : "text-brand/60"}>
                1. Kredensial
              </span>
              <span className={step === "otp" ? "text-brand" : "text-gray-300 dark:text-white/25"}>
                2. Verifikasi OTP
              </span>
            </div>

            {/* ── Form: Credentials ── */}
            {step === "credentials" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-400 dark:text-white/50 uppercase tracking-wider">
                    Email Admin
                  </Label>
                  <Input
                    type="email"
                    placeholder="admin@tumbuzz.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleCredentials()}
                    className="h-11 bg-black/[0.04] dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 rounded-xl focus:border-brand/40 focus:ring-0 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-400 dark:text-white/50 uppercase tracking-wider">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleCredentials()}
                      className="h-11 bg-black/[0.04] dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 rounded-xl focus:border-brand/40 focus:ring-0 text-sm pr-11"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                    <AlertCircle size={13} className="text-red-400 shrink-0" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleCredentials}
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-brand hover:bg-brand/90 text-brand-fg font-bold text-sm gap-2 transition-all duration-200 mt-2 shadow-lg shadow-brand/10"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Lanjut"
                  )}
                </Button>
              </div>
            )}

            {/* ── Form: OTP ── */}
            {step === "otp" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/15 flex items-center justify-center">
                    <Shield size={20} className="text-brand" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700 dark:text-white/80">
                      Kode OTP dikirim ke email
                    </p>
                    <p className="text-xs text-brand/60 mt-0.5">{email}</p>
                    <p className="text-[11px] text-gray-300 dark:text-white/25 mt-2">
                      (Demo: gunakan kode <span className="text-gray-500 dark:text-white/50 font-mono">123456</span>)
                    </p>
                  </div>
                </div>

                {/* OTP Inputs */}
                <div className="flex gap-2.5 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={cn(
                        "w-11 text-center text-lg font-bold rounded-xl border transition-all duration-200 outline-none bg-black/[0.04] dark:bg-white/5 text-gray-900 dark:text-white",
                        digit
                          ? "border-brand/40 bg-brand/8"
                          : "border-black/10 dark:border-white/10 focus:border-brand/30"
                      )}
                      style={{ height: "52px" }}
                    />
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                    <AlertCircle size={13} className="text-red-400 shrink-0" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.join("").length < 6}
                  className="w-full h-11 rounded-xl bg-brand hover:bg-brand/90 text-brand-fg font-bold text-sm gap-2 transition-all duration-200 shadow-lg shadow-brand/10 disabled:opacity-40"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Shield size={15} />
                      Verifikasi & Masuk
                    </>
                  )}
                </Button>

                <button
                  onClick={() => { setStep("credentials"); setOtp(["","","","","",""]); setError(""); }}
                  className="w-full text-xs text-gray-300 dark:text-white/25 hover:text-gray-500 dark:hover:text-white/50 transition-colors text-center"
                >
                  ← Kembali ke halaman login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-300 dark:text-white/15 mt-5">
          Akses terbatas untuk admin Tumbuzz
        </p>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
