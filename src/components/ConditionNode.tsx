import React from 'react';
import { Handle, Position } from 'reactflow';
import { IconRenderer } from "@/lib/IconRenderer";
import { NodeActionButtons } from './NodeActionButtons';

interface ConditionNodeProps {
  data: {
    label: string;
    icon?: string;
    color?: string;
  };
  onEdit: (node: any) => void;
  onDelete: (nodeId: string) => void;
}

export function ConditionNode({ data, onEdit, onDelete }: ConditionNodeProps) {
  return (
    <div className="flex flex-col items-center group">
      <div
        className={`
          flex items-center justify-center
          relative
          bg-white
          p-5
          rounded-xl
          min-w-[200px]
          backdrop-blur-sm
          transition-all duration-300
          hover:shadow-2xl
          hover:-translate-y-1
          shadow-[0_8px_30px_rgba(0,0,0,0.12)]
          border-2
        `}
        style={{ 
          borderColor: data.color || '#EAB308',
          backgroundColor: `${data.color}08`,
          boxShadow: `0 4px 20px ${data.color}20`
        }}
      >
        <div className="absolute left-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
          <div 
            className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
            style={{ 
              borderColor: data.color || '#EAB308',
            }}
          />
          <Handle
            type="target"
            position={Position.Left}
            className="absolute inset-0 opacity-0"
          />
        </div>

        <div className="flex items-center gap-4">
          <IconRenderer iconName={data.icon ?? ''} className="text-4xl" />
          <div className="flex flex-col">
            <div className="text-lg font-bold" style={{ color: data.color || '#EAB308' }}>{data.label}</div>
            <div className="text-sm text-gray-500">Condição</div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-gray-100">
          <div className="flex flex-col items-center relative w-10">
            <div className="w-4 h-4 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border hover:scale-110 bg-white"
              style={{ 
                borderColor: data.color || '#EAB308',
              }}>
              <div className="text-green-500 text-[8px]">✓</div>
            </div>
           
            <Handle
              type="source"
              position={Position.Bottom}
              id="true"
              className="absolute bottom-[-4px] opacity-0"
              style={{ bottom: '-30px', left: '50%' }}
            />
          </div>
          <div className="flex flex-col items-center relative w-10">
            <div className="w-4 h-4 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border hover:scale-110 bg-white"
              style={{ 
                borderColor: data.color || '#EAB308',
              }}>
              <div className="text-red-500 text-[8px]">✕</div>
            </div>
          
            <Handle
              type="source"
              position={Position.Bottom}
              id="false"
              className="absolute bottom-[-4px] opacity-0"
              style={{ bottom: '-30px', left: '50%' }}
            />
          </div>
        </div>

        <NodeActionButtons data={data} onEdit={onEdit} onDelete={onDelete} type="condition" />
      </div>
    </div>
  );
} 