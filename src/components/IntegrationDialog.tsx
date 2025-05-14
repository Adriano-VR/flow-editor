import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IconRenderer } from '@/lib/IconRenderer';

interface IntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: string;
  name: string;
  description: string;
  videoUrl?: string;
  config: Record<string, any>;
  renderConfigFields: (config: any, setConfig: (cfg: any) => void) => React.ReactNode;
  onSave: () => void;
  isInternal?: boolean;
}

export const IntegrationDialog: React.FC<IntegrationDialogProps> = ({
  open,
  onOpenChange,
  icon,
  name,
  description,
  config,
  renderConfigFields,
  onSave,
  isInternal = false,
}) => {
  const [currentConfig, setCurrentConfig] = useState(config);

  useEffect(() => {
    setCurrentConfig(config);
  }, [config]);

  const handleSave = () => {
    onSave();
    onOpenChange(false);
  };

  const renderStyledConfigFields = (config: any, setConfig: (cfg: any) => void) => {
    return (
      <div className="[&_input]:bg-[#2d3748] [&_input]:text-white [&_input]:border-gray-600 [&_input]:focus:border-green-500 [&_input]:focus:ring-green-500 [&_input]:placeholder-gray-400 [&_select]:bg-[#2d3748] [&_select]:text-white [&_select]:border-gray-600 [&_select]:focus:border-green-500 [&_select]:focus:ring-green-500 [&_textarea]:bg-[#2d3748] [&_textarea]:text-white [&_textarea]:border-gray-600 [&_textarea]:focus:border-green-500 [&_textarea]:focus:ring-green-500">
        {renderConfigFields(config, setConfig)}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#191919] text-white max-w-4xl w-full">
        <DialogTitle className="text-white">{name}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Lado esquerdo: Card */}
          <div className="bg-[#23272f] rounded-xl p-6 flex flex-col items-center w-full md:w-80 shadow-lg border border-gray-700">
            <div className="bg-white rounded-full p-4 mb-4">
              <IconRenderer iconName={icon ?? ''} className="text-5xl text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1">{name}</div>
            <div className="text-xs text-gray-400 mb-2">by Xbase</div>
            <div className="text-xs text-gray-400 mb-4">v3.1.0</div>
            {!isInternal && (
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold mb-4">
                Install Integration
              </Button>
            )}
            <div className="bg-[#1a2332] rounded-lg p-3 w-full mb-2">
              <div className="text-xs text-blue-200 mb-2">Something is missing or not working as expected with {name}?</div>
              <Button variant="outline" className="w-full text-blue-400 border-blue-400">
                Request changes
              </Button>
            </div>
          </div>
          {/* Lado direito: Configurações */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-2xl font-bold mb-2">Configuration</div>
            <div className="bg-[#23272f] rounded-xl p-6 border border-gray-700">
              {renderStyledConfigFields(currentConfig, setCurrentConfig)}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button className="bg-green-500 hover:bg-green-600" onClick={handleSave}>Save Configuration</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 