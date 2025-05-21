"use client"

import { FlowProvider } from "@/contexts/FlowContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { Toaster } from "@/components/ui/toaster";
import { ReactFlowProvider } from 'reactflow';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactFlowProvider>
      <FlowProvider>
        <SearchProvider>
          {children}
          <Toaster />
        </SearchProvider>
      </FlowProvider>
    </ReactFlowProvider>
  );
} 