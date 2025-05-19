"use client"

import { memo, useState } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { IconRenderer } from "@/lib/IconRenderer"
import { NodeActionButtons } from "../NodeActionButtons"

interface ErrorNodeProps extends NodeProps {
  data: {
    id: string
    label: string
    name: string
    icon: string
    color: string
    config?: {
      errorType?: string
      errorMessage?: string
      fallbackAction?: string
      retryCount?: number
      retryDelay?: number
    }
  }
}

const ErrorNode = memo(({ data, selected }: ErrorNodeProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`
        flex flex-col items-center justify-center p-4 rounded-lg 
        bg-white transition-all duration-200 ease-in-out
        shadow-sm hover:shadow-md min-w-[220px] max-w-[300px]
        ${selected ? "shadow-md ring-2 ring-opacity-50" : ""}
      `}
      style={{
        borderLeft: `3px solid ${data.color}`,
        boxShadow: isHovered ? `0 0 0 2px ${data.color}20` : "",
        "--tw-ring-color": selected ? data.color : "transparent",
      } as React.CSSProperties}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with icon and label */}
      <div className="flex items-center gap-2 mb-3 w-full">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full p-1.5"
          style={{ backgroundColor: `${data.color}15` }}
        >
          <IconRenderer iconName={data.icon} className="w-full h-full" style={{ color: data.color }} />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{data.label}</span>
          <span className="text-xs text-gray-500">{data.config?.errorType || 'any'}</span>
        </div>
      </div>

      {/* Error details */}
      <div className="w-full space-y-2">
        {data.config?.errorMessage && (
          <div className="text-sm text-gray-600 bg-red-50 p-2 rounded border border-red-100">
            {data.config.errorMessage}
          </div>
        )}
        
        {(data.config?.retryCount || data.config?.retryDelay) && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {data.config.retryCount > 0 && (
              <span className="px-2 py-1 bg-gray-100 rounded">
                Retry: {data.config.retryCount}x
              </span>
            )}
            {data.config.retryDelay > 0 && (
              <span className="px-2 py-1 bg-gray-100 rounded">
                Delay: {data.config.retryDelay}s
              </span>
            )}
          </div>
        )}
      </div>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 rounded-full border-2 border-white"
        style={{
          backgroundColor: data.color,
          left: "-7px",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 rounded-full border-2 border-white"
        style={{
          backgroundColor: data.color,
          right: "-7px",
        }}
      />

      {/* Action buttons */}
      <div className="absolute -top-8 right-0">
        <NodeActionButtons data={data} type="error" />
      </div>
    </div>
  )
})

ErrorNode.displayName = "ErrorNode"

export default ErrorNode 