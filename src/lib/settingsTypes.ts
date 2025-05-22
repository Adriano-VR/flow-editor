export interface Credentials {
  provider: string;
  appName: string;
  source?: string;
  webhook?: string;
  apiKey?: string;
}

export interface Instance {
  name: string;
  credencias: Credentials;
}

export interface Settings {
  instances: Instance[];
}

// Definição dos provedores disponíveis
export const providers = {
  whatsapp: {
    name: 'WhatsApp',
    icon: 'FaWhatsapp',
    color: '#25D366',
    credentials: {
      required: ['provider', 'appName', 'apiKey'],
      optional: ['source', 'webhook']
    }
  },
  telegram: {
    name: 'Telegram',
    icon: 'FaTelegram',
    color: '#0088cc',
    credentials: {
      required: ['provider', 'appName', 'apiKey'],
      optional: ['webhook']
    }
  },
  instagram: {
    name: 'Instagram',
    icon: 'FaInstagram',
    color: '#E1306C',
    credentials: {
      required: ['provider', 'appName', 'apiKey'],
      optional: ['source']
    }
  },
  openai: {
    name: 'OpenAI',
    icon: 'AiOutlineOpenAI',
    color: '#10A37F',
    credentials: {
      required: ['provider', 'apiKey'],
      optional: ['appName']
    }
  },
  elevenlabs: {
    name: 'Eleven Labs',
    icon: 'SiElevenlabs',
    color: '#F59E42',
    credentials: {
      required: ['provider', 'apiKey'],
      optional: ['appName']
    }
  },
  klingai: {
    name: 'Kling AI',
    icon: 'RiSparkling2Line',
    color: '#A21CAF',
    credentials: {
      required: ['provider', 'apiKey'],
      optional: ['appName']
    }
  },
  veo2: {
    name: 'Veo2',
    icon: 'AiOutlineGoogle',
    color: '#0EA5E9',
    credentials: {
      required: ['provider', 'apiKey'],
      optional: ['appName']
    }
  }
} as const;

// Tipos de instâncias disponíveis por categoria
export const instanceTypes = {
  messaging: {
    name: 'Mensageria',
    providers: ['whatsapp', 'telegram', 'instagram'],
    icon: 'FaComments',
    color: '#25D366'
  },
  ai: {
    name: 'Inteligência Artificial',
    providers: ['openai', 'elevenlabs', 'klingai'],
    icon: 'FaRobot',
    color: '#3B82F6'
  },
  media: {
    name: 'Mídia',
    providers: ['veo2'],
    icon: 'FaVideo',
    color: '#E1306C'
  }
} as const;

// Configurações padrão para cada tipo de instância
export const defaultSettings: Record<string, Partial<Settings>> = {
  whatsapp: {
    instances: [{
      name: 'WhatsApp Principal',
      credencias: {
        provider: 'whatsapp',
        appName: '',
        apiKey: '',
        source: '',
        webhook: ''
      }
    }]
  },
  telegram: {
    instances: [{
      name: 'Telegram Bot',
      credencias: {
        provider: 'telegram',
        appName: '',
        apiKey: '',
        webhook: ''
      }
    }]
  },
  instagram: {
    instances: [{
      name: 'Instagram Business',
      credencias: {
        provider: 'instagram',
        appName: '',
        apiKey: '',
        source: ''
      }
    }]
  },
  openai: {
    instances: [{
      name: 'OpenAI API',
      credencias: {
        provider: 'openai',
        apiKey: '',
        appName: 'OpenAI'
      }
    }]
  },
  elevenlabs: {
    instances: [{
      name: 'Eleven Labs TTS',
      credencias: {
        provider: 'elevenlabs',
        apiKey: '',
        appName: 'Eleven Labs'
      }
    }]
  },
  klingai: {
    instances: [{
      name: 'Kling AI Voice',
      credencias: {
        provider: 'klingai',
        apiKey: '',
        appName: 'Kling AI'
      }
    }]
  },
  veo2: {
    instances: [{
      name: 'Veo2 Video',
      credencias: {
        provider: 'veo2',
        apiKey: '',
        appName: 'Veo2'
      }
    }]
  }
} as const;

// Função auxiliar para validar credenciais
export const validateCredentials = (provider: keyof typeof providers, credentials: Credentials): string[] => {
  const errors: string[] = [];
  const providerConfig = providers[provider];

  // Verifica campos obrigatórios
  providerConfig.credentials.required.forEach(field => {
    if (!credentials[field as keyof Credentials]) {
      errors.push(`O campo ${field} é obrigatório para ${providerConfig.name}`);
    }
  });

  return errors;
};

// Função para obter as configurações padrão de um provedor
export const getDefaultSettings = (provider: keyof typeof providers): Settings => {
  return defaultSettings[provider] as Settings;
};

// Função para obter todos os provedores de uma categoria
export const getProvidersByCategory = (category: keyof typeof instanceTypes) => {
  return instanceTypes[category].providers.map(provider => ({
    ...providers[provider],
    id: provider
  }));
};

// Interface para o retorno das funções de validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Função para validar uma instância completa
export const validateInstance = (instance: Instance): ValidationResult => {
  const errors: string[] = [];

  if (!instance.name) {
    errors.push('O nome da instância é obrigatório');
  }

  if (!instance.credencias.provider) {
    errors.push('O provedor é obrigatório');
  } else {
    const providerErrors = validateCredentials(
      instance.credencias.provider as keyof typeof providers,
      instance.credencias
    );
    errors.push(...providerErrors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Função para validar todas as instâncias
export const validateSettings = (settings: Settings): ValidationResult => {
  const errors: string[] = [];

  if (!settings.instances || settings.instances.length === 0) {
    errors.push('É necessário ter pelo menos uma instância configurada');
  } else {
    settings.instances.forEach((instance, index) => {
      const instanceValidation = validateInstance(instance);
      if (!instanceValidation.isValid) {
        errors.push(`Instância ${index + 1}: ${instanceValidation.errors.join(', ')}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 