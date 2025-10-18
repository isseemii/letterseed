"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const useMultilingual = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    // DOM이 완전히 로드된 후 실행
    const timer = setTimeout(() => {
      if (window.$ && window.$(".multilingual").length > 0) {
        window.$(".multilingual").multilingual(["en", "num", "cjk"]);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);
};
