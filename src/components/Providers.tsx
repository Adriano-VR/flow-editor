"use client"

import { FlowProvider } from "@/contexts/FlowContext";
import { SearchProvider } from "@/contexts/SearchContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FlowProvider>
      <SearchProvider>
        {children}
      </SearchProvider>
    </FlowProvider>
  );
} 