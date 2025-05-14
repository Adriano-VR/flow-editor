export interface NodeAction {
  id: string;
  name: string;
  type: string;
  category: 'app' | 'internal';
  subcategory?: string;
  config?: Record<string, unknown>;
}


export interface NodeTypeDefinition {
  id: string;
  name: string;
  type: string;
  category: 'app' | 'internal';
  subcategory?: string;
  config: Record<string, unknown>;
  icon?: string;
  color: string;
  label?:string;
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
        icon: 'FaWhatsapp',
        color: '#25D366',
        config: {
          message: '',
          to: ''
        }
      },
      receive_message: {
        id: 'whatsapp_receive_message',
        name: 'Receber Mensagem',
        type: 'action',
        category: 'app',
        subcategory: 'whatsapp',
        icon: 'FaWhatsapp',
        color: '#25D366',
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
        icon: 'AiOutlineOpenAI',
        color: '#3B82F6',
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
        icon: 'MdMemory',
        color: '#3B82F6',
        config: {
        
        }
      },
      tool: {
        id: 'assistant_tool',
        name: 'Ferramenta',
        type: 'action',
        category: 'app',
        subcategory: 'assistant',
        icon: 'FaTools',
        color: '#3B82F6',
        config: {
          tool: '',
          parameters: {}
        }
      },
      create_agent: {
        id: 'assistant_create_agent',
        name: 'Criar Agente',
        type: 'action',
        category: 'app',
        subcategory: 'assistant',
        icon: 'FaRobot',
        color: '#3B82F6',
        config: {
          name: '',
          description: '',
          capabilities: []
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
      icon: 'VscDebugStart',
      color: '#EAB308',
      config: {}
    },
    delay: {
      id: 'internal_delay',
      name: 'Atraso',
      type: 'action',
      category: 'internal',
      icon: 'IoTime',
      color: '#EAB308',
      label: 'Atraso',
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
      icon: 'TbAirConditioning',
      color: '#EAB308',
      config: {
        condition: '',
      }
    },
    finish: {
      id: 'internal_finish',
      name: 'Fim',
      type: 'action',
      category: 'internal',
      icon: 'GiFinishLine',
      color: '#EAB308',
      config: {
        condition: '',
      }
    },
    comment: {
      id: 'internal_comment',
      name: 'Comentário',
      type: 'comment',
      category: 'internal',
      icon: 'FaCommentAlt',
      color: '#FACC15',
      label: 'Comentário',
      config: {
        comment: ''
      }
    },
    database: {
      id: 'internal_database',
      name: 'Banco de Dados',
      type: 'database',
      category: 'internal',
      icon: 'FaDatabase',
      color: '#2563EB',
      label: 'Banco de Dados',
      config: {
        query: ''
      }
    },
    api: {
      id: 'internal_api',
      name: 'API',
      type: 'api',
      category: 'internal',
      icon: 'FaGlobe',
      color: '#38BDF8',
      label: 'API',
      config: {
        endpoint: '',
        method: 'GET'
      }
    },
    webhook: {
      id: 'internal_webhook',
      name: 'Webhook',
      type: 'webhook',
      category: 'internal',
      icon: 'FaLink',
      color: '#A21CAF',
      label: 'Webhook',
      config: {
        url: '',
        method: 'POST'
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