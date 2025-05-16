import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Sparkles, FilePlus2, LayoutGrid, Upload, X } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { useFlow } from "@/contexts/FlowContext";

interface NewFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOptionSelect: (option: 'ai' | 'blank' | 'template' | 'import', flowName?: string) => void;
}

export function NewFlowDialog({ open, onOpenChange, onOptionSelect }: NewFlowDialogProps) {
  const { handleCreateFlow } = useFlow();
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [flowName, setFlowName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleBlankFlowClick = () => {
    setShowNameDialog(true);
  };

  const handleCreateBlankFlow = async () => {
    if (!flowName.trim()) return;

    try {
      setIsCreating(true);
      const newFlowId = await handleCreateFlow(flowName.trim());
      if (newFlowId) {
        onOptionSelect('blank', flowName.trim());
        setFlowName("");
        setShowNameDialog(false);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating flow:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const cardBase =
    "flex flex-col items-center justify-center p-6 rounded-xl border bg-white shadow-sm transition-all cursor-pointer min-h-[180px] min-w-[200px] hover:shadow-lg hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
  const iconClass = "h-10 w-10 mb-2 text-primary";
  const titleClass = "font-semibold text-base text-center mb-1";
  const descClass = "text-xs text-muted-foreground text-center";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex items-center justify-center min-h-screen max-w-4xl w-full bg-transparent border-none shadow-none p-0">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl relative flex flex-col">
            <DialogHeader className="mb-6">
              <div className="flex justify-between ">
                <DialogTitle className=" text-xl font-bold">Criar um fluxo</DialogTitle>
                <X className="h-6 w-6" onClick={() => onOpenChange(false)} /> 
              </div>
            </DialogHeader>
            <div className="bg-[#f2f4fa] p-5 rounded-lg">
              <div className="flex gap-6 justify-center">
                <button
                  className={cardBase}
                  onClick={() => onOptionSelect('ai')}
                  type="button"
                >
                  <Sparkles className={iconClass} />
                  <span className={titleClass}>Gerar com IA</span>
                  <span className={descClass}>Use IA para criar um fluxo personalizável em segundos</span>
                </button>
                <button
                  className={cardBase}
                  onClick={handleBlankFlowClick}
                  type="button"
                >
                  <FilePlus2 className={iconClass} />
                  <span className={titleClass}>Começar do zero</span>
                  <span className={descClass}>Obtenha uma tela em branco para criar livremente</span>
                </button>
                <button
                  className={cardBase}
                  onClick={() => onOptionSelect('template')}
                  type="button"
                >
                  <LayoutGrid className={iconClass} />
                  <span className={titleClass}>Selecionar template</span>
                  <span className={descClass}>Escolha entre templates prontos para começar rapidamente</span>
                </button>
                <button
                  className={cardBase}
                  onClick={() => onOptionSelect('import')}
                  type="button"
                >
                  <Upload className={iconClass} />
                  <span className={titleClass}>Importar fluxo</span>
                  <span className={descClass}>Importe fluxos existentes (PDF, URL, etc)</span>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="sm:max-w-[425px] bg-[#f2f4fa] border-2">
          <DialogHeader>
            <DialogTitle>Nome do fluxo</DialogTitle>
            <DialogDescription>
              Digite um nome para o seu novo fluxo
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Digite o nome do fluxo"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && flowName.trim() && !isCreating) {
                  handleCreateBlankFlow();
                }
              }}
              autoFocus
              disabled={isCreating}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNameDialog(false)} disabled={isCreating}>
              Cancelar
            </Button>
            <Button onClick={handleCreateBlankFlow} disabled={!flowName.trim() || isCreating}>
              {isCreating ? "Criando..." : "Criar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 