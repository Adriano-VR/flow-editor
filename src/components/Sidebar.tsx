"use client"

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Loader2, X, Save, Pencil, Sparkles, FilePlus2, LayoutGrid, Upload } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { SidebarProps } from "@/types/sidebar";
import { useFlow } from "@/contexts/FlowContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import  FlowEditDrawer  from './FlowEditDrawer';
import { NewFlowDialog } from "./NewFlowDialog";

export default function Sidebar({ onSelectFlow }: SidebarProps) {
  const [showNewFlowInput, setShowNewFlowInput] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [flowToEdit, setFlowToEdit] = useState<string | null>(null);
  const { searchInput } = useSearch();
  const { 
    flows, 
    selectedFlowId, 
    setSelectedFlowId, 
    isCreating, 
    handleCreateFlow,
    setFlows,
    handleSaveFlow,
    handleDeleteFlow
  } = useFlow();
  const [showNewFlowDialog, setShowNewFlowDialog] = useState(false);

  useEffect(() => {
    setLocalSelectedId(selectedFlowId);
  }, [selectedFlowId]);

  const handleCreateFlowClick = async () => {
    try {
      // Criar um novo flow sempre com nodes e edges vazios
      const newFlowId = await handleCreateFlow(newFlowName);
      if (newFlowId) {
        setLocalSelectedId(newFlowId);
        setSelectedFlowId(newFlowId);
        onSelectFlow(newFlowId);

        setNewFlowName("");
        setShowNewFlowInput(false);
        
        // Adiciona o novo flow no início da lista com nodes e edges vazios
        const newFlow = {
          id: newFlowId,
          attributes: {
            name: newFlowName,
            status: "draft",
            description: "",
            data: {
              nodes: [],
              edges: []
            }
          }
        };
        
        setFlows([newFlow, ...flows]);
      }
    } catch (error) {
      console.error('Error creating flow:', error);
    }
  };

  const handleEditFlowClick = (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlowToEdit(flowId);
    setEditDrawerOpen(true);
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

      // Sempre usar os nodes e edges existentes do flow que está sendo editado
      await handleSaveFlow({
        name: data.name,
        status: data.status,
        description: data.description,
        nodes: selectedFlow.attributes.data?.nodes || [],
        edges: selectedFlow.attributes.data?.edges || []
      });

      // Atualiza a lista de flows mantendo os nodes e edges existentes
      const updatedFlows = flows.map(flow => {
        if (flow.id === flowToEdit) {
          return {
            ...flow,
            attributes: {
              ...flow.attributes,
              name: data.name,
              description: data.description,
              status: data.status,
              data: flow.attributes.data // Mantém os dados existentes
            }
          };
        }
        return flow;
      });
      
      setFlows(updatedFlows);
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
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Flow
            </Button>
            <NewFlowDialog
              open={showNewFlowDialog}
              onOpenChange={setShowNewFlowDialog}
              onOptionSelect={(option) => {
                // Aqui você pode definir o que acontece para cada opção
                setShowNewFlowDialog(false);
                if (option === 'blank') setShowNewFlowInput(true);
                // Adicione lógica para 'ai', 'template', 'import' conforme necessário
              }}
            />
          </div>

          <ul className="space-y-2 mt-4">
            {flows
              .filter((flow) => 
                flow.attributes?.name?.toLowerCase().includes(searchInput.toLowerCase()) ?? false
              )
              .sort((a, b) => Number(b.id) - Number(a.id))
              .map((flow) => (
                <li key={flow.id} className="group relative">
                  <Button 
                    variant="ghost"
                    className={`h-11 w-full justify-start truncate ${localSelectedId === flow.id ? 'bg-primary text-white hover:bg-primary/90 hover:text-white' : ''}`}
                    onClick={() => {
                      setLocalSelectedId(flow.id);
                      setSelectedFlowId(flow.id);
                      onSelectFlow(flow.id);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {localSelectedId === flow.id && <Pencil className="h-4 w-4" />}
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
              ))}
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
