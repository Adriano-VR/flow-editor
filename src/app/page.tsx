"use client"

import FlowEditor from "@/components/FlowEditor";
import Sidebar from "@/components/Sidebar";
import DefaultLayout from "@/layout/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFlow } from "@/contexts/FlowContext";

export default function Home() {
  const {
    selectedFlowId,
    setSelectedFlowId,
    flowData,
    isActionModalOpen,
    setIsActionModalOpen,
    selectedAction,
    actionConfig,
    setActionConfig,
    handleSaveFlow,
    handleActionConfigSubmit,
  } = useFlow();



  return (
    <DefaultLayout>
   
      
      <div className="flex h-[calc(100vh-8rem)]">
        <Sidebar onSelectFlow={setSelectedFlowId} />
        <main className="flex-1 p-4">
          {selectedFlowId ? (
            <div className="relative h-full">
              <FlowEditor 
                flowId={selectedFlowId} 
                initialData={flowData?.attributes?.data ?? undefined}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onSave={handleSaveFlow as any}
                
              />
             
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <p className="text-lg">Select a flow or create a new one to get started</p>
            </div>
          )}
        </main>
      </div>

    
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAction?.name}</DialogTitle>
          </DialogHeader>
       
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleActionConfigSubmit}>
              Adicionar ao Flow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}

