"use client"

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Loader2, X, Save, Trash2, Pencil } from "lucide-react";
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

export default function Sidebar({ onSelectFlow }: SidebarProps) {
  const [showNewFlowInput, setShowNewFlowInput] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<string | null>(null);
  const { searchInput } = useSearch();
  const { 
    flows, 
    selectedFlowId, 
    setSelectedFlowId, 
    isCreating, 
    isDeleting, 
    handleCreateFlow, 
    handleDeleteFlow,
    setFlows
  } = useFlow();

  useEffect(() => {
    setLocalSelectedId(selectedFlowId);
  }, [selectedFlowId]);

  const handleCreateFlowClick = async () => {
    try {
      const newFlowId = await handleCreateFlow(newFlowName);
      if (newFlowId) {
        setLocalSelectedId(newFlowId);
        setSelectedFlowId(newFlowId);
        onSelectFlow(newFlowId);

        setNewFlowName("");
        setShowNewFlowInput(false);
        
        const updatedFlows = flows.filter(flow => flow.id !== newFlowId);
        const newFlow = flows.find(flow => flow.id === newFlowId);
        if (newFlow) {
          setFlows([newFlow, ...updatedFlows]);
        }
      }
    } catch (error) {
      console.error('Error creating flow:', error);
    }
  };

  const handleDeleteFlowClick = async (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlowToDelete(flowId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!flowToDelete) return;
    try {
      await handleDeleteFlow(flowToDelete);
      setDeleteDialogOpen(false);
      setFlowToDelete(null);
    } catch (error) {
      console.error('Error deleting flow:', error);
    }
  };

  return (
    <>
      <aside className="w-64 h-full border-r bg-background max-h-screen overflow-y-auto">
        <div className="p-4">
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                console.log('New Flow button clicked');
                setShowNewFlowInput(!showNewFlowInput);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Flow
            </Button>

            {showNewFlowInput && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Nome do flow"
                    value={newFlowName}
                    onChange={(e) => {
                      console.log('Input changed:', e.target.value);
                      setNewFlowName(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        console.log('Enter pressed');
                        handleCreateFlowClick();
                      }
                    }}
                    disabled={isCreating}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      console.log('Cancel button clicked');
                      setShowNewFlowInput(false);
                    }}
                    disabled={isCreating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    console.log('Save button clicked');
                    handleCreateFlowClick();
                  }}
                  disabled={isCreating || !newFlowName.trim()}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </Button>
              </div>
            )}
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
                    onClick={(e) => handleDeleteFlowClick(flow.id, e)}
                    disabled={isDeleting === flow.id}
                  >
                    {isDeleting === flow.id ? (
                      <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
                    ) : (
                      <Trash2 className="h-8 w-8 text-red-500" />
                    )}
                  </Button>
                </li>
              ))}
          </ul>
        </div>
      </aside>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este flow? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting === flowToDelete}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting === flowToDelete}
            >
              {isDeleting === flowToDelete ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
