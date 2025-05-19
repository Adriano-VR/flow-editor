import { Handle, Position, NodeProps } from 'reactflow';
import { IconRenderer } from '@/lib/IconRenderer';

export function ApiNode({ data }: NodeProps) {
  return (
    <div className="flex flex-col items-center group">
      <div
        className={`
          flex flex-col items-center justify-center
          border-2
          bg-sky-300
          rounded-xl
          shadow
          px-4 py-3
          min-w-[150px] min-h-[50px]
          relative
        `}
        style={{ borderColor: data.color || '#38BDF8' }}
      >
        {/* Handle esquerdo */}
        <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
          <div
            className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
            style={{ borderColor: data.color || '#38BDF8' }}
          />
          <Handle type="target" position={Position.Left} className="absolute inset-0 opacity-0" />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <IconRenderer iconName={data.icon ?? ''} className="text-2xl text-sky-600 drop-shadow-md" />
          <span className="text-base font-bold text-sky-900">{data.label}</span>
        </div>
        {data.config?.endpoint && (
          <div className="text-xs text-sky-900 bg-sky-100 rounded p-1 mt-1 w-full break-words text-center">
            {data.config.endpoint}
          </div>
        )}
        {data.config?.method && (
          <div className="text-xs text-sky-800 font-semibold mt-1">
            {data.config.method}
          </div>
        )}
        {/* Handle direito */}
        <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
          <div
            className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
            style={{ borderColor: data.color || '#38BDF8' }}
          />
          <Handle type="source" position={Position.Right} className="absolute inset-0 opacity-0" />
        </div>
      </div>
    </div>
  );
} 