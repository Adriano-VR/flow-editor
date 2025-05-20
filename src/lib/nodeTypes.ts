export interface NodeAction {
  uuid: string;
  name: string;
  type: 'app' | 'trigger';
  subcategory?: string;
  config?: Record<string, unknown>;
}

export interface NodeVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value?: unknown;
}

export interface NodeIO {
  variables: {
    nome: string;
  };
  text?: string;
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
  label?: string;
  input?: NodeIO;
  output?: NodeIO;
}

// Defina arrays de actions para cada subcategoria
const whatsappActions: NodeTypeDefinition[] = [
  {
    id: 'whatsapp_send_message_text',
    name: 'Enviar Mensagem (Texto)',
    type: 'action',
    category: 'app',
    subcategory: 'whatsapp',
    icon: 'FaWhatsapp',
    color: '#25D366',
    label: 'Enviar Mensagem',
    config: {
      message: '',
      to: '4144448585',
      type: 'text'
    } ,
    input: {
      variables: {
        nome: 'message'
      }
    },
    output: {
      variables: {
        nome: ''
      },
      text: ''
    },

  },
  {
    id: 'whatsapp_send_message_image',
    name: 'Enviar Mensagem (Imagem)',
    type: 'action',
    category: 'app',
    subcategory: 'whatsapp',
    icon: 'FaWhatsapp',
    color: '#25D366',
    label: 'Enviar Imagem',
    config: {
      message: '',
      to: '',
      type: 'image'
    }
  },
  {
    id: 'whatsapp_send_message_video',
    name: 'Enviar Mensagem (Vídeo)',
    type: 'action',
    category: 'app',
    subcategory: 'whatsapp',
    icon: 'FaWhatsapp',
    color: '#25D366',
    label: 'Enviar Vídeo',
    config: {
      message: '',
      to: '',
      type: 'video'
    }
  },
  {
    id: 'whatsapp_quick_reply',
    name: 'Quick Reply',
    type: 'action',
    category: 'app',
    subcategory: 'whatsapp',
    icon: 'FaWhatsapp',
    color: '#25D366',
    label: 'Resposta Rápida',
    config: {}
  },
  {
    id: 'whatsapp_list',
    name: 'List',
    type: 'action',
    category: 'app',
    subcategory: 'whatsapp',
    icon: 'FaWhatsapp',
    color: '#25D366',
    label: 'Lista de Opções',
    config: {}
  },
  {
    id: 'whatsapp_receive_message',
    name: 'Receber Mensagem',
    type: 'action',
    category: 'app',
    subcategory: 'whatsapp',
    icon: 'FaWhatsapp',
    color: '#25D366',
    label: 'Receber Mensagem',
    config: {
      message: ''
    }
  }
];

const assistantActions: NodeTypeDefinition[] = [
  {
    id: 'assistant_model',
    name: 'Modelo',
    type: 'action',
    category: 'app',
    subcategory: 'assistant',
    icon: 'MdAssistant',
    color: '#3B82F6',
    label: 'Configurar Modelo',
    config: {
      model: '',
      temperature: 0.7
    }
  },
  {
    id: 'assistant_memory',
    name: 'Memória',
    type: 'action',
    category: 'app',
    subcategory: 'assistant',
    icon: 'MdMemory',
    color: '#3B82F6',
    label: 'Configurar Memória',
    config: {
      "maxTokens": 0,
      "temperature": 0,
      "retentionPeriod": "1d",
    }
  },
  {
    id: 'assistant_tool',
    name: 'Ferramenta',
    type: 'action',
    category: 'app',
    subcategory: 'assistant',
    icon: 'FaTools',
    color: '#3B82F6',
    label: 'Adicionar Ferramenta',
    config: {
      tool: '',
      parameters: {}
    }
  },
  {
    id: 'assistant_create_agent',
    name: 'Criar Agente',
    type: 'action',
    category: 'app',
    subcategory: 'assistant',
    icon: 'FaRobot',
    color: '#3B82F6',
    label: 'Criar Novo Agente',
    config: {
      name: '',
      description: '',
      capabilities: []
    }
  }
];

const openaiActions: NodeTypeDefinition[] = [
  {
    id: 'openai_assistant',
    name: 'Assistente',
    type: 'action',
    category: 'app',
    subcategory: 'openai',
    icon: 'AiOutlineOpenAI',
    color: '#10A37F',
    label: 'Assistente OpenAI',
    config: {}
  },
  {
    id: 'openai_tts',
    name: 'TTS',
    type: 'action',
    category: 'app',
    subcategory: 'openai',
    icon: 'AiOutlineOpenAI',
    color: '#10A37F',
    label: 'Texto para Fala',
    config: {}
  },
  {
    id: 'openai_gpt_image_1',
    name: 'gpt-image-1',
    type: 'action',
    category: 'app',
    subcategory: 'openai',
    icon: 'AiOutlineOpenAI',
    color: '#10A37F',
    label: 'Gerar Imagem',
    config: {}
  },
  {
    id: 'openai_gpt_4o',
    name: 'gpt-4o',
    type: 'action',
    category: 'app',
    subcategory: 'openai',
    icon: 'AiOutlineOpenAI',
    color: '#10A37F',
    label: 'GPT-4 Vision',
    config: {}
  }
];

