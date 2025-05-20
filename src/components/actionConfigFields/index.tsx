import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { renderWhatsAppConfigFields } from './whatsapp';
import { renderInstagramConfigFields } from './instagram';
import { renderAssistantConfigFields } from './assistant';
import { renderFormConfigFields } from './form';
import { renderInternalConfigFields } from './internal';

// Utilitário para sobrescrever campos especiais
const fieldOverrides: Record<string, (value: any, onChange: (v: any) => void) => React.ReactNode> = {
  // Exemplo: campo 'message' como textarea
  // message: (value, onChange) => (
  //   <textarea value={value} onChange={e => onChange(e.target.value)} />
  // ),
};

// Função para renderizar campos dinamicamente
export function renderDynamicConfigFields(
  configTemplate: Record<string, any>,
  configState: Record<string, any>,
  setConfigState: (cfg: any) => void
) {
  if (!configTemplate) return null;
  return (
    <div className="space-y-4">
      {Object.entries(configTemplate).map(([key, defaultValue]) => {
        // Se houver override, usa ele
        if (fieldOverrides[key]) {
          return (
            <div className="space-y-2" key={key}>
              <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
              {fieldOverrides[key](configState[key] ?? defaultValue, (v: any) => setConfigState({ ...configState, [key]: v }))}
            </div>
          );
        }
        // Tipo number
        if (typeof defaultValue === 'number') {
          return (
            <div className="space-y-2" key={key}>
              <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
              <Input
                id={key}
                type="number"
                value={configState[key] ?? defaultValue}
                onChange={e => setConfigState({ ...configState, [key]: Number(e.target.value) })}
              />
            </div>
          );
        }
        // Tipo string
        return (
          <div className="space-y-2" key={key}>
            <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
            <Input
              id={key}
              type="text"
              value={configState[key] ?? defaultValue}
              onChange={e => setConfigState({ ...configState, [key]: e.target.value })}
            />
          </div>
        );
      })}
    </div>
  );
}

// Função principal para renderizar campos de configuração de ação
export function renderActionConfigFields(selectedAction: any, actionConfig: any, setActionConfig: (cfg: any) => void) {
  if (!selectedAction) return null;

  // Determina qual app está sendo usado baseado no ID da ação
  const appType = selectedAction.id.split('_')[0];

  // Renderiza campos específicos para cada tipo de app
  switch (appType) {
    case 'whatsapp':
      return renderWhatsAppConfigFields(selectedAction, actionConfig, setActionConfig);
    
    case 'instagram':
      return renderInstagramConfigFields(selectedAction, actionConfig, setActionConfig);
    
    case 'assistant':
      return renderAssistantConfigFields(selectedAction, actionConfig, setActionConfig);
    
    case 'form':
      return renderFormConfigFields(selectedAction, actionConfig, setActionConfig);
    
    case 'internal':
      return renderInternalConfigFields(selectedAction, actionConfig, setActionConfig);

    case 'ai':
      if (selectedAction.id === 'ai_video_to_text') {
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="output">Formato de Saida </Label>
              <select
                id="outout"
                className="w-full text border border-gray-600 rounded-md px-3 py-2"
                value={actionConfig.output || 'string'}
                onChange={e => setActionConfig({ ...actionConfig, output: e.target.value })}
              >
                <option value="string">String</option>
                <option value="json">Json</option>
                <option value="xlm">Xlm</option>
              </select>
            </div>
          </div>
        );
      }
      return null;

    case 'klap':
      if (selectedAction.id === 'klap_url_input') {
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://www.google.com"
                value={actionConfig.url || ''}
                onChange={e => setActionConfig({ ...actionConfig, url: e.target.value })}
              />
            </div>
          </div>
        );
      }
      return null;

    default:
      return (
        <Alert className="mb-6 bg-red-50 text-red-500 border-red-200 dark:bg-blue-900/20 dark:text-red-300 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Não é possível configurar este tipo de ação
          </AlertDescription>
        </Alert>
      );
  }
} 