import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { IconRenderer } from "@/lib/IconRenderer";
import { getNodeCategories, NodeTypeDefinition } from "@/lib/nodeTypes";
import { Input } from "@/components/ui/input";
import { IntegrationDialog } from './IntegrationDialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface NodeSelectionDrawerProps {
  onNodeSelect: (nodeType: NodeTypeDefinition) => void;
}

export interface NodeSelectionDrawerRef {
  open: () => void;
}

export const NodeSelectionDrawer = forwardRef<NodeSelectionDrawerRef, NodeSelectionDrawerProps>(
  ({ onNodeSelect }, ref) => {
    const categories = getNodeCategories();
    const appSubcategories = categories.app.subcategories;
    const [open, setOpen] = useState(false);
    const [selectedAppKey, setSelectedAppKey] = useState<string | null>(null);
    const [actionConfig, setActionConfig] = useState<Record<string, any>>({});
    const [selectedAction, setSelectedAction] = useState<any>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpen(true);
        setSelectedAppKey(null);
        setSelectedAction(null);
        setActionConfig({});
      }
    }));

    // Descrições e vídeos por app (adicione conforme desejar)
    const appDescriptions: Record<string, { description: string; videoUrl?: string }> = {
      whatsapp: {
        description: 'Integre seu chatbot com o WhatsApp para engajar usuários, enviar mensagens automáticas e criar experiências conversacionais personalizadas.',
        videoUrl: 'https://www.youtube.com/embed/1Q8fG0TtVAY',
      },
      assistant: {
        description: 'Crie agentes virtuais inteligentes e personalize suas capacidades.',
        videoUrl: '',
      },
      openai: {
        description: 'Utilize modelos avançados da OpenAI para processamento de linguagem e geração de conteúdo.',
        videoUrl: '',
      },
      instagram: {
        description: 'Automatize interações e postagens no Instagram.',
        videoUrl: '',
      },
      conversion: {
        description: 'Ferramentas de conversão de texto, imagem, áudio e vídeo com IA.',
        videoUrl: '',
      },
      veo2: {
        description: 'Gere vídeos automaticamente com o Veo2.',
        videoUrl: '',
      },
      klingai: {
        description: 'Gere vozes realistas com Kling AI.',
        videoUrl: '',
      },
      elevenlabs: {
        description: 'Text-to-Speech avançado com Eleven Labs.',
        videoUrl: '',
      },
    };

    // Lista de apps
    const appList = Object.entries(appSubcategories).map(([key, subcat]) => ({
      key,
      name: subcat.name,
      icon: subcat.actions[0]?.icon || 'FaPuzzlePiece',
      color: subcat.actions[0]?.color || '#888',
      description: appDescriptions[key]?.description || '',
      videoUrl: appDescriptions[key]?.videoUrl || '',
      actions: subcat.actions,
    }));

    console.log(selectedAction);
    

    // Renderização
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild></DrawerTrigger>
        <DialogTitle>adawdad</DialogTitle>
        <DrawerContent className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white max-w-lg w-full sm:w-[480px]" data-vaul-drawer-direction="right">
          <div className="flex justify-between items-center px-8 pt-6 pb-2">
            <h2 className="text-2xl font-bold text-gray-800">Escolha um App</h2>
            <button
              className="text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
          {!selectedAppKey && !selectedAction ? (
            <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col justify-center items-center">
              <div className="grid grid-cols-1 gap-8 w-full max-w-xl mt-12">
                <button
                  className="group bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all duration-200 flex flex-col items-center p-8 cursor-pointer hover:scale-105"
                  onClick={() => setSelectedAppKey('apps')}
                >
                  <div className="rounded-full p-6 mb-4 shadow bg-blue-100">
                  <IconRenderer iconName="RiApps2AddFill" className="text-6xl text-blue-500" />            
                        </div>
                 
                  <div className="text-xl font-bold text-gray-800 group-hover:text-blue-600">Apps</div>
                  <div className="text-sm text-gray-500 mt-2 text-center">Integrações externas como WhatsApp, OpenAI, etc.</div>
                </button>
                <button
                  className="group bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-yellow-400 transition-all duration-200 flex flex-col items-center p-8 cursor-pointer hover:scale-105"
                  onClick={() => setSelectedAppKey('internal')}
                >
                  <div className="rounded-full p-6 mb-4 shadow bg-yellow-100">
                    <IconRenderer iconName="CgInternal" className="text-6xl text-yellow-500" />
                  </div>
                  <div className="text-xl font-bold text-gray-800 group-hover:text-yellow-600">Interno</div>
                  <div className="text-sm text-gray-500 mt-2 text-center">Ações internas do fluxo</div>
                </button>
              </div>
            </div>
          ) : selectedAppKey === 'apps' && !selectedAction ? (
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <button className="mb-4 text-sm text-blue-600 underline" onClick={() => setSelectedAppKey(null)}>← Voltar</button>
              <h3 className="text-lg font-bold mb-4 text-gray-700">Apps</h3>
              <div className="grid grid-cols-1 gap-8 mb-8">
                {appList.map((app) => (
                  <button
                    key={app.key}
                    className="group bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all duration-200 flex flex-col items-center p-6 cursor-pointer hover:scale-105"
                    onClick={() => setSelectedAppKey(app.key)}
                  >
                    <div
                      className="rounded-full p-5 mb-4 shadow"
                      style={{ background: app.color + '22' }}
                    >
                      <IconRenderer iconName={app.icon} className={`text-5xl`} />
                    </div>
                    <div className="text-lg font-bold text-gray-800 group-hover:text-blue-600">{app.name}</div>
                    <div className="text-xs text-gray-500 mt-2 text-center">{app.description}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : selectedAppKey === 'internal' && !selectedAction ? (
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <button className="mb-4 text-sm text-blue-600 underline" onClick={() => setSelectedAppKey(null)}>← Voltar</button>
              <h3 className="text-lg font-bold mb-4 text-gray-700">Ações Internas</h3>
              <div className="grid grid-cols-1 gap-8">
                {categories.internal.actions.map((internal) => (
                  <button
                    key={internal.id}
                    className="group bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-yellow-400 transition-all duration-200 flex flex-col items-center p-6 cursor-pointer hover:scale-105"
                    onClick={() => setSelectedAction(internal)}
                  >
                    <div
                      className="rounded-full p-5 mb-4 shadow"
                      style={{ background: (internal.color || '#EAB308') + '22' }}
                    >
                      <IconRenderer iconName={internal.icon || ''} className={`text-5xl`} />
                    </div>
                    <div className="text-lg font-bold text-gray-800 group-hover:text-yellow-600">{internal.name}</div>
                    <div className="text-xs text-gray-500 mt-2 text-center">{internal.label || ''}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : selectedAppKey && !selectedAction ? (
            (() => {
              // Apps
              const app = appList.find(a => a.key === selectedAppKey);
              if (!app) return null;
              return (
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                  <button className="mb-4 text-sm text-blue-600 underline" onClick={() => setSelectedAppKey('apps')}>← Voltar</button>
                  <h3 className="text-lg font-bold mb-4 text-gray-700">Ações de {app.name}</h3>
                  <div className="grid grid-cols-1 gap-8">
                    {app.actions.map((action) => (
                      <button
                        key={action.id}
                        className="group bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all duration-200 flex flex-col items-center p-6 cursor-pointer hover:scale-105"
                        onClick={() => setSelectedAction(action)}
                      >
                        <div
                          className="rounded-full p-5 mb-4 shadow"
                          style={{ background: (action.color || app.color) + '22' }}
                        >
                          <IconRenderer iconName={action.icon || app.icon} className={`text-5xl`} />
                        </div>
                        <div className="text-lg font-bold text-gray-800 group-hover:text-blue-600">{action.name}</div>
                        <div className="text-xs text-gray-500 mt-2 text-center">{action.label || ''}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : selectedAction ? (
            (() => {
              onNodeSelect(selectedAction);
              setOpen(false);
              setSelectedAction(null);
              setSelectedAppKey(null);
              setActionConfig({});
              return null;
            })()
          ) : null}
        </DrawerContent>
      </Drawer>
    );
  }
);