const instagramActions: NodeTypeDefinition[] = [
  {
    id: 'instagram_send_message',
    name: 'Enviar Mensagem',
    type: 'action',
    category: 'app',
    subcategory: 'instagram',
    icon: 'FaInstagram',
    color: '#E1306C',
    label: 'Criar Post',
    config: {
      'to':undefined,
       "type": "text",
      "message": undefined
    }
  },
  {
    id: 'instagram_dm',
    name: 'DM',
    type: 'action',
    category: 'app',
    subcategory: 'instagram',
    icon: 'FaInstagram',
    color: '#E1306C',
    label: 'Enviar Mensagem',
    config: {}
  },
  {
    id: 'instagram_question',
    name: 'Pergunta',
    type: 'action',
    category: 'app',
    subcategory: 'instagram',
    icon: 'FaInstagram',
    color: '#E1306C',
    label: 'Adicionar Pergunta',
    config: {}
  },
  {
    id: 'instagram_quick_reply',
    name: 'Quick Reply',
    type: 'action',
    category: 'app',
    subcategory: 'instagram',
    icon: 'FaInstagram',
    color: '#E1306C',
    label: 'Resposta Rápida',
    config: {}
  }
];

const conversionActions: NodeTypeDefinition[] = [
  {
    id: 'ai_text_to_text',
    name: 'AI Text-to-Text',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'SiConvertio',
    color: '#6366F1',
    label: 'Converter Texto',
    config: {}
  },
  {
    id: 'ai_text_to_video',
    name: 'Text-to-Video',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'SiConvertio',
    color: '#6366F1',
    label: 'Texto para Vídeo',
    config: {}
  },
  {
    id: 'ai_text_to_image',
    name: 'Text-to-Image',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'SiConvertio',
    color: '#6366F1',
    label: 'Texto para Imagem',
    config: {}
  },
  {
    id: 'ai_image_to_video',
    name: 'Image-to-Video',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'SiConvertio',
    color: '#6366F1',
    label: 'Imagem para Vídeo',
    config: {}
  },
  {
    id: 'ai_text_to_audio',
    name: 'Text-to-Audio',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'SiConvertio',
    color: '#6366F1',
    label: 'Texto para Áudio',
    config: {}
  },
  {
    id: 'ai_video_to_text',
    name: 'Video-to-Text',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'SiConvertio',
    color: '#6366F1',
    label: 'Vídeo para Texto',
    config: { 
      output:'string'
    }
  },
  {
    id: 'ai_video_to_audio',
    name: 'Video-to-Audio',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'SiConvertio',
    color: '#6366F1',
    label: 'Vídeo para Áudio',
    config: {}
  },
  {
    id: 'ai_audio_to_text',
    name: 'Audio-to-Text',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'SiConvertio',
    color: '#6366F1',
    label: 'Áudio para Texto',
    config: {}
  }
];

const veo2Actions: NodeTypeDefinition[] = [
  {
    id: 'veo2_generate_video',
    name: 'Gerar Vídeo',
    type: 'action',
    category: 'app',
    subcategory: 'veo2',
    icon: 'AiOutlineGoogle',
    color: '#0EA5E9',
    label: 'Criar Vídeo',
    config: {}
  }
];

const klingaiActions: NodeTypeDefinition[] = [
  {
    id: 'klingai_generate_voice',
    name: 'Gerar Voz',
    type: 'action',
    category: 'app',
    subcategory: 'klingai',
    icon: 'RiSparkling2Line',
    color: '#A21CAF',
    label: 'Sintetizar Voz',
    config: {}
  }
];

const elevenlabsActions: NodeTypeDefinition[] = [
  {
    id: 'elevenlabs_tts',
    name: 'Text-to-Speech',
    type: 'action',
    category: 'app',
    subcategory: 'elevenlabs',
    icon: 'SiElevenlabs',
    color: '#F59E42',
    label: 'Converter para Fala',
    config: {}
  }
];

