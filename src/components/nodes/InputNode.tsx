"use client"

import type React from "react"

import { memo, useState } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { IconRenderer } from "@/lib/IconRenderer"
import { NodeActionButtons } from "../NodeActionButtons"

interface InputNodeProps extends NodeProps {
  data: {
    id: string
    label: string
    name: string
    icon: string
    color: string
    config?: Record<string, unknown>
  }
}

const InputNode = memo(({ data, selected }: InputNodeProps) => {
  return (
    <div className="flex flex-col items-center group">
      <div
        className={`
          flex flex-col items-center justify-center
          border-2
          relative
          bg-white
          p-3
          rounded-xl
          min-w-[200px]
          backdrop-blur-sm
          transition-all duration-300
          hover:shadow-2xl
          hover:-translate-y-1
          shadow-[0_8px_30px_rgba(0,0,0,0.12)]
          ${selected ? "ring-4 ring-opacity-50" : ""}
        `}
        style={{ 
          borderColor: data.color || '#3B82F6',
          backgroundColor: `${data.color}08`,
          boxShadow: `0 4px 20px ${data.color}20`,
          "--tw-ring-color": selected ? data.color : "transparent",
        } as React.CSSProperties}
      >
        {/* Header with icon and label */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-md" 
            style={{ backgroundColor: data.color || '#3B82F6', boxShadow: `0 4px 12px ${data.color}40` }}>
            <IconRenderer iconName={data.icon} className="text-4xl text-white" />
          </div>
          <div className="flex flex-col">
            <div className="text-lg font-bold" style={{ color: data.color || '#3B82F6' }}>{data.label}</div>
          </div>
        </div>

        {/* Connection handles */}
        <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
          <div
            className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
            style={{ borderColor: data.color || '#3B82F6' }}
          />
          <Handle type="target" position={Position.Left} className="absolute inset-0 opacity-0" />
        </div>

        <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
          <div
            className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
            style={{ borderColor: data.color || '#3B82F6' }}
          />
          <Handle type="source" position={Position.Right} className="absolute inset-0 opacity-0" />
        </div>

        {/* Action buttons */}
        <div className="absolute -top-8 right-0">
          <NodeActionButtons data={data} type="input" />
        </div>
      </div>
    </div>
  )
})

InputNode.displayName = "InputNode"

export default InputNode
