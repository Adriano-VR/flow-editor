import { Handle, Position, NodeProps } from 'reactflow';
import { IconRenderer } from '@/lib/IconRenderer';

export function DatabaseNode({ data }: NodeProps) {
  return (
    <div className="flex flex-col items-center group">
     <div
        className={`
          flex items-center justify-center
          border-2
          relative
          bg-white
          p-3
          gap-2
          rounded-xl
          min-w-[200px]
          backdrop-blur-sm
          transition-all duration-300
          hover:shadow-2xl
          hover:-translate-y-1
          shadow-[0_8px_30px_rgba(0,0,0,0.12)]
          ${data.isActive ? 'animate-pulse' : ''}
          ${data.isExecuting ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
        `}
        style={{ 
          borderColor: data.color || '#3B82F6',
          backgroundColor: `${data.color}08`,
          boxShadow: `0 4px 20px ${data.color}20`,
          animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
        }}
      >
        <IconRenderer iconName={data.icon ?? ''} className=" size-10 text-[#FF0000]" />

        <div className="text-base font-bold text-gray-800 text-center w-full">
          {data.label || 'Database'}
        </div>
        {/* Handles para conexão */}
        <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
          <div
            className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
            style={{ borderColor: data.color || '#38BDF8' }}
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
       
       
       
      </div>
    </div>
  );
} 