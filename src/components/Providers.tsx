'use client'

import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { ThemeColorSync } from "@/components/ThemeColorSync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DarkModeProvider>
      <ThemeColorSync />
      {children}
    </DarkModeProvider>
  );
}
