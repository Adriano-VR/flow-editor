"use client"

import { FlowProvider } from "@/contexts/FlowContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FlowProvider>
      <SearchProvider>
        {children}
        <Toaster />
      </SearchProvider>
    </FlowProvider>
  );
} 