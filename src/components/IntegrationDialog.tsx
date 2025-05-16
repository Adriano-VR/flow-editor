import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { IconRenderer } from '@/lib/IconRenderer';
import { renderActionConfigFields } from '@/components/actionConfigFields';
import { Ban, SplinePointer } from 'lucide-react';

interface IntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: string;
  name: string;
  description: string;
  videoUrl?: string;
  config: Record<string, any>;
  actionDefinition: any;
  onSave: (config: Record<string, any>) => void;
  isInternal?: boolean;
}

export const IntegrationDialog: React.FC<IntegrationDialogProps> = ({
  open,
  onOpenChange,
  icon,
  name,
  config,
  actionDefinition,
  onSave,
}) => {
  const [currentConfig, setCurrentConfig] = useState(config);

  useEffect(() => {
    setCurrentConfig(config);
  }, [config]);

  const handleSave = () => {
    onSave(currentConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" text-white max-w-md w-full p-0 rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-[#23272f]">
        {/* Título acessível para screen readers */}
        <DialogTitle className="sr-only">{name}</DialogTitle>
        {/* Header com nome, ícone e botão Test Step */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-700 bg-[#23272f]">
          <div className="flex items-center gap-3">
            <IconRenderer iconName={icon ?? ''} className="text-2xl text-green-500" />
            <span className="text-lg font-semibold">{name}</span>
          </div>
          
        </div>
     
        {/* Conteúdo das Abas */}
        <div className="px-4 bg-[#23272f] min-h-[250px]">
       
              <div className="mt-6">
                <div className="[&_input]:bg-[#2d3748] [&_input]:text-white [&_input]:border-gray-600 [&_input]:focus:border-green-500 [&_input]:focus:ring-green-500 [&_input]:placeholder-gray-400 [&_select]:bg-[#2d3748] [&_select]:text-white [&_select]:border-gray-600 [&_select]:focus:border-green-500 [&_select]:focus:ring-green-500 [&_textarea]:bg-[#2d3748] [&_textarea]:text-white [&_textarea]:border-gray-600 [&_textarea]:focus:border-green-500 [&_textarea]:focus:ring-green-500">
                  {renderActionConfigFields(actionDefinition, currentConfig, setCurrentConfig)}
                </div>
              </div>
         
     
        </div>
        {/* Footer com botões */}
        <div className="cursor-pointer flex justify-end gap-2 p-3 bg-[#23272f] border-t border-gray-700">
          {/* <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-600 text-gray-300">Cancel</Button> */}
        
            <Ban onClick={() => onOpenChange(false)} className='text-red-400' />
            <SplinePointer onClick={handleSave} className='text-green-500' />
          {/* <Button className="bg-green-500 hover:bg-green-600 text-white font-bold" onClick={handleSave}>Save Configuration</Button> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 