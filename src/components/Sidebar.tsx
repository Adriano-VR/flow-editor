"use client"

import { useEffect, useState } from "react";
import { getFlows, createFlow, deleteFlow } from "@/lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Loader2, X, Save, Trash2 } from "lucide-react";

interface Flow {
  id: string;
  attributes: {
    name: string;
    status: string;
    created_at: string;
  };
}

interface SidebarProps {
  onSelectFlow: (flowId: string) => void;
}

export default function Sidebar({ onSelectFlow }: SidebarProps) {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewFlowInput, setShowNewFlowInput] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setLoading(true);
        const response = await getFlows();
        setFlows(response.data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar flows');
        console.error('Error fetching flows:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, []);

  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) return;

    try {
      setIsCreating(true);
      const flowData = {
        data: {
          name: newFlowName.trim(),
          status: "draft",
          billing: "free",
          published: true,
          data: {
            nodes: [],
            edges: []
          }
        }
      };


      const response = await createFlow(flowData);

      if (response && response.data && response.data.id) {
        const updatedResponse = await getFlows();
        setFlows(updatedResponse.data);
        setNewFlowName("");
        setShowNewFlowInput(false);
        onSelectFlow(response.data.id.toString());
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Failed to create flow: Invalid response format');
      }
    } catch (err) {
      console.error('Error creating flow:', err);
      setError('Erro ao criar flow');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteFlow = async (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Tem certeza que deseja excluir este flow?')) {
      return;
    }

    try {
      setIsDeleting(flowId);
      await deleteFlow(flowId);
      const updatedResponse = await getFlows();
      setFlows(updatedResponse.data);
      setError(null);
    } catch (err) {
      console.error('Error deleting flow:', err);
      setError('Erro ao excluir flow');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <aside className="w-64 h-full border-r bg-background">
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
                      handleCreateFlow();
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
                  handleCreateFlow();
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

        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm text-center py-4">
            {error}
          </div>
        ) : (
          <ul className="space-y-2 mt-4">
            {flows.map((flow) => (
              <li key={flow.id} className="group relative  ">
                <Button 
                  variant="ghost" 
                  className={`h-11 w-full justify-start truncate  ${selectedFlowId === flow.id ? 'bg-primary text-green-200 hover:bg-primary/90 hover:text-green-200' : ''}`}
                  onClick={() => {
                    setSelectedFlowId(flow.id);
                    onSelectFlow(flow.id);
                  }}
                >
                  <div className="flex gap-1 flex-col items-start cursor-pointer">
                    <span className="font-medium capitalize">{flow.attributes.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {flow.attributes.status}
                    </span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className= " cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteFlow(flow.id, e)}
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
        )}
      </div>
    </aside>
  );
}
