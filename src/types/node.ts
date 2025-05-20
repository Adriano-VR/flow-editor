import { Node as ReactFlowNode } from 'reactflow';

export type NodeType = 'action' | 'internal';
export type NodeApp = 'whatsapp' | 'instagram' | 'assistant' | 'openai' | 'conversion' | 'veo2' | 'klingai' | 'elevenlabs' | 'form' | 'klap';

// Tipos para a API
export interface NodeApiRequest {
  type: NodeType;
  app: NodeApp;
  name: string;
  label: string;
  config: {
    // WhatsApp
    to?: string;
    message?: string;
    template?: string;
    phone?: string;
    credentials?: {
      provider: string;
      appName: string;
      source: string;
      webhook: string;
      apiKey: string;
    };
    
    // OpenAI/Assistant
    model?: string;
    temperature?: number;
    prompt?: string;
    memoryType?: string;
    maxTokens?: number;
    agentName?: string;
    agentDescription?: string;
    capabilities?: string[];
    toolName?: string;
    toolDescription?: string;
    parameters?: Record<string, unknown>;
    agentId?: string;
    input?: string;
    
    // Internal
    duration?: number;
    unit?: 'seconds' | 'minutes' | 'hours';
    condition?: string;

    // Webhook
    webhook?: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      response?: Record<string, unknown>;
    };
  };
  input?: {
    variables: Array<{
      variable: string;
      value?: string;
      type?: 'string' | 'number' | 'boolean' | 'object';
      required?: boolean;
    }>;
  };
}

export interface NodeApiResponse {
  id: string;
  uuid: string;
  type: NodeType;
  app: NodeApp;
  name: string;
  label: string;
  stop: boolean;
  icon?: string;
  color?: string;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  updatedAt: string;
  config: Record<string, unknown>;
  input?: {
    variables: Array<{
      variable: string;
      value?: string;
      type?: 'string' | 'number' | 'boolean' | 'object';
      required?: boolean;
    }>;
  };
  output?: {
    text: string;
    data?: Record<string, unknown>;
    error?: string;
  };
  credentials?: {
    provider?: string;
    appName?: string;
    source?: string;
    webhook?: string;
    apiKey?: string;
    [key: string]: unknown;
  };
}

export interface NodeData {
  type: NodeType;
  app?: NodeApp;
  name: string;
  // uuid: string;
  label: string;
  stop: boolean;
  icon?: string;
  color?: string;
  input?: {
    variables: Array<{
      variable: string;
    }>;
  };
  output?: {
    text: string;
  };
  config: Record<string, unknown>;
  credentials?: {
    provider?: string;
    appName?: string;
    source?: string;
    webhook?: string;
    apiKey?: string;
    [key: string]: unknown;
  };
}

export type Node = ReactFlowNode<NodeData>;

// Tipos para operações com nodes
export interface CreateNodeRequest extends NodeApiRequest {}
export interface UpdateNodeRequest extends Partial<NodeApiRequest> {
  id: string;
}
export interface DeleteNodeRequest {
  id: string;
}
export interface GetNodeRequest {
  id: string;
}

// Respostas da API
export interface CreateNodeResponse extends NodeApiResponse {}
export interface UpdateNodeResponse extends NodeApiResponse {}
export interface GetNodeResponse extends NodeApiResponse {}
export interface DeleteNodeResponse {
  success: boolean;
  message: string;
} 