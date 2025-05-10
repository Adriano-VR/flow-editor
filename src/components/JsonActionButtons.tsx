import { Button } from "./ui/button";
import { Copy, ClipboardPaste, Download } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface JsonActionButtonsProps {
  jsonInput: string;
  onPaste: (text: string) => void;
  onExport: () => void;
}

export function JsonActionButtons({ jsonInput, onPaste, onExport }: JsonActionButtonsProps) {
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
      onPaste(text);
    } catch (err) {
      toast({
        title: "Erro ao colar",
        description: "Não foi possível acessar a área de transferência",
        variant: "destructive",
      });
      console.log(err);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={handleCopy}>
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handlePaste}>
        <ClipboardPaste className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onExport}>
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
} 