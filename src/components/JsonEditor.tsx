import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, ClipboardPaste, Save, AlertCircle, Code, Download } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { Node } from "@/types/flow";
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

interface JsonEditorProps {
  flowData: Node | null;
  onSave: (json: string) => void;
  onCreateFlow?: (nodes: Node[], edges: any[]) => void;
  completeFlow?: { nodes: Node[]; edges: any[] };
}

export function JsonEditor({ flowData, onSave, onCreateFlow, completeFlow }: JsonEditorProps) {
  const [jsonInput, setJsonInput] = useState<string>(
    flowData ? JSON.stringify(flowData, null, 2) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonInput);
    toast({
      title: "Copiado!",
      description: "JSON copiado para a área de transferência",
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      try {
        // Try to parse the JSON to validate it
        JSON.parse(text);
        setJsonInput(text);
        setError(null);
        onSave(text); // Auto-save when pasting
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
    } catch (err) {
      toast({
        title: "Erro ao colar",
        description: "Não foi possível acessar a área de transferência",
        variant: "destructive",
      });
      console.log(err);
    }
  };

  const handleSave = () => {
    try {
      onSave(jsonInput);
      setError(null);
      toast({
        title: "Salvo!",
        description: "JSON atualizado com sucesso",
      });
    } catch (err) {
      setError("JSON inválido. Por favor, verifique a formatação.");
      toast({
        title: "Erro ao salvar",
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
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm p-4 bg-red-50 border-b mb-4">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <Textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setError(null);
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pastedText = e.clipboardData.getData('text');
                try {
                  JSON.parse(pastedText);
                  setJsonInput(pastedText);
                  setError(null);
                } catch (err) {
                  setError("JSON inválido. Por favor, verifique a formatação.");
                }
              }}
              className="font-mono h-[500px] resize-none bg-background border rounded-md"
              placeholder="Cole ou edite o JSON do fluxo aqui..."
              style={{
                tabSize: 2,
                whiteSpace: "pre",
                wordWrap: "normal",
                overflowX: "auto"
              }}
            />
          </div>
          <DrawerFooter>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handlePaste}>
                  <ClipboardPaste className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleExportJson}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
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