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
    config: {
      message: '',
      to: '',
      type: 'text'
    }
  },
  {
    id: 'whatsapp_send_message_image',
    name: 'Enviar Mensagem (Imagem)',
    type: 'action',
    category: 'app',
    subcategory: 'whatsapp',
    icon: 'FaWhatsapp',
    color: '#25D366',
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
    config: {}
  },
  {
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
  {
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
    config: {}
  }
];

const instagramActions: NodeTypeDefinition[] = [
  {
    id: 'instagram_post',
    name: 'Postar',
    type: 'action',
    category: 'app',
    subcategory: 'instagram',
    icon: 'FaInstagram',
    color: '#E1306C',
    config: {}
  },
  {
    id: 'instagram_dm',
    name: 'DM',
    type: 'action',
    category: 'app',
    subcategory: 'instagram',
    icon: 'FaInstagram',
    color: '#E1306C',
    config: {}
  },
  {
    id: 'instagram_form',
    name: 'Formulário',
    type: 'action',
    category: 'app',
    subcategory: 'instagram',
    icon: 'FaInstagram',
    color: '#E1306C',
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
    config: {}
  },
  {
    id: 'ai_video_to_audio',
    name: 'Video-to-Audio',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'SiConvertio',
    color: '#6366F1',
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
    config: {}
  }
];

const internalActions: NodeTypeDefinition[] = [
  {
    id: 'internal_start',
    name: 'Início',
    type: 'trigger',
    category: 'internal',
    icon: 'VscDebugStart',
    color: '#FF0000', 
    config: {
      condition: ''
    }
  },
  {
    id: 'internal_delay',
    name: 'Atraso',
    type: 'action',
    category: 'internal',
    icon: 'IoTime',
    color: '#FF0000', 
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
    color: '#FF0000', 
    config: {
      condition: '',
    }
  },
  {
    id: 'internal_finish',
    name: 'Fim',
    type: 'action',
    category: 'internal',
    icon: 'GiFinishLine',
    color: '#FF0000',  
    config: {
      condition: '',
    }
  },
  {
    id: 'internal_comment',
    name: 'Comentário',
    type: 'comment',
    category: 'internal',
    icon: 'FaCommentAlt',
    color: '#FF0000', 
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
    color: '#FF0000', 
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
    color: '#FF0000', 
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
    color: '#FF0000', 
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
    config: {}
  },
  {
    id: 'form_text_input',
    name: 'Entrada de Texto',
    type: 'action',
    category: 'app',
    icon: 'MdInput',
    color: '#EAB308',
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