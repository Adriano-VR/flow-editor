// Tipos específicos para o assistente
export interface AssistantModel {
  model: string;
  temperature: number;
}

export interface AssistantMemory {
  maxTokens: number;
  temperature: number;
  retentionPeriod: string;
}

export interface AssistantTool {
  tool: string;
  parameters: Record<string, unknown>;
}

export interface AssistantAgent {
  name: string;
  description: string;
  capabilities: string[];
  model?: string;
  temperature?: number;
}

// Tipo unificado para configuração do assistente
export interface AssistantConfig {
  models: AssistantModel[];
  memory: AssistantMemory;
  tools: AssistantTool[];
  instructions: string;
  agent?: AssistantAgent;
}

// Tipo para os nodes do assistente
export interface AssistantNodeConfig {
  type: 'assistant_model' | 'assistant_memory' | 'assistant_tool' | 'assistant_create_agent';
  config: Partial<AssistantConfig>;
}

// Valores padrão para configuração do assistente
export const defaultAssistantConfig: AssistantConfig = {
  models: [{
    model: 'gpt-3.5-turbo',
    temperature: 0.7
  }],
  memory: {
    maxTokens: 0,
    temperature: 0,
    retentionPeriod: '1d'
  },
  tools: [],
  instructions: '',
  agent: {
    name: '',
    description: '',
    capabilities: []
  }
}; 