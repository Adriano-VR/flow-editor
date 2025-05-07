"use client"

import { useState, useEffect } from "react";
import FlowEditor from "@/components/FlowEditor";
import Sidebar from "@/components/Sidebar";
import DefaultLayout from "@/layout/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFlow, deleteFlow, getFlow, updateFlow } from "@/lib/api";
import { nodeTypes as nodeTypeDefinitions } from "@/lib/nodeTypes";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [flowData, setFlowData] = useState<any>(null);
  const [flowName, setFlowName] = useState("Novo Flow");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [actionConfig, setActionConfig] = useState<any>({});

  const actions = [
    // WhatsApp Actions
    { 
      id: "whatsapp-send-message", 
      name: "Enviar Mensagem WhatsApp", 
      description: "Envia uma mensagem para um número específico",
      category: "whatsapp"
    },
    { 
      id: "whatsapp-receive-message", 
      name: "Enviar Template WhatsApp", 
      description: "Envia uma mensagem usando um template aprovado",
      category: "whatsapp"
    },
   
  ];

  const filteredActions = searchQuery
    ? actions.filter(action =>
        action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : actions;

  useEffect(() => {
    const loadFlowData = async () => {
      if (selectedFlowId) {
        try {
          const response = await getFlow(selectedFlowId);
          setFlowData(response.data);
          setFlowName(response.data.name || "Novo Flow");
        } catch (error) {
          console.error('Error loading flow:', error);
        }
      }
    };

    loadFlowData();
  }, [selectedFlowId]);

  const handleCreateFlow = async () => {
    try {
      setIsCreating(true);
      const newFlow = await createFlow({
        data: {
          name: flowName,
          status: "draft",
          billing: "free",
          published: true,
          data: {
            nodes: [],
            edges: []
          }
        }
      });
      
      if (newFlow.data?.id) {
        setSelectedFlowId(newFlow.data.id.toString());
      }
    } catch (error) {
      console.error('Error creating flow:', error);
    } finally {
      setIsCreating(false);
    }
  };



  const handleSaveFlow = async (data: { nodes: any[]; edges: any[] }) => {
    if (!selectedFlowId) return;

    try {
      await updateFlow(selectedFlowId, {
        data: {
          name: flowData?.attributes?.name || "Novo Flow",
          status: "draft",
          billing: "free",
          published: true,
          data
        }
      });
    } catch (error) {
      console.error('Error saving flow:', error);
    }
  };

  const handleActionSelect = (action: any) => {
    setSelectedAction(action);
    setActionConfig({});
    setIsActionModalOpen(true);
  };

  const handleActionConfigSubmit = async () => {
    if (!selectedAction || !flowData?.data || !selectedFlowId) return;

    let actionDefinition;

    // Identifica a categoria e subcategoria baseado no ID da ação
    const [category, subcategory, ...actionParts] = selectedAction.id.split('_');
    const actionName = actionParts.join('_');

    if (category === 'app' && subcategory) {
      actionDefinition = nodeTypeDefinitions.app[subcategory]?.[actionName];
    } else if (category === 'internal') {
      actionDefinition = nodeTypeDefinitions.internal[actionName];
    }

    if (!actionDefinition) {
      console.error('Action definition not found:', { category, subcategory, actionName });
      return;
    }

    // Mapeia os campos da configuração baseado no tipo de ação
    let config = {};
    switch (selectedAction.id) {
      case 'whatsapp-send-message':
        config = {
          phone: actionConfig.phone,
          message: actionConfig.message
        };
        break;
      case 'whatsapp-receive-message':
        config = {
          template: actionConfig.template,
          phone: actionConfig.phone
        };
        break;
      default:
        config = actionConfig;
    }

    // Cria um novo nó com a ação selecionada
    const newNode = {
      id: `${actionDefinition.id}-${Date.now()}`,
      type: actionDefinition.type,
      data: {
        label: actionDefinition.name,
        config: config,
      },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    };

    // Atualiza o flow com o novo nó
    const updatedData = {
      nodes: [...(flowData.data.nodes || []), newNode],
      edges: flowData.data.edges || [],
    };

    try {
      const response = await updateFlow(selectedFlowId, {
        data: {
          name: flowName,
          status: "draft",
          billing: "free",
          published: true,
          data: updatedData
        }
      });
      
      // Atualiza o estado local com os novos dados
      setFlowData(response.data);
      
      // Fecha o modal e reseta os estados
      setIsActionModalOpen(false);
      setSelectedAction(null);
      setActionConfig({});
    } catch (error) {
      console.error('Error saving flow:', error);
    }
  };

  const renderActionConfigFields = () => {
    if (!selectedAction) return null;

    switch (selectedAction.id) {
      case 'whatsapp-send-message':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número do WhatsApp</Label>
              <Input
                id="phone"
                placeholder="+55 (00) 00000-0000"
                value={actionConfig.phone || ''}
                onChange={(e) => setActionConfig({ ...actionConfig, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Input
                id="message"
                placeholder="Digite sua mensagem"
                value={actionConfig.message || ''}
                onChange={(e) => setActionConfig({ ...actionConfig, message: e.target.value })}
              />
            </div>
          </div>
        );
      case 'email-send':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">Para</Label>
              <Input
                id="to"
                placeholder="email@exemplo.com"
                value={actionConfig.to || ''}
                onChange={(e) => setActionConfig({ ...actionConfig, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                placeholder="Assunto do email"
                value={actionConfig.subject || ''}
                onChange={(e) => setActionConfig({ ...actionConfig, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Mensagem</Label>
              <Input
                id="body"
                placeholder="Conteúdo do email"
                value={actionConfig.body || ''}
                onChange={(e) => setActionConfig({ ...actionConfig, body: e.target.value })}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Selecione uma ação para configurar
          </div>
        );
    }
  };

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Flows</h1>
      
      </div>
      
      <div className="flex h-[calc(100vh-8rem)]">
        <Sidebar onSelectFlow={setSelectedFlowId} />
        <main className="flex-1 p-4">
          {selectedFlowId ? (
            <div className="relative h-full">
              <FlowEditor 
                flowId={selectedFlowId} 
                initialData={flowData?.data}
                onSave={handleSaveFlow}
                onOpenDrawer={() => {
                  console.log('Opening drawer...');
                  setIsDrawerOpen(true);
                }}
              />
              <Button
                size="lg"
                onClick={() => setIsDrawerOpen(true)}
                className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <Button
                size="lg"
                onClick={() => setIsDrawerOpen(true)}
                className="h-16 w-16 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </Button>
              <p>Clique para adicionar uma ação ao seu flow</p>
            </div>
          )}
        </main>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="fixed right-0 top-0 h-full w-[400px] border-l bg-background">
          <DrawerHeader className="border-b">
            <DrawerTitle>Adicionar Ação</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <div className="space-y-4">
              {!selectedFlowId && (
                <div className="space-y-2">
                  <Label htmlFor="flowName">Nome do Flow</Label>
                  <Input
                    id="flowName"
                    placeholder="Digite o nome do flow"
                    value={flowName}
                    onChange={(e) => setFlowName(e.target.value)}
                  />
                  <Button 
                    className="w-full" 
                    onClick={handleCreateFlow}
                    disabled={isCreating}
                  >
                    {isCreating ? 'Criando...' : 'Criar Novo Flow'}
                  </Button>
                </div>
              )}
              <div>
                <Input
                  type="search"
                  placeholder="Pesquisar ações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="w-full justify-start flex-col items-start h-auto py-3"
                    onClick={() => handleActionSelect(action)}
                  >
                    <span className="font-medium">{action.name}</span>
                    <span className="text-sm text-muted-foreground">{action.description}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAction?.name}</DialogTitle>
          </DialogHeader>
          {renderActionConfigFields()}
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
