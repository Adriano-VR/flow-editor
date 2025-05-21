import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';

export function renderWhatsAppConfigFields(selectedAction: any, actionConfig: any, setActionConfig: (cfg: any) => void) {
  // Função auxiliar para atualizar as credenciais
  const updateCredentials = (field: string, value: string) => {
    // Pega as credenciais atuais do nível raiz
    const currentCredentials = actionConfig.credentials || {};
    
    // Remove credenciais do config se existirem
    const { credentials: _credentials, ...configWithoutCredentials } = actionConfig.config || {};
    
    // Atualiza apenas as credenciais no nível raiz
    setActionConfig({
      ...actionConfig,
      config: configWithoutCredentials, // Config sem credenciais
      credentials: {
        ...currentCredentials,
        [field]: value
      }
    });
  };

  // Função auxiliar para atualizar a configuração
  const updateConfig = (field: string, value: string) => {
    // Remove credenciais do config ao atualizar
    const { credentials: _credentials, ...configWithoutCredentials } = actionConfig.config || {};
    
    setActionConfig({
      ...actionConfig,
      config: {
        ...configWithoutCredentials,
        [field]: value,
        type: selectedAction.id.split('_').pop() || 'text'
      }
    });
  };

  switch (selectedAction.id) {
    case 'whatsapp_send_message_text':
    case 'whatsapp_send_message_image':
    case 'whatsapp_send_message_video':
      // Extrai as credenciais do nível raiz
      const credentials = actionConfig.credentials || {};
      // Remove credenciais do config se existirem
      const { credentials: _credentials, ...config } = actionConfig.config || {};
      console.log('credentials', credentials);
      
      return (
        <div className="space-y-4">
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-medium">Credenciais do WhatsApp</h3>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                placeholder="Nome do provider (ex: Twilio, MessageBird)"
                value={credentials.provider || ''}
                onChange={e => updateCredentials('provider', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appName">Nome do App</Label>
              <Input
                id="appName"
                placeholder="Nome da aplicação"
                value={credentials.appName || ''}
                onChange={e => updateCredentials('appName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Número do WhatsApp</Label>
              <Input
                id="source"
                placeholder="+55 (00) 00000-0000"
                value={credentials.source || ''}
                onChange={e => updateCredentials('source', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook">Webhook URL</Label>
              <Input
                id="webhook"
                placeholder="https://..."
                value={credentials.webhook || ''}
                onChange={e => updateCredentials('webhook', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Sua API Key"
                value={credentials.apiKey || ''}
                onChange={e => updateCredentials('apiKey', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to">Número do Destinatário</Label>
            <Input
              id="to"
              placeholder="+55 (00) 00000-0000"
              value={config.to || ''}
              onChange={e => updateConfig('to', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Input
              id="message"
              placeholder="Digite sua mensagem"
              value={config.message || ''}
              onChange={e => updateConfig('message', e.target.value)}
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
              value={actionConfig.config?.message || ''}
              onChange={e => updateConfig('message', e.target.value)}
            />
          </div>
        </div>
      );

    case 'whatsapp_quick_reply':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Input
              id="message"
              placeholder="Digite sua mensagem"
              value={actionConfig.config?.message || ''}
              onChange={e => updateConfig('message', e.target.value)}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
} 