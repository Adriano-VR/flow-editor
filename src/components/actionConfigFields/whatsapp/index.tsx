import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';

export function renderWhatsAppConfigFields(selectedAction: any, actionConfig: any, setActionConfig: (cfg: any) => void) {
  switch (selectedAction.id) {
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
      );

    default:
      return null;
  }
} 