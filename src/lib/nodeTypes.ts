export interface NodeAction {
  id: string;
  name: string;
  type: string;
  category: 'app' | 'internal';
  subcategory?: string;
  config?: Record<string, any>;
}

type AppSubcategory = 'whatsapp' | 'assistant';
type AppAction = 'send_message' | 'receive_message' | 'model' | 'memory' | 'tool';
type InternalAction = 'start' | 'delay' | 'condition';

export interface NodeTypeDefinition {
  id: string;
  name: string;
  type: string;
  category: 'app' | 'internal';
  subcategory?: string;
  config: Record<string, any>;
}

interface AppNodeTypes {
  [key: string]: {
    [key: string]: NodeTypeDefinition;
  };
}

interface InternalNodeTypes {
  [key: string]: NodeTypeDefinition;
}

export const nodeTypes: {
  app: AppNodeTypes;
  internal: InternalNodeTypes;
} = {
  app: {
    whatsapp: {
      send_message: {
        id: 'whatsapp_send_message',
        name: 'Enviar Mensagem',
        type: 'action',
        category: 'app',
        subcategory: 'whatsapp',
        config: {
          message: '',
          to: ''
        }
      },
      receive_message: {
        id: 'whatsapp_receive_message',
        name: 'Receber Mensagem',
        type: 'trigger',
        category: 'app',
        subcategory: 'whatsapp',
        config: {
          message: ''
        }
      }
    },
    assistant: {
      model: {
        id: 'assistant_model',
        name: 'Modelo',
        type: 'action',
        category: 'app',
        subcategory: 'assistant',
        config: {
          model: '',
          temperature: 0.7
        }
      },
      memory: {
        id: 'assistant_memory',
        name: 'Memória',
        type: 'action',
        category: 'app',
        subcategory: 'assistant',
        config: {
          type: 'short_term' | 'long_term'
        }
      },
      tool: {
        id: 'assistant_tool',
        name: 'Ferramenta',
        type: 'action',
        category: 'app',
        subcategory: 'assistant',
        config: {
          tool: '',
          parameters: {}
        }
      }
    }
  },
  internal: {
    start: {
      id: 'internal_start',
      name: 'Início',
      type: 'trigger',
      category: 'internal',
      config: {}
    },
    delay: {
      id: 'internal_delay',
      name: 'Atraso',
      type: 'action',
      category: 'internal',
      config: {
        duration: 0,
        unit: 'seconds'
      }
    },
    condition: {
      id: 'internal_condition',
      name: 'Condição',
      type: 'condition',
      category: 'internal',
      config: {
        condition: '',
        operator: 'equals' | 'contains' | 'greater' | 'less'
      }
    }
  }
};

interface Subcategory {
  name: string;
  actions: NodeTypeDefinition[];
}

interface Category {
  name: string;
  subcategories: {
    [key: string]: Subcategory;
  };
  actions: NodeTypeDefinition[];
}

interface Categories {
  app: Category;
  internal: Category;
}

export const getNodeCategories = (): Categories => {
  return {
    app: {
      name: 'Aplicativos',
      subcategories: {
        whatsapp: {
          name: 'WhatsApp',
          actions: Object.values(nodeTypes.app.whatsapp)
        },
        assistant: {
          name: 'Assistente Virtual',
          actions: Object.values(nodeTypes.app.assistant)
        }
      },
      actions: []
    },
    internal: {
      name: 'Interno',
      subcategories: {},
      actions: Object.values(nodeTypes.internal)
    }
  };
}; 