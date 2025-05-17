import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { MessageSquareWarning } from 'lucide-react';

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

  // Função auxiliar para renderizar campos dinâmicos baseados no config template
  const renderDynamicFields = (configTemplate: Record<string, any>) => {
    if (!configTemplate) return null;
    return (
      <div className="space-y-4">
        {Object.entries(configTemplate).map(([key, defaultValue]) => {
          // Determina o tipo de campo baseado no valor padrão
          const fieldType = typeof defaultValue;
          
          // Renderiza campos especiais
          if (Array.isArray(defaultValue)) {
            return (
              <div className="space-y-2" key={key}>
                <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                <textarea
                  id={key}
                  className="w-full bg-[#2d3748] text-white border border-gray-600 rounded-md px-3 py-2"
                  placeholder={`Digite ${key} (um por linha)`}
                  value={Array.isArray(actionConfig[key]) ? actionConfig[key].join('\n') : ''}
                  onChange={e => setActionConfig({ ...actionConfig, [key]: e.target.value.split('\n').filter(v => v.trim()) })}
                />
              </div>
            );
          }

          // Renderiza campos baseados no tipo
          switch (fieldType) {
            case 'number':
              return (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                  <Input
                    id={key}
                    type="number"
                    value={actionConfig[key] ?? defaultValue}
                    onChange={e => setActionConfig({ ...actionConfig, [key]: Number(e.target.value) })}
                  />
                </div>
              );
            case 'boolean':
              return (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={key}
                      checked={actionConfig[key] ?? defaultValue}
                      onChange={e => setActionConfig({ ...actionConfig, [key]: e.target.checked })}
                      className="rounded border-gray-600 bg-[#2d3748] text-green-500 focus:ring-green-500"
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Label>
                </div>
              );
            case 'object':
              return (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                  <textarea
                    id={key}
                    className="w-full bg-[#2d3748] text-white border border-gray-600 rounded-md px-3 py-2"
                    placeholder="{}"
                    value={typeof actionConfig[key] === 'string' ? actionConfig[key] : JSON.stringify(actionConfig[key] || defaultValue, null, 2)}
                    onChange={e => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setActionConfig({ ...actionConfig, [key]: parsed });
                      } catch {
                        setActionConfig({ ...actionConfig, [key]: e.target.value });
                      }
                    }}
                  />
                </div>
              );
            default:
              return (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                  <Input
                    id={key}
                    type="text"
                    value={actionConfig[key] ?? defaultValue}
                    onChange={e => setActionConfig({ ...actionConfig, [key]: e.target.value })}
                  />
                </div>
              );
          }
        })}
      </div>
    );
  };

  // Renderiza campos específicos para cada tipo de ação
  switch (selectedAction.id) {
    // WhatsApp Actions
    case 'whatsapp_send_message_text':
    case 'whatsapp_send_message_image':
    case 'whatsapp_send_message_video':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to">Número do WhatsApp</Label>
            <Input
              id="to"
              placeholder="+55 (00) 00000-0000"
              value={actionConfig.to || ''}
              onChange={e => setActionConfig({ ...actionConfig, to: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Input
              id="message"
              placeholder="Digite sua mensagem"
              value={actionConfig.message || ''}
              onChange={e => setActionConfig({ ...actionConfig, message: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Input
              id="type"
              value={selectedAction.id.split('_').pop() || 'text'}
              disabled
              className="bg-gray-700"
            />
          </div>
        </div>
      );

    case 'whatsapp_receive_message':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem Recebida</Label>
            <Input
              id="message"
              placeholder="Mensagem recebida"
              value={actionConfig.message || ''}
              onChange={e => setActionConfig({ ...actionConfig, message: e.target.value })}
            />
          </div>
        </div>
      );

    // Assistant Actions
    case 'assistant_model':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              placeholder="gpt-3.5-turbo"
              value={actionConfig.model || ''}
              onChange={e => setActionConfig({ ...actionConfig, model: e.target.value })}
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
              value={actionConfig.temperature || 0.7}
              onChange={e => setActionConfig({ ...actionConfig, temperature: Number(e.target.value) })}
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
            <textarea
              id="parameters"
              className="w-full bg-[#2d3748] text-white border border-gray-600 rounded-md px-3 py-2"
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
              className="w-full bg-[#2d3748] text-white border border-gray-600 rounded-md px-3 py-2"
              placeholder="cap1\ncap2"
              value={Array.isArray(actionConfig.capabilities) ? actionConfig.capabilities.join('\n') : ''}
              onChange={e => setActionConfig({ ...actionConfig, capabilities: e.target.value.split('\n').filter(v => v.trim()) })}
            />
          </div>
        </div>
      );

    // Internal Actions
    case 'internal_start':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Condição de Início</Label>
            <textarea
              id="condition"
              className="w-full bg-[#2d3748] text-white border border-gray-600 rounded-md px-3 py-2"
              placeholder="Digite a condição de início"
              value={actionConfig.condition || ''}
              onChange={e => setActionConfig({ ...actionConfig, condition: e.target.value })}
            />
          </div>
        </div>
      );

    case 'internal_delay':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duração</Label>
            <Input
              id="duration"
              type="number"
              min="0"
              value={actionConfig.duration || 0}
              onChange={e => setActionConfig({ ...actionConfig, duration: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unidade</Label>
            <select
              id="unit"
              className="w-full bg-[#2d3748] text-white border border-gray-600 rounded-md px-3 py-2"
              value={actionConfig.unit || 'seconds'}
              onChange={e => setActionConfig({ ...actionConfig, unit: e.target.value })}
            >
              <option value="seconds">Segundos</option>
              <option value="minutes">Minutos</option>
              <option value="hours">Horas</option>
            </select>
          </div>
        </div>
      );

    case 'internal_condition':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Condição</Label>
            <textarea
              id="condition"
              className="w-full bg-[#2d3748] text-white border border-gray-600 rounded-md px-3 py-2"
              placeholder="Digite a condição"
              value={actionConfig.condition || ''}
              onChange={e => setActionConfig({ ...actionConfig, condition: e.target.value })}
            />
          </div>
        </div>
      );

    case 'internal_comment':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Comentário</Label>
            <textarea
              id="comment"
              className="w-full bg-[#2d3748] text-white border border-gray-600 rounded-md px-3 py-2"
              placeholder="Digite seu comentário"
              value={actionConfig.comment || ''}
              onChange={e => setActionConfig({ ...actionConfig, comment: e.target.value })}
            />
          </div>
        </div>
      );

    case 'internal_database':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Query SQL</Label>
            <textarea
              id="query"
              className="w-full bg-[#2d3748] text-white border border-gray-600 rounded-md px-3 py-2"
              placeholder="Digite a query SQL"
              value={actionConfig.query || ''}
              onChange={e => setActionConfig({ ...actionConfig, query: e.target.value })}
            />
          </div>
        </div>
      );

    case 'internal_api':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint</Label>
            <Input
              id="endpoint"
              placeholder="https://api.exemplo.com/endpoint"
              value={actionConfig.endpoint || ''}
              onChange={e => setActionConfig({ ...actionConfig, endpoint: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="method">Método</Label>
            <select
              id="method"
              className="w-full bg-[#2d3748] text-white border border-gray-600 rounded-md px-3 py-2"
              value={actionConfig.method || 'GET'}
              onChange={e => setActionConfig({ ...actionConfig, method: e.target.value })}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
        </div>
      );

    case 'internal_webhook':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://webhook.site/unique-url"
              value={actionConfig.url || ''}
              onChange={e => setActionConfig({ ...actionConfig, url: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="method">Método</Label>
            <select
              id="method"
              className="w-full bg-[#2d3748] text-white border border-gray-600 rounded-md px-3 py-2"
              value={actionConfig.method || 'POST'}
              onChange={e => setActionConfig({ ...actionConfig, method: e.target.value })}
            >
              <option value="POST">POST</option>
              <option value="GET">GET</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
        </div>
      );

    // Form Actions
    case 'form_text_input':
    case 'form_number_input':
    case 'form_checkbox':
    case 'form_date_input':
      return renderDynamicFields(selectedAction.config?.fields || {});

    // Para todos os outros tipos de ação, usa o renderDynamicFields
    default:
      // return renderDynamicFields(selectedAction.config || {});
      return (
        <div className="space-y-4 flex flex-col items-center gap-2">
          <MessageSquareWarning size={50} />
          <span>
            Nao E possivel configurar este tipo de ação
          </span>
          </div>
      )
  }
} 