const klapActions: NodeTypeDefinition[] = [
  {
    id: 'klap_url_input',
    name: 'Input URL',
    type: 'input',
    category: 'app',
    subcategory: 'klap',
    icon: 'CiLink',
    color: '#E1306C',
    label: 'URL do Vídeo',
    config: {
      url: ''
    }
  },
  {
    id: 'klap_create_cut',
    name: 'Criar Corte',
    type: 'action',
    category: 'app',
    subcategory: 'klap',
    icon: 'MdOndemandVideo',
    color: '#E1306C',
    label: 'Criar Corte de Vídeo',
    config: {
      url: '',
      options: {
        format: 'vertical',
        duration: '30s',
        quality: 'high'
      }
    }
  },
  {
    id: 'klap_process_url',
    name: 'Processar URL',
    type: 'action',
    category: 'app',
    subcategory: 'klap',
    icon: 'MdOndemandVideo',
    color: '#E1306C',
    label: 'Processar URL do Vídeo',
    config: {
    
    }
  },
  {
    id: 'klap_download',
    name: 'Download',
    type: 'action',
    category: 'app',
    subcategory: 'klap',
    icon: 'MdOndemandVideo',
    color: '#E1306C',
    label: 'Baixar Corte',
    config: {
      format: 'mp4',
      quality: 'high'
    }
  }
];

const internalActions: NodeTypeDefinition[] = [
  {
    id: 'internal_start',
    name: 'Início',
    type: 'trigger',
    category: 'internal',
    icon: 'VscDebugStart',
    color: '#ff4700', 
    config: {
      condition: ''
    }
  },
  {
    id: 'internal_wait_response',
    name: 'Aguardando Resposta',
    type: 'action',
    category: 'internal',
    icon: 'MdOutlineWebhook',
    color: '#ff4700',
    label: 'Aguardar Resposta Webhook',
    input: {
      variables: {
        nome: ''
      }
    },
    output: {
      variables: {
        nome: ''
      },
      text: ''
    },
    config: {}
  },
  {
    id: 'internal_error',
    name: 'Erro',
    type: 'error',
    category: 'internal',
    icon: 'TbError404',
    color: '#ef4444',
    label: 'Tratamento de Erro',
    config: {
      errorType: 'any',
      errorMessage: 'error',
    }
  },
  {
    id: 'internal_delay',
    name: 'Atraso',
    type: 'action',
    category: 'internal',
    icon: 'IoTime',
    color: '#ff4700', 
    label: 'Atraso',
    config: {
      duration: 0,
      unit: 'seconds'
    }
  },
  {
    id: 'internal_condition',
    name: 'Condição',
    type: 'condition',
    category: 'internal',
    icon: 'TbAirConditioning',
    color: '#ff4700', 
    config: {
      condition: '',
    }
  },
  {
    id: 'internal_finish',
    name: 'Fim',
    type: 'trigger',
    category: 'internal',
    icon: 'FaRegWindowClose',
    color: '#ff4700',  
    config: {
      condition: 'fim',
    }
  },
  {
    id: 'internal_comment',
    name: 'Comentário',
    type: 'comment',
    category: 'internal',
    icon: 'FaCommentAlt',
    color: '#ff4700', 
    label: 'Comentário',
    config: {
      comment: ''
    }
  },
  {
    id: 'internal_database',
    name: 'Banco de Dados',
    type: 'database',
    category: 'internal',
    icon: 'FaDatabase',
    color: '#ff4700', 
    label: 'Banco de Dados',
    config: {
      query: ''
    }
  },
  {
    id: 'internal_api',
    name: 'API',
    type: 'api',
    category: 'internal',
    icon: 'TbApi',
    color: '#ff4700', 
    label: 'Conectar API',
    config: {
      endpoint: '',
      method: 'GET'
    }
  },
  {
    id: 'internal_webhook',
    name: 'Webhook',
    type: 'webhook',
    category: 'internal',
    icon: 'MdOutlineWebhook',
    color: '#ff4700', 
    label: 'Webhook',
    config: {
      url: '',
      method: 'POST'
    }
  }
];

