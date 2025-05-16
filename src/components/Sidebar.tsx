"use client"

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Plus, Loader2, Pencil } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { SidebarProps } from "@/types/sidebar";
import { useFlow } from "@/contexts/FlowContext";
import  FlowEditDrawer  from './FlowEditDrawer';
import { NewFlowDialog } from "./NewFlowDialog";

export default function Sidebar({ onSelectFlow }: SidebarProps) {
  const [, setShowNewFlowInput] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [flowToEdit, setFlowToEdit] = useState<string | null>(null);
  const { searchInput } = useSearch();
  const { 
    flows, 
    selectedFlowId, 
    setSelectedFlowId, 
    isCreating, 
    isLoading,
    setFlows,
    handleSaveFlow,
    handleDeleteFlow,
    getFlows
  } = useFlow();
  const [showNewFlowDialog, setShowNewFlowDialog] = useState(false);

  const handleEditFlowClick = (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlowToEdit(flowId);
    setEditDrawerOpen(true);
  };

  const handleFlowSelect = async (flowId: string) => {
    // Limpa o estado de edição antes de selecionar um novo flow
    setEditDrawerOpen(false);
    setFlowToEdit(null);
    
    // Atualiza o ID do flow selecionado
    setSelectedFlowId(flowId);
    onSelectFlow(flowId);
  };

  const handleSaveFlowClick = async (data: { 
    name: string; 
    description: string; 
    status: string;
    data?: {
      nodes: any[];
      edges: any[];
    };
  }) => {
    if (!flowToEdit) return;
    try {
      const selectedFlow = flows.find(flow => flow.id === flowToEdit);
      if (!selectedFlow) return;

      // Primeiro atualiza no backend
      await handleSaveFlow({
        name: data.name,
        status: data.status,
        description: data.description,
        nodes: selectedFlow.attributes.data?.nodes || [],
        edges: selectedFlow.attributes.data?.edges || []
      });

      // Busca a lista atualizada de flows do backend
      const updatedResponse = await getFlows();
      setFlows(updatedResponse.data);

      // Fecha o drawer e limpa o estado
      setEditDrawerOpen(false);
      setFlowToEdit(null);
    } catch (error) {
      console.error('Error updating flow:', error);
    }
  };

  const handleDeleteFlowClick = async () => {
    if (!flowToEdit) return;
    try {
      await handleDeleteFlow(flowToEdit);
      setEditDrawerOpen(false);
      setFlowToEdit(null);
      // Se o flow deletado era o selecionado, limpa a seleção
      if (selectedFlowId === flowToEdit) {
        setSelectedFlowId(null);
        onSelectFlow('');
      }
    } catch (error) {
      console.error('Error deleting flow:', error);
    }
  };

  const selectedFlow = flows.find(flow => flow.id === flowToEdit);

  return (
    <>
      <aside className="w-64 h-full border-r bg-background max-h-screen overflow-y-auto">
        <div className="p-4">
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setShowNewFlowDialog(true);
              }}
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
            <NewFlowDialog
              open={showNewFlowDialog}
              onOpenChange={setShowNewFlowDialog}
              onOptionSelect={(option) => {
                setShowNewFlowDialog(false);
                if (option === 'blank') setShowNewFlowInput(true);
              }}
            />
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
                  <Button 
                    variant="ghost"
                    className={`h-11 w-full justify-start truncate ${selectedFlowId === flow.id ? 'bg-primary text-white hover:bg-primary/90 hover:text-white' : ''}`}
                    onClick={() => handleFlowSelect(flow.id)}
                  >
                    <div className="flex items-center gap-2">
                      {selectedFlowId === flow.id && <Pencil className="h-4 w-4" />}
                      <div className="flex gap-1 flex-col items-start cursor-pointer">
                        <span className="font-medium capitalize">{flow.attributes.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {flow.attributes.status}
                        </span>
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleEditFlowClick(flow.id, e)}
                  >
                    <Pencil className="h-4 w-4 text-primary" />
                  </Button>
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>

      {selectedFlow && (
        <FlowEditDrawer
          open={editDrawerOpen}
          onOpenChange={(open: boolean) => {
            setEditDrawerOpen(open);
            if (!open) {
              setFlowToEdit(null);
            }
          }}
          flowData={{
            name: selectedFlow.attributes.name,
            description: selectedFlow.attributes.description || '',
            status: selectedFlow.attributes.status,
            data: selectedFlow.attributes.data || { nodes: [], edges: [] }
          }}
          onSave={handleSaveFlowClick}
          onDelete={handleDeleteFlowClick}
        />
      )}
    </>
  );
}
