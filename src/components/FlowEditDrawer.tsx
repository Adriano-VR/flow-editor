import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from './ui/drawer';
import { FiArrowLeft, FiTrash2, FiSave, FiEdit2, FiSettings, FiCheckCircle } from 'react-icons/fi';
import { Switch } from './ui/switch';
import { cn } from '@/lib/utils';
import { DialogTitle } from './ui/dialog';

interface FlowEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowData: {
    name: string;
    description?: string;
    status: string;
    data?: {
      nodes: any[];
      edges: any[];
    };
  };
  onSave: (data: { 
    name: string; 
    description: string; 
    status: string;
    data?: {
      nodes: any[];
      edges: any[];
    };
  }) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function FlowEditDrawer({
  open,
  onOpenChange,
  flowData,
  onSave,
  onDelete
}: FlowEditDrawerProps) {
  const [name, setName] = useState(flowData.name);
  const [description, setDescription] = useState(flowData.description || '');
  const [status, setStatus] = useState(flowData.status);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (open) {
      setName(flowData.name);
      setDescription(flowData.description || '');
      setStatus(flowData.status);
    }
  }, [open, flowData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({ 
        name, 
        description, 
        status,
        data: flowData.data // Mantém os dados existentes do flow
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving flow:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja deletar este flow? Esta ação não pode ser desfeita.')) {
      return;
    }
    try {
      setIsDeleting(true);
      await onDelete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting flow:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className=" fixed inset-y-0 right-0 h-[100vh] w-6/12 rounded-r-xl rounded-l-none border-l bg-white flex flex-col p-0">
        {/* Header fixo */}
        <DialogTitle></DialogTitle>
        <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <FiArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-lg">Editar Flow</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving} title="Salvar">
              <FiSave className="h-5 w-5 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting} title="Deletar">
              <FiTrash2 className="h-5 w-5 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Seções/cards */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50">
          {/* Nome */}
          <div className="rounded-xl bg-white shadow-sm px-4 py-3 flex items-center gap-4">
            <FiEdit2 className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <Label htmlFor="flow-name" className="text-xs font-medium">Nome</Label>
              <Input
                id="flow-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome do flow"
                className="mt-1 h-9 text-base bg-gray-50"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="rounded-xl bg-white shadow-sm px-4 py-3 flex items-center gap-4">
            <FiSettings className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <Label htmlFor="flow-desc" className="text-xs font-medium">Descrição</Label>
              <Textarea
                id="flow-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o flow"
                rows={2}
                className="mt-1 text-base bg-gray-50 resize-none"
              />
            </div>
          </div>

          {/* Status */}
          <div className="rounded-xl bg-white shadow-sm px-4 py-3 flex items-center gap-4">
            <FiCheckCircle className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <Label htmlFor="flow-status" className="text-xs font-medium">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1 h-9 text-base bg-gray-50">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

         
        </div>

        {/* Rodapé com botões grandes */}
        <DrawerFooter className="bg-white border-t p-4 flex flex-col gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
          >
            <FiSave className="h-5 w-5" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
          >
            <FiTrash2 className="h-5 w-5" />
            {isDeleting ? 'Deletando...' : 'Deletar Flow'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
} 