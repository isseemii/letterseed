'use client'

import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { ThemeColorSync } from "@/components/ThemeColorSync";
import { LeadingSpecialIndentSync } from "@/components/LeadingSpecialIndentSync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DarkModeProvider>
      <ThemeColorSync />
      <LeadingSpecialIndentSync />
      {children}
    </DarkModeProvider>
  );
}
