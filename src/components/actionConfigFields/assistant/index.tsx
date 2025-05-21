import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { AssistantConfig, AssistantModel, AssistantMemory, AssistantTool, AssistantAgent, defaultAssistantConfig } from '@/types/assistant';

interface AssistantConfigFieldsProps {
  selectedAction: {
    id: string;
    name: string;
  };
  actionConfig: {
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    config: Partial<AssistantConfig>;
    credentials?: Record<string, unknown>;
  };
  setActionConfig: (cfg: {
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    config: Partial<AssistantConfig>;
    credentials?: Record<string, unknown>;
  }) => void;
}

export function renderAssistantConfigFields({ selectedAction, actionConfig, setActionConfig }: AssistantConfigFieldsProps) {
  if (!selectedAction?.id) return null;

  const updateConfig = (updates: Partial<AssistantConfig>) => {
    setActionConfig({
      ...actionConfig,
      config: {
        ...actionConfig.config,
        ...updates
      }
    });
  };

  const currentConfig = actionConfig.config || {};

  switch (selectedAction.id) {
    case 'assistant_model':
      const currentModel = currentConfig.models?.[0] || defaultAssistantConfig.models[0];
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              type="text"
              placeholder="gpt-3.5-turbo"
              value={currentModel.model}
              onChange={e => updateConfig({
                models: [{
                  model: e.target.value,
                  temperature: currentModel.temperature
                }]
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
              value={currentModel.temperature}
              onChange={e => updateConfig({
                models: [{
                  model: currentModel.model,
                  temperature: Number(e.target.value)
                }]
              })}
            />
          </div>
        </div>
      );

    case 'assistant_memory':
      const currentMemory = currentConfig.memory || defaultAssistantConfig.memory;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxTokens">Máximo de Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              min="0"
              value={currentMemory.maxTokens}
              onChange={(e) => updateConfig({
                memory: {
                  ...currentMemory,
                  maxTokens: Number(e.target.value)
                }
              })}
              placeholder="Digite o máximo de tokens"
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
              value={currentMemory.temperature}
              onChange={(e) => updateConfig({
                memory: {
                  ...currentMemory,
                  temperature: Number(e.target.value)
                }
              })}
              placeholder="Digite a temperatura"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retentionPeriod">Período de Retenção</Label>
            <Input
              id="retentionPeriod"
              type="text"
              value={currentMemory.retentionPeriod}
              onChange={(e) => updateConfig({
                memory: {
                  ...currentMemory,
                  retentionPeriod: e.target.value
                }
              })}
              placeholder="Ex: 1d, 7d, 30d"
            />
          </div>
        </div>
      );

    case 'assistant_tool':
      const currentTool = currentConfig.tools?.[0] || { tool: '', parameters: {} };
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tool">Ferramenta</Label>
            <Input
              id="tool"
              type="text"
              placeholder="Nome da ferramenta"
              value={currentTool.tool}
              onChange={e => updateConfig({
                tools: [{
                  tool: e.target.value,
                  parameters: currentTool.parameters
                }]
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parameters">Parâmetros</Label>
            <Input
              id="parameters"
              type="text"
              placeholder="Digite os parâmetros em JSON"
              value={JSON.stringify(currentTool.parameters, null, 2)}
              onChange={e => {
                try {
                  const params = JSON.parse(e.target.value);
                  updateConfig({
                    tools: [{
                      tool: currentTool.tool,
                      parameters: params
                    }]
                  });
                } catch (err) {
                  // Ignora erros de JSON inválido
                }
              }}
            />
          </div>
        </div>
      );

    case 'assistant_create_agent':
      const currentAgent = currentConfig.agent || defaultAssistantConfig.agent!;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Agente</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nome"
              value={currentAgent.name}
              onChange={e => updateConfig({
                agent: {
                  ...currentAgent,
                  name: e.target.value
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              type="text"
              placeholder="Descrição"
              value={currentAgent.description}
              onChange={e => updateConfig({
                agent: {
                  ...currentAgent,
                  description: e.target.value
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capabilities">Capacidades (uma por linha)</Label>
            <textarea
              id="capabilities"
              className="w-full text border border-gray-600 rounded-md px-3 py-2"
              placeholder="cap1\ncap2"
              value={currentAgent.capabilities.join('\n')}
              onChange={e => updateConfig({
                agent: {
                  ...currentAgent,
                  capabilities: e.target.value.split('\n').filter(v => v.trim())
                }
              })}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
} 