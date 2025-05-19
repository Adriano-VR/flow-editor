import { Handle, Position, NodeProps } from 'reactflow';
import { IconRenderer } from '@/lib/IconRenderer';
import { NodeActionButtons } from '../NodeActionButtons';

export function TriggerNode({ data }: NodeProps) {
  return (
    <div className="flex flex-col items-center group">
      <div
        className={`
          flex flex-col items-center justify-center
          rounded-full
          border-2
          w-19 h-19
          relative
          transition-all duration-300
          hover:shadow-2xl
          hover:-translate-y-1
          shadow-[0_8px_30px_rgba(0,0,0,0.12)]
          ${data.isActive ? 'animate-pulse' : ''}
          ${data.isExecuting ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
        `}
        style={{
          minWidth: 72,
          minHeight: 72,
          backgroundColor: data.color || '#3B82F6',
          borderColor: data.color || '#3B82F6',
          animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
        }}
      >
        <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
          <div
            className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
            style={{ borderColor: data.color || '#3B82F6' }}
          />
          <Handle type="source" position={Position.Right} className="absolute inset-0 opacity-0" />
        </div>
        <div className="flex items-center justify-center w-10/12 h-10/12 rounded-full mb-2">
        <IconRenderer iconName={data.icon ?? ""} className="text-5xl text-white drop-shadow-md" />
        </div>
        <NodeActionButtons data={data} type="trigger" />
      </div>
      {/* <div className="text-xs font-bold text-black text-center px-1 mt-1 capitalize">{data.name}</div> */}
      <div className="text-xs font-bold text-black text-center px-1 mt-1">{data.label}</div>
      {data.label === 'Início' && data.config?.condition && (
        <div className="text-xs text-gray-600 text-center px-1 mt-1 max-w-[200px] break-words">
          {data.config.condition}
        </div>
      )}
    </div>
  );
} 