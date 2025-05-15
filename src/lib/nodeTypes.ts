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
    icon: 'MdRecordVoiceOver',
    color: '#10A37F',
    config: {}
  },
  {
    id: 'openai_gpt_image_1',
    name: 'gpt-image-1',
    type: 'action',
    category: 'app',
    subcategory: 'openai',
    icon: 'MdImage',
    color: '#10A37F',
    config: {}
  },
  {
    id: 'openai_gpt_4o',
    name: 'gpt-4o',
    type: 'action',
    category: 'app',
    subcategory: 'openai',
    icon: 'SiOpenai',
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
    icon: 'FaWpforms',
    color: '#E1306C',
    config: {}
  },
  {
    id: 'instagram_question',
    name: 'Pergunta',
    type: 'action',
    category: 'app',
    subcategory: 'instagram',
    icon: 'FaQuestionCircle',
    color: '#E1306C',
    config: {}
  },
  {
    id: 'instagram_quick_reply',
    name: 'Quick Reply',
    type: 'action',
    category: 'app',
    subcategory: 'instagram',
    icon: 'FaReply',
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
    icon: 'FaRegPlayCircle',
    color: '#6366F1',
    config: {}
  },
  {
    id: 'ai_text_to_image',
    name: 'Text-to-Image',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'FaWhatsapp',
    color: '#6366F1',
    config: {}
  },
  {
    id: 'ai_image_to_video',
    name: 'Image-to-Video',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'FaRegPlayCircle',
    color: '#6366F1',
    config: {}
  },
  {
    id: 'ai_text_to_audio',
    name: 'Text-to-Audio',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'FaRegFileAudio',
    color: '#6366F1',
    config: {}
  },
  {
    id: 'ai_video_to_text',
    name: 'Video-to-Text',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'FaRegFileAlt',
    color: '#6366F1',
    config: {}
  },
  {
    id: 'ai_video_to_audio',
    name: 'Video-to-Audio',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'FaRegFileAudio',
    color: '#6366F1',
    config: {}
  },
  {
    id: 'ai_audio_to_text',
    name: 'Audio-to-Text',
    type: 'action',
    category: 'app',
    subcategory: 'conversion',
    icon: 'FaRegFileAlt',
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
    color: '#EAB308',
    config: {}
  },
  {
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
  {
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
  {
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
  {
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
  {
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
  {
    id: 'internal_api',
    name: 'API',
    type: 'api',
    category: 'internal',
    icon: 'TbApi',
    color: '#38BDF8',
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
    color: '#A21CAF',
    label: 'Webhook',
    config: {
      url: '',
      method: 'POST'
    }
  }
];

export const nodeTypes = {
  app: {
    subcategories: {
      whatsapp: {
        name: 'WhatsApp',
        actions: whatsappActions
      },
      assistant: {
        name: 'Assistente Virtual',
        actions: assistantActions
      },
      openai: {
        name: 'OpenAI',
        actions: openaiActions
      },
      instagram: {
        name: 'Instagram',
        actions: instagramActions
      },
      conversion: {
        name: 'Conversão AI',
        actions: conversionActions
      },
      veo2: {
        name: 'Veo2',
        actions: veo2Actions
      },
      klingai: {
        name: 'Kling AI',
        actions: klingaiActions
      },
      elevenlabs: {
        name: 'Eleven Labs',
        actions: elevenlabsActions
      }
    }
  },
  internal: {
    name: 'Interno',
    subcategories: {},
    actions: internalActions
  }
} as const;

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
      subcategories: nodeTypes.app.subcategories,
      actions: []
    },
    internal: {
      name: 'Interno',
      subcategories: {},
      actions: nodeTypes.internal.actions
    }
  };
}; 