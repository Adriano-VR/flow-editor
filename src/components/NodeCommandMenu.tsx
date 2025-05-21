"use client"

import React, { useCallback, useMemo, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { IconRenderer } from "@/lib/IconRenderer";
import { NodeTypeDefinition } from "@/lib/nodeTypes";
import { nodeTypes as allNodeTypes } from "@/lib/nodeTypes";

interface NodeCommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNodeSelect: (nodeType: NodeTypeDefinition) => void;
  onClose?: () => void;
}

export function NodeCommandMenu({ open, onOpenChange, onNodeSelect, onClose }: NodeCommandMenuProps) {
  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if '/' is pressed and no input/textarea is focused
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault(); // Prevent the '/' from being typed
        onOpenChange(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  const handleSelect = useCallback((nodeType: NodeTypeDefinition) => {
    // Use setTimeout to ensure state updates happen after render
    setTimeout(() => {
      onNodeSelect(nodeType);
      onOpenChange(false);
    }, 0);
  }, [onNodeSelect, onOpenChange]);

  // Flatten all node types into a single array for search
  const allNodes = useMemo(() => {
    const nodes: NodeTypeDefinition[] = [];
    
    // Add app nodes from subcategories
    Object.entries(allNodeTypes.app.subcategories).forEach(([_, actions]) => {
      actions.actions.forEach((action) => {
        nodes.push(action);
      });
    });

    // Add internal nodes
    nodes.push(...allNodeTypes.internal.actions);

    return nodes;
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => {
      onOpenChange(false);
      onClose?.();
    }}>
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[450px] max-h-[85vh] overflow-hidden rounded-lg border bg-background shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Buscar tipo de nó..." />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>Nenhum nó encontrado.</CommandEmpty>
            <CommandGroup heading="Internos">
              {allNodes
                .filter(node => node.category === 'internal')
                .map((node) => (
                  <CommandItem
                    key={node.id}
                    onSelect={() => handleSelect(node)}
                    className="flex items-center gap-2"
                  >
                    <IconRenderer 
                      iconName={node.icon ?? ''} 
                      className="w-4 h-4"
                      style={{ color:node.color}} 
                    />
                    <span>{node.name}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandGroup heading="Aplicativos">
              {allNodes
                .filter(node => node.category === 'app')
                .map((node) => (
                  <CommandItem
                    key={node.id}
                    onSelect={() => handleSelect(node)}
                    className="flex items-center gap-2"
                  >
                     
                      <IconRenderer 
                      iconName={node.icon ?? ''} 
                      className="w-4 h-4"
                      style={{ color:node.color}} 
                    />
                    
                  
                  
                    <span>{node.name}</span>
                    {node.subcategory && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {node.subcategory}
                      </span>
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  );
} 