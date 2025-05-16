"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from './ui/drawer';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useChat } from '@/contexts/ChatContext';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatAssistantProps {
  flowId: string;
}

export function ChatAssistant({ flowId }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { addMessage, getThread } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const thread = getThread(flowId);
  const messagesLengthRef = useRef(thread.messages.length);

  // Auto-scroll to bottom when new messages arrive or when typing starts/stops
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [isTyping]);

  // Separate effect to track message length changes
  useEffect(() => {
    if (thread.messages.length !== messagesLengthRef.current) {
      messagesLengthRef.current = thread.messages.length;
      if (scrollRef.current) {
        const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }
    }
  }, [thread.messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    addMessage(flowId, {
      content: input,
      role: 'user',
    });

    setInput('');
    setIsTyping(true);

    // Simulate AI typing
    setTimeout(() => {
      setIsTyping(false);
      addMessage(flowId, {
        content: `I received your message: "${input}"`,
        role: 'assistant',
      });
    }, 1500);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={cn(
          "relative transition-all duration-200 hover:scale-105",
          "bg-gradient-to-br from-blue-500/10 to-purple-500/10",
          "hover:from-blue-500/20 hover:to-purple-500/20",
          "border-blue-200/50 hover:border-blue-300/50",
          "shadow-lg hover:shadow-xl"
        )}
      >
        <MessageCircle className="h-4 w-4 text-blue-500" />
        {thread.messages.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 text-[10px] text-white flex items-center justify-center animate-in fade-in slide-in-from-top-1 duration-200">
            {thread.messages.length}
          </span>
        )}
      </Button>

      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
        <DrawerContent className="max-w-[480px] w-full h-full fixed right-0 top-0 bottom-0 flex flex-col p-0 gap-0 bg-gradient-to-br from-gray-50 to-gray-100/50 backdrop-blur-sm shadow-2xl">
          <div className="relative px-6 pt-6 pb-4 border-b bg-white/80 backdrop-blur-sm flex-shrink-0 flex flex-col items-center">
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-full hover:bg-gray-100">
                <span className="sr-only">Close</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6L14 14M14 6L6 14" stroke="#555" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </Button>
            </DrawerClose>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg mb-1">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <DrawerTitle className="text-xl font-bold text-gray-900">Flow Assistant</DrawerTitle>
              <p className="text-sm text-gray-500">Ask me anything about your flow</p>
            </div>
          </div>

          <ScrollArea 
            ref={scrollRef} 
            className="flex-1 px-3 py-6 min-h-0"
            style={{ maxHeight: 'calc(100vh - 180px)' }}
          >
            <div className="space-y-6">
              {thread.messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[200px] text-center text-gray-500">
                  <Bot className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900">Welcome to Flow Assistant!</p>
                  <p className="text-sm">I'm here to help you with your flow. Ask me anything!</p>
                </div>
              )}
              {thread.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    'flex flex-col items-end max-w-[80%]',
                    message.role === 'assistant' && 'items-start'
                  )}>
                    <div className={cn(
                      'flex items-end gap-2',
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}>
                      <div className={cn(
                        'rounded-full flex items-center justify-center shadow-md',
                        message.role === 'user'
                          ? 'w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600'
                          : 'w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500'
                      )}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className={cn(
                        'px-4 py-2 shadow-sm',
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-100 rounded-2xl rounded-bl-md'
                      )}
                        style={{ wordBreak: 'break-word' }}
                      >
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                    <div className={cn(
                      'flex items-center gap-1 mt-1',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex w-full justify-start">
                  <div className="flex flex-col items-start max-w-[80%]">
                    <div className="flex items-end gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white text-gray-900 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm border border-gray-100">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-white/80 backdrop-blur-sm flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-full px-4 py-2"
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Send className="h-5 w-5 text-white" />
              </Button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
} 
