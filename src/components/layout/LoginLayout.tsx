
import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeProvider";

interface LoginLayoutProps {
  children: React.ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  const { theme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    // Add subtle mouse movement effect for parallax
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Fade in background
    const timer = setTimeout(() => {
      setShowBackground(true);
    }, 300);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  // Calculate parallax effect
  const moveX = mousePosition.x * 10;
  const moveY = mousePosition.y * 10;
  
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with animated gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-background to-background/80 overflow-hidden transition-opacity duration-1000 ${showBackground ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Animated background blobs with parallax effect */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            transform: `translate(${-moveX}px, ${-moveY}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-40 w-96 h-96 bg-secondary/30 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20 pointer-events-none"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 5}s linear infinite`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>
      
      {/* Main content container */}
      <div className={`relative z-10 w-full max-w-md p-1 transition-opacity duration-1000 ${showBackground ? 'opacity-100' : 'opacity-0'}`}>
        {/* Glass container with gradient border */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-xl blur"></div>
          <div className="relative p-8 space-y-8 bg-black/50 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 z-10">
            {children}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className={`absolute bottom-4 text-center w-full text-xs text-white/30 transition-opacity duration-1000 ${showBackground ? 'opacity-100' : 'opacity-0'}`}>
        &copy; {new Date().getFullYear()} Vikas Milk Centre. All rights reserved.
      </div>
    </div>
  );
}
