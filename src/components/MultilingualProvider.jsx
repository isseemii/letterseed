"use client";

import { useMultilingual } from "@/hooks/useMultilingual";

export default function MultilingualProvider({ children }) {
  useMultilingual();

  return <>{children}</>;
}
