import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, ClipboardPaste, Save, AlertCircle } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { Node } from "@/types/flow";

interface JsonEditorProps {
  flowData: Node | null;
  onSave: (json: string) => void;
}

export function JsonEditor({ flowData, onSave }: JsonEditorProps) {
  const [jsonInput, setJsonInput] = useState<string>(
    flowData ? JSON.stringify(flowData, null, 2) : ""
  );
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b bg-muted/50">
        <h2 className="text-lg font-semibold">Editor JSON</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePaste}>
            <ClipboardPaste className="h-4 w-4" />
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm p-4 bg-red-50 border-b">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex-1 p-4 overflow-auto">
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
              // Try to parse the JSON to validate it
              JSON.parse(pastedText);
              setJsonInput(pastedText);
              setError(null);
              onSave(pastedText); // Auto-save when pasting
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
          }}
          className="font-mono h-full resize-none bg-background border rounded-md"
          placeholder="Cole ou edite o JSON do fluxo aqui..."
          style={{
            tabSize: 2,
            whiteSpace: "pre",
            wordWrap: "normal",
            overflowX: "auto"
          }}
        />
      </div>
    </div>
  );
} 