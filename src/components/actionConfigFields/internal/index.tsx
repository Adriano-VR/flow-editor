import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';

export function renderInternalConfigFields(selectedAction: any, actionConfig: any, setActionConfig: (cfg: any) => void, actionDefinition: any) {
  switch (selectedAction.id) {
    case 'internal_start':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Condição de Início</Label>
            <Input
              id="condition"
              placeholder="Digite a condição de início"
              value={actionConfig.config.condition || ''}
              onChange={e => setActionConfig({ 
                ...actionConfig, 
                config: {
                  ...actionConfig.config,
                  condition: e.target.value 
                }
              })}
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
              className="w-full text border border-gray-600 rounded-md px-3 py-2"
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
              className="w-full text-black border border-gray-600 rounded-md px-3 py-2"
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
              className="w-full text border border-gray-600 rounded-md px-3 py-2"
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
              className="w-full text border border-gray-600 rounded-md px-3 py-2"
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
              className="w-full text border border-gray-600 rounded-md px-3 py-2"
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
              className="w-full text border border-gray-600 rounded-md px-3 py-2"
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

    case 'internal_error':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="errorType">Erro</Label>
            <Input
              id="erro"
              type="text"
              value={actionConfig.errorMessage || ''}
              onChange={e => setActionConfig({ ...actionConfig, errorMessage: e.target.value })}
            />
          </div>
        </div>
      );

    case 'internal_wait_response':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">Variável de Entrada</Label>
            <Input
              id="input"
              placeholder="Digite o nome da variável de entrada"
              value={actionConfig.input?.variables?.[0]?.variable || actionDefinition?.input?.variables?.[0]?.variable || ''}
              onChange={e => {
                const newValue = e.target.value;
                setActionConfig({
                  ...actionConfig,
                  input: {
                    variables: [{
                      variable: newValue
                    }]
                  }
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="output">Mensagem de Saída</Label>
            <Input
              id="output"
              placeholder="Digite a mensagem que será enviada para a API"
              value={actionConfig.output?.text || ''}
              onChange={e => {
                const inputVariable = actionConfig.input?.variables?.[0]?.variable || '';
                const newValue = e.target.value;
                setActionConfig({
                  ...actionConfig,
                  output: {
                    text: newValue,
                    variables: {
                      nome: `{{${inputVariable}}}`
                    }
                  }
                });
              }}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
} 