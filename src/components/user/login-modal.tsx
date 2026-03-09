"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
}

export function LoginModal({ open, onClose, onGoogleLogin }: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <div className="flex flex-col items-center text-center gap-6">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-brand/15 border border-brand/20 flex items-center justify-center">
              <Leaf size={24} className="text-brand" />
            </div>
            <div>
              <DialogTitle
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Masuk ke Tumbuzz
              </DialogTitle>
              <p className="text-sm text-white/40 mt-1">
                Login diperlukan untuk melakukan checkout
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/6" />

          {/* Google Login Button */}
          <Button
            onClick={onGoogleLogin}
            className="w-full h-12 rounded-xl bg-white hover:bg-white/90 text-[#1a1a1a] font-semibold text-sm gap-3 transition-all duration-200 shadow-lg"
          >
            {/* Google SVG Icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Lanjutkan dengan Google
          </Button>

          <p className="text-[11px] text-white/20 leading-relaxed">
            Dengan masuk, kamu menyetujui Syarat & Ketentuan dan Kebijakan Privasi Tumbuzz.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}