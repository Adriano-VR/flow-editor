"use client"

import { useState } from "react";
import { Button } from "./ui/button";
import { Plus, Loader2, CheckCircle2 } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { SidebarProps } from "@/types/sidebar";
import { useFlow } from "@/contexts/FlowContext";
import { NewFlowDialog } from "./NewFlowDialog";
import { cn } from "@/lib/utils";

export default function Sidebar({ onSelectFlow }: SidebarProps) {
  const { searchInput } = useSearch();
  const { 
    flows, 
    selectedFlowId,
    setSelectedFlowId,
    isCreating, 
    isLoading,
  } = useFlow();
  const [showNewFlowDialog, setShowNewFlowDialog] = useState(false);

  const handleFlowSelect = (flowId: string) => {
    setSelectedFlowId(flowId);
    onSelectFlow(flowId);
  };

  return (
    <>
      <aside className="w-64 h-full border-r bg-background max-h-screen overflow-y-auto">
        <div className="p-4">
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowNewFlowDialog(true)}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Flow
                </>
              )}
            </Button>
          </div>

          <ul className="space-y-2 mt-4">
            {isLoading ? (
              <li className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando flows...</span>
              </li>
            ) : flows.length === 0 ? (
              <li className="text-center py-4 text-sm text-muted-foreground">
                Nenhum flow encontrado
              </li>
            ) : (
              flows
                .filter((flow) => 
                  flow.attributes?.name?.toLowerCase().includes(searchInput.toLowerCase()) ?? false
                )
                .sort((a, b) => Number(b.id) - Number(a.id))
                .map((flow) => (
                <li key={flow.id} className="group relative">
                  <div 
                    className={cn(
                      "h-11 w-full relative overflow-hidden transition-all duration-200 rounded-md cursor-pointer",
                      "hover:bg-accent/50",
                      selectedFlowId === flow.id && "bg-accent/80 hover:bg-accent"
                    )}
                    onClick={() => handleFlowSelect(flow.id)}
                  >
                    <div className="flex items-center justify-between w-full h-full px-3">
                      <div className="flex gap-1 flex-col items-start">
                        <div className="flex items-center gap-2">
                          {selectedFlowId === flow.id && (
                            <CheckCircle2 className="h-4 w-4 text-primary animate-in fade-in slide-in-from-left-2 duration-200" />
                          )}
                          <span className={cn(
                            "font-medium capitalize transition-colors duration-200",
                            selectedFlowId === flow.id && "text-primary"
                          )}>
                            {flow.attributes.name}
                          </span>
                        </div>
                        <span className={cn(
                          "text-xs transition-colors duration-200",
                          selectedFlowId === flow.id ? "text-primary/70" : "text-muted-foreground"
                        )}>
                          {flow.attributes.status}
                        </span>
                      </div>
                    </div>
                    {selectedFlowId === flow.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full animate-in slide-in-from-left-2 duration-200" />
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>

      <NewFlowDialog
        open={showNewFlowDialog}
        onOpenChange={setShowNewFlowDialog}
        onOptionSelect={() => {
          setShowNewFlowDialog(false);
        }}
      />
    </>
  );
}
