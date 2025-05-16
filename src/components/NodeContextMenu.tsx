import React from 'react';
import { NodeTypeDefinition } from "@/lib/nodeTypes";
import { NodeCommandMenu } from './NodeCommandMenu';

interface NodeContextMenuProps {
  children: React.ReactNode;
  onNodeSelect?: (nodeType: NodeTypeDefinition) => void;
}

export function NodeContextMenu({ children, onNodeSelect }: NodeContextMenuProps) {
  const [showCommandMenu, setShowCommandMenu] = React.useState(false);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (onNodeSelect) {
      setShowCommandMenu(true);
    }
  };

  return (
    <>
      <div 
        onContextMenu={handleContextMenu}
        className="h-full w-full relative"
        style={{ pointerEvents: 'none' }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          {children}
        </div>
      </div>

      {onNodeSelect && (
        <NodeCommandMenu
          open={showCommandMenu}
          onOpenChange={setShowCommandMenu}
          onNodeSelect={(nodeType) => {
            onNodeSelect(nodeType);
            setShowCommandMenu(false);
          }}
        />
      )}
    </>
  );
} 