import { Node } from "@/types/flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: Node | null;
  onNodeUpdate: (node: Node) => void;
}

export function Drawer({ isOpen, onClose, selectedNode, onNodeUpdate }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-background border-l shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Node Editor</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Node ID</Label>
                <Input value={selectedNode.id} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Input value={selectedNode.type} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input 
                  value={selectedNode.data.label} 
                  onChange={(e) => {
                    const updatedNode = {
                      ...selectedNode,
                      data: {
                        ...selectedNode.data,
                        label: e.target.value
                      }
                    };
                    onNodeUpdate(updatedNode);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a node to edit
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
} 