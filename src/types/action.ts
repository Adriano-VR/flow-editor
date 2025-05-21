export type AppType = 'whatsapp' | 'instagram' | 'others';
export type ActionType = 'action' | 'trigger' | 'api' | 'webhook' | 'input' | 'error' | 'condition' | 'comment' | 'database';
export type ActionCategory = 'app' | 'internal';

export interface ActionCredentials {
  provider?: string;
  appName?: string;
  source?: string;
  webhook?: string;
  apiKey?: string;
}

export interface ActionVariable {
  name: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required?: boolean;
  default?: any;
}

export interface ActionInput {
  variables: ActionVariable[];
}

export interface ActionOutput {
  text: string;
  // Add other output types as needed
}

export interface ActionConfig {
  // Base configuration
  [key: string]: any;
  
  // Common fields
  message?: string;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url?: string;
  duration?: number;
  unit?: 'seconds' | 'minutes' | 'hours';
  condition?: string;
  comment?: string;
  query?: string;
  errorMessage?: string;
}

export interface Action {
  // Base fields from your structure
  type: ActionType;
  trigger: 'internal';
  app?: AppType;
  name: string;
  uuid: string;
  label: string;
  stop: boolean;
  input: ActionInput;
  output: ActionOutput;
  config: ActionConfig;

  // Additional fields from current system
  id?: string;
  category?: ActionCategory;
  subcategory?: string;
  icon?: string;
  color?: string;
  credentials?: ActionCredentials;
  isActive?: boolean;
  isExecuting?: boolean;
} 