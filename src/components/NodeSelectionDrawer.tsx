import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconRenderer } from "@/lib/IconRenderer";
import { getNodeCategories, NodeTypeDefinition } from "@/lib/nodeTypes";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NodeSelectionDrawerProps {
  onNodeSelect: (nodeType: NodeTypeDefinition) => void;
}

export interface NodeSelectionDrawerRef {
  open: () => void;
}

export const NodeSelectionDrawer = forwardRef<NodeSelectionDrawerRef, NodeSelectionDrawerProps>(
  ({ onNodeSelect }, ref) => {
    const categories = getNodeCategories();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedApp, setSelectedApp] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpen(true);
        setSearchQuery("");
        setSelectedApp(null);
      }
    }));

    const handleNodeSelect = (action: NodeTypeDefinition) => {
      onNodeSelect(action);
      setOpen(false);
      setSearchQuery("");
      setSelectedApp(null);
    };

    const handleOpenChange = (newOpen: boolean) => {
      if (!newOpen) {
        setSearchQuery("");
        setSelectedApp(null);
      }
      setOpen(newOpen);
    };

    const filterNodes = (nodes: NodeTypeDefinition[]) => {
      if (!searchQuery) return nodes;
      return nodes.filter(node => 
        node.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    };

    NodeSelectionDrawer.displayName = 'NodeSelectionDrawer';

    // Lista de apps (Interno primeiro)
    const appList = [
      { key: 'internal', name: categories.internal.name },
      ...Object.entries(categories.app.subcategories).map(([key, sub]) => ({ key, name: sub.name }))
    ];

    // Renderização
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild></DrawerTrigger>
        <DrawerContent className="h-full" data-vaul-drawer-direction="right">
          <DrawerHeader>
            <DrawerTitle>Selecione um Nó</DrawerTitle>
            <div className="relative mt-4" onClick={(e) => e.stopPropagation()}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar nós..."
                value={searchQuery}
                onChange={(e) => {
                  e.stopPropagation();
                  setSearchQuery(e.target.value);
                }}
                className="pl-9"
                autoComplete="off"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                onKeyPress={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
              />
            </div>
          </DrawerHeader>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-4 space-y-6">
              {/* Se nenhum app selecionado, mostra lista de apps */}
              {!selectedApp && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Apps</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {appList.map(app => (
                      <Button
                        key={app.key}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => setSelectedApp(app.key)}
                      >
                        <span className="text-base font-bold">{app.name}</span>
                        <span className="text-xs text-muted-foreground">{app.key === 'internal' ? 'Interno' : 'App'}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Se app selecionado, mostra lista de ações desse app */}
              {selectedApp && (
                <div className="space-y-4">
                  <Button variant="ghost" className="mb-2" onClick={() => setSelectedApp(null)}>
                    ← Voltar
                  </Button>
                  <h3 className="font-semibold text-lg">
                    {selectedApp === 'internal'
                      ? categories.internal.name
                      : categories.app.subcategories[selectedApp]?.name || selectedApp}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedApp === 'internal'
                      ? filterNodes(categories.internal.actions).map((action) => (
                          <Button
                            key={action.id}
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-center gap-2"
                            onClick={() => handleNodeSelect(action)}
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: action.color }}>
                              <IconRenderer iconName={action.icon ?? ''} className="text-white" />
                            </div>
                            <span className="text-sm">{action.name}</span>
                          </Button>
                        ))
                      : filterNodes(categories.app.subcategories[selectedApp]?.actions || []).map((action) => (
                          <Button
                            key={action.id}
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-center gap-2"
                            onClick={() => handleNodeSelect(action)}
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: action.color }}>
                              <IconRenderer iconName={action.icon ?? ''} className="text-white" />
                            </div>
                            <span className="text-sm">{action.name}</span>
                          </Button>
                        ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }
); 