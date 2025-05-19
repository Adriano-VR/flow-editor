"use client"

import type { NodeProps } from "reactflow"
import { StickyNote } from "lucide-react"
import { useState } from "react"

export function CommentNode({ data }: NodeProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="flex flex-col items-center justify-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative flex flex-col bg-[#FFFB8F] border border-yellow-300 rounded-xl shadow-lg p-3 min-w-[160px] min-h-[60px] max-w-[280px] transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-105 hover:bg-[#FFFA80]"
        style={{
          boxShadow: isHovered ? "0 8px 24px rgba(250, 204, 21, 0.4)" : "0 4px 16px rgba(250, 204, 21, 0.2)",
        }}
      >
        <div className="flex items-center mb-1.5 pb-1.5 border-b border-yellow-200">
          <StickyNote className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
          <span className="text-xs font-medium text-yellow-800">Note</span>
        </div>

        <div className="w-full">
          <p className="text-sm text-gray-800 break-words leading-snug">
            {data.config?.comment || "Add your comment here"}
          </p>
        </div>

        {isHovered && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100 cursor-pointer transition-opacity">
            <span>✎</span>
          </div>
        )}
      </div>

      {/* Optional tooltip that appears on hover */}
      {isHovered && data.config?.comment && data.config.comment.length > 50 && (
        <div className="absolute -bottom-12 bg-white border border-gray-200 rounded-md p-2 shadow-md text-xs max-w-[200px] z-10">
          <p className="text-gray-700">{data.config.comment}</p>
        </div>
      )}
    </div>
  )
}
