
import React from "react";
import { useTheme } from "@/contexts/ThemeProvider";

interface LoginLayoutProps {
  children: React.ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#131519] to-[#1e2227] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-0 -right-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>
      
      {/* Glass container */}
      <div className="w-full max-w-md p-8 space-y-8 bg-black/30 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 z-10">
        {children}
      </div>
    </div>
  );
}
