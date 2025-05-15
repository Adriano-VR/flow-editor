"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatThread {
  flowId: string;
  messages: Message[];
}

interface ChatContextType {
  threads: Record<string, ChatThread>;
  addMessage: (flowId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  getThread: (flowId: string) => ChatThread;
  clearThread: (flowId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<Record<string, ChatThread>>({});

  const addMessage = (flowId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    setThreads((prevThreads) => {
      const thread = prevThreads[flowId] || { flowId, messages: [] };
      const newMessage: Message = {
        ...message,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };

      return {
        ...prevThreads,
        [flowId]: {
          ...thread,
          messages: [...thread.messages, newMessage],
        },
      };
    });
  };

  const getThread = (flowId: string): ChatThread => {
    return threads[flowId] || { flowId, messages: [] };
  };

  const clearThread = (flowId: string) => {
    setThreads((prevThreads) => {
      const { [flowId]: _, ...rest } = prevThreads;
      return rest;
    });
  };

  return (
    <ChatContext.Provider value={{ threads, addMessage, getThread, clearThread }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 