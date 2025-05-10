import { Pencil, Trash } from 'lucide-react';
import React from 'react';
import { Node as ReactFlowNode } from 'reactflow';
import { useNode } from '../contexts/NodeContext';

interface NodeActionButtonsProps {
  data: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    config?: Record<string, unknown>;
  };
  type: string;
}

export function NodeActionButtons({ data, type }: NodeActionButtonsProps) {
  const { onEdit, onDelete } = useNode();

  return (
    <div className= " z-50 border border-gray-300 rounded-lg absolute -top-11 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div className="flex gap-2 bg-white/60 backdrop-blur-sm p-1 rounded-lg">
        <button
          className="cursor-pointer p-1.5 rounded-lg hover:bg-white/80"
          onClick={() => onEdit({ 
            id: data.id, 
            data: {
              label: data.name,
              config: data.config || {},
              icon: data.icon,
              name: data.name,
              color: data.color
            },
            position: { x: 0, y: 0 },
            type: type
          } as ReactFlowNode)}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          className="cursor-pointer p-1.5 rounded-lg hover:bg-white/80"
          onClick={() => onDelete(data.id)}
        >
          <Trash className="w-4 h-4" color='red' />
        </button>
      </div>
    </div>  
  );
} 