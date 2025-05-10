import { useState } from "react";
import { Button } from "./ui/button";
import { Save, Code } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { Edge, Node } from "@/types/flow";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { JsonActionButtons } from "./JsonActionButtons";
import { JsonErrorDisplay } from "./JsonErrorDisplay";
import { JsonTextarea } from "./JsonTextarea";

interface JsonEditorProps {
  flowData: Node | null;
  onSave: (json: string) => void;
  onCreateFlow?: (nodes: Node[], edges: Edge[]) => void;
  completeFlow?: { nodes: Node[]; edges: Edge[] };
}

export function JsonEditor({ flowData, onSave, onCreateFlow, completeFlow }: JsonEditorProps) {
  const [jsonInput, setJsonInput] = useState<string>(
    flowData ? JSON.stringify(flowData, null, 2) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handlePaste = (text: string) => {
    try {
      JSON.parse(text);
      setJsonInput(text);
      setError(null);
      onSave(text);
      toast({
        title: "JSON aplicado",
        description: "JSON colado e aplicado com sucesso",
      });
    } catch (err) {
      setError("JSON inválido. Por favor, verifique a formatação.");
      toast({
        title: "Erro ao colar",
        description: "O JSON está mal formatado",
        variant: "destructive",
      });
      console.log(err);
    }
  };



  const handleCreateFlow = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      if (parsedJson.nodes && parsedJson.edges) {
        onCreateFlow?.(parsedJson.nodes, parsedJson.edges);
        setIsOpen(false);
        toast({
          title: "Flow criado!",
          description: "O flow foi criado com sucesso a partir do JSON",
        });
      } else {
        setError("JSON inválido. O JSON deve conter 'nodes' e 'edges'");
        toast({
          title: "Erro ao criar flow",
          description: "O JSON não contém a estrutura necessária",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("JSON inválido. Por favor, verifique a formatação.");
      toast({
        title: "Erro ao criar flow",
        description: "O JSON está mal formatado",
        variant: "destructive",
      });
      console.log(err);
    }
  };

  const handleExportJson = () => {
    try {
      if (!completeFlow) {
        throw new Error("Não há dados do fluxo para exportar");
      }
      const jsonString = JSON.stringify(completeFlow, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flow.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Exportado!",
        description: "JSON do fluxo foi exportado com sucesso",
      });
    } catch (err) {
      toast({
        title: "Erro ao exportar",
        description: err instanceof Error ? err.message : "Não foi possível exportar o JSON",
        variant: "destructive",
      });
      console.error(err);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <Code className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-[400px] right-0 top-0 bottom-0 rounded-r-lg rounded-l-none">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Editor JSON</DrawerTitle>
            <DrawerDescription>
              Cole ou edite o JSON para criar ou atualizar o flow
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <JsonErrorDisplay error={error} />
            <JsonTextarea
              value={jsonInput}
              onChange={setJsonInput}
              onError={setError}
            />
          </div>
          <DrawerFooter>
            <div className="flex justify-between items-center">
              <JsonActionButtons
                jsonInput={jsonInput}
                onPaste={handlePaste}
                onExport={handleExportJson}
              />
              <div className="flex gap-2">
                <DrawerClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DrawerClose>
                <Button onClick={handleCreateFlow}>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Flow
                </Button>
              </div>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 