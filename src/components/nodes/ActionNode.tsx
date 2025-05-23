"use client"

import { memo, useState } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { IconRenderer } from "@/lib/IconRenderer"
import { LiaBrainSolid } from "react-icons/lia"
import { FaMemory } from "react-icons/fa"
import { FiTool } from "react-icons/fi"
import { NodeActionButtons } from "../NodeActionButtons"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const ActionNode = memo(({ data, selected }: NodeProps) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)

  const isEndNode = data.name === "Fim"
  const isModelNode = data.name === "Modelo"
  const isMemoryNode = data.name === "Memória"
  const isToolNode = data.name === "Ferramenta"
  const isSpecialNode = isModelNode || isMemoryNode || isToolNode
  const isDelayNode = data.name === "Atraso"
  const isCreateAgentNode = data.name === "Criar Agente"

  // Design for Create Agent Node
  if (isCreateAgentNode) {
    return (
      <div className="flex flex-col items-center group">
        <div
          className={`
            flex flex-col items-center justify-center
            border-2 
            relative
            bg-white
            p-4
            rounded-xl
            backdrop-blur-sm
            transition-all duration-300
            hover:shadow-2xl
            hover:-translate-y-1
            shadow-lg
            ${data.isActive ? "animate-pulse" : ""}
            ${data.isExecuting ? "ring-4 ring-opacity-50" : ""}
            ${selected ? "ring-2 ring-opacity-30" : ""}
          `}
          style={{
            borderColor: data.color || "#3B82F6",
            backgroundColor: `${data.color}08`,
            boxShadow: `0 8px 24px ${data.color}15`,
            animation: data.isActive ? "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none",
          }}
        >
          {/* Status indicator */}
          {data.isExecuting && (
            <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
              <span className="relative flex h-3 w-3">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: data.color || "#3B82F6" }}
                ></span>
                <span
                  className="relative inline-flex rounded-full h-3 w-3"
                  style={{ backgroundColor: data.color || "#3B82F6" }}
                ></span>
              </span>
            </div>
          )}

          {/* Input handle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute left-[-25px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
                    style={{ borderColor: data.color || "#3B82F6" }}
                  />
                  <Handle type="target" position={Position.Left} className="absolute inset-0 opacity-0" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">Entrada</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Header with icon and title */}
          <div className="flex items-center gap-4 mb-5 w-full">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-xl shadow-md"
              style={{
                background: `linear-gradient(135deg, ${data.color || "#3B82F6"}, ${data.color}dd)`,
                boxShadow: `0 4px 12px ${data.color}30`,
              }}
            >
              <IconRenderer iconName={data.icon ?? ""} className="text-4xl text-white" />
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-bold" style={{ color: data.color || "#3B82F6" }}>
                {data.label}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: data.color || "#3B82F6" }}
                />
                Assistente Virtual
              </div>
            </div>
          </div>

          {/* Connection options */}
          <div className="flex items-center justify-between gap-2 w-full">
            {[
              { icon: <LiaBrainSolid size={18} />, label: "Modelo", id: "model" },
              { icon: <FaMemory size={16} />, label: "Memória", id: "memory" },
              { icon: <FiTool size={16} />, label: "Ferramenta", id: "tool" },
            ].map((item) => (
              <TooltipProvider key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="flex flex-col items-center relative w-full"
                      onMouseEnter={() => setHoveredSection(item.id)}
                      onMouseLeave={() => setHoveredSection(null)}
                    >
                      <div
                        className={`
                          w-10 h-10 rounded-full 
                          flex items-center justify-center 
                          shadow-md transition-all duration-200 
                          cursor-pointer border-2 
                          hover:scale-110 bg-white 
                          group-hover:shadow-lg
                          ${hoveredSection === item.id ? "ring-2 ring-opacity-50" : ""}
                        `}
                        style={{
                          borderColor: data.color || "#3B82F6",
                        }}
                      >
                        <div style={{ color: data.color || "#3B82F6" }}>{item.icon}</div>
                      </div>
                      <div
                        className="text-xs mt-2 font-medium text-center transition-all"
                        style={{ color: data.color || "#3B82F6" }}
                      >
                        {item.label}
                      </div>
                      <Handle
                        type="target"
                        position={Position.Bottom}
                        id={item.id}
                        className="absolute bottom-[-4px] w-3 h-3 bg-gray-300 border-2 border-white"
                        style={{ bottom: "-20px", left: "50%" }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Conectar {item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Output handle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute right-[-25px] top-1/2 -translate-y-1/2 w-4 h-4  z-10">
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
                    style={{ borderColor: data.color || "#3B82F6" }}
                  />
                  <Handle type="source" position={Position.Right} className="absolute inset-0 opacity-0" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">Saída</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Message content */}
          {data.config?.message && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg w-full border border-gray-100">
              <div className="text-sm text-gray-600 break-words">{data.config.message}</div>
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <NodeActionButtons data={data} type="action" />
          </div>
        </div>
      </div>
    )
  }

  // Design for Model, Memory and Tool nodes
  if (isSpecialNode) {
    return (
      <div className="flex flex-col items-center group">
        <div
          className={`
            flex flex-col items-center justify-center
            border-2
            relative
            rounded-2xl
            bg-white
            p-4
            min-w-[220px]
            backdrop-blur-sm
            transition-all duration-300
            hover:shadow-xl
            hover:-translate-y-1
            shadow-lg
            ${data.isActive ? "animate-pulse" : ""}
            ${data.isExecuting ? "ring-4 ring-opacity-50" : ""}
            ${selected ? "ring-2 ring-opacity-30" : ""}
          `}
          style={{
            borderColor: data.color || "#3B82F6",
            backgroundColor: `${data.color}05`,
            boxShadow: `0 8px 24px ${data.color}15`,
            animation: data.isActive ? "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none",
          }}
        >
          {/* Status indicator */}
          {data.isExecuting && (
            <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
              <span className="relative flex h-3 w-3">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: data.color || "#3B82F6" }}
                ></span>
                <span
                  className="relative inline-flex rounded-full h-3 w-3"
                  style={{ backgroundColor: data.color || "#3B82F6" }}
                ></span>
              </span>
            </div>
          )}

          {/* Top handle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 w-5 h-5 z-10">
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
                    style={{ borderColor: data.color || "#3B82F6" }}
                  />
                  <Handle type="source" position={Position.Top} className="absolute inset-0 opacity-0" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Conectar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Content */}
          <div className="flex items-center gap-4 w-full">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-xl shadow-md"
              style={{
                background: `linear-gradient(135deg, ${data.color || "#3B82F6"}, ${data.color}dd)`,
                boxShadow: `0 4px 12px ${data.color}30`,
              }}
            >
              <IconRenderer className="text-4xl text-white" iconName={data.icon ?? ""} />
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-bold" style={{ color: data.color || "#3B82F6" }}>
                {data.name}
              </div>
              <div className="text-sm text-gray-500">{data.label}</div>
            </div>
          </div>

          {/* Message content */}
          {data.config?.message && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg w-full border border-gray-100">
              <div className="text-sm text-gray-600 break-words">{data.config.message}</div>
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <NodeActionButtons data={data} type="action" />
          </div>
        </div>
      </div>
    )
  }

  // Design for Delay node
  if (isDelayNode) {
    return (
      <div className="flex flex-col items-center group">
        <div
          className={`
            flex items-center justify-center
            backdrop-blur-sm
            w-auto h-auto
            rounded-l-lg rounded-r-full
            relative
            border-2
            transition-all duration-300
            hover:shadow-lg
            hover:-translate-y-0.5
            ${data.isActive ? "animate-pulse" : ""}
            ${data.isExecuting ? "ring-2 ring-opacity-60" : ""}
            ${selected ? "shadow-md ring-2 ring-opacity-40" : "shadow-sm"}
          `}
          style={{
            minWidth: 100,
            minHeight: 52,
            borderColor: data.color || "#3B82F6",
            backgroundColor: `${data.color || "#3B82F6"}08`,
            boxShadow: selected ? `0 4px 12px ${data.color || "#3B82F6"}30` : `0 2px 8px ${data.color || "#3B82F6"}15`,
          }}
        >
          <div className="flex flex-col items-center text-base font-medium text-center w-full px-4 py-2">
            <div className="flex items-center justify-center mb-1">
              <IconRenderer
                iconName={data.icon ?? ""}
                className="text-3xl transition-transform group-hover:scale-110"
                style={{ color: data.color || "#3B82F6" }}
              />
            </div>
            <h2 className="text-sm font-medium truncate max-w-[120px]" style={{ color: data.color || "#3B82F6" }}>
              {data.label}
            </h2>
          </div>

          {/* Input handle with improved visual feedback */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
                  <div
                    className={`
                      w-full h-full 
                      rounded-full 
                      flex items-center justify-center 
                      shadow-md 
                      transition-all duration-200 
                      cursor-pointer 
                      border-2 
                      hover:scale-110 
                      hover:shadow-lg
                      bg-white
                      ${selected ? "ring-1 ring-opacity-50" : ""}
                    `}
                    style={{
                      borderColor: data.color || "#3B82F6",
                    }}
                  />
                  <Handle
                    type="target"
                    position={Position.Left}
                    className="absolute inset-0 opacity-0"
                    isConnectable={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">Entrada</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Output handle with improved visual feedback */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
                  <div
                    className={`
                      w-full h-full 
                      rounded-full 
                      flex items-center justify-center 
                      shadow-md 
                      transition-all duration-200 
                      cursor-pointer 
                      border-2 
                      hover:scale-110
                      hover:shadow-lg
                      bg-white
                      ${selected ? "ring-1 ring-opacity-50" : ""}
                    `}
                    style={{
                      borderColor: data.color || "#3B82F6",
                    }}
                  />
                  <Handle
                    type="source"
                    position={Position.Right}
                    className="absolute inset-0 opacity-0"
                    isConnectable={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">Saída</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Status indicator */}
          {data.isExecuting && (
            <div
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: data.color || "#3B82F6" }}
            />
          )}

          {/* Subtle pulse animation for the node when active */}
          {data.isActive && (
            <div
              className="absolute inset-0 rounded-l-lg rounded-r-full animate-pulse opacity-30 -z-10"
              style={{ backgroundColor: data.color || "#3B82F6" }}
            />
          )}

          {/* Action buttons */}
          <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <NodeActionButtons data={data} type="action" />
          </div>
        </div>
      </div>
    )
  }

  // Default action node
  return (
    <div className="flex flex-col items-center group">
      <div
        className={`
          flex flex-col items-center justify-center
          border-2
          relative
          bg-white
          p-4
          rounded-xl
          min-w-[220px]
          backdrop-blur-sm
          transition-all duration-300
          hover:shadow-xl
          hover:-translate-y-1
          shadow-lg
          ${data.isActive ? "animate-pulse" : ""}
          ${data.isExecuting ? "ring-4 ring-opacity-50" : ""}
          ${selected ? "ring-2 ring-opacity-30" : ""}
        `}
        style={{
          borderColor: data.color || "#3B82F6",
          backgroundColor: `${data.color}05`,
          boxShadow: `0 8px 24px ${data.color}15`,
          animation: data.isActive ? "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none",
        }}
      >
        {/* Status indicator */}
        {data.isExecuting && (
          <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
            <span className="relative flex h-3 w-3">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: data.color || "#3B82F6" }}
              ></span>
              <span
                className="relative inline-flex rounded-full h-3 w-3"
                style={{ backgroundColor: data.color || "#3B82F6" }}
              ></span>
            </span>
          </div>
        )}

        {/* Input handle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
                  style={{ borderColor: data.color || "#3B82F6" }}
                />
                <Handle type="target" position={Position.Left} className="absolute inset-0 opacity-0" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">Entrada</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Content */}
        <div className="flex items-center gap-4 w-full">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-xl shadow-md"
            style={{
              background: `linear-gradient(135deg, ${data.color || "#3B82F6"}, ${data.color}dd)`,
              boxShadow: `0 4px 12px ${data.color}30`,
            }}
          >
            <IconRenderer iconName={data.icon ?? ""} className="text-4xl text-white" />
          </div>
          <div className="flex flex-col">
            <div className="text-lg font-bold" style={{ color: data.color || "#3B82F6" }}>
              {data.name}
            </div>
            <div className="text-sm text-gray-500">{data.config.messageType}</div>
          </div>
        </div>

        {/* Message content */}
        {data.config?.message && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg w-full border border-gray-100">
            <div className="text-sm text-gray-600 break-words">{data.config.message}</div>
          </div>
        )}

        {/* Output handle */}
        {!isEndNode && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
                    style={{ borderColor: data.color || "#3B82F6" }}
                  />
                  <Handle type="source" position={Position.Right} className="absolute inset-0 opacity-0" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">Saída</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Action buttons */}
        <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <NodeActionButtons data={data} type="action" />
        </div>
      </div>
    </div>
  )
})

ActionNode.displayName = "ActionNode"

export default ActionNode
