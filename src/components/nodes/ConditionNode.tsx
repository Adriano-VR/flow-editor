import { Handle, Position, NodeProps } from 'reactflow';
import { IconRenderer } from '@/lib/IconRenderer';
import { NodeActionButtons } from '../NodeActionButtons';

export function ConditionNode({ data }: NodeProps) {
  const color = data.color || '#EAB308';
  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      {/* Handles fora do losango rotacionado */}
      {/* Handle de entrada (esquerda) */}
      <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white" style={{ borderColor: color }}>
        <Handle type="target" position={Position.Left} className="absolute inset-0 w-full h-full opacity-0" />
      </div>
      {/* Handle de saída true (baixo) */}
      <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white" style={{ borderColor: '#25D366' }}>
        <Handle type="source" position={Position.Bottom} id="true" className="absolute inset-0 w-full h-full opacity-0" />
      </div>
      <div className="absolute left-1/2" style={{ bottom: -18 }}>
      </div>
      {/* Handle de saída false (direita) */}
      <div className="absolute right-[-15px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white" style={{ borderColor: '#F87171' }}>
        <Handle type="source" position={Position.Right} id="false" className="absolute inset-0 w-full h-full opacity-0" />
      </div>
      <div className="absolute top-1/2 -translate-y-1/2" style={{ right: -18 }}>
      </div>
      {/* Losango rotacionado */}
      <div
        className={`
          flex flex-col items-center justify-center
          relative
          bg-white
          p-4
          gap-2
          backdrop-blur-sm
          transition-all duration-300
          hover:shadow-2xl
          hover:-translate-y-1
          shadow-[0_8px_30px_rgba(0,0,0,0.12)]
          border-2
          ${data.isActive ? 'animate-pulse' : ''}
          ${data.isExecuting ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
        `}
        style={{
          borderColor: color,
          backgroundColor: `${color}08`,
          boxShadow: `0 4px 20px ${color}20`,
          animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
          width: '120px',
          height: '120px',
          transform: 'rotate(45deg)',
          margin: '20px',
        }}
      >
        {/* Conteúdo interno rotacionado de volta */}
        <div className="flex flex-col items-center justify-center" style={{ transform: 'rotate(-45deg)' }}>
          <div className="rounded-lg p-1 mb-2" style={{ backgroundColor: color }}>
            <IconRenderer iconName={data.icon ?? ''} className="text-3xl text-white" />
          </div>
          <div className="text-center">
            <div className="text-sm font-bold" style={{ color }}>{data.label}</div>
            <div className="text-xs text-gray-500">{data.config.condition}</div>
          </div>
        </div>
        <NodeActionButtons data={data} type="condition" />
      </div>
    </div>
  );
} 