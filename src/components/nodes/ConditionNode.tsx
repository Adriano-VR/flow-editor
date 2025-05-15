import { Handle, Position, NodeProps } from 'reactflow';
import { IconRenderer } from '@/lib/IconRenderer';
import { NodeActionButtons } from '../NodeActionButtons';

export function ConditionNode({ data }: NodeProps) {
  return (
    <div className="flex flex-col items-center group">
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
          borderColor: data.color || '#EAB308',
          backgroundColor: `${data.color}08`,
          boxShadow: `0 4px 20px ${data.color}20`,
          animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
          width: '120px',
          height: '120px',
          transform: 'rotate(45deg)',
          margin: '20px',
        }}
      >
        <div className="absolute top-1/2 left-[-85px] -translate-y-1/2 w-5 h-5 z-10" style={{ transform: 'rotate(-45deg)' }}>
          <div
            className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
            style={{ borderColor: data.color || '#EAB308' }}
          />
          <Handle type="target" position={Position.Left} className="absolute inset-0 opacity-0" />
        </div>
        <div className="flex flex-col items-center justify-center -rotate-45">
          <div className="rounded-lg p-1 mb-2" style={{ backgroundColor: data.color || '#EAB308' }}>
            <IconRenderer iconName={data.icon ?? ''} className="text-3xl text-white" />
          </div>
          <div className="text-center">
            <div className="text-sm font-bold" style={{ color: data.color || '#EAB308' }}>{data.label}</div>
            <div className="text-xs text-gray-500">Condição</div>
          </div>
        </div>
        <div className="absolute bottom-[-25px] left-1/2 -translate-x-1/2 flex items-center justify-between gap-4">
          <div className="flex flex-col items-center relative">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border hover:scale-110 bg-white" style={{ borderColor: data.color || '#25D366' }}>
              <div className="text-green-500 text-xs">✓</div>
            </div>
            <Handle type="source" position={Position.Bottom} id="true" className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 opacity-0" />
          </div>
          <div className="flex flex-col items-center relative">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border hover:scale-110 bg-white" style={{ borderColor: data.color || '#25D366' }}>
              <div className="text-red-500 text-xs">✕</div>
            </div>
            <Handle type="source" position={Position.Bottom} id="false" className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 opacity-0" />
          </div>
        </div>
        <NodeActionButtons data={data} type="condition" />
      </div>
    </div>
  );
} 