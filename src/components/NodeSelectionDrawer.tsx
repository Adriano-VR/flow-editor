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
import { ArrowBigLeft } from 'lucide-react';

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
    const [search, setSearch] = useState("");

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpen(true);
        setSelectedAppKey(null);
        setSelectedAction(null);
        setActionConfig({});
      }
    }));

    // Descrições e vídeos por app (adicione conforme desejar)
    const appDescriptions: Record<string, { description: string }> = {
      whatsapp: {
        description: 'Integre seu chatbot com o WhatsApp para engajar usuários, enviar mensagens automáticas e criar experiências conversacionais personalizadas.'
      },
      assistant: {
        description: 'Crie agentes virtuais inteligentes e personalize suas capacidades.',
      },
      openai: {
        description: 'Utilize modelos avançados da OpenAI para processamento de linguagem e geração de conteúdo.',
      },
      instagram: {
        description: 'Automatize interações e postagens no Instagram.',
      },
      conversion: {
        description: 'Ferramentas de conversão de texto, imagem, áudio e vídeo com IA.',
      },
      veo2: {
        description: 'Gere vídeos automaticamente com o Veo2.',
      },
      klingai: {
        description: 'Gere vozes realistas com Kling AI.',
      },
      elevenlabs: {
        description: 'Text-to-Speech avançado com Eleven Labs.',
      },
    };

    // Lista de apps
    const appList = Object.entries(appSubcategories).map(([key, subcat]) => ({
      key,
      name: subcat.name,
      icon: subcat.actions[0]?.icon || 'FaPuzzlePiece',
      color: subcat.color || '#888',
      description: appDescriptions[key]?.description || '',
      actions: subcat.actions,
    }));

   

    // Função utilitária para destacar o termo buscado
    function highlight(text: string, term: string) {
      if (!term) return text;
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return (
        <span>
          {text.split(regex).map((part, i) =>
            regex.test(part) ? <span key={i} className="bg-yellow-200 font-bold rounded px-1">{part}</span> : part
          )}
        </span>
      );
    }

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild></DrawerTrigger>
        <DrawerContent className="h-full min-w-4/12 flex flex-col  bg-gradient-to-br from-gray-50 to-white max-w-lg w-full sm:w-[480px]" data-vaul-drawer-direction="right">
          <DialogTitle></DialogTitle>
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
          {/* Lista inicial: apps, interno e ações/nodes filtradas juntos, com input de busca */}
          {!selectedAppKey && !selectedAction && (
            <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col justify-start items-center">
              <div className="w-full max-w-xl mt-4">
                <Input
                  placeholder="Buscar app, interno ou ação..."
                  className="mb-4"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {/* Monta lista de apps/interno e lista de ações/nodes que batem */}
                {(() => {
                  const searchLower = search.toLowerCase();
                  // Lista de apps/interno
                  const items = [
                    {
                      type: 'internal',
                      key: 'internal',
                      name: 'Interno',
                      icon: 'CgInternal',
                      color: categories.internal.color,
                      description: 'Componentes Internos',
                      actions: categories.internal.actions.map(action => ({
                        ...action,
                        parent: 'internal',
                        parentName: 'Interno',
                        parentIcon: 'CgInternal',
                        parentColor: categories.internal.color,
                      })),
                    },
                    ...appList.map(app => ({
                      type: 'app',
                      key: app.key,
                      name: app.name,
                      icon: app.icon,
                      color: app.color,
                      description: app.description,
                      actions: app.actions.map(action => ({
                        ...action,
                        parent: app.key,
                        parentName: app.name,
                        parentIcon: app.icon,
                        parentColor: app.color,
                      })),
                    }))
                  ];
                  // Apps/interno que batem
                  const filteredItems = items.filter(item =>
                    item.name.toLowerCase().includes(searchLower) ||
                    item.description.toLowerCase().includes(searchLower)
                  );
                  // Todas as ações/nodes de todos
                  const allActions = items.flatMap(item =>
                    item.actions.map(action => ({
                      ...action,
                      parent: item.key,
                      parentName: item.name,
                      parentIcon: item.icon,
                      parentColor: item.color,
                    }))
                  );
                  // Ações/nodes que batem
                  const filteredActions = search.trim() ? allActions.filter(action =>
                    action.name.toLowerCase().includes(searchLower) ||
                    (action.label || '').toLowerCase().includes(searchLower)
                  ) : [];
                  // Renderização:
                  // - Se busca vazia: só apps/interno
                  // - Se busca preenchida: mostra apps/interno que batem E/OU ações/nodes que batem
                  return <>
                    {filteredItems.map((item, idx) => (
                      <div key={item.key} className='flex flex-col gap-2'>
                        <button
                          className="w-full flex items-center  hover:bg-[#e5e0ff] transition bg-[#f2f4fa] py-5 px-3 rounded-lg"
                          onClick={() => setSelectedAppKey(item.key)}
                        >
                          <div className="rounded-full h-10 w-10 flex items-center justify-center mr-4" style={{ background: item.color }}>
                            <IconRenderer iconName={item.icon || ''} className="text-white text-xl" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-bold text-base text-gray-800">{highlight(item.name, search)}</div>
                            <div className="text-xs text-gray-500 mt-1">{highlight(item.description, search)}</div>
                          </div>
                        </button>
                        {idx !== filteredItems.length - 1 && <div className="border-b border-gray-200 ml-12" />}
                      </div>
                    ))}
                    {/* Se houver apps/interno e ações, separa */}
                    {filteredItems.length > 0 && filteredActions.length > 0 && <div className="my-2" />}
                    {filteredActions.map((action, idx) => (
                      <div key={action.id + '-' + action.parent}>
                        <button
                          className="w-full flex items-center py-5 px-3 hover:[#e5e0ff] transition rounded-lg bg-[#f2f4fa]"
                          onClick={() => {
                            setSelectedAction(action);
                          }}
                        >
                          <div className="rounded-full w-8 h-8 flex items-center justify-center mr-4" style={{ background: action.color || appList.find(a => a.key === action.parent)?.color }}>
                            <IconRenderer iconName={action.icon || action.parentIcon || ''} className="text-white text-xl" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-bold text-base text-gray-800">{highlight(action.name, search)}</div>
                            <div className="text-xs text-gray-500 mt-1">{highlight(action.label || '', search)}</div>
                            <div className="text-xs text-gray-400 mt-1">{action.parentName}</div>
                          </div>
                        </button>
                        {idx !== filteredActions.length - 1 && <div className="border-b border-gray-200 ml-12" />}
                      </div>
                    ))}
                    {/* Se nada encontrado */}
                    {filteredItems.length === 0 && filteredActions.length === 0 && (
                      <div className="text-center text-gray-400 py-8">Nenhum resultado encontrado</div>
                    )}
                  </>;
                })()}
              </div>
            </div>
          )}
          {/* Se for app, mostra as ações */}
          {selectedAppKey && selectedAppKey !== 'internal' && !selectedAction && (() => {
            const app = appList.find(a => a.key === selectedAppKey);
            if (!app) return null;
            return (
              <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col justify-start items-center ">
                <div className="w-full max-w-xl mt-4">
                  {/* <button className="mb-4 text-sm text-blue-600 underline" onClick={() => setSelectedAppKey(null)}>← Voltar</button> */}
                  <div className='flex items-center gap-2 mb-4'>
                <ArrowBigLeft size={40} strokeWidth={2}  onClick={() => setSelectedAppKey(null)} />
                <h3 className="text-lg font-bold text-gray-700">Ações de {app.name}</h3>


                </div>
                  {app.actions.map((action, idx) => (
                    <div key={action.id} className='flex flex-col gap-2'>
                      <button
                        className="w-full flex items-center py-5 px-3 hover:bg-[#e5e0ff]  rounded-lg  transition bg-[#f2f4fa]"
                        onClick={() => setSelectedAction(action)}
                      >
                        <div className="rounded-full w-8 h-8 flex items-center justify-center mr-4" style={{ background: action.color || app.color }}>
                          <IconRenderer iconName={action.icon || app.icon} className="text-white text-xl" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-bold text-base text-gray-800">{highlight(action.name, search)}</div>
                          <div className="text-xs text-gray-500 mt-1">{highlight(action.label || '', search)}</div>
                        </div>
                      </button>
                      {idx !== app.actions.length - 1 && <div className="border-b border-gray-200 ml-12" />}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          {/* Se for interno, mostra os nodes internos */}
          {selectedAppKey === 'internal' && !selectedAction && (
            <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col justify-start items-center">
              <div className="w-full max-w-xl mt-4">
                {/* <button className="mb-4 text-sm text-blue-600 underline" onClick={() => setSelectedAppKey(null)}>← Voltar</button> */}
             

                <div className='flex items-center gap-2 mb-4  '>
                <ArrowBigLeft size={40} strokeWidth={2} onClick={() => setSelectedAppKey(null)} />
                <h3 className="text-lg font-bold text-gray-700">Ações Internas</h3>

                </div>
             
                {categories.internal.actions.map((internal, idx) => (
                  <div key={internal.id} className='flex flex-col gap-2'>
                    <button
                      className="w-full flex items-center py-5 px-3 hover:bg-[#e5e0ff] transition rounded-lg bg-[#f2f4fa]"
                      onClick={() => setSelectedAction(internal)}
                    >
                      <div className="rounded-full w-8 h-8 flex items-center justify-center mr-4" style={{ background: internal.color || categories.internal.color }}>
                        <IconRenderer iconName={internal.icon || ''} className="text-white text-xl" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-base text-gray-800">{highlight(internal.name, search)}</div>
                        <div className="text-xs text-gray-500 mt-1">{highlight(internal.label || '', search)}</div>
                      </div>
                    </button>
                    {idx !== categories.internal.actions.length - 1 && <div className="border-b border-gray-200 ml-12" />}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Se selecionou ação, dispara seleção */}
          {selectedAction && (() => {
            onNodeSelect(selectedAction);
            setOpen(false);
            setSelectedAction(null);
            setSelectedAppKey(null);
            setActionConfig({});
            return null;
          })()}
        </DrawerContent>
      </Drawer>
    );
  }
);