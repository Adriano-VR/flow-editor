import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Plus } from "lucide-react";

interface NodeContextMenuProps {
  children: React.ReactNode;
  onAddNode: () => void;
}

export function NodeContextMenu({ children, onAddNode }: NodeContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onAddNode} className="gap-2 font-semibold cursor-pointer">
          <Plus className="h-4 w-4 " strokeWidth={4} />
          Adicionar Nó
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
} 