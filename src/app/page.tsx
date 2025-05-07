"use client"

import { useState } from "react";
import FlowEditor from "@/components/FlowEditor";
import Sidebar from "@/components/Sidebar";
import DefaultLayout from "@/layout/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
    flowName,
    setFlowName,
    isCreating,
    isDrawerOpen,
    setIsDrawerOpen,
    searchQuery,
    setSearchQuery,
    isActionModalOpen,
    setIsActionModalOpen,
    selectedAction,
    actionConfig,
    setActionConfig,
    handleCreateFlow,
    handleSaveFlow,
    handleActionSelect,
    handleActionConfigSubmit,
  } = useFlow();

  const actions = [
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
              <p className="text-lg">Select a flow or create a new one to get started</p>
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

