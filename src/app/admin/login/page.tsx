"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Shield, Leaf, AlertCircle, Loader2,
  Smartphone, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Step = "credentials" | "enroll" | "otp";


export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);

  // MFA state
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [qrCode, setQrCode] = useState(""); // SVG string
  const [secret, setSecret] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "otp" || step === "enroll") {
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    }
  }, [step]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Step 1: Login + cek admin + setup MFA ───────────────────────────────
  const handleCredentials = async () => {
    setError("");
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      // Login dengan email + password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError || !data.user) {
        setError("Email atau password salah.");
        triggerShake();
        return;
      }

      // Cek role admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        setError("Akun ini tidak memiliki akses admin.");
        triggerShake();
        return;
      }

      // Ambil semua faktor termasuk unverified via .all
      const { data: factors } = await supabase.auth.mfa.listFactors();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allFactors: any[] = (factors as any)?.all ?? factors?.totp ?? [];
      const verifiedFactor = allFactors.find((f) => f.status === "verified");
      const unverifiedFactors = allFactors.filter((f) => f.status === "unverified");

      if (verifiedFactor) {
        // Sudah terdaftar & terverifikasi — buat challenge langsung
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: verifiedFactor.id,
        });
        if (challengeError || !challenge) {
          setError("Gagal membuat tantangan MFA. Coba lagi.");
          return;
        }
        setFactorId(verifiedFactor.id);
        setChallengeId(challenge.id);
        setStep("otp");
      } else {
        // Hapus semua faktor unverified yang tersisa
        for (const f of unverifiedFactors) {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        }

        // Enrollment baru
        let enrollData = null;
        for (const name of ["Tumbuzz Admin", `Tumbuzz Admin ${Date.now()}`]) {
          const { data, error } = await supabase.auth.mfa.enroll({
            factorType: "totp",
            issuer: "Tumbuzz Admin",
            friendlyName: name,
          });
          if (!error && data) { enrollData = data; break; }
          if (error?.code !== "mfa_factor_name_conflict") {
            console.error("Enroll error:", JSON.stringify(error));
            setError(`Error ${error?.status ?? ""}: ${error?.message ?? "Gagal enroll MFA"}`);
            return;
          }
        }
        if (!enrollData) {
          setError("Gagal menyiapkan Authenticator. Hapus faktor MFA lama di Supabase Dashboard.");
          return;
        }

        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: enrollData.id,
        });
        if (challengeError || !challenge) {
          setError("Gagal membuat tantangan MFA. Coba lagi.");
          return;
        }

        setFactorId(enrollData.id);
        setChallengeId(challenge.id);
        setQrCode(enrollData.totp.qr_code);
        setSecret(enrollData.totp.secret);
        setStep("enroll");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2/3: Verifikasi TOTP ────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
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
    const code = otp.join("");
    if (code.length < 6) {
      setError("Masukkan 6 digit kode dari Authenticator.");
      return;
    }

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });

      if (verifyError) {
        setError("Kode salah atau sudah expired. Coba kode terbaru dari app.");
        triggerShake();
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();

        // Buat ulang challenge untuk percobaan berikutnya
        const { data: newChallenge } = await supabase.auth.mfa.challenge({ factorId });
        if (newChallenge) setChallengeId(newChallenge.id);
        return;
      }

      router.push("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Inputs (JSX variable, bukan komponen — agar tidak remount saat re-render)
  const otpInputs = (
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
          onKeyUp={(e) => { if (e.key === "Enter" && otp.join("").length === 6) handleVerifyOtp(); }}
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
  );

  const stepIndex = step === "credentials" ? 0 : 1;

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
        className="relative w-full max-w-[420px]"
        style={shake ? { animation: "shake 0.4s ease-in-out" } : {}}
      >
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
                  {step === "credentials" && "Masuk ke panel administrasi"}
                  {step === "enroll" && "Daftarkan Authenticator App"}
                  {step === "otp" && "Verifikasi dengan Authenticator"}
                </p>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex gap-2 mb-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 h-1 rounded-full transition-all duration-500",
                    i <= stepIndex ? "bg-brand" : "bg-black/10 dark:bg-white/10"
                  )}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-semibold mb-6">
              <span className={stepIndex === 0 ? "text-brand" : "text-brand/60"}>1. Kredensial</span>
              <span className={stepIndex === 1 ? "text-brand" : "text-gray-300 dark:text-white/25"}>2. Authenticator</span>
            </div>

            {/* ── Step: Credentials ── */}
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
                      type="button"
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
                  className="w-full h-11 rounded-xl bg-brand hover:bg-brand/90 text-brand-fg font-bold text-sm gap-2 mt-2 shadow-lg shadow-brand/10"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Lanjut"}
                </Button>
              </div>
            )}

            {/* ── Step: Enroll (Pertama kali) ── */}
            {step === "enroll" && (
              <div className="space-y-5">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-brand/8 border border-brand/15">
                  <Smartphone size={16} className="text-brand shrink-0 mt-0.5" />
                  <p className="text-xs text-brand/80 leading-relaxed">
                    Scan QR code ini dengan aplikasi <strong>Google Authenticator</strong>, <strong>Authy</strong>, atau app sejenis.
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-sm">
                    {qrCode && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrCode}
                        alt="QR Code Authenticator"
                        width={180}
                        height={180}
                        style={{ display: "block", imageRendering: "pixelated" }}
                      />
                    )}
                  </div>
                </div>

                {/* Secret key (manual entry) */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">
                    Atau masukkan kode manual
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[11px] font-mono bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-gray-500 dark:text-white/40 tracking-widest break-all">
                      {secret}
                    </code>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="w-8 h-8 rounded-lg bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-brand transition-colors shrink-0"
                    >
                      {copied ? <Check size={13} className="text-brand" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 dark:text-white/40 text-center">
                    Masukkan kode 6 digit dari app
                  </p>
                  {otpInputs}
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
                  className="w-full h-11 rounded-xl bg-brand hover:bg-brand/90 text-brand-fg font-bold text-sm gap-2 shadow-lg shadow-brand/10 disabled:opacity-40"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><Shield size={15} />Aktifkan & Masuk</>}
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep("credentials"); setOtp(["","","","","",""]); setError(""); }}
                  className="w-full text-xs text-gray-300 dark:text-white/25 hover:text-gray-500 dark:hover:text-white/50 transition-colors text-center"
                >
                  ← Kembali
                </button>
              </div>
            )}

            {/* ── Step: OTP (sudah enrolled) ── */}
            {step === "otp" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/15 flex items-center justify-center">
                    <Smartphone size={20} className="text-brand" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700 dark:text-white/80">
                      Buka Authenticator App
                    </p>
                    <p className="text-xs text-gray-400 dark:text-white/30 mt-1">
                      Masukkan kode 6 digit untuk <span className="text-brand/70 font-semibold">Tumbuzz Admin</span>
                    </p>
                  </div>
                </div>

                {otpInputs}

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                    <AlertCircle size={13} className="text-red-400 shrink-0" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.join("").length < 6}
                  className="w-full h-11 rounded-xl bg-brand hover:bg-brand/90 text-brand-fg font-bold text-sm gap-2 shadow-lg shadow-brand/10 disabled:opacity-40"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><Shield size={15} />Verifikasi & Masuk</>}
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep("credentials"); setOtp(["","","","","",""]); setError(""); }}
                  className="w-full text-xs text-gray-300 dark:text-white/25 hover:text-gray-500 dark:hover:text-white/50 transition-colors text-center"
                >
                  ← Kembali
                </button>
              </div>
            )}
          </div>
        </div>

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
