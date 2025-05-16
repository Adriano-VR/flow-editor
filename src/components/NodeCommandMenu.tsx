"use client"

import React from "react";
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
}

export function NodeCommandMenu({ 
  open, 
  onOpenChange, 
  onNodeSelect 
}: NodeCommandMenuProps) {
  const [search, setSearch] = React.useState("");

  // Flatten all node types into a single array for search
  const allNodes = React.useMemo(() => {
    const nodes: NodeTypeDefinition[] = [];
    
    // Add app nodes
    Object.entries(allNodeTypes.app.subcategories).forEach(([subcat, actions]) => {
      actions.actions.forEach((action: any) => {
        nodes.push({
          ...action,
          category: 'app',
          subcategory: subcat,
        });
      });
    });

    // Add internal nodes
    Object.entries(allNodeTypes.internal.actions).forEach(([name, action]) => {
      if (
        typeof action === 'object' &&
        action !== null &&
        'id' in action &&
        'type' in action
      ) {
        const node = action as any;
        nodes.push({
          id: node.id,
          type: node.type,
          name,
          category: 'internal',
          config: node.config ?? {},
          color: node.color ?? '',
          severity: node.severity ?? undefined,
          icon: node.icon ?? undefined,
          ...node,
        });
      }
    });

    return nodes;
  }, []);

  const filteredNodes = React.useMemo(() => {
    if (!search) return allNodes;
    const searchLower = search.toLowerCase();
    return allNodes.filter(node => 
      node.name.toLowerCase().includes(searchLower) ||
      node.category.toLowerCase().includes(searchLower) ||
      (node.subcategory && node.subcategory.toLowerCase().includes(searchLower))
    );
  }, [search, allNodes]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)}>
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[450px] max-h-[85vh] overflow-hidden rounded-lg border bg-background shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Pesquisar nós..." 
            value={search}
            onValueChange={setSearch}
            className="h-9"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>Nenhum nó encontrado.</CommandEmpty>
            <CommandGroup heading="Aplicativos">
              {filteredNodes
                .filter(node => node.category === 'app')
                .map((node, idx) => (
                  <CommandItem
                    key={node.id || `${node.name}-${node.type}-${idx}`}
                    onSelect={() => {
                      onNodeSelect(node);
                      onOpenChange(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    {node.icon && <IconRenderer iconName={node.icon} className="h-4 w-4" />}
                    <span>{node.name}</span>
                    {node.subcategory && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {node.subcategory}
                      </span>
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandGroup heading="Internos">
              {filteredNodes
                .filter(node => node.category === 'internal')
                .map((node, idx) => (
                  <CommandItem
                    key={node.id || `${node.name}-${node.type}-${idx}`}
                    onSelect={() => {
                      onNodeSelect(node);
                      onOpenChange(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    {node.icon && <IconRenderer iconName={node.icon} className="h-4 w-4" />}
                    <span>{node.name}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  );
} 