const formActions: NodeTypeDefinition[] = [
  {
    id: 'start_form',
    name: 'Criar Formulario',
    type: 'trigger',
    category: 'app',
    icon: 'FaWpforms',
    color: '#EAB308',
    label: 'Novo Formulário',
    config: {
      fields: [
        {
          id: 'title',
          name: 'Título do Formulário',
          type: 'string',
          required: true
        },
        {
          id: 'description',
          name: 'Descrição',
          type: 'string',
          required: false
        },
        {
          id: 'submit_button_text',
          name: 'Texto do Botão de Envio',
          type: 'string',
          required: false,
          default: 'Enviar'
        },
        {
          id: 'success_message',
          name: 'Mensagem de Sucesso',
          type: 'string',
          required: false,
          default: 'Formulário enviado com sucesso!'
        },
        {
          id: 'redirect_url',
          name: 'URL de Redirecionamento',
          type: 'string',
          required: false,
          description: 'URL para redirecionar após o envio do formulário'
        }
      ]
    }
  },
  {
    id: 'form_text_input',
    name: 'Entrada de Texto',
    type: 'action',
    category: 'app',
    icon: 'MdInput',
    color: '#EAB308',
    label: 'Campo de Texto',
    config: {
      fields: [
        {
          id: 'label',
          name: 'Rótulo',
          type: 'string',
          required: true
        },
        {
          id: 'placeholder',
          name: 'Placeholder',
          type: 'string',
          required: false
        },
        {
          id: 'required',
          name: 'Obrigatório',
          type: 'boolean',
          required: false,
          default: false
        }
      ]
    }
  },
  {
    id: 'form_number_input',
    name: 'Entrada de Número',
    type: 'action',
    category: 'app',
    icon: 'MdInput',
    color: '#EAB308',
    label: 'Campo Numérico',
    config: {
      fields: [
        {
          id: 'label',
          name: 'Rótulo',
          type: 'string',
          required: true
        },
        {
          id: 'min',
          name: 'Valor Mínimo',
          type: 'number',
          required: false
        },
        {
          id: 'max',
          name: 'Valor Máximo',
          type: 'number',
          required: false
        },
        {
          id: 'required',
          name: 'Obrigatório',
          type: 'boolean',
          required: false,
          default: false
        }
      ]
    }
  },
  {
    id: 'form_checkbox',
    name: 'Checkbox',
    type: 'action',
    category: 'app',
    icon: 'GrCheckboxSelected',
    color: '#EAB308',
    label: 'Caixa de Seleção',
    config: {
      fields: [
        {
          id: 'label',
          name: 'Rótulo',
          type: 'string',
          required: true
        },
        {
          id: 'default',
          name: 'Marcado por Padrão',
          type: 'boolean',
          required: false,
          default: false
        }
      ]
    }
  },
  {
    id: 'form_date_input',
    name: 'Entrada de Data',
    type: 'action',
    category: 'app',
    icon: 'BsCalendar2Date',
    color: '#EAB308',
    label: 'Seletor de Data',
    config: {
      fields: [
        {
          id: 'label',
          name: 'Rótulo',
          type: 'string',
          required: true
        },
        {
          id: 'min_date',
          name: 'Data Mínima',
          type: 'string',
          required: false
        },
        {
          id: 'max_date',
          name: 'Data Máxima',
          type: 'string',
          required: false
        },
        {
          id: 'required',
          name: 'Obrigatório',
          type: 'boolean',
          required: false,
          default: false
        }
      ]
    }
  }
];


export const nodeTypes = {
  app: {
    subcategories: {
      whatsapp: {
        name: 'WhatsApp',
        actions: whatsappActions,
        color: '#25D366'
      },
      assistant: {
        name: 'Assistente Virtual',
        actions: assistantActions,
        color: '#3B82F6'
      },
      openai: {
        name: 'OpenAI',
        actions: openaiActions,
        color: '#10A37F'
      },
      instagram: {
        name: 'Instagram',
        actions: instagramActions,
        color: '#E1306C'
      },
      conversion: {
        name: 'Conversão AI',
        actions: conversionActions,
        color: '#6366F1'
      },
      veo2: {
        name: 'Veo2',
        actions: veo2Actions,
        color: '#0EA5E9'
      },
      klingai: {
        name: 'Kling AI',
        actions: klingaiActions,
        color: '#A21CAF'
      },
      elevenlabs: {
        name: 'Eleven Labs',
        actions: elevenlabsActions,
        color: '#F59E42'
      },
      form: {
        name: 'Formulário',
        actions: formActions,
        color: '#EAB308'
      },
      klap: {
        name: 'Klap',
        actions: klapActions,
        color: '#E1306C'
      }
    }
  },
  internal: {
    name: 'Interno',
    subcategories: {},
    actions: internalActions,
    color: '#EAB308'
  }
} as const;

interface Subcategory {
  name: string;
  actions: NodeTypeDefinition[];
  color: string;
}

interface Category {
  name: string;
  subcategories: {
    [key: string]: Subcategory;
  };
  actions: NodeTypeDefinition[];
  color: string;
}

interface Categories {
  app: Category;
  internal: Category;
}

export const getNodeCategories = (): Categories => {
  return {
    app: {
      name: 'Aplicativos',
      subcategories: nodeTypes.app.subcategories,
      actions: [],
      color: '#25D366'
    },
    internal: {
      name: 'Interno',
      subcategories: {},
      actions: nodeTypes.internal.actions,
      color: '#EAB308'
    }
  };
};

export interface NodeData {
  label: string;
  config: Record<string, unknown>;
  icon: string;
  name: string;
  color: string;
} 