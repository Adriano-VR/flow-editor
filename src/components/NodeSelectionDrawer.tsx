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

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpen(true);
        setSearchQuery("");
      }
    }));

    const handleNodeSelect = (action: NodeTypeDefinition) => {
      onNodeSelect(action);
      setOpen(false);
      setSearchQuery("");
    };

    const handleOpenChange = (newOpen: boolean) => {
      if (!newOpen) {
        setSearchQuery("");
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


    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
         
        </DrawerTrigger>
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
              {/* App Nodes */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{categories.app.name}</h3>
                {Object.entries(categories.app.subcategories).map(([key, subcategory]) => (
                  <div key={key} className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">{subcategory.name}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {filterNodes(subcategory.actions).map((action) => (
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
                ))}
              </div>

              {/* Internal Nodes */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{categories.internal.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {filterNodes(categories.internal.actions).map((action) => (
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
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }
); 