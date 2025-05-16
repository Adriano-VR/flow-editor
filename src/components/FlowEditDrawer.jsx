import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { IconRenderer } from '../lib/IconRenderer';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const FlowEditDrawer = ({
  open,
  onOpenChange,
  flowData,
  onSave,
  onDelete
}) => {
  const [name, setName] = useState(flowData?.name || '');
  const [description, setDescription] = useState(flowData?.description || '');
  const [status, setStatus] = useState(flowData?.status || 'active');

  if (!open) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild></DrawerTrigger>
      <DrawerContent className="h-full min-w-4/12 flex flex-col bg-gradient-to-br from-gray-50 to-white max-w-lg w-full sm:w-[480px]" data-vaul-drawer-direction="right">
        <div className="flex justify-between items-center px-8 pt-6 pb-2">
          <h2 className="text-2xl font-bold text-gray-800">Editar Flow</h2>
          <button
            className="text-gray-400 hover:text-gray-700 text-2xl"
            onClick={onOpenChange}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col justify-start items-center">
          <div className="w-full max-w-xl mt-4">
            <div className="space-y-6">
              <div className='bg-[#f2f4fa] p-2'>
                <Label htmlFor="flow-name" className="text-sm font-medium text-gray-700">Nome</Label>
                <Input
                  id="flow-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Digite o nome do flow"
                  className="mt-1"
                />
              </div>

              <div className='bg-[#f2f4fa] p-2 rounded-lg'>
                <Label htmlFor="flow-desc" className="text-sm font-medium text-gray-700">Descrição</Label>
                <Textarea
                  id="flow-desc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descreva o flow"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className='bg-[#f2f4fa] p-2 rounded-lg'>
                <Label htmlFor="flow-status" className="text-sm font-medium text-gray-700">Status</Label>
                <Select
                  id="flow-status"
                  value={status}
                  onValueChange={setStatus}
                  className="mt-1 w-full"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 border-t border-gray-200 bg-white">
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <IconRenderer iconName="FiTrash2" className="text-red-500 size-5" />
              Deletar
            </button>
            <button
              onClick={() => onSave({ name, description, status })}
              className="flex items-center gap-2 px-4 py-2 bg-[#6c47ff] text-white hover:bg-[#5936d6] rounded-lg transition-colors"
            >
              <IconRenderer iconName="FiSave" className="text-white size-5" />
              Salvar
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FlowEditDrawer; 