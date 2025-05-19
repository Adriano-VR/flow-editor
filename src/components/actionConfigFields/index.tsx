import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

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


      case 'instagram_send_message':  
        return (
          <div className="space-y-4">
            <div className="space-y-2">

            <Label htmlFor="insta_to">Conta Instagram</Label>
              <Input
              id="insta_mensagem"
              placeholder="@insta"
              value={actionConfig.to || ''}
              onChange={e => setActionConfig({ ...actionConfig, to: e.target.value })}
            />


              <Label htmlFor="insta_mensagem">Mensagem</Label>
              <Input
              id="insta_mensagem"
              placeholder="Mensagem"
              value={actionConfig.message || ''}
              onChange={e => setActionConfig({ ...actionConfig, message: e.target.value })}
            />
            </div>
          </div>
        )

        case 'klap_url_input' :	
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
        )


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

      case 'internal_error' : 
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="errorType">Erro</Label>
              <Input
              id="erro"
              type="text"
              value={actionConfig.errorMessage || 0.7}
              onChange={e => setActionConfig({ ...actionConfig, errorMessage: e.target.value })}
            />
            </div>
          </div>
        )

        case'ai_video_to_text':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="output">Formato de Saida </Label>
              <select
              id="outout"
              className="w-full  text border border-gray-600 rounded-md px-3 py-2"
              value={actionConfig.output || 'string'}
              onChange={e => setActionConfig({ ...actionConfig, output: e.target.value })}
            >
              <option value="string">String</option>
              <option value="json">Json</option>
              <option value="xlm">Xlm</option>
            </select>
            </div>
          </div>
        )
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
              className="w-full  text border border-gray-600 rounded-md px-3 py-2"
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
            <Input
              id="condition"
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
              className="w-full  text border border-gray-600 rounded-md px-3 py-2"
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
              className="w-full  text-black border border-gray-600 rounded-md px-3 py-2"
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
              className="w-full  text border border-gray-600 rounded-md px-3 py-2"
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
              className="w-full  text border border-gray-600 rounded-md px-3 py-2"
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
              className="w-full  text border border-gray-600 rounded-md px-3 py-2"
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
              className="w-full  text border border-gray-600 rounded-md px-3 py-2"
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

    case 'whatsapp_quick_reply':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Input
              id="url"
              placeholder="mensagem aqui"
            
            />
          </div>
        </div>
      )

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
      )

    // Form Actions
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


      case 'internal_condition':  
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Condição</Label>
            </div>
          </div>
        )


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

    // Para todos os outros tipos de ação, usa o renderDynamicFields
    default:
      return (
        <Alert className="mb-6 bg-red-50 text-red-500 border-red-200 dark:bg-blue-900/20 dark:text-red-300 dark:border-red-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
         Não é possível configurar este tipo de ação
        </AlertDescription>
      </Alert>
      )
  }
} 