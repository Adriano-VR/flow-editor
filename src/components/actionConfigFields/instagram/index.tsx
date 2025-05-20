import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';

export function renderInstagramConfigFields(selectedAction: any, actionConfig: any, setActionConfig: (cfg: any) => void) {
  switch (selectedAction.id) {
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
      );

    default:
      return null;
  }
} 