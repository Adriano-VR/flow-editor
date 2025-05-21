import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';

export function renderAssistantConfigFields(selectedAction: any, actionConfig: any, setActionConfig: (cfg: any) => void) {
  switch (selectedAction.id) {
    case 'assistant_model':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              placeholder="gpt-3.5-turbo"
              value={actionConfig.config?.model || ''}
              onChange={e => setActionConfig({ 
                ...actionConfig, 
                config: {
                  ...actionConfig.config,
                  model: e.target.value 
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperatura</Label>
            <Input
              id="temperature"
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={actionConfig.config?.temperature || 0.7}
              onChange={e => setActionConfig({ 
                ...actionConfig, 
                config: {
                  ...actionConfig.config,
                  temperature: Number(e.target.value) 
                }
              })}
            />
          </div>
        </div>
      );

    case 'assistant_tool':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tool">Ferramenta</Label>
            <Input
              id="tool"
              placeholder="Nome da ferramenta"
              value={actionConfig.tool || ''}
              onChange={e => setActionConfig({ ...actionConfig, tool: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parameters">Parâmetros</Label>
            <Input
              id="parameters"
              placeholder="Digite os parâmetros"
              value={typeof actionConfig.parameters === 'object' ? JSON.stringify(actionConfig.parameters) : (actionConfig.parameters || '')}
              onChange={e => setActionConfig({ ...actionConfig, parameters: e.target.value })}
            />
          </div>
        </div>
      );

    case 'assistant_create_agent':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Agente</Label>
            <Input
              id="name"
              placeholder="Nome"
              value={actionConfig.name || ''}
              onChange={e => setActionConfig({ ...actionConfig, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Descrição"
              value={actionConfig.description || ''}
              onChange={e => setActionConfig({ ...actionConfig, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capabilities">Capacidades (uma por linha)</Label>
            <textarea
              id="capabilities"
              className="w-full text border border-gray-600 rounded-md px-3 py-2"
              placeholder="cap1\ncap2"
              value={Array.isArray(actionConfig.capabilities) ? actionConfig.capabilities.join('\n') : ''}
              onChange={e => setActionConfig({ ...actionConfig, capabilities: e.target.value.split('\n').filter(v => v.trim()) })}
            />
          </div>
        </div>
      );

    case 'assistant_memory':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxTokens">Máximo de Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              value={actionConfig.maxTokens || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, maxTokens: Number(e.target.value) })}
              placeholder="Digite o máximo de tokens"
            />

            <Label htmlFor="temperature">Temperatura</Label>
            <Input
              id="temperature"
              type="number"
              value={actionConfig.temperature || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, temperature: Number(e.target.value) })}
              placeholder="Digite a temperatura"
            />
          </div>
        </div>
      );

    default:
      return null;
  }
} 