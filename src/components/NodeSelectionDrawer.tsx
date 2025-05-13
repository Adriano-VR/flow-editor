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
import { Plus } from "lucide-react";

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

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true)
    }));

    const handleNodeSelect = (action: NodeTypeDefinition) => {
      onNodeSelect(action);
      setOpen(false);
    };

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Nó
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-full" data-vaul-drawer-direction="right">
          <DrawerHeader>
            <DrawerTitle>Selecione um Nó</DrawerTitle>
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
                      {subcategory.actions.map((action) => (
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
                  {categories.internal.actions.map((action) => (
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