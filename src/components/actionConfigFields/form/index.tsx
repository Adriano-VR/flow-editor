import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from "../../ui/textarea";

export function renderFormConfigFields(selectedAction: any, actionConfig: any, setActionConfig: (cfg: any) => void) {
  switch (selectedAction.id) {
    case 'start_form':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Formulário</Label>
            <Input
              id="title"
              value={actionConfig.title || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, title: e.target.value })}
              placeholder="Digite o título do formulário"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={actionConfig.description || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, description: e.target.value })}
              placeholder="Digite uma descrição para o formulário"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submit_button_text">Texto do Botão de Envio</Label>
            <Input
              id="submit_button_text"
              value={actionConfig.submit_button_text || 'Enviar'}
              onChange={(e) => setActionConfig({ ...actionConfig, submit_button_text: e.target.value })}
              placeholder="Digite o texto do botão"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success_message">Mensagem de Sucesso</Label>
            <Textarea
              id="success_message"
              value={actionConfig.success_message || 'Formulário enviado com sucesso!'}
              onChange={(e) => setActionConfig({ ...actionConfig, success_message: e.target.value })}
              placeholder="Digite a mensagem de sucesso"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="redirect_url">URL de Redirecionamento</Label>
            <Input
              id="redirect_url"
              type="url"
              value={actionConfig.redirect_url || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, redirect_url: e.target.value })}
              placeholder="https://exemplo.com/obrigado"
            />
            <p className="text-sm text-gray-500">URL para redirecionar após o envio do formulário</p>
          </div>
        </div>
      );

    case 'form_text_input':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Rótulo</Label>
            <Input
              id="label"
              value={actionConfig.label || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, label: e.target.value })}
              placeholder="Digite o rótulo do campo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={actionConfig.placeholder || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, placeholder: e.target.value })}
              placeholder="Digite o texto de placeholder"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required"
                checked={actionConfig.required || false}
                onChange={(e) => setActionConfig({ ...actionConfig, required: e.target.checked })}
                className="rounded border-gray-600"
              />
              <Label htmlFor="required">Campo Obrigatório</Label>
            </div>
          </div>
        </div>
      );

    case 'form_number_input':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Rótulo</Label>
            <Input
              id="label"
              value={actionConfig.label || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, label: e.target.value })}
              placeholder="Digite o rótulo do campo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min">Valor Mínimo</Label>
            <Input
              id="min"
              type="number"
              value={actionConfig.min || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, min: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Digite o valor mínimo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max">Valor Máximo</Label>
            <Input
              id="max"
              type="number"
              value={actionConfig.max || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, max: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Digite o valor máximo"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required"
                checked={actionConfig.required || false}
                onChange={(e) => setActionConfig({ ...actionConfig, required: e.target.checked })}
                className="rounded border-gray-600"
              />
              <Label htmlFor="required">Campo Obrigatório</Label>
            </div>
          </div>
        </div>
      );

    case 'form_checkbox':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Rótulo</Label>
            <Input
              id="label"
              value={actionConfig.label || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, label: e.target.value })}
              placeholder="Digite o rótulo do checkbox"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="default"
                checked={actionConfig.default || false}
                onChange={(e) => setActionConfig({ ...actionConfig, default: e.target.checked })}
                className="rounded border-gray-600"
              />
              <Label htmlFor="default">Marcado por Padrão</Label>
            </div>
          </div>
        </div>
      );

    case 'form_date_input':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Rótulo</Label>
            <Input
              id="label"
              value={actionConfig.label || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, label: e.target.value })}
              placeholder="Digite o rótulo do campo de data"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min_date">Data Mínima</Label>
            <Input
              id="min_date"
              type="date"
              value={actionConfig.min_date || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, min_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_date">Data Máxima</Label>
            <Input
              id="max_date"
              type="date"
              value={actionConfig.max_date || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, max_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required"
                checked={actionConfig.required || false}
                onChange={(e) => setActionConfig({ ...actionConfig, required: e.target.checked })}
                className="rounded border-gray-600"
              />
              <Label htmlFor="required">Campo Obrigatório</Label>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
} 