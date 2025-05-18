"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/contexts/ChatContext"
import { MessageCircle, Send, Bot, User, X, Sparkles, PanelRightOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface ChatAssistantProps {
  flowId: string
}

export function ChatAssistant({ flowId }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const { addMessage, getThread } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const thread = getThread(flowId)
  const messagesLengthRef = useRef(thread.messages.length)

  // Auto-scroll to bottom when new messages arrive or when typing starts/stops
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [isTyping])

  // Separate effect to track message length changes
  useEffect(() => {
    if (thread.messages.length !== messagesLengthRef.current) {
      messagesLengthRef.current = thread.messages.length
      if (scrollRef.current) {
        const scrollElement = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]")
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight
        }
      }
    }
  }, [thread.messages.length])

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    addMessage(flowId, {
      content: input,
      role: "user",
    })

    setInput("")
    setIsTyping(true)

    // Simulate AI typing
    setTimeout(() => {
      setIsTyping(false)
      addMessage(flowId, {
        content: `I received your message: "${input}"`,
        role: "assistant",
      })
    }, 1500)
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsOpen(true)}
              className={cn(
                "relative transition-all duration-200 hover:scale-105",
                "bg-gradient-to-br from-blue-500/10 to-purple-500/10",
                "hover:from-blue-500/20 hover:to-purple-500/20",
                "border-blue-200/50 hover:border-blue-300/50",
                "shadow-md hover:shadow-lg",
              )}
            >
              <MessageCircle className="h-4 w-4 text-blue-500" />
              {thread.messages.length > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-blue-500 text-[10px] text-white animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  {thread.messages.length}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Abrir assistente de chat</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
        <DrawerContent className="max-w-[480px] min-w-3/12 w-full h-full fixed right-0 top-0 bottom-0 flex flex-col p-0 gap-0 bg-gradient-to-br from-slate-50 to-slate-100/50 backdrop-blur-sm shadow-2xl">
          <div className="relative px-6 pt-6 pb-4 border-b bg-white/80 backdrop-blur-sm flex-shrink-0 flex flex-col items-center">
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-full hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
                <span className="sr-only">Fechar</span>
              </Button>
            </DrawerClose>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg mb-1">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <DrawerTitle className="text-xl font-bold text-slate-900">Flow Assistant</DrawerTitle>
              <p className="text-sm text-slate-500">Pergunte qualquer coisa sobre seu flow</p>
            </div>
          </div>

          <ScrollArea ref={scrollRef} className="flex-1 px-4 py-6 min-h-0" style={{ maxHeight: "calc(100vh - 180px)" }}>
            <div className="space-y-6">
              {thread.messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[280px] text-center text-slate-500">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-lg font-medium text-slate-900">Bem-vindo ao Flow Assistant!</p>
                  <p className="text-sm max-w-xs mx-auto mt-2">
                    Estou aqui para ajudar com seu flow. Você pode me perguntar sobre:
                  </p>
                  <div className="grid grid-cols-1 gap-2 mt-4 w-full max-w-xs">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-left text-xs border-slate-200 hover:bg-slate-100"
                      onClick={() => setInput("Como adicionar um novo nó?")}
                    >
                      <PanelRightOpen className="h-3 w-3 mr-2 text-blue-500" />
                      Como adicionar um novo nó?
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-left text-xs border-slate-200 hover:bg-slate-100"
                      onClick={() => setInput("Como conectar nós entre si?")}
                    >
                      <PanelRightOpen className="h-3 w-3 mr-2 text-blue-500" />
                      Como conectar nós entre si?
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-left text-xs border-slate-200 hover:bg-slate-100"
                      onClick={() => setInput("Como executar meu flow?")}
                    >
                      <PanelRightOpen className="h-3 w-3 mr-2 text-blue-500" />
                      Como executar meu flow?
                    </Button>
                  </div>
                </div>
              )}
              {thread.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex w-full", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn("flex flex-col items-end max-w-[80%]", message.role === "assistant" && "items-start")}
                  >
                    <div
                      className={cn("flex items-end gap-2", message.role === "user" ? "flex-row-reverse" : "flex-row")}
                    >
                      <div
                        className={cn(
                          "rounded-full flex items-center justify-center shadow-md",
                          message.role === "user"
                            ? "w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700"
                            : "w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500",
                        )}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "px-4 py-2 shadow-sm",
                          message.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md"
                            : "bg-white text-slate-900 border border-slate-100 rounded-2xl rounded-bl-md",
                        )}
                        style={{ wordBreak: "break-word" }}
                      >
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1 mt-1",
                        message.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <span className="text-xs text-slate-400">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
                      <div className="bg-white text-slate-900 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm border border-slate-100">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
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
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 rounded-full px-4 py-2"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim()}
                      className="rounded-full bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5 text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Enviar mensagem</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
